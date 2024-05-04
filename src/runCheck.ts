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