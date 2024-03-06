import chalk from "chalk";
import { diffLines } from "diff";

export function logDiff(oldContent: string, newContent: string): void {