---
title: System API
section: api
slug: system
order: 1
label: System
source: packages/api-client/openapi.json
summary: Health, version, sign-in, settings, who am I.
---
Health, version and sign-in options (some of them public), the settings the control plane runs with, the support bundle, and who the caller is. This page documents all 16 operations, each with a request you can copy. Set `APELORA_URL` and `APELORA_TOKEN` as described in [the API overview](/docs/api/overview/).

## Operations

| Operation | What it does |
|---|---|
| [`GET /api/v1/database-backups`](#get-apiv1database-backups) | Whether Apelora's database is being backed up and a restore has been proven, from the records the scripts leave in `APELORA_DB_BACKUP_DIR`. |
| [`GET /api/v1/health`](#get-apiv1health) | Public. |
| [`GET /api/v1/health/components`](#get-apiv1healthcomponents) | The state of each part of this installation: control plane, database, deployment workers, job queue, Incus, networks, storage pools and identity providers. |
| [`GET /api/v1/health/servers`](#get-apiv1healthservers) | Each server's status, CPU, memory, storage and the instances on it, with warnings. |
| [`GET /api/v1/image-mirrors`](#get-apiv1image-mirrors) | Image mirrors: the configuration this control plane runs with (upstream → mirror pairs and whether only mirrors may be used; URLs, not secrets), whether each mirror answers (probed at most once a minute), and the image servers each deployable catalog class needs with whether it is covered. |
| [`PUT /api/v1/me/password`](#put-apiv1mepassword) | Changes the caller's own password (local accounts only). |
| [`GET /api/v1/monitoring`](#get-apiv1monitoring) | Where each metrics endpoint is, whether the caller may scrape, and the region, site and sector labels. |
| [`GET /api/v1/settings`](#get-apiv1settings) | The settings this control plane runs with: every setting the control plane and the worker read, the value when it may be shown (never a secret, a key or a certificate path), whether it is the default and where it came from; sign-in settings saved in the Console; the workers seen recently. |
| [`GET /api/v1/sign-in`](#get-apiv1sign-in) | Public. |
| [`POST /api/v1/sign-in/password`](#post-apiv1sign-inpassword) | Public. |
| [`POST /api/v1/sign-in/setup`](#post-apiv1sign-insetup) | Public. |
| [`POST /api/v1/sign-out`](#post-apiv1sign-out) | Ends the Apelora session the request was made with. |
| [`GET /api/v1/support-bundle`](#get-apiv1support-bundle) | Downloads a support bundle (a tar file, streamed): manifest, versions, effective settings (secrets never included), health, preflight, jobs that failed in the last 24 hours with their attempts, a metrics snapshot and where to find logs. |
| [`GET /api/v1/system`](#get-apiv1system) | Versions of this control plane and the Incus release it is pinned to, and when the certificates Apelora uses to reach Incus expire, and Incus as observed now (running version, or the error that keeps it unreachable). |
| [`GET /api/v1/whoami`](#get-apiv1whoami) | Who is calling, with the role assignments and permissions in force. |
| [`GET /metrics`](#get-metrics) | Metrics of this control plane in the text exposition format (OpenMetrics when the `Accept` header asks for `application/openmetrics-text`). |

## Details

### `GET /api/v1/database-backups`

Whether Apelora's database is being backed up and a restore has been proven, from the records the scripts leave in `APELORA_DB_BACKUP_DIR`.

**Needs:** `cluster.view`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/database-backups" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "backups": 0,
  "configured": false,
  "assessment": {
    "findings": [
      {
        "level": "ok",
        "text": "example"
      }
    ],
    "state": "ok",
    "backupAgeHours": 1,
    "drillAgeDays": 1
  },
  "directory": "example",
  "lastDrill": {
    "backup": "example",
    "drilledAt": "2026-01-01T09:00:00Z",
    "durationSeconds": 0,
    "passed": false,
    "reason": "example"
  },
  "lastVerified": {
    "backup": "example",
    "drilledAt": "2026-01-01T09:00:00Z",
    "durationSeconds": 0,
    "passed": false,
    "reason": "example"
  },
  "newestBackup": {
    "createdAt": "2026-01-01T09:00:00Z",
    "durationSeconds": 0,
    "encryption": "example",
    "file": "example",
    "pgDumpVersion": "example",
    "sizeBytes": 0,
    "migrations": 0
  }
}
```

**Errors:** `401`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/health`

Public. Reports that the service answers, the inventory provider, the authentication mode and whether Incus is reachable. Incus is asked at most every 15 s whatever the request rate; versions and error text are only on `GET /api/v1/system` (signed in).

**Sign-in:** none; this operation is public.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/health" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "apiVersion": "example",
  "auth": "tokens",
  "checkedAt": "2026-01-01T09:00:00Z",
  "incus": {
    "connected": false
  },
  "provider": "mock",
  "service": "example",
  "status": "example",
  "version": "example"
}
```

**Errors:** `429`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/health/components`

The state of each part of this installation: control plane, database, deployment workers, job queue, Incus, networks, storage pools and identity providers. Read-only; needs `cluster.view`.

**Needs:** a signed-in caller; the server decides what that caller may see.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/health/components" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "checkedAt": "2026-01-01T09:00:00Z",
  "controlPlane": {
    "apiVersion": "example",
    "auth": "tokens",
    "provider": "mock",
    "startedAt": "2026-01-01T09:00:00Z",
    "state": "healthy",
    "uptimeSecs": 1,
    "version": "example",
    "nextStep": "example",
    "reason": "example"
  },
  "database": {
    "expectedSchemaVersion": 1,
    "state": "healthy",
    "nextStep": "example",
    "reason": "example",
    "roundTripMs": 1,
    "schemaVersion": 1
  },
  "identityProviders": {
    "apiTokens": false,
    "items": [
      {
        "enabled": false,
        "name": "example",
        "reachable": false,
        "source": "example",
        "error": "example"
      }
    ],
    "state": "healthy",
    "nextStep": "example",
    "reason": "example"
  },
  "incus": {
    "provider": "mock",
    "state": "healthy",
    "apiVersion": "example",
    "clustered": false,
    "members": {
      "evacuated": 0,
      "offline": 0,
      "online": 0,
      "other": 0,
      "total": 0
    },
    "nextStep": "example",
    "reason": "example",
    "roundTripMs": 1,
    "serverVersion": "example"
  },
  "jobQueue": {
    "state": "healthy",
    "counts": {
      "failedLastHour": 1,
      "retrying": 1,
      "running": 1,
      "stalled": 1,
      "waiting": 1,
      "oldestWaitingSecs": 1
    },
    "nextStep": "example",
    "reason": "example"
  },
  "networks": {
    "problems": [
      "example"
    ],
  …
```

**Errors:** `401`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/health/servers`

Each server's status, CPU, memory, storage and the instances on it, with warnings. Read-only; needs `cluster.view`.

**Needs:** a signed-in caller; the server decides what that caller may see.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/health/servers" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "clustered": false,
  "items": [
    {
      "architecture": "example",
      "failureDomain": "example",
      "held": false,
      "instances": [
        {
          "kind": "container",
          "managed": false,
          "name": "example",
          "project": "apelora",
          "status": "example"
        }
      ],
      "message": "example",
      "name": "example",
      "roles": [
        "example"
      ],
      "state": "healthy",
      "status": "example",
      "warnings": [
        "example"
      ],
      "resources": {
        "loadAverages": [
          1
        ],
        "pools": [
          {
            "name": "example",
            "totalBytes": 0,
            "usedBytes": 0
          }
        ],
        "cpuThreads": 0,
        "memory": {
          "totalBytes": 0,
          "usedBytes": 0
        },
        "uptimeSecs": 0
      },
      "resourcesError": "example"
    }
  ],
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  }
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/image-mirrors`

Image mirrors: the configuration this control plane runs with (upstream → mirror pairs and whether only mirrors may be used; URLs, not secrets), whether each mirror answers (probed at most once a minute), and the image servers each deployable catalog class needs with whether it is covered. Read-only: configuration stays in the environment.

**Needs:** `read-inventory`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/image-mirrors" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "checks": [
    {
      "detail": "example",
      "id": "example",
      "status": "pass",
      "title": "example"
    }
  ],
  "mirrors": [
    {
      "mirror": "example",
      "probe": {
        "detail": "example",
        "state": "answers"
      },
      "upstream": "example",
      "checkedAt": "2026-01-01T09:00:00Z"
    }
  ],
  "mode": "any",
  "overall": "pass",
  "servers": [
    {
      "coverage": "mirrored",
      "images": [
        {
          "alias": "example",
          "class": "example",
          "displayName": "example",
          "setting": "example"
        }
      ],
      "protocol": "simplestreams",
      "server": "example",
      "mirror": "example"
    }
  ]
}
```

**Errors:** `401`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `PUT /api/v1/me/password`

Changes the caller's own password (local accounts only). Every other session of theirs is revoked; the one making the request stays. Counts towards the account's lock like a sign-in.

**Needs:** a signed-in caller; the server decides what that caller may see.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `current` | string | yes | — |
| `new` | string | yes | — |

```json
{
  "current": "example",
  "new": "example"
}
```

```sh
curl -sS -X PUT "$APELORA_URL/api/v1/me/password" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"current":"example","new":"example"}'
```

**Response `204`**, with no body.

**Errors:** `400`, `401`, `409`, `429`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/monitoring`

Where each metrics endpoint is, whether the caller may scrape, and the region, site and sector labels.

**Needs:** `fabric.metrics.read` or `cluster.view`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/monitoring" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "endpoints": [
    {
      "authentication": "example",
      "component": "example",
      "path": "example",
      "address": "example"
    }
  ],
  "formats": [
    "example"
  ],
  "incusMetricsPath": "example",
  "mayScrape": false,
  "permission": "example",
  "provider": "mock",
  "region": "example",
  "role": "example",
  "sector": "example",
  "site": "example"
}
```

**Errors:** `401`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/settings`

The settings this control plane runs with: every setting the control plane and the worker read, the value when it may be shown (never a secret, a key or a certificate path), whether it is the default and where it came from; sign-in settings saved in the Console; the workers seen recently.

**Needs:** `cluster.view` on the platform.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/settings" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "description": "A description",
      "isDefault": false,
      "known": false,
      "name": "example",
      "readBy": [
        "example"
      ],
      "set": false,
      "source": "example",
      "default": "example",
      "hidden": "example",
      "value": "example"
    }
  ],
  "readAt": "2026-01-01T09:00:00Z",
  "saved": [
    {
      "description": "A description",
      "isDefault": false,
      "known": false,
      "name": "example",
      "readBy": [
        "example"
      ],
      "set": false,
      "source": "example",
      "default": "example",
      "hidden": "example",
      "value": "example"
    }
  ],
  "workers": [
    {
      "host": "example",
      "id": "example",
      "lastSeen": "example",
      "version": "example"
    }
  ]
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/sign-in`

Public. How people can sign in to this control plane.

**Sign-in:** none; this operation is public.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/sign-in" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "apiTokens": false,
  "directories": [
    {
      "id": "00000000-0000-4000-8000-000000000001",
      "name": "example"
    }
  ],
  "localAccounts": false,
  "providers": [
    {
      "clientId": "example",
      "issuer": "example",
      "label": "example",
      "scopes": [
        "example"
      ]
    }
  ]
}
```

### `POST /api/v1/sign-in/password`

Public. Signs a person in with a username and password and returns an Apelora session. Every refusal answers `invalid_credentials` (unknown, wrong, locked or disabled alike). Limited to 10 attempts a minute per client address.

**Sign-in:** none; this operation is public.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `directory` | string | no | Sign in against this directory instead of a local account. |
| `password` | string | yes | — |
| `username` | string | yes | — |

```json
{
  "username": "example",
  "password": "<redacted>"
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/sign-in/password" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"example","password":"<redacted>"}'
```

**Response `200`**:

```json
{
  "expiresAt": "2026-01-01T09:00:00Z",
  "name": "example",
  "token": "<redacted>"
}
```

**Errors:** `400`, `401`, `429`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/sign-in/setup`

Public. Sets a local account's password with its one-time setup link (24 hours, single use). `setup_invalid` when the link was used, expired or is unknown; `weak_password` with the rule when the password does not follow it.

**Sign-in:** none; this operation is public.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `password` | string | yes | — |
| `token` | string | yes | The token from the setup link. |

```json
{
  "token": "<redacted>",
  "password": "<redacted>"
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/sign-in/setup" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token":"<redacted>","password":"<redacted>"}'
```

**Response `204`**, with no body.

**Errors:** `400`, `429`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/sign-out`

Ends the Apelora session the request was made with. With any other credential (an identity-provider or API token) there is nothing to end here: 204.

**Needs:** a signed-in caller; the server decides what that caller may see.

```sh
curl -sS -X POST "$APELORA_URL/api/v1/sign-out" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`**, with no body.

**Errors:** `401`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/support-bundle`

Downloads a support bundle (a tar file, streamed): manifest, versions, effective settings (secrets never included), health, preflight, jobs that failed in the last 24 hours with their attempts, a metrics snapshot and where to find logs. Never tokens, passwords, certificates or keys.

**Needs:** `support.bundle`; audited (`support.bundle.downloaded`) before it is sent.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/support-bundle" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**, with no body.

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/system`

Versions of this control plane and the Incus release it is pinned to, and when the certificates Apelora uses to reach Incus expire, and Incus as observed now (running version, or the error that keeps it unreachable).

**Needs:** `read-inventory`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/system" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "apiVersion": "example",
  "certificates": [
    {
      "certificate": "example",
      "daysLeft": 1,
      "expiresAt": "2026-01-01T09:00:00Z",
      "state": "example"
    }
  ],
  "incus": {
    "connected": false,
    "serverVersion": "example",
    "apiVersion": "example",
    "clustered": false,
    "error": "example"
  },
  "incusPinned": "example",
  "incusSeries": "example",
  "incusTestedWith": "example",
  "version": "example"
}
```

**Errors:** `401`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/whoami`

Who is calling, with the role assignments and permissions in force.

**Needs:** a signed-in caller; the server decides what that caller may see.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/whoami" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "capabilities": [
    "example"
  ],
  "credential": "example",
  "deployProjects": [
    "apelora"
  ],
  "kind": "example",
  "localAccount": false,
  "name": "example",
  "permissions": [
    "read-inventory"
  ],
  "platformPermissions": [
    "example"
  ],
  "roles": [
    {
      "emergency": false,
      "role": "example",
      "scope": {},
      "viaGroup": false,
      "expiresAt": "2026-01-01T09:00:00Z"
    }
  ],
  "id": "00000000-0000-4000-8000-000000000001",
  "role": "fabric-admin"
}
```

**Errors:** `401`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /metrics`

Metrics of this control plane in the text exposition format (OpenMetrics when the `Accept` header asks for `application/openmetrics-text`). Labels never carry names, ids, paths with ids, tokens or error texts; see docs/architecture/MONITORING.md.

**Needs:** `fabric.metrics.read` (built-in role Metrics Reader, for the collector's service identity).

```sh
curl -sS -X GET "$APELORA_URL/metrics" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**, with no body.

**Errors:** `401`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

