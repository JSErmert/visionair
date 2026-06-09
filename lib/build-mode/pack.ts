import JSZip from "jszip";
import { FileMap } from "./assemble";

export async function pack(files: FileMap): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const [path, content] of Object.entries(files)) zip.file(path, content);
  return zip.generateAsync({ type: "uint8array" });
}
