import equal from "deep-equal";

import { Check, TAction } from "./check.js";
import { Job } from "./job.js";
import { Step } from "./step.js";
import { Workflow } from "./workflow.js";

export class Checker {
    force: boolean;
    current: Workflow;

    constructor(force: boolean, current: Workflow) {
        this.force = force;
        this.current = current;
    }

    getChecks(update: Workflow): Array<Check> {
        const errors = this.getErrors();
        if (errors.length) return errors;

        return [
            ...this.getWorkflowChecks(update),
            ...this.getJobsChecks(update)
        ];
    }

    getStepErrors(currentJob: Job): Array<string> {
        const stepIds = new Set();
        const result: Array<string> = [];
        currentJob.steps.forEach(step => {
            if (!step.id) return;
            if (stepIds.has(step.id))
                result.push(`${step.name} step has duplicate id ${step.id}`);
        });