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
        if (this.data.run) {
            const lines = this.data.run.split(/\r?\n/).map(x => x.trim());
            if (lines.includes("# github-actions-managed: true")) return true;
        }
        if (this.data.with?.script) {
            const lines = this.data.with.script
                .split(/\r?\n/)
                .map(x => x.trim());
            if (lines.includes("// github-actions-managed: true")) return true;
        }
        return false;
    }

    makeNonManaged(): Step {
        if (!this.isManaged()) return this;
        if (
            this.data.run &&
            this.data.run.includes("# github-actions-managed: true")
        ) {
            const lines: Array<string> = this.data.run
                .split(/\r?\n/)
                .filter((l, i) => i || l.trim())
                .filter(l => l.trim() !== "# github-actions-managed: true");
            this.data.run = lines.join("\n");
        }
        if (
            this.data.with?.script &&
            this.data.with.script.includes("// github-actions-managed: true")
        ) {
            const lines: Array<string> = this.data.with.script
                .split(/\r?\n/)
                .filter((l, i) => i || l.trim())