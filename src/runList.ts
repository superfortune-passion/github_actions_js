import chalk from "chalk";

import { WorkflowResource } from "./workflow/resource.js";
import { Workflow } from "./workflow/workflow.js";

export function runList(resource: WorkflowResource, workflow: Workflow): void {
    const state = resource.existsLocally()
        ? "is installed to"
        : "can be installed to";
    console.log(
        `${chalk.blue(workflow.name)} ${chalk.grey(state)} ${chalk.bold(
            resource.path
        )}`
    );
    if (workflow.commentLines.length) {
        workflow.commentLines.forEach(line => console.log(`  ${line}`));
        console.log("");
    }
}