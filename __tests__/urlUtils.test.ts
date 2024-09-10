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
    expect(joinURL("https://username:password@example.com/test/", "new")).toBe(
        "https://username:password@example.com/test/new"
    );
});

test("is GitHub URL", () => {
    expect(isGitHubURL("test")).toBe(false);
    expect(isGitHubURL("https://google.com")).toBe(false);
    expect(isGitHubURL("https://nogithub.com")).toBe(false);
    expect(isGitHubURL("https://github.com")).toBe(true);
    expect(isGitHubURL("https://custom.github.com")).toBe(true);
    expect(isGitHubURL("https://github.com/user/repo")).toBe(true);
});

test("is file URL", () => {
    expect(isFileURL("test")).toBe(false);
    expect(isFileURL("https://google.com")).toBe(false);