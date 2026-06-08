import { AskLLM } from "./interview";

export const TITLE_SYSTEM =
  "Give a short, plain, human title (3–6 words) for the project described. " +
  "No quotes, no trailing punctuation, no 'A '/'The ' prefix. Return ONLY the title.";

export async function generateTitle(
  idea: string,
  identity: string,
  askLLM: AskLLM,
): Promise<string> {
  try {
    const raw = (await askLLM(TITLE_SYSTEM, `IDEA: ${idea}\n\nIDENTITY:\n${identity}`))
      .trim()
      .replace(/^["'#\s]+|["'\s]+$/g, "");
    if (!raw) return "Untitled Build";
    return raw.length > 80 ? raw.slice(0, 80).trim() : raw;
  } catch {
    return "Untitled Build";
  }
}
