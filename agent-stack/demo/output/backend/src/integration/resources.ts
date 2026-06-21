// @ai-generated
import { getAccessToken } from "./auth.js";

export interface CreateResourceInput {
  title: string;
}

export async function createResource(input: CreateResourceInput) {
  const token = await getAccessToken();
  return {
    id: "mock-resource-001",
    title: input.title,
    tokenPreview: token.slice(0, 4),
    status: "created"
  };
}
