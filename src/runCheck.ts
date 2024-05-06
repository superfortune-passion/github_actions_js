import chalk from "chalk";

import { logDiff } from "./differ.js";
import { Check } from "./workflow/check.js";
import { Checker } from "./workflow/checker.js";
import { Merger } from "./workflow/merger.js";
import { WorkflowResource } from "./workflow/resource.js";
import { Workflow } from "./workflow/workflow.js";

export function logCheck(
    check: Check,
    forceUpdate = false,
    showDiff = false
): void {
    if (check.action === "equal") return;
    if (!forceUpdate && check.force) {
        return console.log(chalk.grey(`  ${check.noForceMessage}`));
    }
    console.log(check.color(`  ${check.checkMessage}`));
    if (showDiff) logDiff(check.oldValue, check.newValue);
}

export function getCheckResult(
    resource: WorkflowResource,
    checks: Array<Check>,
    forceUpdate: boolean
): Check {
    const errorChecks = checks.filter(check => check.isError());
    if (errorChecks.length)
        return new Check("error", "error", false, "has errors");

    if (!resource.existsLocally()) return new Check("workflow", "added");
    const applyChecks = checks.filter(check => check.isApplied(forceUpdate));
    if (applyChecks.length) return new Check("workflow", "updated");

    return new Check("workflow", "up to date");
}

export async function runCheck(
    workflowItem: WorkflowResource,
    forceUpdate: boolean,
    removeMarker: boolean