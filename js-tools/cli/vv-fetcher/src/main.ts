import { getLogger } from "@tools/shared";
import { glob, readFile, writeFile } from "node:fs/promises";

const logger = getLogger("global");
async function main() {
    logger.info("Downloading VV");

    // const client = new CampusnetClient();
    // await downloadVV(
    //     client,
    //     "./vv_ss_25",
    //     "WpZ-VMe4PWbDPxyDPBJVTF5MOvYX8tTpjzK14QpSSiUscDH8XM5CBryHzjdQCDPBmxOM9B2e30Eh6d6idHYBYGm5HG8Ng1GuIhJMgIr1lIc4a0R6GpXw~2XiWTPOLCXE2IQhzQlWSordX0lk7cq37toRhJKUh8x9IJJYqH8pdgvgWalAxrXC2Q-dCw__",
    //     0,
    // );

    // await dumpIds("./vv_ss_25/FB01 - Rechts- und Wirtschaftswissenschaften/**/*.json");
    //await dumpIds("./vv_ss_25/FB20 - Informatik/**/*.json");
    await dumpIds("./vv_ss_25/**/*.json");
}

async function dumpIds(pattern: string) {
    logger.info(`Collecting all IDs from ${pattern}`)
    const ids: { id1: number, id2: number }[] = [];
    for await (const entry of glob(pattern)) {
        logger.debug(` loading file ${entry}`);
        const payload = JSON.parse(await readFile(entry).then(buffer => buffer.toString("utf-8")));
        ids.push(...payload.events.map((event: any) => ({ id1: event.id1, id2: event.id2, name: event.name })));
    }

    await writeFile("out.json", JSON.stringify(ids, undefined, 4));
    logger.info(`Wrote IDs to out.json`);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
})