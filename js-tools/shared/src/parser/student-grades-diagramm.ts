import { parse as parseHtml, HTMLElement } from "node-html-parser";
import { normalizeInnerText, throwCriticalParseError } from "./utils";

export type OverviewContext = {
    semesterName: string,

    moduleId: string,
    moduleName: string,

    examName: string,
    examDate: string,
};

export type GradeDistribution = {
    distribution: Record<string, number>,
    average: number,
};
export type ParticipationInfo = {
    totalCount: number,
    totalCountBWS: number,
    missingCounts: Record<string, number>,
};

export type GradeOverview = {
    context: OverviewContext,
    scores: GradeDistribution,
    participation: ParticipationInfo,
};

function parseScoreDistribution(dom: HTMLElement): GradeDistribution {
    const tableScores =
        dom.querySelector("table.nb") ??
        throwCriticalParseError("missing scores table");
    const [rowGrades, rowCount] = tableScores.querySelectorAll("> tr");

    if (!rowGrades) {
        throwCriticalParseError("missing grade table row");
    }

    if (!rowCount) {
        throwCriticalParseError("missing count table row");
    }

    const grades = rowGrades.querySelectorAll("> td");
    const counts = rowCount.querySelectorAll("> td");

    if (grades.length !== counts.length) {
        throwCriticalParseError(
            `expected equal amount of grades and counts (grades: ${grades.length}, counts: ${counts.length})`,
        );
    }

    const distribution: Record<string, number> = {};
    for (let index = 1; index < grades.length; index++) {
        const grade = grades[index].textContent.trim();
        const countString = counts[index].textContent.trim();

        if (countString === "---") {
            distribution[grade] = 0;
        } else if (countString.match(/\d+/)) {
            distribution[grade] = parseInt(countString);
        } else {
            throwCriticalParseError(
                `could not parse count as number: ${countString}`,
            );
        }
    }

    let average: number | null = null;
    const tbdata = dom.querySelectorAll(".tbdata");
    for (const data of tbdata) {
        const match = data.textContent.match(/Durchschnitt:\s*(\d+,\d*)/);
        if (!match) {
            continue;
        }

        average = parseFloat(match[1].replace(/,/g, "."));
        break;
    }

    return {
        distribution,
        average:
            average ?? throwCriticalParseError("failed to parse score average"),
    };
}

const ifMatches = (
    text: string,
    regex: RegExp,
    exec: (match: RegExpMatchArray) => void,
) => {
    regex.lastIndex = 0;
    const match = text.match(regex);
    if (match) {
        exec(match);
    }
};

function parseParticipationInfo(dom: HTMLElement): ParticipationInfo {
    let totalCount: number | null = null;
    let totalCountBWS: number | null = null;
    const missingCounts: Record<string, number> = {};

    for (const data of dom.querySelectorAll(".tbdata")) {
        const text = data.textContent.trim();
        ifMatches(
            text,
            /Vorliegende Ergebnisse:\s*(\d+)/,
            ([_text, count]) => (totalCount = parseInt(count)),
        );
        ifMatches(
            text,
            /Ergebnisse.*BWS:\s*(\d+)/,
            ([_text, count]) => (totalCountBWS = parseInt(count)),
        );
        ifMatches(
            text,
            /Fehlend \((.*)\):\s*(\d+)/,
            ([_text, name, count]) => (missingCounts[name] = parseInt(count)),
        );
    }

    return {
        totalCount: totalCount ?? 0,
        totalCountBWS: totalCountBWS ?? 0,
        missingCounts,
    };
}

function parseContext(dom: HTMLElement): OverviewContext {
    const [xmlModule, xmlExam] = dom.querySelectorAll("h2");
    if (!xmlModule) {
        throwCriticalParseError("missing module info");
    }

    if (!xmlExam) {
        throwCriticalParseError("missing exam info");
    }

    const [moduleId, moduleNameAndSemester] = xmlModule.textContent.replace(/^[ \r\n]+/, "").replace(/[ \r\n]+$/, "").split("\n");
    const semesterIndex = moduleNameAndSemester.lastIndexOf(", ");
    if (semesterIndex === -1) {
        throwCriticalParseError(`missing semester name in module info (${moduleNameAndSemester})`);
    }

    const [examName, examDate] = xmlExam.innerText.split("&nbsp;");

    return {
        semesterName: normalizeInnerText(moduleNameAndSemester.substring(semesterIndex + 1)),

        moduleId: normalizeInnerText(moduleId),
        moduleName: normalizeInnerText(moduleNameAndSemester.substring(0, semesterIndex)),

        examName: normalizeInnerText(examName),
        examDate: normalizeInnerText(examDate),
    }
}

function isGradeNotSetYet(source: string) {
    if (
        !["noch nicht gesetzt", "not set yet"].reduce(
            (acc, val) => acc || source.includes(val),
            false,
        )
    ) {
        /* required keywords are not contained */
        return false;
    }

    if ((source.match(/"tbdata"/g) ?? []).length > 5) {
        /* There seems to be a lot of data. Why? Ignore found keywords and hope for the best */
        return false;
    }

    return true;
}

export function parseStudentGradesDiagramm(
    source: string,
): GradeOverview | null {
    if (source.indexOf("students_grades_diagramm.htm") === -1) {
        throwCriticalParseError("expected a students grades diagramm");
    }

    if (isGradeNotSetYet(source)) {
        return null;
    }

    const dom = parseHtml(source);
    return {
        context: parseContext(dom),
        scores: parseScoreDistribution(dom),
        participation: parseParticipationInfo(dom),
    };
}
