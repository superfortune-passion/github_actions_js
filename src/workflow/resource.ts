import chalk, { ChalkInstance } from "chalk";
import fs from "fs";
import path from "path";
import { promisify } from "util";

import { UTF8 } from "../constants.js";
import { download } from "../urlUtils.js";
import { Workflow } from "./workflow.js";