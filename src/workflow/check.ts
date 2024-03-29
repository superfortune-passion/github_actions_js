import chalk, { ChalkInstance } from "chalk";

import { yamlDump } from "./../utils.js";
import { Job } from "./job.js";
import { Step } from "./step.js";

type TWorkflowPart =
    | "error"
    | "top comment"
    | "workflow name"
    | "trigger"
    | "job"
    | "job environment"
    | "job runner"
    | "job strategy"