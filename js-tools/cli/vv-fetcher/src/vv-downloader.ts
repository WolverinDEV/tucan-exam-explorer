import path from "path";
import { CampusnetClient, parseRegistrationAuditor } from "@tools/shared";
import { mkdir, readFile, stat, writeFile } from "fs/promises";
import { getLogger } from "loglevel";

const logger = getLogger("vv-download");

export async function downloadVV(client: CampusnetClient, fsRoot: string, vvAction: string, depth: number) {
    const fileHtmlPayload = path.join(fsRoot, "data.html");
    const fileJsonPayload = path.join(fsRoot, "data.json");

    let htmlPayload: string;
    if (await stat(fileHtmlPayload).then(() => true).catch(() => false)) {
        htmlPayload = await readFile(fileHtmlPayload).then(payload => payload.toString("utf-8"));
    } else {
        const { data } = await client.executeProgram({
            name: "ACTION",
            args: [vvAction],
        });
        await mkdir(fsRoot, { recursive: true });
        await writeFile(fileHtmlPayload, data);

        htmlPayload = data;
    }

    const register = parseRegistrationAuditor(htmlPayload);
    await writeFile(fileJsonPayload, JSON.stringify(register, undefined, 4));

    for (const child of register.children) {
        const prefix = "".padStart(depth, " ");
        logger.info(`${prefix}${child.display}`)
        const dirName = child.display.replaceAll(/[^a-zA-Z0-9 -]/g, '');
        await downloadVV(client, path.join(fsRoot, dirName), child.action, depth + 1);
    }
}