import {
    highlightURL,
    isFileURL,
    isGitHubURL,
    joinURL,
    replaceRef
} from "../src/urlUtils";

test("join url", () => {
    expect(joinURL("https://example.com/old", "new")).toBe(
        "https://example.com/new"
    );
    expect(joinURL("https://example.com/test/old", "new")).toBe(
        "https://example.com/test/new"
    );
    expect(joinURL("https://example.com/test/", "new")).toBe(
        "https://example.com/test/new"
    );