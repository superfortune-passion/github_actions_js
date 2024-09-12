import { Step } from "./../../src/workflow/step.js";

describe("step", () => {
    test("create", () => {
        const step = new Step({
            id: "stepid",
            name: "stepname",
            if: "condition",
            uses: "using@v1"
        });
        expect(step.id).toBe("stepid");
        expect(step.name).toBe("stepname");
        expect(step.uses).toBe("using");
        expect(new Step({ key: "value" }).name).toBe(null);
        expect(new Step({ name: "test" }).name).toBe("test");
        expect(new Step({ id: "test" }).name).toBe("test");