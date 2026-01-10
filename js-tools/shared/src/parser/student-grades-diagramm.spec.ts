import { describe, test } from "@jest/globals";
import { parseStudentGradesDiagramm } from "./student-grades-diagramm";
import { executeParserTest } from "./utils-test";

describe("campusnet parser > student grades diagramm", () => {
    test("Computersystemsicherheit WS2020", () =>
        executeParserTest(
            "student-grades-diagramm_01",
            parseStudentGradesDiagramm,
        ));
    test("Grundlagen der Informatik III SS2020", () =>
        executeParserTest(
            "student-grades-diagramm_02",
            parseStudentGradesDiagramm,
        ));
    test("Grades not set (German)", () =>
        executeParserTest(
            "student-grades-diagramm_03",
            parseStudentGradesDiagramm,
        ));
    test("Grades not set (English)", () =>
        executeParserTest(
            "student-grades-diagramm_04",
            parseStudentGradesDiagramm,
        ));
});
