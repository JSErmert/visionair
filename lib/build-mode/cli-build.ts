import { readFileSync, writeFileSync } from "fs";
import { runBuildMode, AnswerProvider } from "./orchestrate";
import { anthropicAskLLM } from "./llm";

export function answerFromMap(answers: Record<string, string>): AnswerProvider {
  return async (q) => answers[q.move] ?? "not sure";
}

// Operator-attended entry: `npm run build-mode -- --in idea.json --out pack.zip [--opus]`
export async function main(argv: string[]): Promise<void> {
  const arg = (k: string) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const inPath = arg("--in"); const outPath = arg("--out") ?? "build-mode-pack.zip";
  if (!inPath) throw new Error("usage: --in <idea.json> [--out pack.zip] [--opus]");
  const { idea, answers } = JSON.parse(readFileSync(inPath, "utf8"));
  const questionLLM = anthropicAskLLM({ model: "claude-sonnet-4-6", maxTokens: 400 });
  const synthLLM = anthropicAskLLM({
    model: argv.includes("--opus") ? "claude-opus-4-7" : "claude-sonnet-4-6",
    maxTokens: 2000,
  });
  const { zip } = await runBuildMode({ idea, answer: answerFromMap(answers), questionLLM, synthLLM });
  writeFileSync(outPath, zip);
  // eslint-disable-next-line no-console
  console.log(`wrote ${outPath}`);
}

// ESM-compatible entry guard (tsx runs this as ESM)
const isMain = process.argv[1] != null &&
  (process.argv[1].endsWith("cli-build.ts") || process.argv[1].endsWith("cli-build.js"));
if (isMain) {
  main(process.argv.slice(2)).catch((e) => { console.error(e); process.exit(1); });
}
