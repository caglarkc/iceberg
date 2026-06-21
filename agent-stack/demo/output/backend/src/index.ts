// @ai-generated
import { getConfig } from "./config.js";
import { createResource } from "./integration/resources.js";

const config = getConfig();

export async function health() {
  return { ok: true, mode: config.mockApi ? "mock" : "live" };
}

export async function demoCreateResource() {
  return createResource({ title: "Demo resource" });
}
