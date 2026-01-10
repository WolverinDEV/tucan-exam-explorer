import { expect } from "@jest/globals";
import { readFile } from "fs/promises";
import * as fs from "fs/promises";
import * as path from "path";

export const executeParserTest = async (
    name: string,
    parser: (text: string) => any,
) => {
    const fileInput = path.join(__dirname, "test-data", `${name}.html`);
    const fileOutput = path.join(__dirname, "test-data", `${name}.json`);

    const htmlPayload = await readFile(fileInput);
    const result = await parser(htmlPayload.toString("utf-8"));

    if (await fs.stat(fileOutput).then(() => false).catch(() => true)) {
        console.log(`Output file does not exists. Creating new one.`);
        await fs.writeFile(fileOutput, JSON.stringify(result, undefined, 4));
        return;
    }

    const expectedResult = JSON.parse(
        (
            await readFile(fileOutput)
        ).toString("utf-8"),
    );
    expect(result).toEqual(expectedResult);
};
