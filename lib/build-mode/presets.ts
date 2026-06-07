import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Support both CJS (__dirname) and ESM (import.meta.url) environments
const _dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));

const DIR = join(_dirname, "presets");

const MAP: Record<string, string> = {
  "security.md": "docs/context/06-security.md",
  "architecture.md": "docs/context/05-architecture.md",
  "testing.md": "docs/context/testing.md",
  "workflow.md": "docs/context/08-workflow.md",
  "ci.yml": ".github/workflows/ci.yml",
  "dependabot.yml": ".github/dependabot.yml",
  "pre-commit-config.yaml": ".pre-commit-config.yaml",
  "setup.md": "SETUP.md",
  "gitignore": ".gitignore",
};

export function loadPresets(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [src, dest] of Object.entries(MAP)) {
    out[dest] = readFileSync(join(DIR, src), "utf8");
  }
  return out;
}
