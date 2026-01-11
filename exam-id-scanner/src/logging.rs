use std::{
    io::{
        self,
    },
    sync::Mutex,
};

use indicatif::{
    ProgressBar,
    WeakProgressBar,
};

static PROGRESS_BAR_INSTANCE: Mutex<Option<WeakProgressBar>> = Mutex::new(None);
pub struct ProgressBarLogTarget<I> {
    inner: I,
}

impl<I> ProgressBarLogTarget<I> {
    pub fn new(inner: I) -> Self {
        Self { inner }
    }

    pub fn setup_progress_bar(bar: &ProgressBar) {
        *PROGRESS_BAR_INSTANCE.lock().unwrap() = Some(bar.downgrade());
    }

    pub fn clear_progress_bar(_bar: &ProgressBar) {
        *PROGRESS_BAR_INSTANCE.lock().unwrap() = None;
    }
}

impl<I: io::Write> io::Write for ProgressBarLogTarget<I> {
    fn write(&mut self, buf: &[u8]) -> io::Result<usize> {
        let cli_progress = PROGRESS_BAR_INSTANCE.lock().unwrap();
        if let Some(cli_progress) = cli_progress.as_ref().map(|inner| inner.upgrade()).flatten() {
            cli_progress.suspend(|| self.inner.write(buf))
        } else {
            self.inner.write(buf)
        }
    }

    fn flush(&mut self) -> io::Result<()> {
        self.inner.flush()
    }
}
