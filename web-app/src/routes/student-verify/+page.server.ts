import { fail, redirect } from "@sveltejs/kit";
import { generateStudentVerifiedJwt, kCookieNameStudentVerified, verifyStudentVerifiedJwt } from "../../lib/server/jwt";
import type { Actions, PageServerLoad } from "./$types";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { kFormSchema } from "./schema";
import { kEnvironmentPrivate } from "../../lib/server/env";
import { MailService } from "../../lib/server/mail";
import VerificationCode from "../../lib/server/mail/templates/verification-code.svelte";
import { kAppBaseUrl } from "../../lib";
import { resolveService } from "../../lib/server/dependency-injection";

export const load: PageServerLoad = async (event) => {
    const url = new URL(event.request.url);
    if (url.searchParams.has('token')) {
        const token = url.searchParams.get('token')!;
        if (verifyStudentVerifiedJwt(url.searchParams.get('token') ?? "")) {
            event.cookies.set(kCookieNameStudentVerified, token, { path: '/', secure: true, sameSite: "lax" });
            const target = decodeURIComponent(url.searchParams.get("forward") ?? "/");
            return redirect(303, `${kAppBaseUrl}${target}`);
        }
    }

    const parent = await event.parent();
    if (parent.verifiedStudent) {
        const target = decodeURIComponent(url.searchParams.get("forward") ?? "/");
        return redirect(303, `${kAppBaseUrl}${target}`);
    }

    return {
        emailSuffix: kEnvironmentPrivate.EMAIL_STUDENT_SUFFIX,
        form: await superValidate(zod4(kFormSchema)),
    }
};

export const actions: Actions = {
    default: async (event) => {
        const form = await superValidate(event, zod4(kFormSchema));
        if (!form.valid) {
            return fail(400, {
                form,
            });
        }

        const targetEmail = form.data.email + kEnvironmentPrivate.EMAIL_STUDENT_SUFFIX;
        const token = generateStudentVerifiedJwt();

        console.log(`Sending verification E-Mail to ${targetEmail}`);
        const mail = resolveService(MailService);
        await mail.sendTemplateMail({
            target: targetEmail,
            subject: "Exam Explorer - Verifizierungslink",

            template: VerificationCode,
            props: {
                link: `${kAppBaseUrl}/student-verify?token=${encodeURIComponent(token)}`
            }
        });

        return message(
            form,
            `E-Mail erfolgreich gesendet!`
        );
    },
};