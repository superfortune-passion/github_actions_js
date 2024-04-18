import chalk, { ChalkInstance } from "chalk";
import fs from "fs";
import path from "path";
import { promisify } from "util";

import { UTF8 } from "../constants.js";
import { download } from "../urlUtils.js";
import { Workflow } from "./workflow.js";

export class WorkflowResource {
    path: string;
    url: string;
    name: string;
    private _local: Workflow | null = null;
    private _remote: Workflow | null = null;

    constructor(url: string, workflowsPath: string) {
        this.url = url;
        this.name = path.parse(url).name;
        this.path = path.join(workflowsPath, this.fileName);
    }

    get title(): string | null {
        if (this._local) return this._local.name;
        if (this._remote) return this._remote.name;
        return this.name;
    }

    getTitle(action = "in", color: ChalkInstance = chalk.blue): string {
        return `${color(this.title)} ${chalk.grey(`${action} ${this.path}`)}`;
    }

    get fileName(): string {
        return `${this.name}.yml`;
    }

    existsLocally(): boolean {
        return fs.existsSync(this.path);
    }

    async getLocal(): Promise<Workflow> {
        if (this._local) return this._local;
        if (!this.existsLocally()) null;
        const result = await promisify(fs.readFile)(this.path, {
            encoding: UTF8
        });
        this._local = Workflow.fromString(result);
        return this._local;
    }

    async setLocal(data: string): Promise<void> {
        return promisify(fs.writeFile)(this.path, data, {
            encoding: UTF8
        });