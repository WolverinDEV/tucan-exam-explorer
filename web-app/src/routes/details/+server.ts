import z from 'zod';
import { error, json } from '@sveltejs/kit';
import { kEnvironmentPrivate } from '$lib/server/env';
import { exams } from '../../lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { resolveService } from '../../lib/server/dependency-injection.js';
import { Database } from '../../lib/server/db/index.js';
import type { RequestHandler } from './$types.js';

const kPayload = z.object({
    authKey: z.string(),

    examId: z.number().nonnegative(),
    examDate: z.string(),
    examName: z.string(),

    moduleId: z.string(),
    moduleName: z.string(),

    semesterName: z.string(),

    participationTotal: z.number().nonnegative(),
    participationMissing: z.number().nonnegative(),

    gradeOverview: z.record(
        z.string(),
        z.number().nonnegative()
    ),
    metadata: z.record(
        z.string(),
        z.string()
    ),
})

export const POST: RequestHandler = async (event) => {
    const payload = kPayload.parse(await event.request.json());
    if (payload.authKey !== kEnvironmentPrivate.AUTH_UPDATE_KEY) {
        return error(400, {
            success: false,
            message: "invalid key",
        });
    }

    const db = resolveService(Database);
    await db.transaction(async tx => {
        /* delete the old exam info if it exists */
        await tx.delete(exams).where(eq(exams.id, payload.examId));

        /* insert the new version */
        await tx.insert(exams).values({
            id: payload.examId,

            moduleId: payload.moduleId,
            moduleName: payload.moduleName,

            examName: payload.examName,
            semesterName: payload.semesterName,

            participationTotal: payload.participationTotal,
            participationMissing: payload.participationMissing,

            gradeOverview: payload.gradeOverview,
            metadata: payload.metadata,
        });
    });

    return json({
        success: true,

        examId: payload.examId,
    });
};