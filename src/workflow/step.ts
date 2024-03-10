import equal from "deep-equal";

interface IEnv {
    [index: string]: string;
}

interface IStepWith {
    "github-actions-managed"?: boolean;
    "github-actions-comment"?: string;
    script?: string;
    [index: string]: unknown;
}

export interface IStepData {
    name?: string;
    id?: string;