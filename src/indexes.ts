export const JS_INDEX_URL =
    "https://github.com/vemel/github_actions_js/tree/main/nodejs_workflows";

export interface IIndex {
    url: string;
    title: string;
    shortcut: string;
}

export const INDEXES: Array<IIndex> = [
    {
        url: JS_INDEX_URL,
        title: "Node.js",
        shortcut: "node"
    },
    {
        url: "https://github.com/vemel/github_actions_js/tree/main/python_workflows",
        title: "Python",
        shortcut: "python"
    },
    {
        url: "https://github.com/actions-rs/example/tree/master/.github/workflows",
        title: "Rust",
        shortcut: "rust"
    },
    {