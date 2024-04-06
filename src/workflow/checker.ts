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
        return result;
    }

    getErrors(): Array<Check> {
        const result = [] as Array<Check>;
        this.current.jobs.forEach(job => {
            this.getStepErrors(job).map(
                error => new Check("error", "error", false, error)
            );
        });
        return result;
    }

    static getAction(oldValue: unknown, newValue: unknown): TAction {
        if (equal(oldValue, newValue)) return "equal";
        if (!oldValue) return "added";
        if (!newValue) return "deleted";
        return "updated";
    }

    getWorkflowChecks(update: Workflow): Array<Check> {
        return [
            new Check(
                "top comment",
                Checker.getAction(
                    this.current.commentLines,
                    update.commentLines
                ),
                true,
                this.current.commentLines.join("\n"),
                update.commentLines.join("\n")
            ),
            new Check(
                "workflow name",
                Checker.getAction(this.current.name, update.name),
                true,
                this.current.name,
                update.name
            ),
            new Check(
                "trigger",
                Checker.getAction(this.current.triggers, update.triggers),
                true,
                this.current.triggers,
                update.triggers
            )
        ];
    }
