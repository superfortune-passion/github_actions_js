import fs from "fs";

import {
    decapitalize,
    getCommandArgs,
    getCommandName,
    getTempDir,
    getVersionString,
    yamlDump
} from "../src/utils";

test("decapitalize", async () => {
    expect(decapitalize("")).toBe("");
    expect(decapitalize("name")).toBe("name");
    expect(decapitalize("NAME")).toBe("nAME");
});

test("get version string", () => {
    expect(getVersionString() === "unknown").toBeFalsy();
});