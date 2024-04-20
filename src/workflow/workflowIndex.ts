import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import { EXTENSIONS } from "./../constants.js";
import { listWorkflowURLs } from "./../github.js";
import { isFileURL, isGitHubURL } from "./../urlUtils.js";
import { WorkflowResource } from "./resource.js";

export class WorkflowIndex {
    url: string;