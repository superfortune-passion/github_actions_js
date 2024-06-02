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