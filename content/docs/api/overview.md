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
APELORA_URL=...      # where the API is served, without a path
APELORA_TOKEN=...    # an API token: see "Get a token"
```

All paths start with `/api/v1`. Bodies are JSON (`Content-Type: application/json`), and so are the answers, except a few downloads (metrics, the support bundle, audit exports).

## Get a token

Create the first administrator's token on the machine that runs the control plane ([install on your servers](/docs/start/install-on-your-servers/)):

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

Send it as a bearer token on every request. Check it with `whoami`, which shows the roles and permissions in force:

```sh
curl -sS "$APELORA_URL/api/v1/whoami" -H "Authorization: Bearer $APELORA_TOKEN"
```

Each operation page says what it **needs**: a named permission, or only a signed-in caller where the server decides what that caller may see. A missing permission is a `403`, never a silent empty answer.

## Changing things safely

- **Idempotency-Key.** Operations that change something accept an `Idempotency-Key` header. Repeat a request with the same key and you get the first result instead of a second change. Send a new key (`uuidgen`) for each distinct change.
- **Jobs.** Deploying, starting, stopping and migrating are carried out by the worker, so the answer is a job. Poll `GET /api/v1/jobs/{id}` until its `status` is `succeeded`, `failed` or `cancelled`. The worker retries with backoff, so a job can stay pending for a while.
- **Approvals.** Some protected actions need a second person to approve first; the request then names the approval in an `Apelora-Approval` header.
- **Versions.** Applications keep numbered, immutable versions; a deployment saves the design as a new revision and queues the changes.

```sh
# a request that changes something, safe to repeat
curl -sS -X POST "$APELORA_URL/api/v1/applications/shop/operations" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"action":"start"}'
```

The request body of each operation is on its page of this section; this one starts the application `shop`.

## Errors

A failed request has a status code and, for anything but a network failure, a body:

```json
{ "error": { "code": "not_found", "message": "No application called shop." } }
```

The `code` is stable and meant for programs; the `message` is for people. The usual statuses are `400` for a request that does not make sense, `401` for a missing or expired token, `403` for a token that lacks the permission, `404` for something that is not there or not visible to you, `409` for a conflict with the current state, and `429` for too many requests.

## Rate limits

Requests are limited per client address before sign-in, and writes are limited per signed-in caller. When you hit a limit you get `429` with a `Retry-After` header in seconds: wait that long, then retry. Repeated wrong tokens from one address are slowed down on purpose. The limits are settings of the control plane ([settings reference](/docs/reference/settings/)).

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

Pass `idempotencyKey: newIdempotencyKey()` in the options of any call that changes something. Errors are thrown as `ApiRequestError` with the HTTP `status` and the API's `code`.

## The OpenAPI document

The machine-readable description of every operation is `packages/api-client/openapi.json`, and the running control plane can print the document of the version it runs:

```sh
apelora-control-plane openapi > openapi.json
```

Use it to generate a client in another language, or to check your own calls against what the version you run accepts.

## The groups

The next pages list every operation, each with what it needs, its parameters, a request you can copy and the shape of its answer.
