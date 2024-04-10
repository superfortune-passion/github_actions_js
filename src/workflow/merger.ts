import { Workflow } from "./workflow.js";

export class Merger {
    force: boolean;

    constructor(force: boolean) {
        this.force = force;