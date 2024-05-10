import chalk from "chalk";

import { logDiff } from "./differ.js";
import { getCheckResult, runCheck } from "./runCheck.js";
import { Check } from "./workflow/check.js";
import { Merger } from "./workflow/merger.js";
import { WorkflowResource } from "./workflow/resource.js";

export function logUpdate(