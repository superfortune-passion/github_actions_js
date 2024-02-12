import fs from "fs";
import yaml from "js-yaml";
import os from "os";
import path from "path";

import { UTF8 } from "./constants.js";

export function decapitalize(s: string): string {
    if (!s) return s;
    return `${s[0].toLowerCase()}${s.substr(1)}`;
}

export function getCommandName(): string {
    return (process.argv[1] && process.argv[1].split("/").pop()) || "ghactions";
}

export function getCommandArgs(): string {
    return process.argv.slice(2).join(" ");