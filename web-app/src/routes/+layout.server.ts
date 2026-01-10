import { error, redirect } from "@sveltejs/kit";
import { kCookieNameStudentVerified, verifyStudentVerifiedJwt } from "../lib/server/jwt";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {
    const verifiedStudent = verifyStudentVerifiedJwt(event.cookies.get(kCookieNameStudentVerified) ?? "");

    if (!verifiedStudent && event.route.id?.match(/\/details(\/.*)?$/g)) {
        const url = new URL(event.request.url);
        throw redirect(307, `/student-verify?forward=${encodeURIComponent(url.pathname + url.search + url.hash)}`)
    }

    return {
        verifiedStudent
    };
}