import { Job } from "../../src/workflow/job.js";
import { Workflow } from "../../src/workflow/workflow.js";

const renderResult = `# comment
#
# line2

name: workflow
"on":
  event: {}
jobs:
  main:
    runs-on: runner
    env:
      key: value
    if: cond
    steps:
      - {}
`;

describe("workflow", () => {
    const workflow = new Workflow(
        {
            name: "workflow",
            on: { event: {} },
            jobs: {
                main: {
                    "runs-on": "runner",
                    env: { key: "value" },
                    if: "cond",
                    steps: [{}]
                }
            }
        },
        ["comment", "", "line2"]
    );