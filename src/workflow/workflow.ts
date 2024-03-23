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