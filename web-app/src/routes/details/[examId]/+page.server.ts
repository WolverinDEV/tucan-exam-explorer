import { eq } from "drizzle-orm";
import { Database } from "../../../lib/server/db";
import { exams, type Exam } from "../../../lib/server/db/schema";
import type { PageServerLoad } from "./$types";
import { resolveService } from "../../../lib/server/dependency-injection";

async function loadExamData(examId: number) {
    const db = resolveService(Database);
    const [exam] = await db.select()
        .from(exams)
        .where(eq(exams.id, examId))
        .limit(1);

    if (!exam) {
        /* exam not found */
        return null;
    }

    return {
        id: exam.id,
        timestamp: exam.timestamp,

        semesterName: exam.semesterName,

        moduleId: exam.moduleId,
        moduleName: exam.moduleName,

        examName: exam.examName,

        participationTotal: exam.participationTotal,
        participationMissing: exam.participationMissing,

        gradeOverview: exam.gradeOverview as any,
        metadata: exam.metadata as any
    } satisfies Exam;
}

export const load: PageServerLoad = async (event) => {
    return {
        exam: loadExamData(parseInt(event.params.examId))
    }
}