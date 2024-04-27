import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";

import { DOCS_URL } from "./constants.js";
import { getIndexURL } from "./indexes.js";

export interface Namespace {
    help: boolean;
    version: boolean;
    names: Array<string>;
    ref: string;
    path: string;
    force: boolean;
    update: boolean;
    list: boolean;
    diff: boolean;
    clean: boolean;
    index: string;
}

export function getHelp(): string {
    return commandLineUsage([
        {
            header: "GitHub Actions Manager",
            content: [
                "CLI tool to install and update and share GitHub Actions workflows",
                "",
                `Documentation: ${DOCS_URL}`,
                "",
                "{bold ghactions} - Run in interactive mode",