import { rm } from "node:fs/promises";

for (const target of ["coverage", "dist"]) {
  await rm(target, { force: true, recursive: true });
}
