import z from 'zod';
import { error, type Handle, type HandleServerError } from '@sveltejs/kit';
import { setupInjector } from './lib/server/dependency-injection';
import { ReflectiveInjector } from 'injection-js';
import { MailService } from './lib/server/mail';
import db from "$lib/server/db";

const start = performance.now();
setupInjector(
    ReflectiveInjector.resolveAndCreate([
        db,
        MailService,
    ]),
);
const end = performance.now();
console.log(`Server setup time: ${(end - start).toFixed(2)}ms`);

export const handleError: HandleServerError = ({ event, error: cause }) => {
    if (event.request.headers.get('Content-Type') === 'application/json') {
        console.error(cause);

        if (cause instanceof z.ZodError) {
            return error(400, {
                success: false,
                message: "invalid request",
                issues: cause.issues
            });
        }

        return error(500, {
            success: false,
            message: "internal server error",
        });
    }

    throw cause;
}


process.on("uncaughtException", event => {
    console.error("Uncaught exception: ", event);
});