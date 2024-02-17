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