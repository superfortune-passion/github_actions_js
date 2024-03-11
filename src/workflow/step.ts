import equal from "deep-equal";

interface IEnv {
    [index: string]: string;
}

interface IStepWith {
    "github-actions-managed"?: boolean;
    "github-actions-comment"?: string;
    script?: string;
    [index: string]: unknown;
}

export interface IStepData {
    name?: string;
    id?: string;
    uses?: string;
    with?: IStepWith;
    env?: IEnv;
    run?: string;
    [index: string]: unknown;
}

export class Step {
    data: IStepData;
    constructor(data: IStepData) {
        this.data = data;
    }

    get id(): string | null {
        return this.data.id || null;
    }