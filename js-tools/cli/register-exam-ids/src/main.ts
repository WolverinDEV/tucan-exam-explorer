import yargs from 'yargs';
import { CampusnetClient, CampusnetSession, extractErrorMessage, getLogger, GradeOverview, parseStudentGradesDiagramm } from "@tools/shared";
import { inspect } from 'node:util';
import { readFile } from 'node:fs/promises';

const logger = getLogger("global");

async function loadGradeOverview(campusnet: CampusnetClient, session: CampusnetSession, examId: number): Promise<GradeOverview> {
    logger.debug(`Loading exam grade overview for ${examId}`);
    const { data } = await campusnet.loadPage({
        programName: "GRADEOVERVIEW",
        session,
        programArgs: [
            "EXEV",
            examId
        ]
    });

    const overview = parseStudentGradesDiagramm(data);
    if (!overview) {
        throw new Error("exam has not yet been concluded");
    }

    logger.debug(` -> success: ${inspect(overview)}`);
    return overview;
}

async function registerGradeOverview(endpoint: { url: string, token: string }, examId: number, overview: GradeOverview) {
    const response = await fetch(endpoint.url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            authKey: endpoint.token,

            examId: examId,
            examDate: overview.context.examDate,
            examName: overview.context.examName,

            moduleId: overview.context.moduleId,
            moduleName: overview.context.moduleName,

            semesterName: overview.context.semesterName,

            participationTotal: overview.participation.totalCount,
            participationMissing: Object.values(overview.participation.missingCounts).reduce((a, b) => a + b, 0),

            gradeOverview: overview.scores.distribution,
            metadata: {}
        })
    }).then(response => response.json());
    if (!response.success) {
        throw new Error(response.message ?? "unknown server error");
    }
}

async function registerExams(endpoint: { url: string, token: string }, client: CampusnetClient, session: CampusnetSession, examIds: number[]) {
    logger.info(`Registering ${examIds.length} exam ids:`);
    for (const examId of examIds) {
        logger.info(`  loading exam grade overview for ${examId}`);

        let overview: GradeOverview;
        try {
            overview = await loadGradeOverview(client, session, examId);
        } catch (error) {
            if (examIds.length === 1) {
                throw error;
            }

            logger.error(`  -> failed to load ${examId}: ${extractErrorMessage(error)}`);
            continue;
        }

        logger.info(`  register ${overview.context.moduleId} ${overview.context.moduleName} (${overview.context.examName})`);
        await registerGradeOverview(endpoint, examId, overview);
        logger.info(`    -> success`);
    }
}

async function main() {
    logger.debug(`Parsing CLI: ${process.argv.slice(2)}`);

    await yargs(process.argv.slice(2))
        .option("endpoint", {
            default: "https://explorer.tuna-systems.com/details"
        })
        .option("endpointKey", { string: true, demandOption: true })
        .option("tucanSessionId", { number: true, demandOption: true })
        .option("tucanSessionCookie", { string: true, demandOption: true })

        .command("register [examId]", "load and register a single exam", (yargs) => {
            return yargs.positional('examId', {
                describe: 'target id',
                type: "number",
                demandOption: true,
            });
        }, async (argv) => {
            await registerExams({
                url: argv.endpoint,
                token: argv.endpointKey
            }, new CampusnetClient(), {
                id: `${argv.tucanSessionId}`,
                cookie: argv.tucanSessionCookie,
            }, [argv.examId]);
        })

        .command("register-bulk [file]", "load and register multiple exams", (yargs) => {
            return yargs.positional('file', {
                describe: 'file containing all exam ids',
                type: "string",
                demandOption: true,
            });
        }, async (argv) => {
            logger.info(`Loading exam ids from ${argv.file}`);
            const rawExamIds = await readFile(argv.file).then(buffer => buffer.toString("utf-8"));
            const examIds = rawExamIds.split("\n")
                .map(line => line.replaceAll(/[^0-9]/g, ""))
                .map(line => parseInt(line))
                .filter(id => !isNaN(id));

            await registerExams({
                url: argv.endpoint,
                token: argv.endpointKey
            }, new CampusnetClient(), {
                id: `${argv.tucanSessionId}`,
                cookie: argv.tucanSessionCookie,
            }, examIds);
        })

        .showHelpOnFail(true)
        .help()
        .strict()
        .parse();


}

main().catch(error => {
    console.error(error);
    process.exit(1);
})