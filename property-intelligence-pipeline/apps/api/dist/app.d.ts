import { type Express } from "express";
import { type AppConfig } from "./services.js";
import { type PipStore } from "./store.js";
export type AppDeps = {
    store?: PipStore;
    config?: AppConfig;
};
export declare function createApp(deps?: AppDeps): Express;
