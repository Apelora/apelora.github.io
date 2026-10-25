// Turns the control plane's OpenAPI document into documentation pages: every operation with what it
// does, what it needs, its parameters, a request body and a response taken from the schemas, and a
// curl command. Nothing here is written by hand per operation: when the API changes and the
// document is regenerated, the pages follow.
import { slugify } from "./markdown.mjs";

const METHODS = ["get", "post", "put", "patch", "delete"];

export function apiPages(api, tagInfo = {}, verified = {}) {
  const resolve = (s, seen = []) => {
    while (s && s.$ref) {
      const name = s.$ref.split("/").pop();
      if (seen.includes(name)) return { type: "object", $cycle: name };
      seen = [...seen, name];
      const ref = s.$ref;
      if (!ref.startsWith("#/")) throw new Error(`Unsupported reference: ${ref}`);
      s = ref.slice(2).split("/").reduce((value, key) => value?.[key.replace(/~1/g, "/").replace(/~0/g, "~")], api);
      if (!s) throw new Error(`Unresolved reference: ${ref}`);
    }
    return s;
  };

  const kinds = (s) => [].concat(s?.type ?? []).filter((t) => t !== "null");

  /** Illustrative schema values; keep every required field and never cut JSON text. */
  function example(schema, name = "", depth = 0, seen = []) {
    let s = schema;
    if (s?.$ref) {
      const n = s.$ref.split("/").pop();
      if (seen.includes(n)) return null;
      seen = [...seen, n];
      s = resolve(s);
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
      for (const k of keys) {
        const v = example(props[k], k, depth + 1, seen);
        if (v !== null && v !== undefined || required.has(k)) out[k] = v;
      }
      if (!keys.length && s.additionalProperties && s.additionalProperties !== true) out.key = example(s.additionalProperties, "key", depth + 1, seen);
      return out;
    }
    if (t === "array") return [example(s.items, name, depth + 1, seen)].filter((x) => x !== null);
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
    const summary = [...new Set([op.summary, op.description].filter(Boolean))].map(oneLine).join(" ");
    // Only permission clauses start with a code span. Preserve the complete source description.
    const needs = [...summary.matchAll(/\bneeds\s+(`[^`]+`(?:`[^`]+`|[^.`])*\.)/gi)].map((m) => m[1]);
    const security = op.security ?? api.security ?? [];
    const isPublic = security.length === 0 || security.some((requirement) => Object.keys(requirement).length === 0);
    const params = (op.parameters ?? []).map((p) => (p.$ref ? resolve(p) : p));
    const pathParams = params.filter((p) => p.in === "path");
    const queryParams = params.filter((p) => p.in === "query");
    const headerParams = params.filter((p) => p.in === "header");
    let url = path.replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(paramValue(pathParams.find((p) => p.name === n) ?? { name: n })));
    const q = queryParams.filter((p) => p.required).map((p) => `${p.name}=${encodeURIComponent(paramValue(p))}`);
    if (q.length) url += `?${q.join("&")}`;
    const captured = verified.responses?.find((r) => r.operationId === op.operationId && r.status < 300);
    if (captured?.path && path !== "/api/v1/audit/export") url = captured.path;
    const body = resolve(op.requestBody)?.content?.["application/json"]?.schema;
    const bodyExample = body ? captured?.requestBody ?? requestExample(body) : null;
    const idem = headerParams.some((p) => p.name.toLowerCase() === "idempotency-key");

    let md = `### \`${M} ${path}\`\n\n${summary || "—"}\n\n`;
    md += `**Operation ID:** \`${op.operationId}\`\n\n`;
    md += isPublic ? "**Sign-in:** none; this operation is public.\n\n" : `**Needs:** ${needs.length ? needs.join(" ") : "a signed-in caller; the server decides what that caller may see."}\n\n`;
    const all = [...pathParams, ...queryParams, ...headerParams];
    if (all.length) {
      md += "| Parameter | In | Type | Required | Meaning |\n|---|---|---|---|---|\n";
      md += all.map((p) => `| \`${p.name}\` | ${p.in} | ${typeOf(p.schema)} | ${p.required ? "yes" : "no"} | ${cell(p.description)} |`).join("\n") + "\n\n";
    }
    if (body) {
      md += `**Request body** (JSON):\n\n${fieldTable(body)}\n\`\`\`json\n${json(bodyExample)}\n\`\`\`\n\n`;
    }
    const codes = Object.keys(op.responses ?? {});
    const successes = codes.filter((c) => c.startsWith("2"));
    const mediaTypes = [...new Set(successes.flatMap((c) => Object.keys(resolve(op.responses[c])?.content ?? {})))];
    const command = (media) => {
      // The export selects its representation with a query parameter, rather than Accept.
      const address = path === "/api/v1/audit/export" ? `${url}${url.includes("?") ? "&" : "?"}format=${media === "text/csv" ? "csv" : "jsonl"}` : url;
      const curl = [`curl --fail-with-body -sS -X ${M} "$APELORA_URL${address}"`];
      if (!isPublic) curl.push(`  -H "Authorization: Bearer $APELORA_TOKEN"`);
      if (media) curl.push(`  -H "Accept: ${media}"`);
      if (idem) curl.push(`  -H "Idempotency-Key: $IDEMPOTENCY_KEY"`);
      if (body) curl.push(`  -H "Content-Type: application/json"`, `  --data-raw '${JSON.stringify(bodyExample).replace(/'/g, "'\\''")}'`);
      if (media && /application\/(x-tar|zip|octet-stream)/.test(media)) curl.push(`  --output support-bundle.${media === "application/x-tar" ? "tar" : media === "application/zip" ? "zip" : "bin"}`);
      return `\`\`\`sh\n${idem ? '# Generate once per distinct change; keep this value when retrying.\nIDEMPOTENCY_KEY=$(uuidgen)\n' : ""}${curl.join(" \\\n")}\n\`\`\`\n\n`;
    };
    md += "**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.\n\n";
    if (M !== "GET") md += "This request can change state. Check permissions, prerequisites and any required approval before running it.\n\n";
    md += (mediaTypes.length ? mediaTypes : [null]).map((media) => `${mediaTypes.length > 1 ? `For \`${media}\`:\n\n` : ""}${command(media)}`).join("");
    for (const code of successes) {
      const response = resolve(op.responses[code]);
      const content = Object.entries(response.content ?? {});
      md += `**Response \`${code}\`** — ${response.description || "Success"}${content.length ? "." : ", with no body."}\n\n`;
      for (const [media, value] of content) {
        md += `Content-Type: \`${media}\`.\n\n`;
        const actual = verified.responses?.find((r) => r.operationId === op.operationId && String(r.status) === code && r.mediaType === media);
        if (actual && Object.hasOwn(actual, "body")) {
          md += "**Example response** from a test installation; your IDs, names and times differ.\n\n";
          md += `\`\`\`${media === "application/json" ? "json" : "text"}\n${media === "application/json" ? json(actual.body) : actual.body.replace(/\r\n/g, "\n")}\n\`\`\`\n\n`;
        } else if (media === "application/json") {
          md += `**Example response** (placeholder values that show the shape):\n\n\`\`\`json\n${json(example(value.schema))}\n\`\`\`\n\n`;
        } else if (/application\/(x-tar|zip|octet-stream)/.test(media)) {
          md += "Binary download; the command saves the response to a file. For a tar bundle, list the files after a successful download:\n\n```sh\ntar -tf support-bundle.tar\n```\n\n";
          const capture = verified.responses?.find((r) => r.operationId === op.operationId && r.mediaType === media);
          if (capture?.listing) md += `**Example contents:**\n\n\`\`\`text\n${capture.listing}\n\`\`\`\n\n`;
        } else {
          md += "Text response; the command prints the returned text. ";
          md += media === "application/x-ndjson" ? "Each nonempty line is a JSON object.\n\n" : media === "text/csv" ? "The first row contains the column names.\n\n" : "Metrics use the Prometheus text exposition format.\n\n";
        }
      }
    }
    const errors = codes.filter((c) => !c.startsWith("2"));
    if (errors.length) md += `**Errors:** ${errors.map((c) => `\`${c}\``).join(", ")}. The body is \`{ "error": { "code": …, "message": … } }\`.\n\n`;
    return { md, M, path, summary: first(summary.replace(/^Public\.\s*/i, "")) };
  }

  const byTag = new Map();
  const operationIds = new Set();
  for (const [path, ops] of Object.entries(api.paths)) {
    for (const m of METHODS) {
      if (!ops[m]) continue;
      const id = ops[m].operationId;
      if (!id || typeof id !== "string" || operationIds.has(id)) throw new Error(`${m.toUpperCase()} ${path}: missing or duplicate operationId: ${id}`);
      operationIds.add(id);
      const tag = ops[m].tags?.[0] ?? "other";
      if (!byTag.has(tag)) byTag.set(tag, []);
      const params = new Map([...(ops.parameters ?? []), ...(ops[m].parameters ?? [])].map((p) => { const value = resolve(p); return [`${value.in}:${value.name}`, value]; }));
      byTag.get(tag).push(operation(m, path, { ...ops[m], parameters: [...params.values()] }));
    }
  }

  const order = (api.tags ?? []).map((t) => t.name);
  const tags = [...byTag.keys()].sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));
  const pages = tags.map((tag, i) => {
    const ops = byTag.get(tag).sort((a, b) => a.path.localeCompare(b.path) || METHODS.indexOf(a.M.toLowerCase()) - METHODS.indexOf(b.M.toLowerCase()));
    const info = tagInfo[tag] ?? {};
    const title = info.title ?? `${tag[0].toUpperCase()}${tag.slice(1)}`;
    let md = `${info.intro ?? `The ${tag} operations of the control plane's API.`} This page lists ${ops.length} operations.\n\nSet variables in the [API overview](/docs/api/overview/). Download [OpenAPI](/assets/api/openapi.json).\n\n`;
    md += `## Operations\n\n| Operation | What it does |\n|---|---|\n`;
    md += ops.map((o) => `| [\`${o.M} ${o.path}\`](#${slugify(`${o.M} ${o.path}`)}) | ${cell(o.summary)} |`).join("\n") + "\n\n";
    md += `## Details\n\n${ops.map((o) => o.md).join("")}`;
    return { tag, title: `${title} API`, label: title, order: i + 1, count: ops.length, summary: info.summary ?? `All ${ops.length} ${tag} operations, with examples.`, md };
  });
  return pages;
}
