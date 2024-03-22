import yaml from "js-yaml";

import { IJobData, Job } from "./job.js";

interface Jobs {
    [index: string]: IJobData;
}

export interface IWorkflowData {