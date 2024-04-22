import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import { EXTENSIONS } from "./../constants.js";
import { listWorkflowURLs } from "./../github.js";
import { isFileURL, isGitHubURL } from "./../urlUtils.js";
import { WorkflowResource } from "./resource.js";

export class WorkflowIndex {
    url: string;
    name: string;
    names: Array<string>;
    workflowsPath: string;
    shortcut: string;
    private _workflows: Array<WorkflowResource>;

    constructor(
        url: string,
        workflowsPath: string,
        workflowURLs: Array<string>
    ) {
        this.url = url;
        this.name = url;
        this.workflowsPath = workflowsPath;
        this._workflows = workflowURLs.map(
            url => new WorkflowResource(url, this.workflowsPath)
        );
        this.names = this._workflows.map(w => w.name);
        this.shortcut = "";
    }