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