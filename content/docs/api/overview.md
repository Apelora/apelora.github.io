---
title: API overview
section: api
slug: overview
order: 0
label: Overview
summary: How to call the API: the address, signing in, options and paging, errors and their codes, safe retries, and the TypeScript client.
---
Everything the Studio and the Console do goes through one HTTP API served by the control plane, and so can your scripts. The API has {{fact:apiOperations}} operations in {{fact:apiGroups}} groups, listed in the pages that follow this one. They are generated from the same OpenAPI document the screens' client is generated from, so they match the version they were built from.

## Set up your shell

The examples on every page use two variables:

```sh
export APELORA_URL="https://fabric.example.org"  # replace with your API origin
read -r -s -p "API token: " APELORA_TOKEN
export APELORA_TOKEN
```

Most paths start with `/api/v1`; the metrics endpoint is `/metrics`. Request bodies are JSON (`Content-Type: application/json`). Responses are JSON except metrics (`text/plain`), support bundles (`application/x-tar`), and audit exports (`text/csv` or `application/x-ndjson`). A `204` response has no body. The examples use Bash and curl 7.76 or later for `--fail-with-body`.

Try a public, read-only request first:

```sh
curl --fail-with-body -sS "$APELORA_URL/api/v1/health"
```

Its [System API entry](/docs/api/system/#get-apiv1health) shows an example response. Replace the sample names, IDs and settings on these pages with your own before running a command.

## Get a token

Create the first administrator's token on the machine that runs the control plane ([install on your servers](/docs/install/install-on-your-servers/)):

```sh
apelora-control-plane token create --name "$ADMIN_NAME" --role fabric-admin --expires-in-days 90
```

The token is shown once. Which roles exist and what each may do is in [roles and access](/docs/concepts/access-and-roles/). An administrator can also create tokens for people and automation from the Console, and a signed-in person can ask for a personal token. The token kinds are:

| Prefix | What it is |
|---|---|
| `apt_` | A personal token, acting as the person who made it |
| `aps_` | A service token for automation, with its own role |
| `apu_` | A session after a password sign-in |
| `apl_` | A legacy API token from `token create` |
| (none) | An access token from your identity provider |

A local account's setup link carries a one-time `apw_` value: it sets the account's password with `POST /api/v1/sign-in/setup` and cannot call anything else. Pages never show a real credential; where a response contains one, the example shows a placeholder such as `<token, shown once>`.

Send the token as a bearer token on authenticated requests. Health, sign-in options, password sign-in, setup-link completion and the OpenAPI download are public. Check your token with `whoami`, which shows the roles and permissions in force:

```sh
curl --fail-with-body -sS "$APELORA_URL/api/v1/whoami" -H "Authorization: Bearer $APELORA_TOKEN"
```

A missing permission returns `403`; collection results may also be filtered to the caller's scope. Personal-token and personal-session endpoints (`/api/v1/me/…`) require a person credential: a session from a password sign-in or a personal token. A legacy CLI token receives `403 people_only` there even when its role is fabric-admin.

## How an operation is described

Each operation on the group pages has:

- the method and path, the operation ID the generated client uses, and the permission the handler checks;
- a parameter table: where each parameter goes (path, query or header), its type, whether it is required, its default and its allowed values;
- for a request body, a table of every field, with nested fields written `parent.child` (`items[].port` for a list of objects) and, where a field takes different shapes, which `type` needs it;
- a curl command, and a second one **with options** when the operation takes optional query parameters or headers;
- the same call with the TypeScript client;
- the response: an example response from a test installation (your IDs, names and times differ), or placeholder values that show the shape where no example could be recorded. Long lists in examples are cut to their first items;
- the error statuses and the error codes the operation returns.

## Changing things safely

- **Idempotency-Key.** Use this header where it appears in the operation's parameter table. Generate a key once per distinct change and retain it for retries. Repeating the same request with the same key returns the first result. Other writes do not automatically gain retry protection.
- **Jobs and operations.** Instance writes return a `jobId`; poll `GET /api/v1/jobs/{id}` until `status` is `succeeded`, `failed` or `cancelled`. Application actions return an `operation` object; poll `GET /api/v1/applications/{name}/operations/{id}` using `operation.id`. Deployment responses include their jobs. Use the response shape on each operation's page; the worker retries jobs with backoff.
- **Approvals.** Some protected actions need a second person to approve first: request it with `POST /api/v1/approvals`, another person approves it, and the request names the approval in an `Apelora-Approval` header.
- **Confirmations.** Destructive requests carry a `confirm` field: type the name of what is being changed again (the member, volume, backup or snapshot). A mismatch returns `400 confirmation_mismatch`.
- **Versions.** Applications keep numbered, immutable versions; a deployment saves the design as a new revision and queues the changes.

```sh
# Requires an existing shop application, deploy permission, and any required approval.
# Generate once; reuse this value and the same body when retrying this change.
IDEMPOTENCY_KEY=$(uuidgen)
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications/shop/operations" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action":"start"}'
```

The request body of each operation is on its page of this section; this one starts the application `shop`.

## Errors

API handler errors use a status code and the following JSON envelope. Transport failures, proxies and malformed HTTP requests can return a different format. For example, asking for an application that does not exist:

```sh
curl --fail-with-body -sS "$APELORA_URL/api/v1/applications/storefront" -H "Authorization: Bearer $APELORA_TOKEN"
```

Example response from a test installation (status `404`):

```json
{
  "error": {
    "code": "not_found",
    "message": "not found: application storefront"
  }
}
```

The `code` is stable and meant for programs; the `message` is for people and may change. The usual statuses are `400` for a request that does not make sense, `401` for a missing or expired token, `403` for a token that lacks the permission, `404` for something that is not there or not visible to you, `409` for a conflict with the current state, `422` for a draft that cannot be published, `429` for too many requests, `502` when Incus could not answer and `503` when something the request needs is not set up or not reachable. Saving a draft over a newer one answers `409 draft_conflict` with the newer version number in `currentVersion`.

### Error codes

Each operation's page lists the codes it returns. These codes are shared by every operation that documents the status:

| Status | Codes | Meaning |
|---|---|---|
| `401` | `unauthenticated`, `invalid_token` | No token, an unknown token or an ended session (`unauthenticated`); an identity provider's access token that fails verification (`invalid_token`) |
| `403` | `forbidden`, `mfa_required`, `account_disabled` | The caller lacks the permission, signed in without multi-factor authentication where a policy needs it, or is disabled |
| `429` | `rate_limited` | Too many requests; wait for `Retry-After` seconds |
| `500` | `store_error`, `internal` | The database refused the request; the server log has the details under the request id |
| `502` | `incus_unreachable`, `incus_authentication`, `incus_not_found`, `incus_api_error`, `incus_bad_response`, `incus_unsupported_capability` | Incus could not be reached, refused Apelora's certificate, or answered with an error |
| `503` | `database_not_configured`, `store_unavailable`, `incus_not_configured`, `incus_invalid_config` | The control plane runs without a database, cannot reach it, or has no (or an invalid) Incus connection |

## Rate limits

Requests are limited per client address before sign-in, and writes are limited per signed-in caller. When you hit a limit you get `429` with a `Retry-After` header in seconds: wait that long, then retry. Repeated wrong tokens from one address are slowed down on purpose. The limits are settings of the control plane ([settings reference](/docs/install/settings/)).

## Options, filters and paging

Optional query parameters filter or shape a list; each operation's parameter table gives their types, defaults and allowed values, and its second example request uses them. Lists return the newest first unless the page says otherwise. Two lists page differently.

**Audit events and alert history** take `limit` and `before`. To fetch the next page, repeat the request with `before` set to the `id` of the last item; a page shorter than `limit` is the last one:

```sh
curl --fail-with-body -sS "$APELORA_URL/api/v1/audit?action=application.&limit=50&before=1200" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Jobs** take `limit` and `after`. The response has a `next` value while more jobs follow; repeat the request with `after` set to it. The last page has no `next`:

```sh
curl --fail-with-body -sS "$APELORA_URL/api/v1/jobs?status=failed&limit=50&after=$NEXT" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

The audit export takes the same filters as the audit list and returns every matching event, without paging.

## From TypeScript

The typed client the screens use is the package `packages/api-client` in the repository, generated from the OpenAPI document. Every operation is called by name, with its path parameters, query and body type-checked; each operation's page shows its call in one line:

```ts
import { createClient, followJob, newIdempotencyKey } from "@apelora/api-client";

const client = createClient({ baseUrl: process.env.APELORA_URL, token: () => process.env.APELORA_TOKEN ?? null });

const me = await client.get("whoami");
const failed = await client.request("jobs", { query: { status: "failed", limit: 50 } });

// a change that queues work: keep the key for retries, then follow the job until it is final
const accepted = await client.request("retry_job", { params: { id: failed.items[0].id }, idempotencyKey: newIdempotencyKey() });
await followJob(client, accepted.jobId, (j) => console.log(j.status));
```

`client.get(name)` is a shorthand for operations without parameters or a body. For operations that document `Idempotency-Key`, pass `idempotencyKey: newIdempotencyKey()` and retain that key for retries; for an approved action, pass `approvalId`. Text answers (metrics, audit exports) come back as a string and the support bundle as a `Blob`. Errors are thrown as `ApiRequestError` with the HTTP `status` and the API's `code`.

## The OpenAPI document

Download the [complete OpenAPI document](/assets/api/openapi.json) used to build this reference. It defines all operations, request and response schemas, authentication requirements and documented status codes. The repository source is `packages/api-client/openapi.json`. Fetch the contract of the running API without a token:

```sh
curl --fail-with-body -sS "$APELORA_URL/api/v1/openapi.json" --output openapi.json
```

The control-plane executable can also print its version's document:

```sh
apelora-control-plane openapi > openapi.json
```

Use it to generate a client in another language, or to check your own calls against what the version you run accepts.

## The groups

The next pages list every operation, each with what it needs, its parameters and options, a request you can copy, the TypeScript call, an example of its answer and its error codes.
