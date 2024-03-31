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
    action: TAction;
    item: TWorkflowPart;
    force?: boolean;
    private _oldValue: unknown;
    private _newValue: unknown;

    constructor(
        item: TWorkflowPart,
        action: TAction,
        force = false,
        oldValue: unknown = null,
        newValue: unknown = null
    ) {
        this.action = action;
        this.item = item;
        this.force = force;
        this._oldValue = oldValue;
        this._newValue = newValue;
    }

    private static _dumpValue(value: unknown): string {
        if (typeof value === "string") return value;
        if (value === null) return "";
        if (value instanceof Job) return yamlDump({ [value.name]: value.data });
        if (value instanceof Step) return yamlDump(value.data);
        return yamlDump(value);
    }

    get oldValue(): string {