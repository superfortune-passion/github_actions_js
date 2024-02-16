import chalk from "chalk";
import fs from "fs";
import http from "http";
import https from "https";
import path from "path";
import { fileURLToPath, URL } from "url";
import { promisify } from "util";

import { UTF8 } from "./constants.js";
import { getTempDir } from "./utils.js";