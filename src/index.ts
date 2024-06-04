import chalk from "chalk";
import fs from "fs";
import path from "path";

import { getHelp, Namespace, parseArgs } from "./cli.js";
import { DOCS_URL, LOCAL_WORKFLOWS_PATH } from "./constants.js";
import { JS_INDEX_URL } from "./indexes.js";
import { runCheckAll } from "./runCheck.js";
import { runInteractive } from "./runInteractive.js";
import { runListAll } from "./runList.js";
import { runUpdateAll } from "./runUpdate.js";
import { highlightURL, replaceRef } from "./urlUtils.js";
import {
    decapitalize,
    getCommandArgs,
    getCommandName,
    getVersionString
} from "./utils.js";
import { WorkflowResource } from "./workflow/resource.js";
import { WorkflowIndex } from "./workflow/workflowIndex.js";

async function main(): Promise<void> {
    let args: Namespace;
    const commandName = getCommandName();
    try {
        args = parseArgs();
    } catch (e) {
        console.log(e instanceof Error ? e.message : e);
        console.log("Use `--help` to know more");
        process.exit(1);
    }
    if (args.help) {
        console.log(getHelp());
        process.exit(0);
    }
    if (args.version) {
        console.log(getVersionString());
        process.exit(0);
    }

    if (args.names.length === 0) {
        try {
            await runInteractive(args);
        } catch (e) {
            console.warn(chalk.red(`✗  ${e}`));
            process.exit(1);
        }
        process.exit(0);
    }

    if (!fs.existsSync(args.path)) {
        console.warn(
            chalk.red(`✗  ${chalk.bold(args.path)} directory does not exist`)
        );
        console.warn(
            chalk.yellow("✎  Probably this is not a GitHub repository root")
        );
        console.warn(
            chalk.yellow(
                `✎  If it is, create this directory with: ${chalk.bold(
                    `mkdir -p ${args.path}`
                )}`
            )
        );
        process.exit(1);
    }

    let workflowIndex: WorkflowIndex;
    let workflows: Array<WorkflowResource>;
    try {
        workflowIndex = await WorkflowIndex.fromURL(
            replaceRef(args.index || JS_INDEX_URL, args.ref),
            path.join(args.path, LOCAL_WORKFLOWS_PATH)