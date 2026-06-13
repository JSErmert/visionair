import { type ReactNode } from "react";

// Lightweight markdown renderer for the blueprint — no dependency. Handles the
// subset the synthesizer emits: #/##/### headers, - and 1. lists, ``` code
// fences, **bold**, `code`, and paragraphs. Renders into the themed type scale so
// the blueprint reads like a document, not a wall of monospace ## text.

function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2] !== undefined)
      parts.push(
        <strong key={key++} className="font-semibold text-foreground">
          {m[2]}
        </strong>,
      );
    else if (m[3] !== undefined)
      parts.push(
        <code key={key++} className="rounded bg-foreground/10 px-1.5 py-0.5 font-mono text-[0.85em]">
          {m[3]}
        </code>,
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default function BlueprintView({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");
  const out: ReactNode[] = [];
  let listItems: string[] | null = null;
  let listOrdered = false;
  let key = 0;
  let i = 0;

  const flushList = () => {
    if (!listItems) return;
    const items = listItems;
    out.push(
      listOrdered ? (
        <ol key={key++} className="mb-4 ml-5 list-decimal space-y-1.5 text-foreground/80">
          {items.map((it, j) => (
            <li key={j}>{inline(it)}</li>
          ))}
        </ol>
      ) : (
        <ul key={key++} className="mb-4 ml-5 list-disc space-y-1.5 text-foreground/80">
          {items.map((it, j) => (
            <li key={j}>{inline(it)}</li>
          ))}
        </ul>
      ),
    );
    listItems = null;
  };

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      flushList();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      i++;
      out.push(
        <pre
          key={key++}
          className="mb-4 overflow-x-auto rounded-xl bg-foreground/[0.04] p-4 font-mono text-[0.8rem] leading-relaxed text-foreground/80"
        >
          {code.join("\n")}
        </pre>,
      );
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      flushList();
      const level = h[1].length;
      const txt = inline(h[2]);
      if (level === 1)
        out.push(
          <h2 key={key++} className="mb-3 mt-6 font-serif text-2xl font-semibold text-foreground first:mt-0">
            {txt}
          </h2>,
        );
      else if (level === 2)
        out.push(
          <h3 key={key++} className="mb-2 mt-5 text-lg font-semibold text-foreground">
            {txt}
          </h3>,
        );
      else
        out.push(
          <h4 key={key++} className="mb-2 mt-4 text-base font-semibold text-foreground/90">
            {txt}
          </h4>,
        );
      i++;
      continue;
    }
    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ul) {
      if (!listItems || listOrdered) {
        flushList();
        listItems = [];
        listOrdered = false;
      }
      listItems.push(ul[1]);
      i++;
      continue;
    }
    if (ol) {
      if (!listItems || !listOrdered) {
        flushList();
        listItems = [];
        listOrdered = true;
      }
      listItems.push(ol[1]);
      i++;
      continue;
    }
    if (line.trim() === "") {
      flushList();
      i++;
      continue;
    }
    flushList();
    out.push(
      <p key={key++} className="mb-3 leading-7 text-foreground/80">
        {inline(line)}
      </p>,
    );
    i++;
  }
  flushList();
  return <div className="text-[0.95rem]">{out}</div>;
}
