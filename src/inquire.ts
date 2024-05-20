import chalk from "chalk";
import Configstore from "configstore";
import inquirer from "inquirer";
import inquirerSelectDirectory from "inquirer-select-directory";
import { pathToFileURL } from "url";

import { getIndexResource, getShortcut, INDEXES } from "./indexes.js";
import { highlightURL, replaceRef } from "./urlUtils.js";
import { WorkflowResource } from "./workflow/resource.js";
import { WorkflowIndex } from "./workflow/workflowIndex.js";

export async function chooseIndex(
    url: string | undefined,
    ref: string,
    workflowsPath: string
): Promise<WorkflowIndex> {
    if (url) {
        return WorkflowIndex.fromURL(replaceRef(url, ref), workflowsPath);
    }
    const defaultIndexes = INDEXES.map(index => index.url) as Array<string>;
    const config = new Configstore("github-actions", {
        indexes: defaultIndexes
    });
    const indexes: Array<string> = config.get("indexes");
    indexes.push(...defaultIndexes.filter(index => !indexes.includes(index)));
    const titlePad = 15;
    return inquirer
        .prompt([
            {
                name: "url",
                type: "list",
                message:
                    "Select project type or choose any repository with workflows",
                pageSize: 30,
                choices: [
                    ...indexes.map(url => {
                        const index = getIndexResource(url);
                        const title = index
                            ? `${index.title.padEnd(titlePad)} ${highlightURL(
                                replaceRef(url, ref)
                            )}`
                            : `${"Recently used".padEnd(
                                titlePad
                            )} ${highlightURL(replaceRef(url, ref))}`;
                        return {
                            name: title,
                            value: url
                        };
                    }),
                    {
                        name: `${"From GitHub URL".padEnd(
                            titlePad
                        )} ${chalk.grey(
                            "https://github.com/<owner>/<repo>/tree/main/.github/workflows"
                        )}`,
                        value: "github"
                    },
                    {
                        name: `${"From directory".padEnd(
                            titlePad
                        )} ${chalk.grey("other/project/.github/workflows")}`,
                        value: "path"