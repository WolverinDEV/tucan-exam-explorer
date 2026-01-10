import { Node } from "node-html-parser";

export const throwCriticalParseError = (text: string): never => {
    throw new Error(text);
};

/* Throw a parse error but we can recover from it. */
export const throwParseError = (text: string) => {
    /* In development we don't want to recover */
    throw new Error(text);
};

export const normalizeInnerText = (text: string) => text.replaceAll(/[\n\r]/g, "").replaceAll(/  +/g, " ").replaceAll("&nbsp;", " ").trim();

export const getInnerText = (element: Node): string => normalizeInnerText(element.innerText);

export const parseCampusnetArguments = (valueType: "arguments" | "url", value: string) => {
    let args: string;
    if (valueType === "url") {
        const hrefTarget = new URL(value.startsWith("/") ? `https://invalid.local${value}` : value);
        args = hrefTarget.searchParams.get("ARGUMENTS") ?? throwCriticalParseError("missing ARGUMENTS parameter in url");
    } else {
        args = value;
    }

    return args.split(",").map(arg => {
        switch (arg.charAt(1)) {
            case "N":
                return parseInt(arg.substring(2));

            case "A":
                return arg.substring(2);

            default:
                throwCriticalParseError(`invalid argument type "${arg.charAt(1)}" | "${arg}"`);
                return null;
        }
    })
};
