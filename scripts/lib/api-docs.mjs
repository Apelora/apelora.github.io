// Turns the control plane's OpenAPI document into documentation pages: every operation with what it
// does, what it needs, its parameters and options, the request body field by field, a curl command
// (and a second one with the options), a TypeScript call, the response and its error codes.
// Nothing here is written by hand per operation: when the API changes and the document is
// regenerated, the pages follow. Recorded output comes from scripts/verify-api-examples.py; error
// codes from scripts/lib/api-errors.mjs (the handlers) and from what the verifier observed.
import { slugify } from "./markdown.mjs";

const METHODS = ["get", "post", "put", "patch", "delete"];

/** Codes every authenticated operation can return; the overview lists them once. */
export const SHARED_CODES = {
  401: ["unauthenticated", "invalid_token"],
  403: ["forbidden", "mfa_required", "account_disabled"],
  429: ["rate_limited"],
  500: ["store_error", "internal"],
  502: ["incus_unreachable", "incus_authentication", "incus_not_found", "incus_api_error", "incus_bad_response", "incus_unsupported_capability"],
  503: ["database_not_configured", "store_unavailable", "incus_not_configured", "incus_invalid_config"],
};

const LIST_ITEMS = 2;
const TEXT_LINES = { "text/plain": 15, "text/csv": 4, "application/x-ndjson": 3 };

export function apiPages(api, tagInfo = {}, verified = {}, options = {}) {
  const { errorCodes = {}, paramNotes = {} } = options;
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
  const nullable = (s) => [].concat(s?.type ?? []).includes("null") || (s?.oneOf ?? s?.anyOf ?? []).some((a) => resolve(a)?.type === "null");

  /** Placeholder schema values; keep every required field and never cut JSON text. */
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
    // A paging cursor: the `next` a previous page answered.
    if (n === "after") return "41";
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
  const code = (v) => `\`${typeof v === "string" ? v : JSON.stringify(v)}\``;
  const sentence = (t) => { const s = oneLine(t); return s && !/[.!?:)]$/.test(s) ? `${s}.` : s; };

  /** "string", "integer, 1–500", "one of `a`, `b`", "list of string", … for a parameter or field. */
  function typeOf(sc) {
    const r = resolve(sc ?? {});
    if (!r) return "any";
    if (r.enum) return `one of ${r.enum.map(code).join(", ")}`;
    const alt = (r.oneOf ?? r.anyOf)?.filter((a) => resolve(a)?.type !== "null");
    if (alt?.length === 1) return typeOf(alt[0]);
    if (alt?.length) {
      const objects = alt.map((a) => resolve(a));
      return objects.every((o) => o.properties) ? "object" : "one of several";
    }
    const k = kinds(r);
    if (k[0] === "array") {
      const items = typeOf(r.items);
      return items.startsWith("one of ") ? `list, each ${items}` : `list of ${items}`;
    }
    const base = k.join(" or ") || "object";
    const format = r.format && !["int32", "int64", "double", "float", "password"].includes(r.format) ? ` (${r.format})` : "";
    const range = r.minimum !== undefined && r.maximum !== undefined ? `, ${r.minimum}–${r.maximum}` : r.maximum !== undefined ? `, at most ${r.maximum}` : r.minimum > 0 ? `, at least ${r.minimum}` : "";
    return base + format + range;
  }

  /** A default stated in the schema or in the description ("default 100", "Default `jsonl`"). */
  function defaultOf(sc, description) {
    const r = resolve(sc ?? {});
    if (r?.default !== undefined) return code(r.default);
    const m = /\bdefault(?:s to|:)?\s+`?([^`),;]+?)`?(?=[),;.]|\s*$)/i.exec(oneLine(description));
    return m ? code(m[1].trim()) : null;
  }

  /** Rows for a request body: every field, and one level of nesting as `parent.child`. */
  function fieldRows(schema) {
    const rows = [];
    const add = (name, sc, required, meaning) => {
      const r = resolve(sc ?? {});
      const description = sentence(sc?.description ?? r?.description);
      const def = defaultOf(sc, "");
      rows.push(`| \`${name}\` | ${typeOf(sc)}${nullable(r) ? " or null" : ""} | ${required} | ${cell([description, meaning, def ? `Default ${def}.` : ""].filter(Boolean).join(" "))} |`);
    };
    const children = (sc) => {
      let r = resolve(sc ?? {});
      const alt = (r.oneOf ?? r.anyOf)?.map((a) => resolve(a)).filter((a) => a.type !== "null");
      if (alt?.length === 1) r = alt[0];
      else if (alt?.length) {
        // Variants told apart by a `type` (or `kind`) field: one row per field, saying when it applies.
        const objects = alt.filter((a) => a.properties);
        if (objects.length !== alt.length) return null;
        const tag = ["type", "kind"].find((t) => objects.every((o) => resolve(o.properties[t] ?? {}).enum));
        const props = new Map();
        for (const o of objects) for (const [k, v] of Object.entries(o.properties)) {
          const entry = props.get(k) ?? { schema: v, in: [], required: [] };
          entry.in.push(o);
          if ((o.required ?? []).includes(k)) entry.required.push(o);
          if (k === tag) entry.values = [...(entry.values ?? []), ...resolve(v).enum];
          props.set(k, entry);
        }
        return [...props].map(([k, e]) => {
          const when = (list) => list.map((o) => code(resolve(o.properties[tag]).enum[0])).join(", ");
          const required = e.required.length === objects.length ? "yes" : e.required.length ? `when \`${tag}\` is ${when(e.required)}` : "no";
          return { name: k, schema: e.values ? { type: "string", enum: e.values, description: e.schema.description } : e.schema, required };
        });
      }
      if (kinds(r)[0] === "array") {
        const items = resolve(r.items ?? {});
        return items.properties ? Object.entries(items.properties).map(([k, v]) => ({ name: k, schema: v, required: (items.required ?? []).includes(k) ? "yes" : "no", array: true })) : null;
      }
      if (r.properties) return Object.entries(r.properties).map(([k, v]) => ({ name: k, schema: v, required: (r.required ?? []).includes(k) ? "yes" : "no" }));
      if (r.additionalProperties && r.additionalProperties !== true) return [{ name: "<key>", schema: r.additionalProperties, required: "no", map: true }];
      return null;
    };
    const top = resolve(schema);
    if (!top?.properties) return "";
    const required = new Set(top.required ?? []);
    for (const [k, v] of Object.entries(top.properties)) {
      add(k, v, required.has(k) ? "yes" : "no");
      for (const child of children(v) ?? []) add(`${k}${child.array ? "[]" : ""}.${child.name}`, child.schema, child.required, child.map ? "Any key." : "");
    }
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

  /** Long lists keep their first items, so a page stays readable; the page says so. */
  function shorten(value, state) {
    if (Array.isArray(value)) {
      const limit = value.every((v) => v === null || typeof v !== "object") ? LIST_ITEMS * 2 : LIST_ITEMS;
      if (value.length > limit) state.cut = true;
      return value.slice(0, limit).map((v) => shorten(v, state));
    }
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shorten(v, state)]));
    return value;
  }

  /** Path parameter values used in a recorded request. */
  function paramsFrom(template, path) {
    const names = [...template.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
    const literal = template.split(/\{[^}]+\}/).map((part) => part.replace(/[.*+?^$()|[\]\\]/g, "\\$&"));
    const m = new RegExp(`^${literal.join("([^/?]+)")}(?:\\?|$)`).exec(path ?? "");
    return Object.fromEntries(names.map((n, i) => [n, m ? decodeURIComponent(m[i + 1]) : null]));
  }

  /** A value as a TypeScript literal: `{ name: "shop", replicas: 2 }`. */
  const tsObject = (v) => {
    if (Array.isArray(v)) return `[${v.map(tsObject).join(", ")}]`;
    if (v && typeof v === "object") {
      const entries = Object.entries(v).map(([k, x]) => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${tsObject(x)}`);
      return entries.length ? `{ ${entries.join(", ")} }` : "{}";
    }
    return JSON.stringify(v);
  };

  function operation(method, path, op) {
    const M = method.toUpperCase();
    const id = op.operationId;
    const summary = [...new Set([op.summary, op.description].filter(Boolean))].map(oneLine).join(" ");
    // Only permission clauses start with a code span. Preserve the complete source description.
    const needs = [...summary.matchAll(/\bneeds\s+(`[^`]+`(?:`[^`]+`|[^.`])*\.)/gi)].map((m) => m[1]);
    const security = op.security ?? api.security ?? [];
    const isPublic = security.length === 0 || security.some((requirement) => Object.keys(requirement).length === 0);
    const params = (op.parameters ?? []).map((p) => (p.$ref ? resolve(p) : p));
    const pathParams = params.filter((p) => p.in === "path");
    const queryParams = params.filter((p) => p.in === "query");
    const headerParams = params.filter((p) => p.in === "header");
    const isExport = path === "/api/v1/audit/export";
    const recorded = (verified.responses ?? []).filter((r) => r.operationId === id);
    const captured = recorded.find((r) => !r.variant && r.status < 300) ?? (verified.requests ?? []).find((r) => r.operationId === id);
    const withOptions = recorded.find((r) => r.variant && r.status < 300);
    let url = path.replace(/\{([^}]+)\}/g, (_, n) => encodeURIComponent(paramValue(pathParams.find((p) => p.name === n) ?? { name: n })));
    const q = queryParams.filter((p) => p.required).map((p) => `${p.name}=${encodeURIComponent(paramValue(p))}`);
    if (q.length) url += `?${q.join("&")}`;
    if (captured?.path && !isExport) url = captured.path;
    const body = resolve(op.requestBody)?.content?.["application/json"]?.schema;
    const bodyExample = body ? captured?.requestBody ?? requestExample(body) : null;
    const idem = headerParams.some((p) => p.name.toLowerCase() === "idempotency-key");
    const optional = [...queryParams.filter((p) => !p.required && !(isExport && p.name === "format")), ...headerParams.filter((p) => p.name.toLowerCase() !== "idempotency-key")];

    let md = `### \`${M} ${path}\`\n\n${summary || "—"}\n\n`;
    md += `**Operation ID:** \`${id}\`\n\n`;
    md += isPublic ? "**Sign-in:** none; this operation is public.\n\n" : `**Needs:** ${needs.length ? needs.join(" ") : "a signed-in caller; the server decides what that caller may see."}\n\n`;
    const all = [...pathParams, ...queryParams, ...headerParams];
    if (all.length) {
      md += "| Parameter | In | Type | Required | Default | Meaning |\n|---|---|---|---|---|---|\n";
      md += all.map((p) => {
        const note = paramNotes[`${id}.${p.name}`];
        const description = p.description || note?.description || "";
        const type = note?.values && !resolve(p.schema ?? {}).enum ? `one of ${note.values.map(code).join(", ")}` : typeOf(p.schema);
        const def = defaultOf(p.schema, description) ?? (note?.default !== undefined ? code(note.default) : null);
        return `| \`${p.name}\` | ${p.in} | ${type} | ${p.required ? "yes" : "no"} | ${def ?? "—"} | ${cell(description)} |`;
      }).join("\n") + "\n\n";
    }
    if (body) {
      md += `**Request body** (JSON):\n\n${fieldRows(body)}\n\`\`\`json\n${json(bodyExample)}\n\`\`\`\n\n`;
    }
    const codes = Object.keys(op.responses ?? {});
    const successes = codes.filter((c) => c.startsWith("2"));
    const mediaTypes = [...new Set(successes.flatMap((c) => Object.keys(resolve(op.responses[c])?.content ?? {})))];
    const command = (media, address, headers = [], payload = bodyExample) => {
      // The export selects its representation with a query parameter, rather than Accept.
      const target = isExport && !/[?&]format=/.test(address) ? `${address}${address.includes("?") ? "&" : "?"}format=${media === "text/csv" ? "csv" : "jsonl"}` : address;
      const curl = [`curl --fail-with-body -sS -X ${M} "$APELORA_URL${target}"`];
      if (!isPublic) curl.push(`  -H "Authorization: Bearer $APELORA_TOKEN"`);
      if (media) curl.push(`  -H "Accept: ${media}"`);
      if (idem) curl.push(`  -H "Idempotency-Key: $IDEMPOTENCY_KEY"`);
      for (const h of headers) curl.push(`  -H "${h}"`);
      if (body) curl.push(`  -H "Content-Type: application/json"`, `  --data-raw '${JSON.stringify(payload).replace(/'/g, "'\\''")}'`);
      if (media && /application\/(x-tar|zip|octet-stream)/.test(media)) curl.push(`  --output support-bundle.${media === "application/x-tar" ? "tar" : media === "application/zip" ? "zip" : "bin"}`);
      const approval = headers.some((h) => h.includes("$APPROVAL_ID")) ? "# APPROVAL_ID: the id of the approval another person granted (POST /api/v1/approvals).\n" : "";
      return `\`\`\`sh\n${approval}${idem ? '# Generate once per distinct change; keep this value when retrying.\nIDEMPOTENCY_KEY=$(uuidgen)\n' : ""}${curl.join(" \\\n")}\n\`\`\`\n\n`;
    };
    md += "**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.\n\n";
    if (M !== "GET") md += "This request can change state. Check permissions, prerequisites and any required approval before running it.\n\n";
    md += (mediaTypes.length ? mediaTypes : [null]).map((media) => `${mediaTypes.length > 1 ? `For \`${media}\`:\n\n` : ""}${command(media, url)}`).join("");

    // The same request with its options: recorded values where the verifier used them.
    let query = null;
    if (optional.length) {
      const used = withOptions?.query ? Object.keys(withOptions.query) : optional.filter((p) => p.in === "query").map((p) => p.name);
      const headers = optional.filter((p) => p.in === "header");
      let address;
      if (withOptions?.path) address = withOptions.path;
      else {
        const values = optional.filter((p) => p.in === "query").map((p) => `${p.name}=${encodeURIComponent(paramValue(p))}`);
        address = `${url}${values.length ? `${url.includes("?") ? "&" : "?"}${values.join("&")}` : ""}`;
      }
      query = withOptions?.query ?? Object.fromEntries(optional.filter((p) => p.in === "query").map((p) => [p.name, example(p.schema ?? {}, p.name)]));
      if (isExport) delete query.format;
      const names = [...used.filter((n) => !(isExport && n === "format")), ...headers.map((h) => h.name)];
      const media = isExport ? (withOptions?.mediaType ?? "text/csv") : mediaTypes[0] ?? null;
      const headerLines = headers.map((h) => `${h.name}: ${h.name === "Apelora-Approval" ? "$APPROVAL_ID" : "<value>"}`);
      md += `**With options** (${names.map(code).join(", ")}):\n\n${command(media, address, headerLines, withOptions?.requestBody ?? bodyExample)}`;
      if (queryParams.find((p) => p.name === "after") && !isExport) md += "**Next page:** repeat the request with `after` set to the response's `next`. The last page has no `next`.\n\n";
    }

    // One line with the generated TypeScript client.
    const pathValues = captured?.path && !isExport ? paramsFrom(path, captured.path) : Object.fromEntries(pathParams.map((p) => [p.name, paramValue(p)]));
    const requiredQuery = Object.fromEntries(queryParams.filter((p) => p.required).map((p) => [p.name, new URLSearchParams((captured?.path ?? url).split("?")[1] ?? "").get(p.name) ?? paramValue(p)]));
    const tsQuery = isExport ? { format: "csv" } : { ...requiredQuery, ...(query ?? {}) };
    const parts = [];
    if (pathParams.length) parts.push(`params: ${tsObject(Object.fromEntries(Object.entries(pathValues).map(([k, v]) => [k, v ?? paramValue({ name: k })])))}`);
    if (Object.keys(tsQuery).length) parts.push(`query: ${tsObject(tsQuery)}`);
    if (body) {
      const text = tsObject(bodyExample);
      parts.push(text.length <= 100 ? `body: ${text}` : "body /* the request body above */");
    }
    if (idem) parts.push("idempotencyKey: newIdempotencyKey()");
    md += `**TypeScript:**\n\n\`\`\`ts\n${successes.some((c) => resolve(op.responses[c])?.content) ? "const result = " : ""}await client.request("${id}", ${parts.length ? `{ ${parts.join(", ")} }` : "{}"});\n\`\`\`\n\n`;

    for (const code of successes) {
      const response = resolve(op.responses[code]);
      const content = Object.entries(response.content ?? {});
      md += `**Response \`${code}\`** — ${response.description || "Success"}${content.length ? "." : ", with no body."}\n\n`;
      for (const [media, value] of content) {
        md += `Content-Type: \`${media}\`.\n\n`;
        const actual = recorded.find((r) => !r.variant && String(r.status) === code && r.mediaType === media);
        if (actual && Object.hasOwn(actual, "body")) {
          md += "**Example response** from a test installation; your IDs, names and times differ.";
          if (media === "application/json") {
            const state = {};
            const shown = shorten(actual.body, state);
            md += `${state.cut ? " Long lists are cut to their first items." : ""}\n\n\`\`\`json\n${json(shown)}\n\`\`\`\n\n`;
          } else {
            const lines = actual.body.replace(/\r\n/g, "\n").replace(/\n$/, "").split("\n");
            const total = actual.lines ?? lines.length;
            const keep = TEXT_LINES[media] ?? 15;
            md += `${total > keep ? ` The first ${keep} of ${total} lines.` : ""}\n\n\`\`\`text\n${lines.slice(0, keep).join("\n")}\n\`\`\`\n\n`;
          }
        } else if (media === "application/json") {
          md += `**Example response** (placeholder values that show the shape):\n\n\`\`\`json\n${json(example(value.schema))}\n\`\`\`\n\n`;
        } else if (/application\/(x-tar|zip|octet-stream)/.test(media)) {
          md += "Binary download; the command saves the response to a file. For a tar bundle, list the files after a successful download:\n\n```sh\ntar -tf support-bundle.tar\n```\n\n";
          const capture = recorded.find((r) => r.mediaType === media);
          if (capture?.listing) md += `**Example contents:**\n\n\`\`\`text\n${capture.listing}\n\`\`\`\n\n`;
        } else {
          md += "Text response; the command prints the returned text. ";
          md += media === "application/x-ndjson" ? "Each nonempty line is a JSON object.\n\n" : media === "text/csv" ? "The first row contains the column names.\n\n" : "Metrics use the Prometheus text exposition format.\n\n";
        }
      }
    }

    const errors = codes.filter((c) => !c.startsWith("2"));
    if (errors.length) {
      const found = errorCodes[id] ?? {};
      const observed = (verified.checks ?? []).filter((c) => c.operationId === id && c.errorCode);
      md += "**Errors.** The body is `{\"error\": {\"code\": …, \"message\": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.\n\n";
      md += "| Status | Codes |\n|---|---|\n";
      md += errors.map((status) => {
        const list = new Set([...(found[status] ?? []), ...observed.filter((c) => String(c.status) === status).map((c) => c.errorCode)]);
        const specific = [...list].filter((c) => !(SHARED_CODES[status] ?? []).includes(c)).sort();
        const shared = [...list].filter((c) => (SHARED_CODES[status] ?? []).includes(c)).sort();
        const text = [...specific, ...shared].map(code);
        if (SHARED_CODES[status] && !shared.length) text.push(...(["500", "502"].includes(status) ? [status === "502" ? "an `incus_…` code" : "`store_error`"] : SHARED_CODES[status].slice(0, 2).map(code)));
        return `| \`${status}\` | ${text.join(", ") || "—"} |`;
      }).join("\n") + "\n\n";
    }
    return { md, M, path, summary: first(summary.replace(/^Public\.\s*/i, "")), id };
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
