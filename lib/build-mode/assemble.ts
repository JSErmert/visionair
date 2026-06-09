import { ElicitedArtifact } from "./types";
import { loadPresets } from "./presets";
import { READ_ORDER, CONFLICT_RULE, META_RULE } from "./authority";

export type FileMap = Record<string, string>;

export function assemble(elicited: ElicitedArtifact[]): FileMap {
  const map: FileMap = { ...loadPresets() };
  for (const a of elicited) {
    if (map[a.path]) {
      // preset baseline exists (e.g. 06-security): append elicited app-specifics
      map[a.path] = `${map[a.path]}\n\n## App-specific [${a.provenance}]\n${a.content}`;
    } else {
      map[a.path] = `<!-- [${a.provenance}] -->\n${a.content}`;
    }
  }
  map["LAUNCH.md"] =
    "<!-- [preset] -->\n# LAUNCH — read before any action\n\n" +
    "Read these files IN THIS ORDER, then build:\n\n" +
    READ_ORDER.map((f, i) => `${i + 1}. ${f}`).join("\n") +
    `\n\n${CONFLICT_RULE}\n\n${META_RULE}\n`;
  map["CLAUDE.md"] =
    "<!-- [preset] -->\n# CLAUDE — authority registry\n\n" +
    "Read `LAUNCH.md` first. Authority + conflict resolution:\n\n" +
    `${CONFLICT_RULE}\n\n${META_RULE}\n`;
  return map;
}
