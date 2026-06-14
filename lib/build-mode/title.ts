import { AskLLM } from "./interview";

export const TITLE_SYSTEM =
  "Return a single short, plain project title of 3 to 6 words for the project described. " +
  "Plain text only on ONE line: no markdown, no headings, no '#', no code, no backticks, " +
  "no quotes, no ASCII art, no trailing punctuation, no 'A '/'The ' prefix. " +
  "Output ONLY the title.";

const MAX = 80;

const cap = (s: string): string => (s.length > MAX ? s.slice(0, MAX).trim() : s);

// Box-drawing + block-element ranges (used to detect ASCII-art that leaked from a blueprint).
const ART = /[─-▟]/;

/**
 * Reduce an LLM response to a clean single-line title, or return null if it is
 * clearly not a title (markdown blob, code fence, ASCII art, multi-line). The
 * caller falls back to a title derived from the idea when this returns null.
 */
export function sanitizeTitle(raw: string): string | null {
  if (!raw) return null;
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return null;
  if (lines.length > 1) return null; // a real title is one line; multi-line = blob

  const line = lines[0]
    .replace(/^[\s"'`#>*–—-]+/, "") // leading quotes / markdown / dashes
    .replace(/[\s"'`]+$/, "") // trailing quotes / backticks / space
    .trim();
  if (!line) return null;

  // Reject anything carrying markdown/code/art markers: code fences, any
  // backtick, a markdown heading (## or more), or box/block-drawing characters.
  // A single '#' (e.g. "C#") is allowed.
  if (/`/.test(line) || /#{2,}/.test(line) || ART.test(line)) return null;

  return cap(line);
}

/**
 * Deterministic, LLM-free fallback title built from the user's idea only — never
 * from the identity/blueprint (which is what produced the garbage in the first
 * place). Title-cases the first few meaningful words.
 */
export function titleFromIdea(idea: string): string {
  const cleaned = (idea || "")
    .replace(/[`#*_>|]/g, " ") // markdown
    .replace(/[─-▟]/g, " ") // box/block drawing
    .replace(/[^A-Za-z0-9\s-]/g, " ") // keep alnum / space / hyphen
    .replace(/\s+/g, " ")
    .trim();
  const stop = new Set(["a", "an", "the"]);
  const words = cleaned.split(" ").filter(Boolean);
  while (words.length && stop.has(words[0].toLowerCase())) words.shift();
  const picked = words.slice(0, 5);
  if (!picked.length || picked.join("").length < 2) return "Untitled Build";
  const title = picked
    .map((w) => (w.length <= 2 ? w : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join(" ");
  return cap(title);
}

/**
 * Clean a user-typed title for the manual rename feature. Unlike sanitizeTitle
 * (which guards against LLM blobs), this trusts the human: it just collapses
 * whitespace and caps length, returning null only when the result is empty.
 */
export function cleanManualTitle(raw: string): string | null {
  const s = (raw || "").replace(/\s+/g, " ").trim();
  if (!s) return null;
  return cap(s);
}

export async function generateTitle(
  idea: string,
  identity: string,
  askLLM: AskLLM,
): Promise<string> {
  try {
    const raw = await askLLM(TITLE_SYSTEM, `IDEA: ${idea}\n\nIDENTITY:\n${identity}`);
    const clean = sanitizeTitle(raw ?? "");
    return clean ?? titleFromIdea(idea);
  } catch {
    return titleFromIdea(idea);
  }
}
