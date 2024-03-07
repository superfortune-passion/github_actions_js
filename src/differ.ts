import chalk from "chalk";
import { diffLines } from "diff";

export function logDiff(oldContent: string, newContent: string): void {
    const diff = diffLines(oldContent, newContent, {
        newlineIsToken: false,
        ignoreWhitespace: false
    });
    diff.forEach(part => {
        if (part.added) {
            part.value