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