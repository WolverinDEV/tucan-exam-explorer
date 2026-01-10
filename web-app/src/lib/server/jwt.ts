import jwt from "jsonwebtoken";
import { kEnvironmentPrivate } from "./env";
import { v4 as uuidv4 } from "uuid";

export const kCookieNameStudentVerified: string = "svt";
export function generateStudentVerifiedJwt(): string {
    return jwt.sign(
        {
            id: uuidv4()
        },
        `${kEnvironmentPrivate.JWT_SECRET}-verified-student`,
        { expiresIn: '30d' }
    );
}

export function verifyStudentVerifiedJwt(token: string): boolean {
    try {
        jwt.verify(token, `${kEnvironmentPrivate.JWT_SECRET}-verified-student`);
        return true;
    } catch (error) {
        return false;
    }
}