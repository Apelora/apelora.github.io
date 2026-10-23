// A small Markdown to HTML converter for the documentation pages. No dependencies.
// Covers what the documentation uses: headings, paragraphs, lists (nested, ordered, task),
// tables, fenced code, blockquotes, rules, links, images, emphasis, code spans and a few inline tags.
// Anything it does not understand is reported by `unsupported` so the build can fail loudly.

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** GitHub-style heading id: lower case, punctuation removed, spaces to hyphens. */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

const INLINE_TAGS = /^<\/?(?:br|kbd|sub|sup|b|i|em|strong|code|abbr|mark|span)(?:\s[^>]*)?\/?>/i;

/**
 * Inline Markdown to HTML. `ctx.link(href)` may rewrite an address; `ctx.image(src)` likewise.
 */
export function inline(src, ctx = {}, stash = []) {
  const keep = (html) => `\u0000${stash.push(html) - 1}\u0000`;
  let s = src;
  // code spans first, so nothing inside them is interpreted
  s = s.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (_, __, code) => keep(`<code>${esc(code.replace(/^ (.*) $/, "$1"))}</code>`));
  // backslash escapes
  s = s.replace(/\\([\\`*_{}\[\]()#+\-.!|<>~])/g, (_, c) => keep(esc(c)));
  // images, then links (the text may hold images or code)
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, alt, href, title) =>
    keep(`<img src="${esc(ctx.image ? ctx.image(href) : href)}" alt="${esc(alt)}"${title ? ` title="${esc(title)}"` : ""} loading="lazy">`));
  s = s.replace(/\[((?:[^\[\]]|\[[^\]]*\])*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, text, href, title) => {
    const to = ctx.link ? ctx.link(href) : href;
    const external = /^https?:\/\//.test(to);
    return keep(`<a href="${esc(to)}"${title ? ` title="${esc(title)}"` : ""}${external ? ' rel="noopener"' : ""}>${inline(text, { ...ctx, nolink: true }, stash)}</a>`);
  });
  s = s.replace(/<(https?:\/\/[^>\s]+)>/g, (_, u) => keep(`<a href="${esc(u)}" rel="noopener">${esc(u)}</a>`));
  // a few inline tags pass through
  s = s.replace(/<\/?[a-zA-Z][^>]*>/g, (tag) => (INLINE_TAGS.test(tag) ? keep(tag.replace(/\son\w+="[^"]*"/gi, "")) : esc(tag)));
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  s = esc(s.replace(/&(?!amp;|lt;|gt;|quot;|#\d+;)/g, "&"));
  s = s.replace(/\*\*\*(?=\S)([\s\S]*?\S)\*\*\*/g, "<strong><em>$1</em></strong>");
  s = s.replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/__(?=\S)([\s\S]*?\S)__/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*\w])\*(?=\S)([^*]*?\S)\*(?!\*)/g, "$1<em>$2</em>");
  s = s.replace(/(^|[^_\w])_(?=\S)([^_]*?\S)_(?![_\w])/g, "$1<em>$2</em>");
  s = s.replace(/~~(?=\S)([\s\S]*?\S)~~/g, "<del>$1</del>");
  s = s.replace(/(?: {2,}|\\)\n/g, "<br>\n");
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => stash[Number(i)]);
}

const isFence = (l) => /^\s*(```|~~~)/.test(l);
const isHr = (l) => /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/.test(l);
const isHeading = (l) => /^ {0,3}#{1,6}(\s|$)/.test(l);
const listMarker = (l) => l.match(/^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/);
const isTableSep = (l) => /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(l) && l.includes("-");
const splitRow = (l) => {
  let t = l.trim();
  if (t.startsWith("|")) t = t.slice(1);
  if (t.endsWith("|") && !t.endsWith("\\|")) t = t.slice(0, -1);
  const cells = [];
  let cur = "";
  let inCode = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === "`") inCode = !inCode;
    if (c === "\\" && t[i + 1] === "|") { cur += "|"; i++; continue; }
    if (c === "|" && !inCode) { cells.push(cur.trim()); cur = ""; continue; }
    cur += c;
  }
  cells.push(cur.trim());
  return cells;
};

/**
 * Converts Markdown to HTML. Returns { html, headings, mermaid, unsupported }.
 * `ctx.link`, `ctx.image` rewrite addresses. `ctx.diagram(source, index)` returns HTML for a mermaid block.
 */
export function render(md, ctx = {}) {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const headings = [];
  const unsupported = [];
  const used = new Map();
  let mermaidIndex = 0;

  function headingId(text) {
    const base = slugify(text) || "section";
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    return n ? `${base}-${n}` : base;
  }

  function blocks(ls) {
    const out = [];
    let i = 0;
    while (i < ls.length) {
      const l = ls[i];
      if (!l.trim()) { i++; continue; }

      if (isFence(l)) {
        const m = l.match(/^(\s*)(```+|~~~+)\s*([^\s`]*)/);
        const indent = m[1].length;
        const fence = m[2];
        const lang = m[3];
        const body = [];
        i++;
        while (i < ls.length && !new RegExp(`^\\s*${fence[0]}{${fence.length},}\\s*$`).test(ls[i])) { body.push(ls[i].slice(Math.min(indent, ls[i].length - ls[i].trimStart().length))); i++; }
        i++;
        const code = body.join("\n");
        if (lang === "mermaid" && ctx.diagram) out.push(ctx.diagram(code, mermaidIndex++));
        else out.push(`<pre${lang ? ` data-lang="${esc(lang)}"` : ""} tabindex="0"><code>${esc(code)}</code></pre>`);
        continue;
      }

      if (isHeading(l)) {
        const m = l.match(/^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/);
        const level = m[1].length;
        const html = inline(m[2], ctx);
        const text = html.replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
        const id = headingId(text);
        if (level > 1) headings.push({ level, id, text });
        else headings.push({ level: 1, id, text });
        out.push(`<h${level} id="${id}">${html}</h${level}>`);
        i++;
        continue;
      }

      if (isHr(l)) { out.push("<hr>"); i++; continue; }

      if (/^\s*<!--/.test(l)) {
        while (i < ls.length && !/-->/.test(ls[i])) i++;
        i++;
        continue;
      }

      if (/^\s*>/.test(l)) {
        const q = [];
        while (i < ls.length && /^\s*>/.test(ls[i])) { q.push(ls[i].replace(/^\s*> ?/, "")); i++; }
        out.push(`<blockquote>${blocks(q)}</blockquote>`);
        continue;
      }

      if (/^\s*<(details|summary|div|p|table|figure|img|a|picture|center)\b/i.test(l)) {
        const h = [];
        while (i < ls.length && ls[i].trim()) { h.push(ls[i]); i++; }
        const raw = h.join("\n");
        // raw block HTML is kept, scripts and event handlers never
        out.push(raw.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/\son\w+="[^"]*"/gi, ""));
        continue;
      }

      if (l.includes("|") && ls[i + 1] !== undefined && isTableSep(ls[i + 1]) && splitRow(l).length === splitRow(ls[i + 1]).length) {
        const head = splitRow(l);
        const align = splitRow(ls[i + 1]).map((c) => (c.startsWith(":") && c.endsWith(":") ? "center" : c.endsWith(":") ? "right" : ""));
        i += 2;
        const rows = [];
        while (i < ls.length && ls[i].trim() && ls[i].includes("|")) { rows.push(splitRow(ls[i])); i++; }
        const cell = (tag, c, k) => `<${tag}${tag === "th" ? ' scope="col"' : ""}${align[k] ? ` style="text-align:${align[k]}"` : ""}>${inline(c, ctx)}</${tag}>`;
        out.push(
          `<div class="table-wrap" tabindex="0" role="region" aria-label="Table"><table><thead><tr>${head.map((c, k) => cell("th", c, k)).join("")}</tr></thead><tbody>${rows
            .map((r) => `<tr>${head.map((_, k) => cell("td", r[k] ?? "", k)).join("")}</tr>`)
            .join("")}</tbody></table></div>`,
        );
        continue;
      }

      if (listMarker(l) && !isHr(l)) {
        const first = listMarker(l);
        const ordered = /\d/.test(first[2]);
        const baseIndent = first[1].length;
        const items = [];
        while (i < ls.length) {
          const m = listMarker(ls[i]);
          if (m && m[1].length === baseIndent && !isHr(ls[i]) && /\d/.test(m[2]) === ordered) {
            const content = [m[3]];
            const contentIndent = baseIndent + m[2].length + 1;
            i++;
            while (i < ls.length) {
              const nx = ls[i];
              if (!nx.trim()) {
                // blank line: the item continues if the next non-blank line is indented under it
                let j = i + 1;
                while (j < ls.length && !ls[j].trim()) j++;
                if (j < ls.length && ls[j].match(/^\s*/)[0].length >= contentIndent && !(listMarker(ls[j]) && ls[j].match(/^\s*/)[0].length <= baseIndent)) { content.push(""); i++; continue; }
                break;
              }
              const ind = nx.match(/^\s*/)[0].length;
              if (ind > baseIndent || (!listMarker(nx) && !isHeading(nx) && !isFence(nx) && ind > baseIndent - 1 && !/^\s*>/.test(nx) && !nx.includes("|"))) { content.push(nx.slice(Math.min(ind, contentIndent))); i++; continue; }
              if (ind > baseIndent) { content.push(nx.slice(contentIndent)); i++; continue; }
              if (!listMarker(nx) && ind <= baseIndent && !isHeading(nx) && !isFence(nx) && content.length && content[content.length - 1] !== "") { content.push(nx.trim()); i++; continue; } // lazy continuation
              break;
            }
            items.push(content);
          } else break;
        }
        const loose = items.some((c) => c.includes(""));
        const rendered = items.map((c) => {
          let first = c[0];
          let box = "";
          const t = first.match(/^\[([ xX])\]\s+/);
          if (t) { box = `<input type="checkbox" disabled aria-label="${t[1] !== " " ? "Done" : "To do"}"${t[1] !== " " ? " checked" : ""}> `; first = first.slice(t[0].length); }
          const inner = blocks([first, ...c.slice(1)]);
          const html = loose ? inner : inner.replace(/^<p>([\s\S]*?)<\/p>/, "$1");
          return `<li>${box}${html}</li>`;
        });
        const startAt = ordered ? Number(first[2]) : 1;
        out.push(`<${ordered ? "ol" : "ul"}${ordered && startAt !== 1 ? ` start="${startAt}"` : ""}>${rendered.join("")}</${ordered ? "ol" : "ul"}>`);
        continue;
      }

      // paragraph
      const p = [];
      while (i < ls.length && ls[i].trim() && !isFence(ls[i]) && !isHeading(ls[i]) && !isHr(ls[i]) && !/^\s*>/.test(ls[i]) && !(listMarker(ls[i]) && p.length) && !(ls[i].includes("|") && ls[i + 1] !== undefined && isTableSep(ls[i + 1]))) { p.push(ls[i]); i++; }
      if (!p.length) { unsupported.push(ls[i]); i++; continue; }
      out.push(`<p>${inline(p.join("\n"), ctx)}</p>`);
    }
    return out.join("\n");
  }

  const html = blocks(lines);
  return { html, headings, unsupported };
}
