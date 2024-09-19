import { Job } from "../../src/workflow/job.js";
import { Step } from "../../src/workflow/step.js";

describe("job", () => {
    const job = new Job("main", {
        "runs-on": "runner",
        strategy: { matrix: [1, 2, 3] },
        env: { key: "value" },
        if: "cond",
        steps: [{}]
    });

    test("create", () => {
        const clone = job.clone();
        expect(clone.runsOn).toBe("runner");
        clone.runsOn = "newrunner";

        expect(clone.runsIf).toBe("cond");
        clone.runsIf = "newcond";
        clone.runsIf = undefined;

        expect(clone.env).toEqual({ key: "value" });
        clone.env = { newkey: "value" };
        clone.env = undefined;

        expect(clone.strategy).toEqual({ matrix: [1, 2, 3] });
        clone.strategy = { matrix: [1] };