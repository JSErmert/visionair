import { ElicitedArtifact } from "./types";
import { AskLLM } from "./interview";

interface Contradiction { summary: string; locations: string }

const RECON_FILES = [
  "docs/context/03-spec.md",
  "docs/context/04-contracts.md",
  "docs/context/06-security.md",
];

export async function reconcile(
  arts: ElicitedArtifact[],
  askLLM: AskLLM,
): Promise<ElicitedArtifact[]> {
  const relevant = arts.filter((a) => RECON_FILES.includes(a.path));
  if (relevant.length < 2) return arts;
  const system =
    "You are a cross-file consistency checker for a Claude Code context pack. Find " +
    "CONTRADICTIONS where an API route, auth rule, or contract in one file conflicts with " +
    "another (e.g. the spec exposes an endpoint to a role that security/contracts forbid). " +
    'Return ONLY a JSON array of {"summary": string, "locations": string}. Empty array if none.';
  const user = relevant.map((a) => `=== ${a.path} ===\n${a.content}`).join("\n\n");
  let found: Contradiction[] = [];
  try {
    const raw = (await askLLM(system, user)).trim()
      .replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) found = parsed;
  } catch {
    found = []; // parse failure must not block the pack; treat as "none detected"
  }
  if (found.length === 0) return arts;
  const block =
    "\n## Cross-file contradictions (auto-detected — resolve before building)\n" +
    found.map((c) => `- **${c.summary}** (${c.locations})`).join("\n");
  return arts.map((a) =>
    a.path === "docs/context/07-known-gaps.md"
      ? { ...a, content: a.content + block }
      : a,
  );
}
