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
    | "job run condition"
    | "step"
    | "workflow";

export type TAction =
    | "up to date"
    | "updated"
    | "deleted"
    | "added"
    | "equal"
    | "kept"
    | "error";

export class Check {