import chalk from "chalk";
import fs from "fs";
import http from "http";
import https from "https";
import path from "path";
import { fileURLToPath, URL } from "url";
import { promisify } from "util";

import { UTF8 } from "./constants.js";
import { getTempDir } from "./utils.js";

export async function download(url: string): Promise<string> {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol === "file:") {
        return promisify(fs.readFile)(fileURLToPath(url), { encoding: UTF8 });
    }
    const tempPath = getTempDir();
    const dest = path.join(tempPath, path.basename(url));
    const file = fs.createWriteStream(dest);
    const getFunc = parsedUrl.protocol === "https:" ? https.get : http.get;
    return new Promise((resolve, reject) => {
        const request = getFunc(url, function (response) {
            response.pipe(file);
        });
        file.on("finish", function () {
            file.close();
            resolve(fs.readFileSync(dest, { encoding: UTF8 }));
            fs.rmSync(tempPath, { recursive: true, force: true });
        });
        request.on("error", function (err) {
            fs.rmSync(tempPath, { recursive: true, force: true });
            reject(err);
        });
        file.on("error", err => {
            fs.rmSync(tempPath, { recursive: true, force: true });
            reject(err);
        });
    });
}

export function joinURL(base: string, newPath: string): string {
    const url = new URL(base);
    let oldPathname = url.pathname;
    const origin = base.substr(0, base.length - url.pathname.length);
    if (!base.endsWith("/")) oldPathname = path.dirname(oldPathname);
    const pathname = path.join(oldPathname, newPath);
    return `${origin}${pathname}`;
}

export function isGitHubURL(url: string): boolean {
    try {
        const hostname = new URL(url).hostname;
        return hostname === "github.com" || hostname.endsWith(".github.com");
    } catch {
        return false;
    }
}

export function isFileURL(url: string): boolean {
    try {
        return new URL(url).protocol === "file:";
    } catch {
        return false;
    }
}

export function highlightURL(url: string): string {
    if (isGitHubURL(url)) {