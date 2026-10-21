// Turns the control plane's OpenAPI document into documentation pages: every operation with what it
// does, what it needs, its parameters, a request body and a response taken from the schemas, and a
// curl command. Nothing here is written by hand per operation: when the API changes and the
// document is regenerated, the pages follow.
import { slugify } from "./markdown.mjs";

const METHODS = ["get", "post", "put", "patch", "delete"];

export function apiPages(api, tagInfo = {}) {
  const schemas = api.components?.schemas ?? {};

  const resolve = (s, seen = []) => {
    while (s && s.$ref) {
      const name = s.$ref.split("/").pop();
      if (seen.includes(name)) return { type: "object", $cycle: name };
      seen = [...seen, name];
      s = schemas[name];
    }
    return s;
  };

  const kinds = (s) => [].concat(s?.type ?? []).filter((t) => t !== "null");

  /** A believable example value for a schema, shallow enough to read. */
  function example(schema, name = "", depth = 0, seen = []) {
    let s = schema;
    if (s?.$ref) {
      const n = s.$ref.split("/").pop();
      if (seen.includes(n) || depth > 5) return null;
      seen = [...seen, n];
      s = schemas[n];
    }
    if (!s) return null;
    if (s.example !== undefined) return s.example;
    if (s.const !== undefined) return s.const;
    if (s.enum?.length) return s.enum[0];
    if (s.allOf) return Object.assign({}, ...s.allOf.map((a) => example(a, name, depth, seen) ?? {}));
    const alt = s.oneOf ?? s.anyOf;
    if (alt) {
      const pick = alt.find((a) => resolve(a)?.type !== "null") ?? alt[0];
      return example(pick, name, depth, seen);
    }
    const t = kinds(s)[0];
    if (t === "object" || s.properties || s.additionalProperties) {
      const out = {};
      const props = s.properties ?? {};
      const required = new Set(s.required ?? []);
      const keys = Object.keys(props).sort((a, b) => Number(required.has(b)) - Number(required.has(a)));
      for (const k of keys.slice(0, 14)) {
        const v = example(props[k], k, depth + 1, seen);
        if (v !== null && v !== undefined) out[k] = v;
      }
      if (!keys.length && s.additionalProperties && s.additionalProperties !== true) out.key = example(s.additionalProperties, "key", depth + 1, seen);
      return out;
    }
    if (t === "array") return depth > 4 ? [] : [example(s.items, name, depth + 1, seen)].filter((x) => x !== null);
    if (t === "integer" || t === "number") return s.minimum !== undefined ? s.minimum : 1;
    if (t === "boolean") return false;
    if (t === "string" || !t) return stringExample(s, name);
    return null;
  }

  function stringExample(s, name) {
    const n = name.toLowerCase();
    if (s.format === "uuid" || /(^|[^a-z])id$/.test(n) && n.length > 2) return "00000000-0000-4000-8000-000000000001";
    if (s.format === "date-time" || /(at|time)$/.test(n)) return "2026-01-01T09:00:00Z";
    if (s.format === "uri" || /url$/.test(n)) return "https://example.org";
    if (n.includes("email")) return "alex@example.org";
    if (n.includes("project")) return "apelora";
    if (n.includes("password") || n.includes("secret") || n.includes("token")) return "<redacted>";
    if (n === "name" || n.endsWith("name")) return "example";
    if (n.includes("description")) return "A description";
    return "example";
  }

  const pathExample = { name: "shop", project: "apelora", id: "00000000-0000-4000-8000-000000000001", revision: "1", member: "node-1", instance: "web-01", token: "00000000-0000-4000-8000-000000000001" };
  const paramValue = (p) => pathExample[p.name] ?? String(example(p.schema ?? {}, p.name) ?? "example");

  const oneLine = (t) => (t ?? "").replace(/\s+/g, " ").trim();
  const first = (t) => oneLine(t).replace(/^(.+?[.!?])(\s.*)?$/, "$1");
  const json = (v) => JSON.stringify(v, null, 2);
  const cell = (t) => oneLine(t).replace(/\|/g, "\\|") || "—";
  const typeOf = (sc) => {
    const r = resolve(sc ?? {});
    if (!r) return "any";
    if (r.enum) return r.enum.map((e) => `\`${e}\``).join(", ");
    const k = kinds(r);
    if (k[0] === "array") return `list of ${typeOf(r.items)}`;
    return k.join(" or ") || (r.oneOf || r.anyOf ? "one of several" : "object");
  };

  function fieldTable(schema) {
    const s = resolve(schema);
    if (!s?.properties) return "";
    const required = new Set(s.required ?? []);
    const rows = Object.entries(s.properties).map(([k, v]) => `| \`${k}\` | ${typeOf(v)} | ${required.has(k) ? "yes" : "no"} | ${cell(resolve(v)?.description ?? v.description)} |`);
    return `| Field | Type | Required | Meaning |\n|---|---|---|---|\n${rows.join("\n")}\n`;
  }

  /** A request body with the required fields only (or the first optional one when none is required): the field table lists the rest. */
  function requestExample(schema) {
    const full = example(schema);
    const s = resolve(schema);
    if (!full || typeof full !== "object" || Array.isArray(full) || !s?.properties) return full;
    const required = (s.required ?? []).filter((k) => k in full);
    const keep = required.length ? required : Object.keys(full).slice(0, 1);
    return Object.fromEntries(keep.map((k) => [k, full[k]]));
  }

  function operation(method, path, op) {
    const M = method.toUpperCase();
    const full = oneLine(op.summary ?? op.description ?? "");
    // "Needs `x` …." sentences move to the Needs line, so each fact is stated once.
    const needs = [...full.matchAll(/Needs\s+((?:`[^`]*`|[^.`])*\.)/g)].map((m) => m[1]);
    const summary = oneLine(full.replace(/\s*Needs\s+(?:`[^`]*`|[^.`])*\./g, ""));
    const isPublic = Array.isArray(op.security) && op.security.length === 0 || /^Public\b/.test(summary);
    const params = (op.parameters ?? []).map((p) => (p.$ref ? resolve(p) : p));
    const pathParams = params.filter((p) => p.in === "path");
    const queryParams = params.filter((p) => p.in === "query");
    const headerParams = params.filter((p) => p.in === "header");
    let url = path.replace(/\{([^}]+)\}/g, (_, n) => paramValue(pathParams.find((p) => p.name === n) ?? { name: n }));
    const q = queryParams.filter((p) => p.required).map((p) => `${p.name}=${encodeURIComponent(paramValue(p))}`);
    if (q.length) url += `?${q.join("&")}`;
    const body = op.requestBody?.content?.["application/json"]?.schema;
    const bodyExample = body ? requestExample(body) : null;
    const idem = headerParams.some((p) => p.name.toLowerCase() === "idempotency-key");

    let md = `### \`${M} ${path}\`\n\n${summary || "—"}\n\n`;
    md += isPublic ? "**Sign-in:** none; this operation is public.\n\n" : `**Needs:** ${needs.length ? needs.join(" ") : "a signed-in caller; the server decides what that caller may see."}\n\n`;
    const all = [...pathParams, ...queryParams, ...headerParams];
    if (all.length) {
      md += "| Parameter | In | Type | Required | Meaning |\n|---|---|---|---|---|\n";
      md += all.map((p) => `| \`${p.name}\` | ${p.in} | ${typeOf(p.schema)} | ${p.required ? "yes" : "no"} | ${cell(p.description)} |`).join("\n") + "\n\n";
    }
    if (body) {
      md += `**Request body** (JSON):\n\n${fieldTable(body)}\n\`\`\`json\n${json(bodyExample)}\n\`\`\`\n\n`;
    }
    const curl = [`curl -sS -X ${M} "$APELORA_URL${url}"`, `  -H "Authorization: Bearer $APELORA_TOKEN"`];
    if (idem) curl.push(`  -H "Idempotency-Key: $(uuidgen)"`);
    if (body) curl.push(`  -H "Content-Type: application/json"`, `  -d '${JSON.stringify(bodyExample)}'`);
    md += `\`\`\`sh\n${curl.join(" \\\n")}\n\`\`\`\n\n`;
    const codes = Object.keys(op.responses ?? {});
    const okCode = codes.find((c) => c.startsWith("2"));
    const okSchema = okCode && op.responses[okCode]?.content?.["application/json"]?.schema;
    if (okCode) {
      const ex = okSchema ? example(okSchema) : null;
      md += `**Response \`${okCode}\`**${okSchema ? ":" : ", with no body."}\n\n`;
      if (okSchema && ex !== null) {
        const text = json(ex);
        md += `\`\`\`json\n${text.split("\n").length > 70 ? text.split("\n").slice(0, 70).join("\n") + "\n  …" : text}\n\`\`\`\n\n`;
      }
    }
    const errors = codes.filter((c) => !c.startsWith("2"));
    if (errors.length) md += `**Errors:** ${errors.map((c) => `\`${c}\``).join(", ")}. The body is \`{ "error": { "code": …, "message": … } }\`.\n\n`;
    return { md, M, path, summary: first(summary) };
  }

  const byTag = new Map();
  for (const [path, ops] of Object.entries(api.paths)) {
    for (const m of METHODS) {
      if (!ops[m]) continue;
      const tag = ops[m].tags?.[0] ?? "other";
      if (!byTag.has(tag)) byTag.set(tag, []);
      byTag.get(tag).push(operation(m, path, ops[m]));
    }
  }

  const order = (api.tags ?? []).map((t) => t.name);
  const tags = [...byTag.keys()].sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));
  const pages = tags.map((tag, i) => {
    const ops = byTag.get(tag).sort((a, b) => a.path.localeCompare(b.path) || METHODS.indexOf(a.M.toLowerCase()) - METHODS.indexOf(b.M.toLowerCase()));
    const info = tagInfo[tag] ?? {};
    const title = info.title ?? `${tag[0].toUpperCase()}${tag.slice(1)}`;
    let md = `${info.intro ?? `The ${tag} operations of the control plane's API.`} This page documents all ${ops.length} operations, each with a request you can copy. Set \`APELORA_URL\` and \`APELORA_TOKEN\` as described in [the API overview](/docs/api/overview/).\n\n`;
    md += `## Operations\n\n| Operation | What it does |\n|---|---|\n`;
    md += ops.map((o) => `| [\`${o.M} ${o.path}\`](#${slugify(`${o.M} ${o.path}`)}) | ${cell(o.summary)} |`).join("\n") + "\n\n";
    md += `## Details\n\n${ops.map((o) => o.md).join("")}`;
    return { tag, title: `${title} API`, label: title, order: i + 1, count: ops.length, summary: info.summary ?? `All ${ops.length} ${tag} operations, with examples.`, md };
  });
  return pages;
}
