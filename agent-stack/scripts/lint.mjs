import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const ignoredDirs = new Set(["node_modules", "dist", "coverage", ".git", "worktrees", "output"]);
const textExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".md", ".yml", ".yaml", ".hbs", ".txt", ".example"]);
const secretPatterns = [
  /sk-[A-Za-z0-9_-]{20,}/,
  /Bearer\s+[A-Za-z0-9._-]{20,}/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/
];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else {
      const ext = entry.name === ".env.example" ? ".example" : path.extname(entry.name);
      if (textExtensions.has(ext)) files.push(fullPath);
    }
  }
  return files;
}

const failures = [];
for (const file of await walk(root)) {
  const text = await readFile(file, "utf8");
  if (/\t/.test(text)) {
    failures.push(`${path.relative(root, file)} contains tab characters`);
  }
  for (const pattern of secretPatterns) {
    if (pattern.test(text)) {
      failures.push(`${path.relative(root, file)} appears to contain a secret-like value`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("lint ok");
