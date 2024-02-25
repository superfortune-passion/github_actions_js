import fetch from "node-fetch";
import path from "path";
import { URL } from "url";

interface IResponse {
    message: string;
}

async function api(
    hostname: string,
    endpoint: string,
    token?: string
): Promise<unknown> {
    const response = await fetch(`https://api.${hostname}/repos/${endpoint}`, {
        headers: token
            ? {
                Authorization: `Bearer ${token}`
            }
            : undefined
    });
    const result = await response.json() as IResponse;
    if (result.message === "Not Found") {
        return [];
    }

    if (result.message) {
        throw new Error(result.message);
    }
    return result;
}

interface IFile {
    type: string;
    path: string;
    download_url: string;
}

async function listFiles(
    hostname: string,
    user: string,
    repository: string,