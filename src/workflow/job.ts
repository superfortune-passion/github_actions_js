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
    data: IJobData;

    constructor(name: string, data: IJobData) {
        this.name = name;
        this.data = data;
    }

    get title(): string {
        return `job ${this.name}`;
    }

    get runsOn(): string {
        return this.data["runs-on"];
    }
    set runsOn(value: string) {
        this.data["runs-on"] = value;
    }

    get strategy(): IStrategy | undefined {
        return this.data.strategy;
    }
    set strategy(value: IStrategy | undefined) {
        if (value) this.data.strategy = value;
        else delete this.data.strategy;
    }

    get runsIf(): string | undefined {
        return this.data.if;
    }
    set runsIf(value: string | undefined) {
        if (value) this.data.if = value;
        else delete this.data.if;
    }

    get env(): IEnv | undefined {
        return this.data.env;
    }
    set env(value: IEnv | undefined) {