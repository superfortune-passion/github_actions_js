import { IStepData, Step } from "./step.js";

interface IEnv {
    [index: string]: string;
}
interface IStrategy {
    [index: string]: unknown;
}

export interface IJobData {
    steps: Array<IStepData>;
    "runs-on": string;
    if?: string;
    env?: IEnv;
    strategy?: IStrategy;
    [index: string]: unknown;
}

export class Job {
    name: string;