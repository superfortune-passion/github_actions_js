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