// Finds the stable error codes each API operation can return, by reading the control plane's
// handlers: every `ApiError::new(StatusCode::X, "code", …)` a handler reaches, directly or through
// the functions it calls in the same crate, including helpers that take the code as an argument
// (`conflict("code", …)`). The result is an over-approximation of what a handler can say; codes
// the verifier observed are added by the page generator.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SOURCE = "services/control-plane/src";
const DEPTH = 4;

const files = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  if (statSync(p).isDirectory()) return f === "tests" ? [] : files(p);
  return f.endsWith(".rs") && !/(^|_)tests?\.rs$/.test(f) ? [p] : [];
});

/** Blank out comments and the bodies of test modules, keeping string literals and offsets. */
function clean(text) {
  let out = "";
  for (let i = 0; i < text.length;) {
    const c = text[i];
    if (c === "/" && text[i + 1] === "/") { const end = text.indexOf("\n", i); const stop = end < 0 ? text.length : end; out += " ".repeat(stop - i); i = stop; continue; }
    if (c === "/" && text[i + 1] === "*") { const end = text.indexOf("*/", i + 2) + 2; out += text.slice(i, end).replace(/[^\n]/g, " "); i = end; continue; }
    const literal = stringAt(text, i);
    if (literal) { out += text.slice(i, literal); i = literal; continue; }
    out += c; i++;
  }
  return out;
}

/** If a string or char literal starts at i, the index after it. */
function stringAt(text, i) {
  const c = text[i];
  const raw = /^r(#*)"/.exec(text.slice(i, i + 10));
  if (raw && !/[\w]/.test(text[i - 1] ?? "")) {
    const close = `"${raw[1]}`;
    return text.indexOf(close, i + raw[0].length) + close.length;
  }
  if (c === '"' || (c === "b" && text[i + 1] === '"' && !/[\w]/.test(text[i - 1] ?? ""))) {
    let j = c === "b" ? i + 2 : i + 1;
    while (j < text.length && text[j] !== '"') j += text[j] === "\\" ? 2 : 1;
    return j + 1;
  }
  if (c === "'") {
    const m = /^'(\\.[^']*|[^'\\])'/.exec(text.slice(i, i + 12));
    if (m) return i + m[0].length;
  }
  return 0;
}

/** Index of the bracket that closes the one at `open`, skipping literals. */
function closing(text, open) {
  const pairs = { "(": ")", "{": "}", "[": "]" };
  const stack = [pairs[text[open]]];
  for (let i = open + 1; i < text.length; i++) {
    const literal = stringAt(text, i);
    if (literal) { i = literal - 1; continue; }
    const c = text[i];
    if (pairs[c]) stack.push(pairs[c]);
    else if (c === stack[stack.length - 1]) { stack.pop(); if (!stack.length) return i; }
  }
  return text.length;
}

/** Top-level comma-separated arguments of the call whose `(` is at `open`. */
function args(text, open) {
  const end = closing(text, open);
  const out = [];
  let start = open + 1;
  for (let i = open + 1; i < end; i++) {
    const literal = stringAt(text, i);
    if (literal) { i = literal - 1; continue; }
    if ("({[".includes(text[i])) { i = closing(text, i); continue; }
    if (text[i] === ",") { out.push(text.slice(start, i).trim()); start = i + 1; }
  }
  const last = text.slice(start, end).trim();
  if (last) out.push(last);
  return out;
}

const literalCode = (arg) => /^"([a-z][a-z0-9_]*)"$/.exec(arg ?? "")?.[1];
const statusOf = (arg) => /^StatusCode::([A-Z_]+)$/.exec(arg ?? "")?.[1];
const STATUS = { BAD_REQUEST: 400, UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404, CONFLICT: 409, GONE: 410, UNPROCESSABLE_ENTITY: 422, TOO_MANY_REQUESTS: 429, INTERNAL_SERVER_ERROR: 500, BAD_GATEWAY: 502, SERVICE_UNAVAILABLE: 503 };

export function errorCodes(repo) {
  const fns = [];
  const imports = new Map();
  for (const file of files(join(repo, SOURCE))) {
    let text = clean(readFileSync(file, "utf8"));
    // Drop `#[cfg(test)] mod … { … }` blocks.
    for (let m; (m = /#\[cfg\(test\)\]\s*mod\s+\w+\s*\{/.exec(text));) {
      const open = m.index + m[0].length - 1;
      text = text.slice(0, m.index) + " ".repeat(closing(text, open) + 1 - m.index) + text.slice(closing(text, open) + 1);
    }
    const name = relative(repo, file);
    // Names imported from sibling modules: `use super::authz::{allow, guard};`.
    for (const u of text.matchAll(/\buse\s+(?:super|crate(?:::api)?|self)::(?:api::)?([a-z_][a-z0-9_]*)::(\{[^}]*\}|[a-z_][a-z0-9_]*)\s*;/g)) {
      for (const item of u[2].replace(/[{}]/g, "").split(",").map((x) => x.trim().split(/\s+as\s+/))) {
        if (item[0]) imports.set(`${name}:${item[1] ?? item[0]}`, { module: u[1], name: item[0] });
      }
    }
    for (const m of text.matchAll(/\bfn\s+([a-z_][a-z0-9_]*)\s*(?:<[^({;]*>)?\s*\(/g)) {
      const paren = m.index + m[0].length - 1;
      const close = closing(text, paren);
      const brace = text.indexOf("{", close);
      const semi = text.indexOf(";", close);
      if (brace < 0 || (semi >= 0 && semi < brace)) continue;
      const params = args(text, paren).map((a) => /^(?:mut\s+)?([a-z_][a-z0-9_]*)\s*:/.exec(a)?.[1] ?? null);
      const body = text.slice(brace, closing(text, brace) + 1);
      fns.push({ name: m[1], file: name, at: m.index, params, body, operation: null });
      // Closures that build errors (`let conflict = |code: &'static str, msg| ApiError::new(…)`).
      for (const c of body.matchAll(/let\s+([a-z_][a-z0-9_]*)\s*=\s*\|([^|]*)\|/g)) {
        const rest = body.slice(c.index + c[0].length);
        const end = rest.search(/;\s*\n/);
        const params = c[2].split(",").map((a) => /^\s*(?:mut\s+)?([a-z_][a-z0-9_]*)/.exec(a)?.[1] ?? null);
        fns.push({ name: c[1], file: name, params, body: `{${rest.slice(0, end < 0 ? rest.length : end)}}`, operation: null, closure: true });
      }
    }
    // The operation each handler serves.
    for (const m of text.matchAll(/#\[utoipa::path\(([\s\S]*?)\)\]\s*(?:pub(?:\([^)]*\))?\s+)?(?:async\s+)?fn\s+([a-z_][a-z0-9_]*)/g)) {
      // Without an explicit operation_id, utoipa names the operation after the function.
      const id = /operation_id\s*=\s*"([^"]+)"/.exec(m[1])?.[1] ?? m[2];
      // The function right after the attribute (a file may hold other functions of that name).
      const handler = fns.filter((f) => f.file === name && f.name === m[2] && !f.closure && f.at >= m.index).sort((a, b) => a.at - b.at)[0];
      if (id && handler) handler.operation = id;
    }
  }
  const byName = new Map();
  for (const f of fns) byName.set(f.name, [...(byName.get(f.name) ?? []), f]);
  const stems = new Set(fns.map((f) => f.file.split("/").pop().replace(/\.rs$/, "")));
  const resolve = (call, from) => {
    const name = typeof call === "string" ? call : call.name;
    const module = typeof call === "string" ? null : call.module;
    // A path into another crate (`db::…`, `apelora_persistence::…`) is not ours.
    if (module && !["super", "self", "crate"].includes(module)) {
      if (!stems.has(module)) return [];
      return (byName.get(name) ?? []).filter((f) => f.file.endsWith(`/${module}.rs`) && !f.closure);
    }
    // Rust calls an unqualified name from this file or from an import.
    const local = (byName.get(name) ?? []).filter((f) => f.file === from.file);
    if (local.length) return local;
    const imported = imports.get(`${from.file}:${name}`);
    if (imported) return resolve({ name: imported.name, module: imported.module }, from);
    // Items of the parent module (`api.rs`), which its submodules reach with `use super::…`.
    const parent = (byName.get(name) ?? []).filter((f) => !f.closure && f.file.endsWith("/api.rs") && from.file.includes("/api/"));
    return parent.length === 1 ? parent : [];
  };

  // Helpers that build an error from their arguments: which argument is the code, and the status.
  const helpers = new Map();
  const helperKey = (f) => `${f.file}:${f.name}`;
  for (let round = 0; round < 4; round++) {
    for (const f of fns) {
      for (const call of calls(f)) {
        let code = null, status = null;
        if (call.name === "ApiError::new") { code = call.args[1]; status = statusOf(call.args[0]) ?? call.args[0]; }
        else {
          const h = resolve(call, f).map((g) => helpers.get(helperKey(g))).find(Boolean);
          if (!h) continue;
          code = call.args[h.code];
          status = h.status ?? statusOf(call.args[h.statusArg]) ?? call.args[h.statusArg];
        }
        const ci = f.params.indexOf(code);
        if (ci < 0) continue;
        const fixed = STATUS[status] ? status : null;
        const si = fixed ? -1 : f.params.indexOf(status);
        if (!fixed && si < 0) continue;
        helpers.set(helperKey(f), fixed ? { code: ci, status: fixed } : { code: ci, statusArg: si });
      }
    }
  }

  // Codes each function produces itself.
  const own = new Map();
  for (const f of fns) {
    const found = [];
    for (const call of calls(f)) {
      if (call.name === "ApiError::new") {
        const code = literalCode(call.args[1]);
        const status = STATUS[statusOf(call.args[0])];
        if (code && status) found.push([status, code]);
        continue;
      }
      const h = resolve(call, f).map((g) => helpers.get(helperKey(g))).find(Boolean);
      if (!h) continue;
      const code = literalCode(call.args[h.code]);
      const status = STATUS[h.status ?? statusOf(call.args[h.statusArg])];
      if (code && status) found.push([status, code]);
    }
    for (const m of f.body.matchAll(/StatusCode::([A-Z_]+)\s*,\s*Json\(\s*json!\(\s*\{\s*"error"\s*:\s*\{\s*"code"\s*:\s*"([a-z][a-z0-9_]*)"/g)) {
      if (STATUS[m[1]]) found.push([STATUS[m[1]], m[2]]);
    }
    own.set(f, found);
  }

  const result = {};
  for (const handler of fns.filter((f) => f.operation)) {
    const codes = {};
    const seen = new Set();
    const visit = (f, depth) => {
      if (seen.has(f) || depth > DEPTH) return;
      seen.add(f);
      for (const [status, code] of own.get(f)) (codes[status] ??= new Set()).add(code);
      for (const call of calls(f)) for (const g of resolve(call, f)) visit(g, depth + 1);
    };
    visit(handler, 0);
    result[handler.operation] = Object.fromEntries(Object.entries(codes).map(([s, set]) => [s, [...set].sort()]));
  }
  return result;
}

const cache = new WeakMap();
/** Function and associated-function calls in a body, with their top-level arguments. */
function calls(f) {
  if (cache.has(f)) return cache.get(f);
  const out = [];
  for (const m of f.body.matchAll(/(?<![\w:.])((?:ApiError::new)|(?:[a-z_][a-z0-9_]*::)*[a-z_][a-z0-9_]*)\s*(?:::<[^>]*>)?\(/g)) {
    const path = m[1].startsWith("ApiError::") ? [m[1]] : m[1].split("::");
    const name = path.pop();
    if (/^(if|while|match|for|return|Some|Ok|Err|move|in|as|let|fn)$/.test(name)) continue;
    out.push({ name, module: path.pop() ?? null, args: args(f.body, m.index + m[0].length - 1) });
  }
  // Functions passed by name: `.map_err(weak)?`, `.ok_or_else(not_found)?`.
  for (const m of f.body.matchAll(/\.(?:map_err|ok_or_else|or_else|unwrap_or_else|map)\(\s*((?:[a-z_][a-z0-9_]*::)*[a-z_][a-z0-9_]*)\s*\)/g)) {
    const path = m[1].split("::");
    const name = path.pop();
    out.push({ name, module: path.pop() ?? null, args: [] });
  }
  cache.set(f, out);
  return out;
}
