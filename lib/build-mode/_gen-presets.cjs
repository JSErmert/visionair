// Code generator: embeds lib/build-mode/presets/* into presets-data.ts so the
// pack route does not read preset files from disk at request time (Next.js does
// not trace those files into the route bundle — __dirname resolves to a virtual
// path and readFileSync throws ENOENT). Run from the project root:
//   node lib/build-mode/_gen-presets.cjs
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "presets");
const files = [
  "security.md",
  "architecture.md",
  "testing.md",
  "workflow.md",
  "ci.yml",
  "dependabot.yml",
  "pre-commit-config.yaml",
  "setup.md",
  "gitignore",
];

let out =
  "// AUTO-GENERATED — do not edit by hand.\n" +
  "// Source of truth: lib/build-mode/presets/*\n" +
  "// Regenerate after editing a preset: node lib/build-mode/_gen-presets.cjs\n" +
  "/* eslint-disable */\n" +
  "export const PRESET_FILES: Record<string, string> = {\n";
for (const f of files) {
  const content = fs.readFileSync(path.join(dir, f), "utf8");
  out += `  ${JSON.stringify(f)}: ${JSON.stringify(content)},\n`;
}
out += "};\n";

fs.writeFileSync(path.join(__dirname, "presets-data.ts"), out);
// eslint-disable-next-line no-console
console.log(`wrote presets-data.ts (${files.length} files embedded)`);
