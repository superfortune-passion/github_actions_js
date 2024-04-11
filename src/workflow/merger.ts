import { Workflow } from "./workflow.js";

export class Merger {
    force: boolean;

    constructor(force: boolean) {
        this.force = force;
    }

    mergeWorkflow(current: Workflow, update: Workflow): void {
        if (this.force) current.commentLines = update.commentLines;
        if (this.force) current.name = update.name;
        if (this.force) current.triggers = update.triggers;
    }

    mergeJobs(current: Workflow, update: Workflow): void {
        update.jobNames.forEach(jobName => {
            const updateJob = update.getJob(jobName);
            if (!current.jobNames.includes(jobName)) {
                current.setJob(updateJob.clone());
                return;