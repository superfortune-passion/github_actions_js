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