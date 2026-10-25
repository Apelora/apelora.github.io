---
title: System API
section: api
slug: system
order: 1
label: System
source: packages/api-client/openapi.json
summary: Health, versions, sign-in, settings, metrics, who am I.
---
Health and versions, signing in and out, passwords, settings, metrics and monitoring, image mirrors, database backups, support bundles and caller identity. This page lists 16 operations.

Set variables in the [API overview](/docs/api/overview/). Download [OpenAPI](/assets/api/openapi.json).

## Operations

| Operation | What it does |
|---|---|
| [`GET /api/v1/database-backups`](#get-apiv1database-backups) | Whether Apelora's database is being backed up and a restore has been proven, from the records the scripts leave in `APELORA_DB_BACKUP_DIR`. |
| [`GET /api/v1/health`](#get-apiv1health) | Reports that the service answers, the inventory provider, the authentication mode and whether Incus is reachable. |
| [`GET /api/v1/health/components`](#get-apiv1healthcomponents) | The state of each part of this installation: control plane, database, deployment workers, job queue, Incus, networks, storage pools and identity providers. |
| [`GET /api/v1/health/servers`](#get-apiv1healthservers) | Each server's status, CPU, memory, storage and the instances on it, with warnings. |
| [`GET /api/v1/image-mirrors`](#get-apiv1image-mirrors) | Image mirrors: the configuration this control plane runs with (upstream → mirror pairs and whether only mirrors may be used; URLs, not secrets), whether each mirror answers (probed at most once a minute), and the image servers each deployable catalog class needs with whether it is covered. |
| [`PUT /api/v1/me/password`](#put-apiv1mepassword) | Changes the caller's own password (local accounts only). |
| [`GET /api/v1/monitoring`](#get-apiv1monitoring) | Where each metrics endpoint is, whether the caller may scrape, and the region, site and sector labels. |
| [`GET /api/v1/settings`](#get-apiv1settings) | The settings this control plane runs with: every setting the control plane and the worker read, the value when it may be shown (never a secret, a key or a certificate path), whether it is the default and where it came from; sign-in settings saved in the Console; the workers seen recently. |
| [`GET /api/v1/sign-in`](#get-apiv1sign-in) | How people can sign in to this control plane. |
| [`POST /api/v1/sign-in/password`](#post-apiv1sign-inpassword) | Signs a person in with a username and password and returns an Apelora session. |
| [`POST /api/v1/sign-in/setup`](#post-apiv1sign-insetup) | Sets a local account's password with its one-time setup link (24 hours, single use). |
| [`POST /api/v1/sign-out`](#post-apiv1sign-out) | Ends the Apelora session the request was made with. |
| [`GET /api/v1/support-bundle`](#get-apiv1support-bundle) | Downloads a support bundle (a tar file, streamed): manifest, versions, effective settings (secrets never included), health, preflight, jobs that failed in the last 24 hours with their attempts, a metrics snapshot and where to find logs. |
| [`GET /api/v1/system`](#get-apiv1system) | Versions of this control plane and the Incus release it is pinned to, and when the certificates Apelora uses to reach Incus expire, and Incus as observed now (running version, or the error that keeps it unreachable). |
| [`GET /api/v1/whoami`](#get-apiv1whoami) | Who is calling, with the role assignments and permissions in force. |
| [`GET /metrics`](#get-metrics) | Metrics of this control plane in the text exposition format (OpenMetrics when the `Accept` header asks for `application/openmetrics-text`). |

## Details

### `GET /api/v1/database-backups`

Whether Apelora's database is being backed up and a restore has been proven, from the records the scripts leave in `APELORA_DB_BACKUP_DIR`. Needs `cluster.view`.

**Operation ID:** `database_backups`

**Needs:** `cluster.view`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/database-backups" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("database_backups", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "configured": true,
  "directory": "/var/backups/apelora",
  "backups": 0,
  "newestBackup": null,
  "lastDrill": null,
  "lastVerified": null,
  "assessment": {
    "state": "failing",
    "backupAgeHours": null,
    "drillAgeDays": null,
    "findings": [
      {
        "level": "failing",
        "text": "No backup of Apelora's database has been written yet."
      },
      {
        "level": "warning",
        "text": "No restore of Apelora's database has been verified yet. A backup that was never restored is a hope, not a backup."
      }
    ]
  }
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |

### `GET /api/v1/health`

Public. Reports that the service answers, the inventory provider, the authentication mode and whether Incus is reachable. Incus is asked at most every 15 s whatever the request rate; versions and error text are only on `GET /api/v1/system` (signed in).

**Operation ID:** `health`

**Sign-in:** none; this operation is public.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/health" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("health", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "status": "ok",
  "service": "control-plane",
  "version": "0.0.0",
  "apiVersion": "v1",
  "provider": "mock",
  "auth": "tokens",
  "incus": {
    "connected": false
  },
  "checkedAt": "2026-10-25T20:59:28.502797Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `429` | `rate_limited` |

### `GET /api/v1/health/components`

The state of each part of this installation: control plane, database, deployment workers, job queue, Incus, networks, storage pools and identity providers. Read-only; needs `cluster.view`.

**Operation ID:** `health_components`

**Needs:** `cluster.view`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/health/components" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("health_components", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "checkedAt": "2026-10-25T20:59:37.694608Z",
  "overall": "degraded",
  "controlPlane": {
    "state": "healthy",
    "version": "0.0.0",
    "apiVersion": "v1",
    "startedAt": "2026-10-25T20:59:28.427608Z",
    "uptimeSecs": 9,
    "auth": "tokens",
    "provider": "mock",
    "reason": null,
    "nextStep": null
  },
  "database": {
    "state": "healthy",
    "roundTripMs": 1.8,
    "schemaVersion": 33,
    "expectedSchemaVersion": 33,
    "reason": null,
    "nextStep": null
  },
  "workers": {
    "state": "healthy",
    "items": [
      {
        "id": "docs-worker",
        "host": "unknown",
        "version": "0.0.0",
        "startedAt": "2026-10-25T20:59:31.834773Z",
        "lastSeen": "2026-10-25T20:59:31.834773Z",
        "secondsSinceSeen": 5,
        "state": "running"
      }
    ],
    "reason": null,
    "nextStep": null
  },
  "jobQueue": {
    "state": "degraded",
    "counts": {
      "waiting": 0,
      "retrying": 0,
      "running": 0,
      "stalled": 0,
      "failedLastHour": 2,
      "oldestWaitingSecs": null
    },
    "reason": "2 jobs failed in the last hour",
    "nextStep": "Open Operations to see the jobs and their errors"
  },
  "incus": {
    "state": "not-set-up",
    "provider": "mock",
    "apiVersion": "1.0",
    "serverVersion": null,
    "clustered": true,
    "roundTripMs": 0,
    "members": {
      "total": 3,
      "online": 2,
      "evacuated": 1,
      "offline": 0,
      "other": 0
    },
    "reason": "Mock data: no Incus server is configured",
    "nextStep": "Set APELORA_INCUS_URL and the certificate paths to read a real cluster"
  },
  "networks": {
    "state": "healthy",
    "total": 1,
    "problems": [],
    "reason": null,
    "nextStep": null
  },
  "storagePools": {
    "state": "healthy",
    "total": 1,
    "problems": [],
    "reason": null,
    "nextStep": null
  },
  "identityProviders": {
    "state": "not-set-up",
    "items": [],
    "apiTokens": true,
    "reason": "No identity provider is set up; people sign in with API tokens",
    "nextStep": null
  }
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |

### `GET /api/v1/health/servers`

Each server's status, CPU, memory, storage and the instances on it, with warnings. Read-only; needs `cluster.view`.

**Operation ID:** `health_servers`

**Needs:** `cluster.view`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/health/servers" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("health_servers", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-25T20:59:37.697631Z"
  },
  "clustered": true,
  "items": [
    {
      "name": "mock-member-01",
      "status": "Online",
      "message": "Fully operational",
      "state": "healthy",
      "roles": [
        "database-leader",
        "database"
      ],
      "architecture": "x86_64",
      "failureDomain": "default",
      "held": false,
      "resources": {
        "cpuThreads": 8,
        "loadAverages": [
          0.6,
          0.48,
          0.36
        ],
        "memory": {
          "usedBytes": 9663676416,
          "totalBytes": 34359738368
        },
        "pools": [
          {
            "name": "mock-local",
            "usedBytes": 128849018880,
            "totalBytes": 536870912000
          }
        ],
        "uptimeSecs": 259200
      },
      "resourcesError": null,
      "instances": [
        {
          "name": "mock-web-01",
          "project": "default",
          "kind": "container",
          "status": "Running",
          "managed": false
        }
      ],
      "warnings": []
    },
    {
      "name": "mock-member-02",
      "status": "Evacuated",
      "message": "Fully operational",
      "state": "degraded",
      "roles": [
        "database"
      ],
      "architecture": "x86_64",
      "failureDomain": "default",
      "held": false,
      "resources": {
        "cpuThreads": 8,
        "loadAverages": [
          1.4,
          1.1199999999999999,
          0.84
        ],
        "memory": {
          "usedBytes": 13958643712,
          "totalBytes": 34359738368
        },
        "pools": [
          {
            "name": "mock-local",
            "usedBytes": 225485783040,
            "totalBytes": 536870912000
          }
        ],
        "uptimeSecs": 262800
      },
      "resourcesError": null,
      "instances": [
        {
          "name": "mock-web-02",
          "project": "default",
          "kind": "container",
          "status": "Running",
          "managed": false
        },
        {
          "name": "mock-vm-01",
          "project": "default",
          "kind": "virtual-machine",
          "status": "Running",
          "managed": false
        }
      ],
      "warnings": [
        "Evacuated: it runs no workloads until it is restored"
      ]
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |

### `GET /api/v1/image-mirrors`

Image mirrors: the configuration this control plane runs with (upstream → mirror pairs and whether only mirrors may be used; URLs, not secrets), whether each mirror answers (probed at most once a minute), and the image servers each deployable catalog class needs with whether it is covered. Read-only: configuration stays in the environment. Needs `read-inventory`.

**Operation ID:** `image_mirrors`

**Needs:** `read-inventory`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/image-mirrors" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("image_mirrors", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "mode": "any",
  "mirrors": [],
  "servers": [
    {
      "server": "https://docker.io",
      "protocol": "oci",
      "coverage": "upstream",
      "mirror": null,
      "images": [
        {
          "class": "nginx",
          "displayName": "NGINX",
          "setting": "channel = stable",
          "alias": "library/nginx@sha256:eb1c896deef834f4e056829fd6dadac8305501f16cc71ba65fb252c8d0aa168e"
        },
        {
          "class": "nginx",
          "displayName": "NGINX",
          "setting": "channel = mainline",
          "alias": "library/nginx@sha256:bc4cad49969aaf95eb4eecec5572846f86e59f1e8332aba36ed64b91aff8b724"
        }
      ]
    },
    {
      "server": "https://images.linuxcontainers.org",
      "protocol": "simplestreams",
      "coverage": "upstream",
      "mirror": null,
      "images": [
        {
          "class": "resolver",
          "displayName": "Resolver",
          "setting": null,
          "alias": "debian/13"
        },
        {
          "class": "linux-base",
          "displayName": "Linux base",
          "setting": null,
          "alias": "debian/13"
        }
      ]
    }
  ],
  "checks": [
    {
      "id": "image-mirrors",
      "title": "Image mirrors",
      "status": "warn",
      "detail": "none configured, so the catalog's 2 image servers are used directly. Fine with internet access; without it, set APELORA_IMAGE_MIRRORS and APELORA_IMAGE_SERVERS=mirrors-only"
    }
  ],
  "overall": "warn"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |

### `PUT /api/v1/me/password`

Changes the caller's own password (local accounts only). Every other session of theirs is revoked; the one making the request stays. Counts towards the account's lock like a sign-in.

**Operation ID:** `change_password`

**Needs:** a signed-in caller; the server decides what that caller may see.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `current` | string | yes | — |
| `new` | string | yes | — |

```json
{
  "current": "<current password>",
  "new": "<new password>"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/me/password" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  --data-raw '{"current":"<current password>","new":"<new password>"}'
```

**TypeScript:**

```ts
await client.request("change_password", { body: { current: "<current password>", new: "<new password>" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request`, `weak_password`, `wrong_password` |
| `401` | `unauthenticated`, `invalid_token` |
| `409` | `account_locked`, `not_a_local_account` |
| `429` | `rate_limited` |

### `GET /api/v1/monitoring`

Where each metrics endpoint is, whether the caller may scrape, and the region, site and sector labels. Needs `fabric.metrics.read` or `cluster.view`.

**Operation ID:** `monitoring`

**Needs:** `fabric.metrics.read` or `cluster.view`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/monitoring" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("monitoring", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "region": "default",
  "site": "default",
  "sector": "default",
  "provider": "mock",
  "mayScrape": true,
  "permission": "fabric.metrics.read",
  "role": "metrics-reader",
  "endpoints": [
    {
      "component": "control-plane",
      "address": null,
      "path": "/metrics",
      "authentication": "bearer"
    },
    {
      "component": "worker",
      "address": "127.0.0.1:9471",
      "path": "/metrics",
      "authentication": "none"
    }
  ],
  "formats": [
    "text/plain; version=0.0.4; charset=utf-8",
    "application/openmetrics-text; version=1.0.0; charset=utf-8"
  ],
  "incusMetricsPath": "/1.0/metrics"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |

### `GET /api/v1/settings`

The settings this control plane runs with: every setting the control plane and the worker read, the value when it may be shown (never a secret, a key or a certificate path), whether it is the default and where it came from; sign-in settings saved in the Console; the workers seen recently. Needs `cluster.view` on the platform.

**Operation ID:** `effective_settings`

**Needs:** `cluster.view` on the platform.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/settings" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("effective_settings", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "items": [
    {
      "name": "APELORA_ALERT_EVALUATE_SECS",
      "value": "30",
      "set": false,
      "isDefault": true,
      "default": "30",
      "source": "default",
      "hidden": null,
      "readBy": [
        "worker"
      ],
      "description": "How often built-in alert rules are evaluated (0: off)",
      "known": true
    },
    {
      "name": "APELORA_ALLOWED_ORIGINS",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Browser origins besides the API's own host",
      "known": true
    }
  ],
  "saved": [
    {
      "name": "auth.local_accounts",
      "value": "on",
      "set": true,
      "isDefault": false,
      "default": "off",
      "source": "console",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Sign-in with local accounts (Identity & Access → Sign-in)",
      "known": true
    },
    {
      "name": "identity.api_tokens",
      "value": "accepted",
      "set": false,
      "isDefault": true,
      "default": "accepted",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Legacy API tokens accepted (also needs APELORA_LEGACY_TOKENS)",
      "known": true
    }
  ],
  "workers": [
    {
      "id": "docs-worker",
      "host": "unknown",
      "version": "0.0.0",
      "lastSeen": "2026-10-25T20:59:31.834773Z"
    }
  ],
  "readAt": "2026-10-25T20:59:28.427608Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `503` | `database_not_configured`, `store_unavailable` |

### `GET /api/v1/sign-in`

Public. How people can sign in to this control plane.

**Operation ID:** `sign_in_options`

**Sign-in:** none; this operation is public.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/sign-in" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("sign_in_options", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "providers": [],
  "apiTokens": true,
  "localAccounts": false,
  "directories": []
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `429` | `rate_limited` |

### `POST /api/v1/sign-in/password`

Public. Signs a person in with a username and password and returns an Apelora session. Every refusal answers `invalid_credentials` (unknown, wrong, locked or disabled alike). Limited to 10 attempts a minute per client address.

**Operation ID:** `sign_in_with_password`

**Sign-in:** none; this operation is public.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `directory` | string (uuid) or null | no | Sign in against this directory instead of a local account. |
| `password` | string | yes | — |
| `username` | string | yes | — |

```json
{
  "username": "ada",
  "password": "<password>"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/sign-in/password" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"username":"ada","password":"<password>"}'
```

**TypeScript:**

```ts
const result = await client.request("sign_in_with_password", { body: { username: "ada", password: "<password>" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "token": "<token, shown once>",
  "expiresAt": "2026-10-26T04:59:29.025804Z",
  "name": "Ada Lovelace"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `directory_unavailable`, `invalid_request`, `local_accounts_disabled` |
| `401` | `invalid_credentials`, `unauthenticated`, `invalid_token` |
| `429` | `rate_limited` |
| `503` | `directory_unreachable`, `database_not_configured` |

### `POST /api/v1/sign-in/setup`

Public. Sets a local account's password with its one-time setup link (24 hours, single use). `setup_invalid` when the link was used, expired or is unknown; `weak_password` with the rule when the password does not follow it.

**Operation ID:** `complete_password_setup`

**Sign-in:** none; this operation is public.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `password` | string | yes | — |
| `token` | string | yes | The token from the setup link. |

```json
{
  "token": "<setup token from the setup link>",
  "password": "<new password>"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/sign-in/setup" \
  -H "Content-Type: application/json" \
  --data-raw '{"token":"<setup token from the setup link>","password":"<new password>"}'
```

**TypeScript:**

```ts
await client.request("complete_password_setup", { body: { token: "<setup token from the setup link>", password: "<new password>" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request`, `setup_invalid`, `weak_password` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `POST /api/v1/sign-out`

Ends the Apelora session the request was made with. With any other credential (an identity-provider or API token) there is nothing to end here: 204.

**Operation ID:** `sign_out`

**Needs:** a signed-in caller; the server decides what that caller may see.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/sign-out" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("sign_out", {});
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `429` | `rate_limited` |

### `GET /api/v1/support-bundle`

Downloads a support bundle (a tar file, streamed): manifest, versions, effective settings (secrets never included), health, preflight, jobs that failed in the last 24 hours with their attempts, a metrics snapshot and where to find logs. Never tokens, passwords, certificates or keys. Needs `support.bundle`; audited (`support.bundle.downloaded`) before it is sent.

**Operation ID:** `support_bundle`

**Needs:** `support.bundle`; audited (`support.bundle.downloaded`) before it is sent.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/support-bundle" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/x-tar" \
  --output support-bundle.tar
```

**TypeScript:**

```ts
const result = await client.request("support_bundle", {});
```

**Response `200`** — A tar archive.

Content-Type: `application/x-tar`.

Binary download; the command saves the response to a file. For a tar bundle, list the files after a successful download:

```sh
tar -tf support-bundle.tar
```

**Example contents:**

```text
apelora-support-20261025-205937/manifest.json
apelora-support-20261025-205937/versions.json
apelora-support-20261025-205937/settings.json
apelora-support-20261025-205937/health.json
apelora-support-20261025-205937/preflight.json
apelora-support-20261025-205937/jobs-failed.json
apelora-support-20261025-205937/metrics.txt
apelora-support-20261025-205937/logs/README.txt
apelora-support-20261025-205937/README.txt
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `GET /api/v1/system`

Versions of this control plane and the Incus release it is pinned to, and when the certificates Apelora uses to reach Incus expire, and Incus as observed now (running version, or the error that keeps it unreachable). Needs `read-inventory`.

**Operation ID:** `system`

**Needs:** `read-inventory`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/system" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("system", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "version": "0.0.0",
  "apiVersion": "v1",
  "incusPinned": "v7.0.2",
  "incusSeries": "7.0",
  "incusTestedWith": "<how this release was tested with Incus>",
  "certificates": [],
  "incus": {
    "connected": false,
    "apiVersion": "1.0",
    "serverVersion": null,
    "clustered": true
  }
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |

### `GET /api/v1/whoami`

Who is calling, with the role assignments and permissions in force.

**Operation ID:** `whoami`

**Needs:** a signed-in caller; the server decides what that caller may see.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/whoami" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("whoami", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "name": "docs-verifier",
  "kind": "legacy-token",
  "id": null,
  "role": "fabric-admin",
  "permissions": [
    "read-inventory",
    "read-audit",
    "manage-tokens",
    "manage-infrastructure"
  ],
  "capabilities": [
    "organization.view",
    "organization.update",
    "project.view",
    "project.create"
  ],
  "platformPermissions": [
    "organization.view",
    "organization.update",
    "project.view",
    "project.create"
  ],
  "roles": [],
  "deployProjects": [
    "apelora",
    "shop-prod",
    "default"
  ],
  "localAccount": false,
  "credential": "api-token"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated` |
| `429` | `rate_limited` |

### `GET /metrics`

Metrics of this control plane in the text exposition format (OpenMetrics when the `Accept` header asks for `application/openmetrics-text`). Needs `fabric.metrics.read` (built-in role Metrics Reader, for the collector's service identity). Labels never carry names, ids, paths with ids, tokens or error texts; see docs/architecture/MONITORING.md.

**Operation ID:** `metrics`

**Needs:** `fabric.metrics.read` (built-in role Metrics Reader, for the collector's service identity).

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/metrics" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: text/plain"
```

**TypeScript:**

```ts
const result = await client.request("metrics", {});
```

**Response `200`** — Metrics in the text exposition format.

Content-Type: `text/plain`.

**Example response** from a test installation; your IDs, names and times differ. The first 15 of 2952 lines.

```text
# HELP apelora_build_info Always 1: which component, version and commit is running.
# TYPE apelora_build_info gauge
apelora_build_info{region="default",site="default",sector="default",component="control-plane",version="0.0.0",commit="unknown"} 1
# HELP apelora_provider_info Always 1: whether this process talks to Incus or to the mock (mode).
# TYPE apelora_provider_info gauge
apelora_provider_info{region="default",site="default",sector="default",mode="mock"} 1
# HELP apelora_http_requests_total API requests answered, by route template, method and status class.
# TYPE apelora_http_requests_total counter
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/alerts",method="GET",status="2xx"} 9
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/alerts/channels",method="GET",status="2xx"} 2
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/alerts/channels",method="POST",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/alerts/channels/{id}",method="DELETE",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/alerts/channels/{id}",method="PUT",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/alerts/channels/{id}/test",method="POST",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/alerts/history",method="GET",status="2xx"} 2
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |

