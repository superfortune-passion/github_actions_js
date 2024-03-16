import { IStepData, Step } from "./step.js";

interface IEnv {
    [index: string]: string;
}
interface IStrategy {
    [index: string]: unknown;
}

export interface IJobData {