---
title: API overview
section: api
slug: overview
order: 0
label: Overview
summary: How to call the API: the address, signing in, errors, safe retries, and the TypeScript client.
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

Its [System API entry](/docs/api/system/#get-apiv1health) shows an example response. Example responses on these pages come from a test installation or show the shape with placeholder values; replace the sample names, IDs and settings with your own before running a command.

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

Send it as a bearer token on authenticated requests. Health, sign-in options, password sign-in, setup-link completion and the OpenAPI download are public. Check your token with `whoami`, which shows the roles and permissions in force:

```sh
curl --fail-with-body -sS "$APELORA_URL/api/v1/whoami" -H "Authorization: Bearer $APELORA_TOKEN"
```

Each operation page gives the HTTP method, path, generated client operation ID, permissions documented by the handler, parameters, request and response. A missing permission returns `403`; collection results may also be filtered to the caller's scope. Personal-token and personal-session endpoints require a person credential; a legacy CLI token receives `403 people_only` even when its role is fabric-admin.

## Changing things safely

- **Idempotency-Key.** Use this header where it appears in the operation's parameter table. Generate a key once per distinct change and retain it for retries. Repeating the same request with the same key returns the first result. Other writes do not automatically gain retry protection.
- **Jobs and operations.** Instance writes return a `jobId`; poll `GET /api/v1/jobs/{id}` until `status` is `succeeded`, `failed` or `cancelled`. Application actions return an `operation` object; poll `GET /api/v1/applications/{name}/operations/{id}` using `operation.id`. Deployment responses include their jobs. Use the response shape on each operation's page; the worker retries jobs with backoff.
- **Approvals.** Some protected actions need a second person to approve first; the request then names the approval in an `Apelora-Approval` header.
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

API handler errors use a status code and the following JSON envelope. Transport failures, proxies and malformed HTTP requests can return a different format:

```json
{ "error": { "code": "not_found", "message": "No application called shop." } }
```

The `code` is stable and meant for programs; the `message` is for people. The usual statuses are `400` for a request that does not make sense, `401` for a missing or expired token, `403` for a token that lacks the permission, `404` for something that is not there or not visible to you, `409` for a conflict with the current state, and `429` for too many requests.

## Rate limits

Requests are limited per client address before sign-in, and writes are limited per signed-in caller. When you hit a limit you get `429` with a `Retry-After` header in seconds: wait that long, then retry. Repeated wrong tokens from one address are slowed down on purpose. The limits are settings of the control plane ([settings reference](/docs/install/settings/)).

## Lists

List operations that can be long take a `limit` and, where the page says so, a position to continue from; they return the newest first unless the page says otherwise. Filters are query parameters, each listed in the operation's parameter table.

## From TypeScript

The typed client the screens use is the package `packages/api-client` in the repository, generated from the OpenAPI document. Every operation is called by name, with its path parameters and body type-checked:

```ts
import { createClient, followJob, newIdempotencyKey } from "@apelora/api-client";

const client = createClient({ baseUrl: process.env.APELORA_URL, token: () => process.env.APELORA_TOKEN ?? null });

const me = await client.get("whoami");
const apps = await client.get("applications");

// a job: follow it until it is final
const job = await client.request("job", { params: { id: "00000000-0000-4000-8000-000000000001" } });
await followJob(client, job.id, (j) => console.log(j.status));
```

For operations that document `Idempotency-Key`, pass `idempotencyKey: newIdempotencyKey()` and retain that key for retries. Errors are thrown as `ApiRequestError` with the HTTP `status` and the API's `code`.

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

The next pages list every operation, each with what it needs, its parameters, a request you can copy and the shape of its answer.
