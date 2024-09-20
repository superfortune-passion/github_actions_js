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
        clone.strategy = undefined;

        expect(clone.steps.length).toBe(1);
        clone.steps = [new Step({})];
    });

    test("merge steps", () => {
        job.steps = [];
        let steps = [new Step({ id: "remote1" })];
        expect(job.mergeSteps(steps).map(i => i.data)).toEqual([
            { id: "remote1" }
        ]);

        job.steps = [new Step({ name: "local1" })];