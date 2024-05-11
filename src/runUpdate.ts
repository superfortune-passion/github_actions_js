import chalk from "chalk";

import { logDiff } from "./differ.js";
import { getCheckResult, runCheck } from "./runCheck.js";
import { Check } from "./workflow/check.js";
import { Merger } from "./workflow/merger.js";
import { WorkflowResource } from "./workflow/resource.js";

export function logUpdate(
    check: Check,
    forceUpdate = false,
    showDiff = false
): void {
    if (check.action === "equal") return;
    if (!forceUpdate && check.force) {
        return console.log(chalk.grey(`  ${check.noForceMessage}`));
    }
    console.log(check.color(`  ${check.updateMessage}`));
    if (showDiff) logDiff(check.oldValue, check.newValue);
}

export async function runUpdate(
    workflowItem: WorkflowResource,
    forceUpdate: boolean,
    removeMarker: boolean