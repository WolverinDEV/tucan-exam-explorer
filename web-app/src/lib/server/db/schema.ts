import { pgTable, integer, varchar, date, json, bigint } from 'drizzle-orm/pg-core';

export const exams = pgTable('exams', {
    id: bigint({ mode: "number" }).notNull().primaryKey(),
    timestamp: date().notNull().defaultNow(),

    semesterName: varchar({ length: 32 }).notNull(),

    moduleId: varchar({ length: 32 }).notNull(),
    moduleName: varchar({ length: 128 }).notNull(),

    examName: varchar({ length: 128 }).notNull(),
    /* examDate: ... */

    participationTotal: integer().notNull(),
    participationMissing: integer().notNull(),

    gradeOverview: json().default({}),
    metadata: json().default({}),
})
export type Exam = typeof exams.$inferSelect & { gradeOverview: Record<string, number>, metadata: Record<string, string> };
export type ExamMetadata = Pick<Exam, "id" | "examName" | "moduleId" | "moduleName" | "semesterName">;