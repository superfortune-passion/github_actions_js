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