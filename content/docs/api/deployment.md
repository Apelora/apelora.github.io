---
title: Deployment API
section: api
slug: deployment
order: 3
label: Deployment
source: packages/api-client/openapi.json
summary: Single instances, moves and the job queue.
---
Creating, changing, moving and deleting single instances, and the jobs that carry out those changes and deployments: list, follow, cancel and retry. This page lists 10 operations.

Set variables in the [API overview](/docs/api/overview/). Download [OpenAPI](/assets/api/openapi.json).

## Operations

| Operation | What it does |
|---|---|
| [`POST /api/v1/instances`](#post-apiv1instances) | Queues creation of an instance. |
| [`DELETE /api/v1/instances/{project}/{name}`](#delete-apiv1instancesprojectname) | Queues deletion of an Apelora instance (stopped first if running). |
| [`GET /api/v1/instances/{project}/{name}/move`](#get-apiv1instancesprojectnamemove) | Dry run of moving an instance to another member: whether it keeps running, what it copies, what blocks it. |
| [`POST /api/v1/instances/{project}/{name}/move`](#post-apiv1instancesprojectnamemove) | Moves an Apelora instance to another member, after the check runs again and its name is typed: live when it can, otherwise only with `allowStop`, copying its volumes there. |
| [`POST /api/v1/instances/{project}/{name}/state`](#post-apiv1instancesprojectnamestate) | Queues starting or stopping an Apelora instance. |
| [`GET /api/v1/jobs`](#get-apiv1jobs) | Jobs newest first, filtered by status, kind and application and paged with `after`. |
| [`GET /api/v1/jobs/{id}`](#get-apiv1jobsid) | A queued job and its progress. |
| [`POST /api/v1/jobs/{id}/cancel`](#post-apiv1jobsidcancel) | Cancels a job. |
| [`GET /api/v1/jobs/{id}/detail`](#get-apiv1jobsiddetail) | A job with its attempts (worker, timings, outcome, error and the Incus operations each started), who queued it, its request id, and the jobs linked to it (retries, and other jobs the same request queued). |
| [`POST /api/v1/jobs/{id}/retry`](#post-apiv1jobsidretry) | Queues a new job that repeats a failed one, linked to it (`retryOf`); the failed job is kept unchanged as evidence. |

## Details

### `POST /api/v1/instances`

Queues creation of an instance. Needs `deploy`. Apelora marks it as its own; only such instances can later be stopped or deleted through Apelora.

**Operation ID:** `create_instance`

**Needs:** `deploy`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `Idempotency-Key` | header | string | no | — | Makes the request safe to repeat |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `architectures` | list of string | no | Architectures the image is known to run on, as Incus names them (`x86_64`, `aarch64`, …); empty allows any. Checked against the cluster before creating and against the instance Incus created. |
| `config` | object | no | Extra instance config; keys under `user.apelora.` are reserved. |
| `config.<key>` | string | no | Any key. |
| `kind` | one of `container`, `virtual-machine`, `unknown` | yes | `container` (system or OCI) or `virtual-machine`. |
| `name` | string | yes | — |
| `network` | object or null | no | — |
| `network.acl` | string | yes | — |
| `network.network` | string | yes | — |
| `network.uplink` | string | yes | Uplink network the application network is created on. |
| `owner` | object or null | no | — |
| `owner.application` | string | yes | — |
| `owner.module` | string | yes | — |
| `owner.replica` | integer | no | — |
| `profiles` | list of string | no | Profiles to apply, in order; empty applies the project's `default` profile. |
| `project` | string | yes | — |
| `rootPool` | string or null | no | The pool of the root disk when it is not the one the project's profile gives: the shared pool for a module that restarts on another member after a failure. Set by the control plane from the module's volume classes, never by a caller. |
| `source` | object | yes | Where an instance's root image comes from. |
| `source.alias` | string | yes | Alias such as `debian/13` or, for OCI, `repository:tag`. Pin an OCI image by digest: `repository@sha256:<64 hex digits>`. |
| `source.fingerprint` | string or null | no | Pins a simplestreams image: the full SHA-256 fingerprint Incus gives it. The instance must then be built from exactly this image. |
| `source.protocol` | one of `simplestreams`, `oci` | yes | How Incus fetches an image. |
| `source.server` | string | yes | Image server URL, e.g. a simplestreams server or an OCI registry. |
| `start` | boolean | no | Start the instance once created. |
| `volumes` | list of object | no | Persistent volumes, each created for this instance on the member it runs on. |
| `volumes[].class` | one of `data-local`, `data-replicated` | no | The policy a volume is created under. |
| `volumes[].content` | one of `filesystem`, `block` | no | What the volume holds: a mounted filesystem or a raw disk (virtual machines only). |
| `volumes[].name` | string | yes | Name in the design, e.g. `data`: lowercase letters, digits and `-`, at most 16. |
| `volumes[].path` | string or null | no | Where a filesystem volume is mounted inside the instance; none for a block volume. |
| `volumes[].pool` | string or null | no | The pool the class resolves to. Set by the control plane, never by a caller. |
| `volumes[].sizeMib` | integer | yes | — |

```json
{
  "project": "apelora",
  "name": "tools-01",
  "kind": "container",
  "start": true,
  "source": {
    "protocol": "simplestreams",
    "server": "https://images.linuxcontainers.org",
    "alias": "debian/13"
  },
  "architectures": [
    "x86_64"
  ],
  "config": {
    "limits.cpu": "1",
    "limits.memory": "1GiB"
  }
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
# Generate once per distinct change; keep this value when retrying.
IDEMPOTENCY_KEY=$(uuidgen)
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/instances" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -H "Content-Type: application/json" \
  --data-raw '{"project":"apelora","name":"tools-01","kind":"container","start":true,"source":{"protocol":"simplestreams","server":"https://images.linuxcontainers.org","alias":"debian/13"},"architectures":["x86_64"],"config":{"limits.cpu":"1","limits.memory":"1GiB"}}'
```

**TypeScript:**

```ts
const result = await client.request("create_instance", { body /* the request body above */, idempotencyKey: newIdempotencyKey() });
```

**Response `202`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "jobId": "dbc69543-0637-485d-b974-002bbaf7f37f",
  "created": true
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `project_not_allowed`, `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `503` | `incus_project_not_ready`, `quota_unverifiable`, `database_not_configured` |

### `DELETE /api/v1/instances/{project}/{name}`

Queues deletion of an Apelora instance (stopped first if running). Needs `deploy`.

**Operation ID:** `delete_instance`

**Needs:** `deploy`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `project` | path | string | yes | — | Incus project. |
| `name` | path | string | yes | — | Instance name. |
| `Idempotency-Key` | header | string | no | — | Makes the request safe to repeat |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
# Generate once per distinct change; keep this value when retrying.
IDEMPOTENCY_KEY=$(uuidgen)
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/instances/apelora/tools-01" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY"
```

**TypeScript:**

```ts
const result = await client.request("delete_instance", { params: { project: "apelora", name: "tools-01" }, idempotencyKey: newIdempotencyKey() });
```

**Response `202`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "jobId": "7ce5919e-fee9-4948-b1e6-1b95e58c7370",
  "created": true
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `project_not_allowed`, `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `GET /api/v1/instances/{project}/{name}/move`

Dry run of moving an instance to another member: whether it keeps running, what it copies, what blocks it. Changes nothing. Needs `deploy` (or `instance.manage`).

**Operation ID:** `preview_instance_move`

**Needs:** `deploy` (or `instance.manage`).

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `project` | path | string | yes | — | Incus project. |
| `name` | path | string | yes | — | Instance name. |
| `target` | query | string | yes | — | The member to move to. |
| `allowStop` | query | boolean | no | — | Whether a short stop is acceptable when it cannot move while running. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/instances/default/mock-web-01/move?target=mock-member-03" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**With options** (`target`, `allowStop`):

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/instances/default/mock-vm-01/move?target=mock-member-03&allowStop=true" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("preview_instance_move", { params: { project: "default", name: "mock-web-01" }, query: { target: "mock-member-03", allowStop: true } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-26T01:11:06.727431Z"
  },
  "plan": {
    "instance": "mock-web-01",
    "from": "mock-member-01",
    "to": "mock-member-03",
    "live": false,
    "stops": false,
    "volumes": [],
    "copyMib": 0,
    "blocked": [
      "mock-web-01 was not created by Apelora",
      "it would have to stop: a container cannot move while running; allow a short stop to move it"
    ],
    "notes": []
  }
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `project_not_allowed`, `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |

### `POST /api/v1/instances/{project}/{name}/move`

Moves an Apelora instance to another member, after the check runs again and its name is typed: live when it can, otherwise only with `allowStop`, copying its volumes there. Queues an `instance.move` job. Needs `deploy` (or `instance.manage`); audited.

**Operation ID:** `move_instance`

**Needs:** `deploy` (or `instance.manage`); audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `project` | path | string | yes | — | Incus project. |
| `name` | path | string | yes | — | Instance name. |
| `Idempotency-Key` | header | string | no | — | Makes the request safe to repeat |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `allowStop` | boolean | no | — |
| `confirm` | string | yes | The instance's name again, typed by the person moving it. |
| `target` | string | yes | — |

```json
{
  "target": "example",
  "confirm": "example"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
# Generate once per distinct change; keep this value when retrying.
IDEMPOTENCY_KEY=$(uuidgen)
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/instances/apelora/shop/move" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -H "Content-Type: application/json" \
  --data-raw '{"target":"example","confirm":"example"}'
```

**TypeScript:**

```ts
const result = await client.request("move_instance", { params: { project: "apelora", name: "shop" }, body: { target: "example", confirm: "example" }, idempotencyKey: newIdempotencyKey() });
```

**Response `202`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

```json
{
  "created": false,
  "jobId": "00000000-0000-4000-8000-000000000001"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `confirmation_mismatch`, `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `project_not_allowed`, `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `move_blocked` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |

### `POST /api/v1/instances/{project}/{name}/state`

Queues starting or stopping an Apelora instance. Needs `deploy`.

**Operation ID:** `change_state`

**Needs:** `deploy`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `project` | path | string | yes | — | Incus project. |
| `name` | path | string | yes | — | Instance name. |
| `Idempotency-Key` | header | string | no | — | Makes the request safe to repeat |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `action` | one of `start`, `stop`, `restart` | yes | A state change Apelora can request for one of its instances. |

```json
{
  "action": "restart"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
# Generate once per distinct change; keep this value when retrying.
IDEMPOTENCY_KEY=$(uuidgen)
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/instances/apelora/tools-01/state" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -H "Content-Type: application/json" \
  --data-raw '{"action":"restart"}'
```

**TypeScript:**

```ts
const result = await client.request("change_state", { params: { project: "apelora", name: "tools-01" }, body: { action: "restart" }, idempotencyKey: newIdempotencyKey() });
```

**Response `202`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "jobId": "7aecdbe2-e9b1-4420-a9ee-a2954d8e390e",
  "created": true
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `project_not_allowed`, `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `GET /api/v1/jobs`

Jobs newest first, filtered by status, kind and application and paged with `after`. Whole platform readers (`read-inventory`) see every job; anyone else the jobs of applications they may view.

**Operation ID:** `jobs`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `status` | query | string | no | — | `pending`, `running`, `succeeded`, `failed` or `cancelled`. |
| `kind` | query | string | no | — | Only kinds starting with this, e.g. `instance.` or `volume.restore`. |
| `application` | query | string | no | — | Only the jobs of this application. |
| `after` | query | string | no | — | Paging: the `next` of the previous page. |
| `limit` | query | integer | no | `100` | Jobs per page, 1 to 200 (default 100). |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/jobs" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**With options** (`status`, `application`, `limit`):

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/jobs?status=pending&application=shop&limit=1" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Next page:** repeat the request with `after` set to the response's `next`. The last page has no `next`.

**TypeScript:**

```ts
const result = await client.request("jobs", { query: { status: "pending", application: "shop", limit: 1 } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "items": [
    {
      "id": "53bd1bbb-e79f-4673-bd9f-b6422fb91f0c",
      "kind": "instance.create",
      "status": "pending",
      "attempts": 0,
      "maxAttempts": 5,
      "lastError": null,
      "incusOperation": null,
      "incusOperations": [],
      "requestId": "4745dbf4-62a5-4080-a1f3-b7167ec1d686",
      "request": {
        "architectures": [
          "x86_64",
          "aarch64"
        ],
        "config": {
          "limits.cpu": "1",
          "limits.memory": "1GiB"
        },
        "kind": "container",
        "name": "shop-cache-01",
        "owner": {
          "application": "shop",
          "module": "cache-01",
          "replica": 1
        },
        "profiles": [],
        "project": "shop-prod",
        "source": {
          "alias": "debian/13",
          "protocol": "simplestreams",
          "server": "https://images.linuxcontainers.org"
        },
        "start": true,
        "volumes": [
          {
            "class": "data-local",
            "content": "filesystem",
            "name": "cache",
            "path": "/var/cache/shop",
            "pool": "mock-local",
            "sizeMib": 2048
          }
        ]
      },
      "createdAt": "2026-10-26T01:11:06.650288Z",
      "updatedAt": "2026-10-26T01:11:06.650288Z",
      "queuedBy": "token:docs-verifier",
      "retryOf": null,
      "retriedBy": null,
      "cancelRequestedAt": null,
      "cancelRequestedBy": null,
      "actions": {
        "retry": {
          "allowed": false,
          "reason": "Only failed jobs can be retried."
        },
        "cancel": {
          "allowed": true,
          "reason": null
        }
      }
    },
    {
      "id": "5d642ea4-0abf-44ff-8b2a-57ff033fbc63",
      "kind": "instance.create",
      "status": "pending",
      "attempts": 0,
      "maxAttempts": 5,
      "lastError": null,
      "incusOperation": null,
      "incusOperations": [],
      "requestId": "4745dbf4-62a5-4080-a1f3-b7167ec1d686",
      "request": {
        "architectures": [
          "x86_64",
          "aarch64"
        ],
        "config": {
          "limits.cpu": "2",
          "limits.memory": "2GiB"
        },
        "kind": "container",
        "name": "shop-db-01",
        "owner": {
          "application": "shop",
          "module": "db-01",
          "replica": 1
        },
        "profiles": [],
        "project": "shop-prod",
        "source": {
          "alias": "debian/13",
          "protocol": "simplestreams",
          "server": "https://images.linuxcontainers.org"
        },
        "start": true,
        "volumes": [
          {
            "class": "data-local",
            "content": "filesystem",
            "name": "data",
            "path": "/var/lib/data",
            "pool": "mock-local",
            "sizeMib": 10240
          }
        ]
      },
      "createdAt": "2026-10-26T01:11:06.650288Z",
      "updatedAt": "2026-10-26T01:11:06.650288Z",
      "queuedBy": "token:docs-verifier",
      "retryOf": null,
      "retriedBy": null,
      "cancelRequestedAt": null,
      "cancelRequestedBy": null,
      "actions": {
        "retry": {
          "allowed": false,
          "reason": "Only failed jobs can be retried."
        },
        "cancel": {
          "allowed": true,
          "reason": null
        }
      }
    }
  ],
  "next": null
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `GET /api/v1/jobs/{id}`

A queued job and its progress. Needs `read-inventory`.

**Operation ID:** `job`

**Needs:** `read-inventory`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Job id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/jobs/ebddac70-3561-4d2b-9198-d92aa47c308d" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("job", { params: { id: "ebddac70-3561-4d2b-9198-d92aa47c308d" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "ebddac70-3561-4d2b-9198-d92aa47c308d",
  "kind": "instance.create",
  "status": "succeeded",
  "attempts": 1,
  "maxAttempts": 5,
  "lastError": null,
  "incusOperation": null,
  "incusOperations": [
    "00000000-0000-4000-8000-000000000002"
  ],
  "requestId": "4745dbf4-62a5-4080-a1f3-b7167ec1d686",
  "request": {
    "architectures": [
      "x86_64",
      "aarch64"
    ],
    "config": {
      "environment.APELORA_SERVICE_CACHE_01": "shop-cache-01",
      "environment.APELORA_SERVICE_DB_01": "shop-db-01",
      "limits.cpu": "1",
      "limits.memory": "512MiB"
    },
    "kind": "container",
    "name": "shop-web-01",
    "owner": {
      "application": "shop",
      "module": "web-01",
      "replica": 1
    },
    "profiles": [],
    "project": "shop-prod",
    "source": {
      "alias": "library/nginx@sha256:eb1c896deef834f4e056829fd6dadac8305501f16cc71ba65fb252c8d0aa168e",
      "protocol": "oci",
      "server": "https://docker.io"
    },
    "start": true
  },
  "createdAt": "2026-10-26T01:11:06.650288Z",
  "updatedAt": "2026-10-26T01:11:07.463197Z",
  "queuedBy": "token:docs-verifier",
  "retryOf": null,
  "retriedBy": null,
  "cancelRequestedAt": null,
  "cancelRequestedBy": null,
  "actions": {
    "retry": {
      "allowed": false,
      "reason": "Only failed jobs can be retried."
    },
    "cancel": {
      "allowed": false,
      "reason": "Only waiting or running jobs can be cancelled."
    }
  }
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `404` | `not_found` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `POST /api/v1/jobs/{id}/cancel`

Cancels a job. A waiting job with nothing in flight is cancelled at once (`cancelled`); otherwise the request is recorded (`requested`) and the worker stops at the job kind's next safe point, never in the middle of an Incus change (see `safePoints` on the job's detail). Repeating the request changes nothing. Refused (409 `job_finished`) for a finished job. Needs the permission that queues that kind of job on its target; audited.

**Operation ID:** `cancel_job`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Job id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/jobs/7ba32d5b-70d8-45b5-9af3-c3ef9fd2cb57/cancel" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("cancel_job", { params: { id: "7ba32d5b-70d8-45b5-9af3-c3ef9fd2cb57" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "outcome": "cancelled",
  "job": {
    "id": "7ba32d5b-70d8-45b5-9af3-c3ef9fd2cb57",
    "kind": "instance.create",
    "status": "cancelled",
    "attempts": 0,
    "maxAttempts": 5,
    "lastError": null,
    "incusOperation": null,
    "incusOperations": [],
    "requestId": "1db2486c-f90f-4aed-a0c2-8eac5ef61707",
    "request": {
      "architectures": [
        "x86_64"
      ],
      "config": {
        "limits.cpu": "1",
        "limits.memory": "1GiB"
      },
      "kind": "container",
      "name": "scratch-01",
      "profiles": [],
      "project": "apelora",
      "source": {
        "alias": "debian/13",
        "protocol": "simplestreams",
        "server": "https://images.linuxcontainers.org"
      },
      "start": true
    },
    "createdAt": "2026-10-26T01:11:06.70091Z",
    "updatedAt": "2026-10-26T01:11:06.706212Z",
    "queuedBy": "token:docs-verifier",
    "retryOf": null,
    "retriedBy": null,
    "cancelRequestedAt": "2026-10-26T01:11:06.706212Z",
    "cancelRequestedBy": "token:docs-verifier",
    "actions": {
      "retry": {
        "allowed": false,
        "reason": "Only failed jobs can be retried."
      },
      "cancel": {
        "allowed": false,
        "reason": "Only waiting or running jobs can be cancelled."
      }
    }
  }
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `project_not_allowed`, `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `job_finished` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `GET /api/v1/jobs/{id}/detail`

A job with its attempts (worker, timings, outcome, error and the Incus operations each started), who queued it, its request id, and the jobs linked to it (retries, and other jobs the same request queued). Same visibility as `GET /api/v1/jobs/{id}`.

**Operation ID:** `job_detail`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Job id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/jobs/ebddac70-3561-4d2b-9198-d92aa47c308d/detail" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("job_detail", { params: { id: "ebddac70-3561-4d2b-9198-d92aa47c308d" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "job": {
    "id": "ebddac70-3561-4d2b-9198-d92aa47c308d",
    "kind": "instance.create",
    "status": "succeeded",
    "attempts": 1,
    "maxAttempts": 5,
    "lastError": null,
    "incusOperation": null,
    "incusOperations": [
      "00000000-0000-4000-8000-000000000002"
    ],
    "requestId": "4745dbf4-62a5-4080-a1f3-b7167ec1d686",
    "request": {
      "architectures": [
        "x86_64",
        "aarch64"
      ],
      "config": {
        "environment.APELORA_SERVICE_CACHE_01": "shop-cache-01",
        "environment.APELORA_SERVICE_DB_01": "shop-db-01",
        "limits.cpu": "1",
        "limits.memory": "512MiB"
      },
      "kind": "container",
      "name": "shop-web-01",
      "owner": {
        "application": "shop",
        "module": "web-01",
        "replica": 1
      },
      "profiles": [],
      "project": "shop-prod",
      "source": {
        "alias": "library/nginx@sha256:eb1c896deef834f4e056829fd6dadac8305501f16cc71ba65fb252c8d0aa168e",
        "protocol": "oci",
        "server": "https://docker.io"
      },
      "start": true
    },
    "createdAt": "2026-10-26T01:11:06.650288Z",
    "updatedAt": "2026-10-26T01:11:07.463197Z",
    "queuedBy": "token:docs-verifier",
    "retryOf": null,
    "retriedBy": null,
    "cancelRequestedAt": null,
    "cancelRequestedBy": null,
    "actions": {
      "retry": {
        "allowed": false,
        "reason": "Only failed jobs can be retried."
      },
      "cancel": {
        "allowed": false,
        "reason": "Only waiting or running jobs can be cancelled."
      }
    }
  },
  "application": "shop",
  "target": "shop-prod/shop-web-01",
  "startedAt": "2026-10-26T01:11:07.450306Z",
  "finishedAt": "2026-10-26T01:11:07.463197Z",
  "attempts": [
    {
      "attempt": 1,
      "worker": "docs-worker",
      "startedAt": "2026-10-26T01:11:07.450306Z",
      "endedAt": "2026-10-26T01:11:07.463197Z",
      "outcome": "succeeded",
      "error": null,
      "incusOperations": [
        "00000000-0000-4000-8000-000000000002"
      ]
    }
  ],
  "linked": [
    {
      "id": "53bd1bbb-e79f-4673-bd9f-b6422fb91f0c",
      "kind": "instance.create",
      "status": "succeeded",
      "relation": "same-request",
      "target": "shop-prod/shop-cache-01",
      "createdAt": "2026-10-26T01:11:06.650288Z"
    },
    {
      "id": "5d642ea4-0abf-44ff-8b2a-57ff033fbc63",
      "kind": "instance.create",
      "status": "succeeded",
      "relation": "same-request",
      "target": "shop-prod/shop-db-01",
      "createdAt": "2026-10-26T01:11:06.650288Z"
    }
  ],
  "safePoints": "Only before the instance is created. Once it exists, its volumes are attached and it is started, so a cancelled create never leaves a half-built instance."
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `POST /api/v1/jobs/{id}/retry`

Queues a new job that repeats a failed one, linked to it (`retryOf`); the failed job is kept unchanged as evidence. Needs the permission that queues that kind of job on its target. Refused (409) when the job did not fail (`not_failed`), was retried already (`already_retried`), a newer job for the same target was queued since (`superseded`), or it is an application operation (`not_retryable`: start it again from the application). Audited.

**Operation ID:** `retry_job`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Job id |
| `Idempotency-Key` | header | string | no | — | Makes the request safe to repeat |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
# Generate once per distinct change; keep this value when retrying.
IDEMPOTENCY_KEY=$(uuidgen)
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/jobs/2c4c5086-f3e9-425b-b235-007215e589fe/retry" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY"
```

**TypeScript:**

```ts
const result = await client.request("retry_job", { params: { id: "2c4c5086-f3e9-425b-b235-007215e589fe" }, idempotencyKey: newIdempotencyKey() });
```

**Response `202`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "jobId": "5c94b950-5b91-4f67-83b7-38d8f8fb19bd",
  "created": true
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `project_not_allowed`, `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `already_retried`, `not_failed`, `not_retryable`, `superseded` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

