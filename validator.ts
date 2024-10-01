import fs from "fs";
import yaml from "js-yaml";
import path from "path";

import { UTF8 } from "./src/constants";
import { ISecret } from "./src/workflow/resource";
import { IWorkflowData, Workflow } from "./src/workflow/workflow";
import { IWorkflowIndex, WorkflowIndex } from "./src/workflow/workflowIndex";

async function main(): Promise<void> {
    const indexPath = process.argv[2];
    const localPath = path.dirname(indexPath);
    const indexContent = fs.readFileSync(indexPath, { encoding: UTF8 });
    const indexData = yaml.load(indexContent) as IWorkflowIndex;
    const workflowIndex = new WorkflowIndex(
        "https://example.com/",
        indexData,
        localPath
    );