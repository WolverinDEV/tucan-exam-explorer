use std::{
    sync::Arc,
    time::Duration,
};

use anyhow::Context;
use clap::Parser;
use indicatif::{
    ProgressBar,
    ProgressStyle,
};
use log::LevelFilter;
use reqwest::header;
use tokio::{
    signal,
    sync::{
        Mutex,
        oneshot,
    },
};

use crate::predictor::{
    IdPredictor,
    Window,
};

mod predictor;

type TucanExamId = u64;

async fn execute_request(
    client: &reqwest::Client,
    session_id: u64,
    id: TucanExamId,
) -> anyhow::Result<bool> {
    let response = client.get(&format!("https://www.tucan.tu-darmstadt.de/scripts/mgrqispi.dll?APPNAME=CampusNet&PRGNAME=GRADEOVERVIEW&ARGUMENTS=-N{session_id},-N000316,-AEXEV,-N{id}"))
        .send()
        .await.context("status")?
        .error_for_status().context("status")?
        .bytes()
        .await
        .context("read body")?;

    let body = String::from_utf8_lossy(&*response);
    if body.contains("cn_loginForm") {
        anyhow::bail!("invalid session");
    }

    Ok(body.contains(" Noten"))
}

async fn request_executor(
    client: reqwest::Client,
    session_id: u64,
    generator: Arc<Mutex<IdPredictor>>,
) {
    loop {
        let Some(next_id) = ({
            let mut generator = generator.lock().await;
            generator.next_id()
        }) else {
            break;
        };

        let max_attempts = 5;
        let mut attempt = 0;
        while attempt < max_attempts {
            attempt += 1;

            let is_match = match self::execute_request(&client, session_id, next_id).await {
                Ok(response) => response,
                Err(error) => {
                    if attempt == max_attempts {
                        log::error!("ID request {next_id} failed: {error}");
                    }

                    continue;
                }
            };

            if is_match {
                log::info!(" -> found exam id {next_id}");
                let mut generator = generator.lock().await;
                generator.id_hit(next_id);
            }

            break;
        }
    }
}

#[derive(Debug, Parser)]
struct CliArgs {
    #[arg(long)]
    session_cookie: String,

    #[arg(long)]
    session_id: u64,

    #[arg(short, long, default_value = "8")]
    threads: usize,

    base_id: TucanExamId,
    target_id: TucanExamId,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    env_logger::builder()
        .filter_level(LevelFilter::Info)
        .parse_default_env()
        .init();

    let args = CliArgs::try_parse()?;

    let predictor = Arc::new(Mutex::new(IdPredictor::new(
        args.base_id,
        args.target_id,
        Window {
            backwards: 150,
            forwards: 150,
        },
    )));

    let mut headers = header::HeaderMap::new();
    headers.insert(
        "cookie",
        header::HeaderValue::from_str(&format!("cnsc={}", args.session_cookie))?,
    );

    let http_client = reqwest::ClientBuilder::new()
        .default_headers(headers)
        .build()
        .context("http client")?;

    let mut tasks = Vec::new();

    for _ in 0..args.threads {
        tasks.push(tokio::spawn(self::request_executor(
            http_client.clone(),
            args.session_id,
            predictor.clone(),
        )));
    }

    log::info!("Executing {} parallel requests", tasks.len());

    let (statistics_task, statistics_shutdown) = {
        let predictor = predictor.clone();
        let (shutdown_tx, mut shutdown_rx) = oneshot::channel::<()>();

        let statistics_task = tokio::spawn(async move {
            let pb = ProgressBar::new_spinner();
            pb.set_style(ProgressStyle::with_template("[{elapsed_precise}] {msg}").unwrap());
            pb.enable_steady_tick(Duration::from_millis(100));

            loop {
                tokio::select! {
                    _ = tokio::time::sleep(Duration::from_secs(1)) => {},
                    _ = &mut shutdown_rx => {
                        break;
                    }
                }

                let predictor = predictor.lock().await;
                pb.set_message(format!(
                    "{:.2}% ({} / {})",
                    predictor.progress() * 100.0,
                    predictor.current_id(),
                    predictor.end_condition()
                ));
            }

            pb.finish_and_clear();
        });

        (statistics_task, shutdown_tx)
    };

    let tasks = async move {
        for task in tasks {
            let _ = task.await;
        }
    };

    tokio::select! {
        _ = tasks => {
            log::info!("Done :)");
        }
        _ = signal::ctrl_c() => {
            log::info!("Aborting...");
        }
    };

    let _ = statistics_shutdown.send(());
    let _ = statistics_task.await;

    // Note:
    // This is technically not fully accurate because we do not wait for all
    // executor tasks to finish their in-flight requests before reading the state.
    // As a result, `current_id()` may not reflect the exact last processed id.
    let predictor = predictor.lock().await;
    log::info!(" -> stopped at {}", predictor.current_id());

    Ok(())
}
