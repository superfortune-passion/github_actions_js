import yaml from "js-yaml";

import { IJobData, Job } from "./job.js";

interface Jobs {
    [index: string]: IJobData;
}

export interface IWorkflowData {
    name: string;
    on?: unknown;
    jobs?: Jobs;
    [index: string]: unknown;
}

export class Workflow {
    data: IWorkflowData;
    commentLines: Array<string>;

    constructor(data: IWorkflowData, commentLines: Array<string>) {
        this.data = data;
        this.commentLines = commentLines;
    }

    get name(): string {
        return this.data.name;
    }

    set name(value: string) {
        this.data.name = value;
    }

    get triggers(): unknown {
        return this.data.on;
    }

    set triggers(value: unknown) {
        this.data.on = value;
    }

    get jobNames(): Array<string> {
        return Object.keys(this.data.jobs || {});
    }

    get jobs(): Array<Job> {
        return this.jobNames.map(name => this.getJob(name));
    }

    getJob(name: string): Job {
        const data = this.data.jobs?.[name];
        if (!data) throw new Error(`Job ${name} not found`);
        return new Job(name, data);
    }
