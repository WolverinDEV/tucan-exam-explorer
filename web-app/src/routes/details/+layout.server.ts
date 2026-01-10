import { Database } from "../../lib/server/db";
import { exams } from "../../lib/server/db/schema";
import { resolveService } from "../../lib/server/dependency-injection";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (_event) => {
    const db = resolveService(Database);
    const availableExams = await db.select()
        .from(exams);

    return {
        availableExams: availableExams.map(exam => ({
            id: exam.id,
            semesterName: exam.semesterName,
            moduleId: exam.moduleId,
            moduleName: exam.moduleName,
            examName: exam.examName
        }))
    }
};