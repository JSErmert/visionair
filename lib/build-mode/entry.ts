export type EntryPoint = "strength" | "problem" | "idea" | "direction" | "unsure";

const FRAMING: Record<EntryPoint, string> = {
  strength: "Building from a capability I have:",
  problem: "Building around a problem I care about:",
  idea: "An idea I can't stop thinking about:",
  direction: "A direction I want to explore:",
  unsure: "Still finding the shape of it:",
};

export function composeIdea(entry: EntryPoint, description: string): string {
  const prefix = FRAMING[entry];
  if (!description.trim()) return prefix;
  return `${prefix}\n${description}`;
}
