import { describe, test } from "@jest/globals";
import { executeParserTest } from "./utils-test";
import { parseRegistrationAuditor } from "./registration-auditor";

describe("campusnet parser > registration auditor", () => {
    test("simple page with everything", () =>
        executeParserTest("registration-auditor_01", parseRegistrationAuditor));
});
