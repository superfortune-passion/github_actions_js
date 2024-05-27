import chalk from "chalk";
import fs from "fs";
import path from "path";

import { Namespace } from "./cli.js";
import { LOCAL_WORKFLOWS_PATH } from "./constants.js";
import {
    chooseIndex,
    confirmRerunApply,
    createWorkflowsDir,
    selectWorkflows
} from "./inquire.js";
import { getCheckResult, logCheck, runCheck } from "./runCheck.js";
import { runList, runListAll } from "./runList.js";
import { logUpdate, runUpdate } from "./runUpdate.js";
import { highlightURL } from "./urlUtils.js";
import { Check } from "./workflow/check.js";
import { WorkflowResource } from "./workflow/resource.js";

async function logWorkflowChecks(
    resources: Array<WorkflowResource>,
    args: Namespace
): Promise<Array<[WorkflowResource, Array<Check>]>> {
    await Promise.all(resources.map(resource => resource.getRemote()));
    const checkLists = await Promise.all(
        resources.map(resource => runCheck(resource, args.force, args.clean))
    );
    const result: Array<[WorkflowResource, Array<Check>]> = [];
    resources.forEach((resource, index) => {
        const checks = checkLists[index];