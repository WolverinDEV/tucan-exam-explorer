import axios, { AxiosInstance, AxiosResponse } from "axios";
import * as crypto from "node:crypto";
import { BinaryLike } from "node:crypto";
import pLimit from "p-limit";

export type CampusnetArgument = string | number;
export type CampusnetSession = {
    id: string,
    cookie: string,
};
export class ErrorCampusnetAccessDenied extends Error {
    constructor() {
        super("campusnet access denied");
    }
}
export class ErrorCampusnetInvalidCredentials extends Error {
    constructor() {
        super("campusnet invalid credentials");
    }
}

export class ErrorCampusnetSessionTimeout extends Error {
    constructor() {
        super("session timed out");
    }
}

export class ErrorCampusnetGeneric extends Error {
    constructor(
        readonly errorCode: string,
        readonly errorText: string,
        readonly additionalContext: Record<string, string | null>,
    ) {
        super(`${errorCode}/${errorText}`);
    }
}

function extractJavaScriptValue(text: string, name: string): string | null {
    const match = new RegExp(`${name}\\s*=[^=]\\s*`, "g").exec(text);
    if (!match) {
        return null;
    }

    let index = match.index! + name.length;
    while ([" ", "   ", "="].includes(text.charAt(index))) {
        index++;
    }

    const quoteCharacter = text.charAt(index);
    if (quoteCharacter !== "'" && quoteCharacter !== '"') {
        return null;
    }

    let endIndex = index + 1;
    /* eslint no-constant-condition: "off" */
    while (true) {
        endIndex = text.indexOf(quoteCharacter, endIndex);
        if (endIndex === -1) {
            break;
        }

        if (text.charAt(endIndex - 1) !== "\\") {
            /* end found */
            break;
        }

        /* escaped */
        endIndex++;
    }

    return text.substring(index + 1, endIndex);
}

export class CampusnetClient {
    private readonly axiosClient: AxiosInstance;
    private readonly requestLimit = pLimit(1);

    constructor() {
        this.axiosClient = axios.create({
            baseURL: "https://www.tucan.tu-darmstadt.de/scripts/",
        });

        // TODO: Refresh header indicates invalid session (except on login & non auth pages)
        this.axiosClient.interceptors.response.use((response) => {
            if (response.status !== 200 || typeof response.data !== "string") {
                return response;
            }

            if (response.data.indexOf("access_denied.htm") !== -1) {
                throw new ErrorCampusnetAccessDenied();
            }

            if (response.data.indexOf("timeout.htm") !== -1) {
                throw new ErrorCampusnetSessionTimeout();
            }

            return response;
        });

        this.axiosClient.interceptors.response.use((response) => {
            if (response.status !== 200 || typeof response.data !== "string") {
                return response;
            }

            if (response.data.indexOf("MG_V_ErrorCode") === -1) {
                return response;
            }

            // Generic API error
            const errorCode =
                extractJavaScriptValue(response.data, "MG_V_ErrorCode") ?? "-1";
            let errorText =
                extractJavaScriptValue(response.data, "MG_V_ErrorText") ??
                "failed to extract text";
            if (
                errorText.startsWith('Error: \\"') &&
                errorText.endsWith(`(${errorCode})`)
            ) {
                errorText = errorText.substring(
                    9,
                    errorText.length - 5 - errorCode.length,
                );
                errorText = errorText.replace(/\\"/g, '"');
            }

            throw new ErrorCampusnetGeneric(errorCode, errorText, {
                MG_V_Server: extractJavaScriptValue(
                    response.data,
                    "MG_V_Server",
                ),
                MG_V_Application: extractJavaScriptValue(
                    response.data,
                    "MG_V_Application",
                ),
                MG_V_Program: extractJavaScriptValue(
                    response.data,
                    "MG_V_Program",
                ),
                MG_V_User: extractJavaScriptValue(response.data, "MG_V_User"),
            });
        });
    }

    async executeProgram(options: {
        name: string,
        args: CampusnetArgument[],

        sessionCookie?: string,
    }): Promise<AxiosResponse<string>> {
        // Actions posted are also allowed with GET
        return this.requestLimit(() =>
            this.axiosClient.get("mgrqispi.dll", {
                params: {
                    APPNAME: "CampusNet",
                    PRGNAME: options.name,
                    ARGUMENTS: options.args
                        .map((value) => {
                            if (typeof value === "number") {
                                return `-N${value}`;
                            } else {
                                return `-A${encodeURIComponent(value)}`;
                            }
                        })
                        .join(","),
                },
                headers: {
                    Cookie: `cnsc=${options.sessionCookie ?? "UNSET"};`,
                },
            }),
        );
    }

    async loadPage(options: {
        programName: string,
        programArgs?: CampusnetArgument[],

        session?: CampusnetSession,
        sidebarId?: number,
    }): Promise<AxiosResponse<string>> {
        return this.executeProgram({
            name: options.programName,
            args: [
                options.session?.id ?? 1,
                options.sidebarId ?? 0,
                ...(options.programArgs ?? []),
            ],
            sessionCookie: options.session?.cookie,
        });
    }

    private async pbkdf2Async(
        password: BinaryLike,
        salt: BinaryLike,
        iterations: number,
        keylen: number,
        digest: string,
    ): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(
                password,
                salt,
                iterations,
                keylen,
                digest,
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                },
            );
        });
    }

    private async encodeMobileArgument(argument: string): Promise<string> {
        const kCryptPassword =
            "5f34243c3477233e27763031486470215e2d5c6829254a30274e6a3a58";
        const seed = crypto.randomBytes(16);
        const payloadBuffer = Buffer.from(argument, "utf-8");
        const keyA = await this.pbkdf2Async(
            kCryptPassword,
            seed,
            1000,
            128 / 8,
            "sha1",
        );
        const keyB = await this.pbkdf2Async(
            kCryptPassword,
            payloadBuffer,
            1000,
            128 / 8,
            "sha1",
        );

        const payload = Buffer.concat([keyB, payloadBuffer]);

        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv("aes-128-cfb", keyA, iv, {});

        const result = [];
        result.push(iv);
        result.push(seed);
        result.push(cipher.update(payload));
        result.push(cipher.final());

        return Buffer.concat(result)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/=/g, "_")
            .replace(/\//g, "~");
    }

    private md5hex(value: string): string {
        return crypto
            .createHash("md5")
            .update(value)
            .digest("hex")
            .toUpperCase();
    }

    async executeMobileAction(
        session: CampusnetSession,
        programName: string,
        args: CampusnetArgument[],
    ) {
        const requestArgument = `${programName},${session.id
            },000000,${args.join(",")}`;
        const encodedRequestArgument = await this.encodeMobileArgument(
            `${this.md5hex(requestArgument)},${requestArgument}`,
        );

        return this.executeProgram({
            name: "ACTIONMOBILE",
            args: [encodedRequestArgument],

            sessionCookie: session.cookie,
        });
    }
}
