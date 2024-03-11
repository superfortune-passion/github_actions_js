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

    get name(): string | null {
        return this.data.name || this.id || null;
    }

    get uses(): string | null {
        return this.data.uses ? this.data.uses.split("@")[0] : null;
    }

    get title(): string {
        if (this.name) return `step ${this.name}`;
        return "unnamed step";
    }

    isManaged(): boolean {
        if (this.data.with?.["github-actions-managed"]) return true;