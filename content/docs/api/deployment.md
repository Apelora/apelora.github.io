---
title: Deployment API
section: api
slug: deployment
order: 3
label: Deployment
source: packages/api-client/openapi.json
summary: Instances, plans, deployments, moves and volumes.
---
Creating, changing and moving single instances, and the plan and deployment of a design. This page documents all 10 operations, each with a request you can copy. Set `APELORA_URL` and `APELORA_TOKEN` as described in [the API overview](/docs/api/overview/).

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

Queues creation of an instance. Apelora marks it as its own; only such instances can later be stopped or deleted through Apelora.

**Needs:** `deploy`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `Idempotency-Key` | header | string | no | Makes the request safe to repeat |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `architectures` | list of string | no | Architectures the image is known to run on (see [`ARCHITECTURES`]); empty allows any. Checked against the cluster before creating and against the instance Incus created. |
| `config` | object | no | Extra instance config; keys under `user.apelora.` are reserved. |
| `kind` | `container`, `virtual-machine`, `unknown` | yes | Kind of Incus instance as reported by the cluster. |
| `name` | string | yes | — |
| `network` | one of several | no | — |
| `owner` | one of several | no | — |
| `profiles` | list of string | no | Profiles to apply, in order; empty applies the project's `default` profile. |
| `project` | string | yes | — |
| `rootPool` | string | no | The pool of the root disk when it is not the one the project's profile gives: the shared pool for a module that restarts on another member after a failure (ADR 0013). Set by the control plane from the module's volume classes, never by a caller. |
| `source` | object | yes | Where an instance's root image comes from. |
| `start` | boolean | no | Start the instance once created. |
| `volumes` | list of object | no | Persistent volumes, each created for this instance on the member it runs on. |

```json
{
  "project": "apelora",
  "name": "example",
  "kind": "container",
  "source": {
    "alias": "example",
    "protocol": "simplestreams",
    "server": "example",
    "fingerprint": "example"
  }
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/instances" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"project":"apelora","name":"example","kind":"container","source":{"alias":"example","protocol":"simplestreams","server":"example","fingerprint":"example"}}'
```

**Response `202`**:

```json
{
  "created": false,
  "jobId": "00000000-0000-4000-8000-000000000001"
}
```

**Errors:** `400`, `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/instances/{project}/{name}`

Queues deletion of an Apelora instance (stopped first if running).

**Needs:** `deploy`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `project` | path | string | yes | Incus project. |
| `name` | path | string | yes | Instance name. |
| `Idempotency-Key` | header | string | no | Makes the request safe to repeat |

```sh
curl -sS -X DELETE "$APELORA_URL/api/v1/instances/apelora/shop" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Idempotency-Key: $(uuidgen)"
```

**Response `202`**:

```json
{
  "created": false,
  "jobId": "00000000-0000-4000-8000-000000000001"
}
```

**Errors:** `400`, `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/instances/{project}/{name}/move`

Dry run of moving an instance to another member: whether it keeps running, what it copies, what blocks it. Changes nothing.

**Needs:** `deploy` (or `instance.manage`).

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `project` | path | string | yes | Incus project. |
| `name` | path | string | yes | Instance name. |
| `target` | query | string | yes | The member to move to. |
| `allowStop` | query | boolean | no | Whether a short stop is acceptable when it cannot move while running. |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/instances/apelora/shop/move?target=example" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "plan": {
    "blocked": [
      "example"
    ],
    "copyMib": 0,
    "from": "example",
    "instance": "example",
    "live": false,
    "notes": [
      "example"
    ],
    "stops": false,
    "to": "example",
    "volumes": [
      "example"
    ]
  },
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  }
}
```

**Errors:** `400`, `401`, `403`, `404`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/instances/{project}/{name}/move`

Moves an Apelora instance to another member, after the check runs again and its name is typed: live when it can, otherwise only with `allowStop`, copying its volumes there. Queues an `instance.move` job.

**Needs:** `deploy` (or `instance.manage`); audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `project` | path | string | yes | Incus project. |
| `name` | path | string | yes | Instance name. |
| `Idempotency-Key` | header | string | no | Makes the request safe to repeat |

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

```sh
curl -sS -X POST "$APELORA_URL/api/v1/instances/apelora/shop/move" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"target":"example","confirm":"example"}'
```

**Response `202`**:

```json
{
  "created": false,
  "jobId": "00000000-0000-4000-8000-000000000001"
}
```

**Errors:** `400`, `401`, `403`, `404`, `409`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/instances/{project}/{name}/state`

Queues starting or stopping an Apelora instance.

**Needs:** `deploy`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `project` | path | string | yes | Incus project. |
| `name` | path | string | yes | Instance name. |
| `Idempotency-Key` | header | string | no | Makes the request safe to repeat |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `action` | `start`, `stop`, `restart` | yes | A state change Apelora can request for one of its instances. |

```json
{
  "action": "start"
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/instances/apelora/shop/state" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Idempotency-Key: $(uuidgen)" \
  -H "Content-Type: application/json" \
  -d '{"action":"start"}'
```

**Response `202`**:

```json
{
  "created": false,
  "jobId": "00000000-0000-4000-8000-000000000001"
}
```

**Errors:** `400`, `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/jobs`

Jobs newest first, filtered by status, kind and application and paged with `after`. Whole platform readers (`read-inventory`) see every job; anyone else the jobs of applications they may view.

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `status` | query | string | no | `pending`, `running`, `succeeded`, `failed` or `cancelled`. |
| `kind` | query | string | no | Only kinds starting with this, e.g. `instance.` or `volume.restore`. |
| `application` | query | string | no | Only the jobs of this application. |
| `after` | query | string | no | Paging: the `next` of the previous page. |
| `limit` | query | integer | no | Jobs per page, 1 to 200 (default 100). |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/jobs" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "actions": {
        "cancel": {
          "allowed": false,
          "reason": "example"
        },
        "retry": {
          "allowed": false,
          "reason": "example"
        }
      },
      "attempts": 1,
      "createdAt": "2026-01-01T09:00:00Z",
      "id": "00000000-0000-4000-8000-000000000001",
      "incusOperations": [
        "example"
      ],
      "kind": "example",
      "maxAttempts": 1,
      "request": {},
      "status": "example",
      "updatedAt": "2026-01-01T09:00:00Z",
      "cancelRequestedAt": "2026-01-01T09:00:00Z",
      "cancelRequestedBy": "example",
      "incusOperation": "example",
      "lastError": "example"
    }
  ],
  "next": "example"
}
```

**Errors:** `400`, `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/jobs/{id}`

A queued job and its progress.

**Needs:** `read-inventory`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Job id |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/jobs/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "actions": {
    "cancel": {
      "allowed": false,
      "reason": "example"
    },
    "retry": {
      "allowed": false,
      "reason": "example"
    }
  },
  "attempts": 1,
  "createdAt": "2026-01-01T09:00:00Z",
  "id": "00000000-0000-4000-8000-000000000001",
  "incusOperations": [
    "example"
  ],
  "kind": "example",
  "maxAttempts": 1,
  "request": {},
  "status": "example",
  "updatedAt": "2026-01-01T09:00:00Z",
  "cancelRequestedAt": "2026-01-01T09:00:00Z",
  "cancelRequestedBy": "example",
  "incusOperation": "example",
  "lastError": "example"
}
```

**Errors:** `401`, `404`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/jobs/{id}/cancel`

Cancels a job. A waiting job with nothing in flight is cancelled at once (`cancelled`); otherwise the request is recorded (`requested`) and the worker stops at the job kind's next safe point, never in the middle of an Incus change (see `safePoints` on the job's detail). Repeating the request changes nothing. Refused (409 `job_finished`) for a finished job.

**Needs:** the permission that queues that kind of job on its target; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Job id |

```sh
curl -sS -X POST "$APELORA_URL/api/v1/jobs/00000000-0000-4000-8000-000000000001/cancel" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "job": {
    "actions": {
      "cancel": {
        "allowed": false,
        "reason": "example"
      },
      "retry": {
        "allowed": false,
        "reason": "example"
      }
    },
    "attempts": 1,
    "createdAt": "2026-01-01T09:00:00Z",
    "id": "00000000-0000-4000-8000-000000000001",
    "incusOperations": [
      "example"
    ],
    "kind": "example",
    "maxAttempts": 1,
    "request": {},
    "status": "example",
    "updatedAt": "2026-01-01T09:00:00Z",
    "cancelRequestedAt": "2026-01-01T09:00:00Z",
    "cancelRequestedBy": "example",
    "incusOperation": "example",
    "lastError": "example"
  },
  "outcome": "example"
}
```

**Errors:** `401`, `403`, `404`, `409`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/jobs/{id}/detail`

A job with its attempts (worker, timings, outcome, error and the Incus operations each started), who queued it, its request id, and the jobs linked to it (retries, and other jobs the same request queued). Same visibility as `GET /api/v1/jobs/{id}`.

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Job id |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/jobs/00000000-0000-4000-8000-000000000001/detail" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "attempts": [
    {
      "attempt": 1,
      "incusOperations": [
        "example"
      ],
      "startedAt": "2026-01-01T09:00:00Z",
      "worker": "example",
      "endedAt": "2026-01-01T09:00:00Z",
      "error": "example",
      "outcome": "example"
    }
  ],
  "job": {
    "actions": {
      "cancel": {
        "allowed": false,
        "reason": "example"
      },
      "retry": {
        "allowed": false,
        "reason": "example"
      }
    },
    "attempts": 1,
    "createdAt": "2026-01-01T09:00:00Z",
    "id": "00000000-0000-4000-8000-000000000001",
    "incusOperations": [
      "example"
    ],
    "kind": "example",
    "maxAttempts": 1,
    "request": {},
    "status": "example",
    "updatedAt": "2026-01-01T09:00:00Z",
    "cancelRequestedAt": "2026-01-01T09:00:00Z",
    "cancelRequestedBy": "example",
    "incusOperation": "example",
    "lastError": "example"
  },
  "linked": [
    {
      "createdAt": "2026-01-01T09:00:00Z",
      "id": "00000000-0000-4000-8000-000000000001",
      "kind": "example",
      "relation": "example",
      "status": "example",
      "target": "example"
    }
  ],
  "safePoints": "example",
  "target": "example",
  "application": "example",
  "finishedAt": "2026-01-01T09:00:00Z",
  "startedAt": "2026-01-01T09:00:00Z"
}
```

**Errors:** `401`, `403`, `404`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/jobs/{id}/retry`

Queues a new job that repeats a failed one, linked to it (`retryOf`); the failed job is kept unchanged as evidence. Refused (409) when the job did not fail (`not_failed`), was retried already (`already_retried`), a newer job for the same target was queued since (`superseded`), or it is an application operation (`not_retryable`: start it again from the application). Audited.

**Needs:** the permission that queues that kind of job on its target.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Job id |
| `Idempotency-Key` | header | string | no | Makes the request safe to repeat |

```sh
curl -sS -X POST "$APELORA_URL/api/v1/jobs/00000000-0000-4000-8000-000000000001/retry" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Idempotency-Key: $(uuidgen)"
```

**Response `202`**:

```json
{
  "created": false,
  "jobId": "00000000-0000-4000-8000-000000000001"
}
```

**Errors:** `401`, `403`, `404`, `409`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

