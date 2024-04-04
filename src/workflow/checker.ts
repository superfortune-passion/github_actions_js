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