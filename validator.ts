import fs from "fs";
import yaml from "js-yaml";
import path from "path";

import { UTF8 } from "./src/constants";
import { ISecret } from "./src/workflow/resource";
import { IWorkflowData, Workflow } from "./src/workflow/workflow";
import { IWorkflowIndex, WorkflowIndex } from "./src/workflow/workflowIndex";

async function main(): Promise<void> {