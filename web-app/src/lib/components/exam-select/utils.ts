import type { ExamMetadata } from "../../server/db/schema";

export type SemesterGroup = {
    name: string;
    departments: DepartmentGroup[];
};
export type DepartmentGroup = {
    id: number;
    name: string;
    exams: ExamMetadata[];
};

function generateSemesterGroup(exam: ExamMetadata): SemesterGroup {
    return {
        name: exam.semesterName,
        departments: []
    };
}

function generateDepartmentGroup(exam: ExamMetadata, departmentId: number): DepartmentGroup {
    return {
        id: departmentId,
        name: `Department ${departmentId}`,
        exams: [exam]
    };
}

export function buildSelectGroup(exams: ExamMetadata[]): SemesterGroup[] {
    const semesterGroups: Record<string, SemesterGroup> = {};

    for (const exam of exams) {
        const semesterGroup =
            semesterGroups[exam.semesterName] ??
            (semesterGroups[exam.semesterName] = generateSemesterGroup(exam));

        const departmentId = parseInt(exam.moduleId.split('-')[0]);
        const department = semesterGroup.departments.find(department => department.id === departmentId);
        if (department) {
            department.exams.push(exam);
        } else {
            semesterGroup.departments.push(generateDepartmentGroup(exam, departmentId))
        }
    }

    for (const semester of Object.values(semesterGroups)) {
        semester.departments.sort((a, b) => a.id - b.id);
    }

    const groupList = Object.values(semesterGroups);
    groupList.sort((a, b) => compareSemesterName(a.name, b.name));
    return groupList;
}

function compareSemesterName(a: string, b: string) {
    const [aTurn, aYear] = a.split(" ");
    const [bTurn, bYear] = b.split(" ");

    return `${aYear} ${aTurn}`.localeCompare(`${bYear} ${bTurn}`);
}