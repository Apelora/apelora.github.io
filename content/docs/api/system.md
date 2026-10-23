---
title: System API
section: api
slug: system
order: 1
label: System
source: packages/api-client/openapi.json
summary: Health, version, sign-in, settings, who am I.
---
Health, versions, sign-in, settings, support bundles and caller identity. This page lists 16 operations.

Set variables in the [API overview](/docs/api/overview/). Download [OpenAPI](/assets/api/openapi.json). Examples: **MOCK VERIFIED** (tested with simulated inventory); **Illustrative** (schema values).

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

**Response `200`** — Success.

Content-Type: `application/json`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

```json
{
  "configured": false,
  "backups": 0,
  "newestBackup": null,
  "lastDrill": null,
  "lastVerified": null,
  "assessment": null
}
```

**Errors:** `401`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/health`

Public. Reports that the service answers, the inventory provider, the authentication mode and whether Incus is reachable. Incus is asked at most every 15 s whatever the request rate; versions and error text are only on `GET /api/v1/system` (signed in).

**Operation ID:** `health`

**Sign-in:** none; this operation is public.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/health" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

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
  "checkedAt": "2026-10-23T22:12:57.992311Z"
}
```

**Errors:** `429`. The body is `{ "error": { "code": …, "message": … } }`.

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

**Response `200`** — Success.

Content-Type: `application/json`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

```json
{
  "checkedAt": "2026-10-23T22:12:58.22869Z",
  "overall": "down",
  "controlPlane": {
    "state": "healthy",
    "version": "0.0.0",
    "apiVersion": "v1",
    "startedAt": "2026-10-23T22:12:57.929042Z",
    "uptimeSecs": 0,
    "auth": "tokens",
    "provider": "mock",
    "reason": null,
    "nextStep": null
  },
  "database": {
    "state": "healthy",
    "roundTripMs": 1.8,
    "schemaVersion": 31,
    "expectedSchemaVersion": 31,
    "reason": null,
    "nextStep": null
  },
  "workers": {
    "state": "down",
    "items": [],
    "reason": "No deployment worker is running: deployments, moves and recovery wait until one starts",
    "nextStep": "Start the deployment worker (apelora-deployment-worker) with the same DATABASE_URL, and read its log"
  },
  "jobQueue": {
    "state": "healthy",
    "counts": {
      "waiting": 0,
      "retrying": 0,
      "running": 0,
      "stalled": 0,
      "failedLastHour": 0,
      "oldestWaitingSecs": null
    },
    "reason": null,
    "nextStep": null
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
      "online": 3,
      "evacuated": 0,
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

**Errors:** `401`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

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

**Response `200`** — Success.

Content-Type: `application/json`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-23T22:12:58.231327Z"
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
      "status": "Online",
      "message": "Fully operational",
      "state": "healthy",
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
      "warnings": []
    },
    {
      "name": "mock-member-03",
      "status": "Online",
      "message": "Fully operational",
      "state": "healthy",
      "roles": [
        "database"
      ],
      "architecture": "x86_64",
      "failureDomain": "default",
      "held": false,
      "resources": {
        "cpuThreads": 8,
        "loadAverages": [
          0.3,
          0.24,
          0.18
        ],
        "memory": {
          "usedBytes": 6442450944,
          "totalBytes": 34359738368
        },
        "pools": [
          {
            "name": "mock-local",
            "usedBytes": 85899345920,
            "totalBytes": 536870912000
          }
        ],
        "uptimeSecs": 266400
      },
      "resourcesError": null,
      "instances": [
        {
          "name": "mock-db-01",
          "project": "default",
          "kind": "container",
          "status": "Running",
          "managed": false
        }
      ],
      "warnings": []
    }
  ]
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

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

**Response `200`** — Success.

Content-Type: `application/json`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

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
          "class": "linux-base",
          "displayName": "Linux base",
          "setting": null,
          "alias": "debian/13"
        },
        {
          "class": "debian",
          "displayName": "Debian",
          "setting": "version = 12",
          "alias": "debian/12"
        },
        {
          "class": "debian",
          "displayName": "Debian",
          "setting": "version = 13",
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

**Errors:** `401`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `PUT /api/v1/me/password`

Changes the caller's own password (local accounts only). Every other session of theirs is revoked; the one making the request stays. Counts towards the account's lock like a sign-in.

**Operation ID:** `change_password`

**Needs:** a signed-in caller; the server decides what that caller may see.

**Request body** (JSON, illustrative values):

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/me/password" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  --data-raw '{"current":"example","new":"example"}'
```

**Response `204`** — Success, with no body.

**Errors:** `400`, `401`, `409`, `429`. The body is `{ "error": { "code": …, "message": … } }`.

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

**Response `200`** — Success.

Content-Type: `application/json`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

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

**Errors:** `401`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

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

**Response `200`** — Success.

Content-Type: `application/json`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

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
    },
    {
      "name": "APELORA_API_ADDR",
      "value": "127.0.0.1:50679",
      "set": true,
      "isDefault": false,
      "default": "127.0.0.1:8080",
      "source": "environment",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Address the API listens on",
      "known": true
    },
    {
      "name": "APELORA_API_URL",
      "value": "http://127.0.0.1:8080",
      "set": false,
      "isDefault": true,
      "default": "http://127.0.0.1:8080",
      "source": "default",
      "hidden": null,
      "readBy": [
        "web-dev-server"
      ],
      "description": "Where the web development server sends /api",
      "known": true
    },
    {
      "name": "APELORA_BACKUP_POOL",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "worker"
      ],
      "description": "Pool scheduled backups are copied to",
      "known": true
    },
    {
      "name": "APELORA_BEHIND_PROXY",
      "value": "0",
      "set": false,
      "isDefault": true,
      "default": "0",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "1: a TLS-terminating proxy is in front",
      "known": true
    },
    {
      "name": "APELORA_BMC_ALLOW_LAB",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "worker"
      ],
      "description": "Allows the lab-only provider that stops a Lima VM (the disposable test cluster); never in production",
      "known": true
    },
    {
      "name": "APELORA_BMC_FENCE_AFTER_SECS",
      "value": "30",
      "set": false,
      "isDefault": true,
      "default": "30",
      "source": "default",
      "hidden": null,
      "readBy": [
        "worker"
      ],
      "description": "A server Offline for this long (at least 20) is switched off through its BMC and fenced",
      "known": true
    },
    {
      "name": "APELORA_BMC_MAP",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "worker"
      ],
      "description": "File naming each server's BMC (ADR 0014): provider (redfish, ipmi, maas), address, user, the name of its password variable and its hardware UUID (for IPMI the system GUID). No passwords in it; absent: no fencing through a BMC",
      "known": true
    },
    {
      "name": "APELORA_CONSOLE_ACCESS",
      "value": "enabled",
      "set": false,
      "isDefault": true,
      "default": "enabled",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "disabled turns terminal sessions off",
      "known": true
    },
    {
      "name": "APELORA_CONSOLE_GID",
      "value": "1000",
      "set": false,
      "isDefault": true,
      "default": "1000",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Group terminal sessions run as",
      "known": true
    },
    {
      "name": "APELORA_CONSOLE_IDLE_SECS",
      "value": "900",
      "set": false,
      "isDefault": true,
      "default": "900",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "No typing for this long ends a session",
      "known": true
    },
    {
      "name": "APELORA_CONSOLE_MAX_SECS",
      "value": "3600",
      "set": false,
      "isDefault": true,
      "default": "3600",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Absolute limit of a session",
      "known": true
    },
    {
      "name": "APELORA_CONSOLE_MAX_SESSIONS",
      "value": "3",
      "set": false,
      "isDefault": true,
      "default": "3",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Open sessions and tickets per person",
      "known": true
    },
    {
      "name": "APELORA_CONSOLE_POWERSHELL",
      "value": "disabled",
      "set": false,
      "isDefault": true,
      "default": "disabled",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "enabled offers PowerShell",
      "known": true
    },
    {
      "name": "APELORA_CONSOLE_UID",
      "value": "1000",
      "set": false,
      "isDefault": true,
      "default": "1000",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "User terminal sessions run as",
      "known": true
    },
    {
      "name": "APELORA_DB_BACKUP_DIR",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Directory the database backup and restore-drill scripts write their records to (read only; Administration shows whether backups are recent and a restore was verified)",
      "known": true
    },
    {
      "name": "APELORA_DEPLOY_PROJECTS",
      "value": "apelora",
      "set": false,
      "isDefault": true,
      "default": "apelora",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane",
        "worker"
      ],
      "description": "Incus projects Apelora may change",
      "known": true
    },
    {
      "name": "APELORA_FENCE_LOCKSPACE",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "worker"
      ],
      "description": "The shared volume group's lockspace the fence probe reads; default the only one joined",
      "known": true
    },
    {
      "name": "APELORA_FENCE_PROBE",
      "value": "off",
      "set": false,
      "isDefault": true,
      "default": "off",
      "source": "default",
      "hidden": null,
      "readBy": [
        "worker"
      ],
      "description": "How the worker reads the shared storage's leases to fence a failed server (off or ssh)",
      "known": true
    },
    {
      "name": "APELORA_FENCE_PROBE_KEY",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "worker"
      ],
      "description": "Private key of the fence probe's forced SSH command",
      "known": true
    },
    {
      "name": "APELORA_FENCE_PROBE_KNOWN_HOSTS",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "worker"
      ],
      "description": "Pinned host keys of the members the fence probe reads",
      "known": true
    },
    {
      "name": "APELORA_FENCE_PROBE_TARGETS",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "worker"
      ],
      "description": "Where the fence probe reaches each member (member=host[:port]); default the member's address, port 22",
      "known": true
    },
    {
      "name": "APELORA_FENCE_PROBE_USER",
      "value": "apelora-fence",
      "set": false,
      "isDefault": true,
      "default": "apelora-fence",
      "source": "default",
      "hidden": null,
      "readBy": [
        "worker"
      ],
      "description": "Account of the fence probe on each member",
      "known": true
    },
    {
      "name": "APELORA_HEALTH_FAIL_AFTER_SECS",
      "value": "20",
      "set": false,
      "isDefault": true,
      "default": "20",
      "source": "default",
      "hidden": null,
      "readBy": [
        "worker"
      ],
      "description": "Failing checks for this long: unhealthy",
      "known": true
    },
    {
      "name": "APELORA_HEALTH_RESTART_AFTER_SECS",
      "value": "60",
      "set": false,
      "isDefault": true,
      "default": "60",
      "source": "default",
      "hidden": null,
      "readBy": [
        "worker"
      ],
      "description": "Unhealthy for this long: restarted",
      "known": true
    },
    {
      "name": "APELORA_IMAGE_MIRRORS",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane",
        "worker"
      ],
      "description": "Image mirrors, upstream=mirror pairs",
      "known": true
    },
    {
      "name": "APELORA_IMAGE_SERVERS",
      "value": "any",
      "set": false,
      "isDefault": true,
      "default": "any",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane",
        "worker"
      ],
      "description": "mirrors-only refuses every server that is not a mirror",
      "known": true
    },
    {
      "name": "APELORA_INCUS_ADMIN_CLIENT_CERT",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Client certificate file of the unrestricted admin identity",
      "known": true
    },
    {
      "name": "APELORA_INCUS_ADMIN_CLIENT_KEY",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Private key file of the unrestricted admin identity",
      "known": true
    },
    {
      "name": "APELORA_INCUS_CLIENT_CERT",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane",
        "worker"
      ],
      "description": "Client certificate file of the restricted deploy identity",
      "known": true
    },
    {
      "name": "APELORA_INCUS_CLIENT_KEY",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane",
        "worker"
      ],
      "description": "Private key file of the restricted deploy identity",
      "known": true
    },
    {
      "name": "APELORA_INCUS_SERVER_CERT",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane",
        "worker"
      ],
      "description": "Pinned Incus server certificate file",
      "known": true
    },
    {
      "name": "APELORA_INCUS_TLS_SERVER_NAME",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane",
        "worker"
      ],
      "description": "Name to expect in the Incus server certificate",
      "known": true
    },
    {
      "name": "APELORA_INCUS_URL",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane",
        "worker"
      ],
      "description": "Incus API address; without it the mock is used",
      "known": true
    },
    {
      "name": "APELORA_LEGACY_TOKENS",
      "value": "enabled",
      "set": false,
      "isDefault": true,
      "default": "enabled",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "disabled refuses legacy apl_ API tokens",
      "known": true
    },
    {
      "name": "APELORA_LOG_FORMAT",
      "value": "text",
      "set": false,
      "isDefault": true,
      "default": "text",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane",
        "worker"
      ],
      "description": "text or json log lines",
      "known": true
    },
    {
      "name": "APELORA_MAAS_API_KEY",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane",
        "worker"
      ],
      "description": "MAAS API key (consumer:token:secret) of a dedicated MAAS user; read once at start, never shown",
      "known": true
    },
    {
      "name": "APELORA_MAAS_CA",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane",
        "worker"
      ],
      "description": "PEM file of the authority that signed MAAS's certificate; default the system roots",
      "known": true
    },
    {
      "name": "APELORA_MAAS_URL",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane",
        "worker"
      ],
      "description": "Address of the MAAS region API (https://host:5240/MAAS); empty: only manual machines. The control plane lists its machines; the worker can fence through it",
      "known": true
    },
    {
      "name": "APELORA_METRICS_ADDR",
      "value": "off",
      "set": false,
      "isDefault": true,
      "default": "off",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Separate metrics listener without authentication",
      "known": true
    },
    {
      "name": "APELORA_NETWORK_UPLINK",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Uplink for per-application OVN networks",
      "known": true
    },
    {
      "name": "APELORA_OIDC_AUDIENCE",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Names this API has at the provider",
      "known": true
    },
    {
      "name": "APELORA_OIDC_AUTHORIZED_PARTIES",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Clients a token must be issued to (azp)",
      "known": true
    },
    {
      "name": "APELORA_OIDC_CLIENT_ID",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Public browser client (no secret)",
      "known": true
    },
    {
      "name": "APELORA_OIDC_GROUPS_CLAIM",
      "value": "groups",
      "set": false,
      "isDefault": true,
      "default": "groups",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Claim holding group names",
      "known": true
    },
    {
      "name": "APELORA_OIDC_ISSUER",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Identity provider set by the environment",
      "known": true
    },
    {
      "name": "APELORA_OIDC_JWKS_URL",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "The provider's key set",
      "known": true
    },
    {
      "name": "APELORA_OIDC_LABEL",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Name on the sign-in button",
      "known": true
    },
    {
      "name": "APELORA_OIDC_MFA_ACR",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "acr values that count as multi-factor",
      "known": true
    },
    {
      "name": "APELORA_OIDC_MFA_AMR",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "amr values that count as multi-factor",
      "known": true
    },
    {
      "name": "APELORA_OIDC_SCOPES",
      "value": "openid profile email",
      "set": false,
      "isDefault": true,
      "default": "openid profile email",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Scopes the browser asks for",
      "known": true
    },
    {
      "name": "APELORA_OIDC_USERNAME_CLAIM",
      "value": "preferred_username",
      "set": false,
      "isDefault": true,
      "default": "preferred_username",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Claim holding the user name",
      "known": true
    },
    {
      "name": "APELORA_OTLP_ENDPOINT",
      "value": "off",
      "set": false,
      "isDefault": true,
      "default": "off",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane",
        "worker"
      ],
      "description": "OTLP/HTTP traces for request and job spans (off, or an http(s) URL of a Tempo or collector inside the site)",
      "known": true
    },
    {
      "name": "APELORA_OUTBOX_SINK",
      "value": "log",
      "set": false,
      "isDefault": true,
      "default": "log",
      "source": "default",
      "hidden": null,
      "readBy": [
        "worker"
      ],
      "description": "Where audit messages are relayed",
      "known": true
    },
    {
      "name": "APELORA_PROBE_UID",
      "value": "65534",
      "set": false,
      "isDefault": true,
      "default": "65534",
      "source": "default",
      "hidden": null,
      "readBy": [
        "worker"
      ],
      "description": "User a module's readiness command runs as inside its instances (not root by default)",
      "known": true
    },
    {
      "name": "APELORA_RATE_LIMIT_FAILED_AUTH_BURST",
      "value": "20",
      "set": false,
      "isDefault": true,
      "default": "20",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Refused credentials saved up per client address",
      "known": true
    },
    {
      "name": "APELORA_RATE_LIMIT_FAILED_AUTH_PER_MIN",
      "value": "10",
      "set": false,
      "isDefault": true,
      "default": "10",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Refused credentials per client address per minute",
      "known": true
    },
    {
      "name": "APELORA_RATE_LIMIT_MAX_CLIENTS",
      "value": "10000",
      "set": false,
      "isDefault": true,
      "default": "10000",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Buckets kept per limit",
      "known": true
    },
    {
      "name": "APELORA_RATE_LIMIT_PUBLIC_BURST",
      "value": "60",
      "set": false,
      "isDefault": true,
      "default": "60",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Public requests saved up per client address",
      "known": true
    },
    {
      "name": "APELORA_RATE_LIMIT_PUBLIC_PER_MIN",
      "value": "120",
      "set": false,
      "isDefault": true,
      "default": "120",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Public requests per client address per minute",
      "known": true
    },
    {
      "name": "APELORA_RATE_LIMIT_WRITES_BURST",
      "value": "200",
      "set": false,
      "isDefault": true,
      "default": "200",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Changes saved up per signed-in caller",
      "known": true
    },
    {
      "name": "APELORA_RATE_LIMIT_WRITES_PER_MIN",
      "value": "600",
      "set": false,
      "isDefault": true,
      "default": "600",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Changes per signed-in caller per minute",
      "known": true
    },
    {
      "name": "APELORA_REBALANCE",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "worker"
      ],
      "description": "1: move a stateless replica that shares a server with another of its module (off when unset)",
      "known": true
    },
    {
      "name": "APELORA_RECOVER_AFTER_SECS",
      "value": "120",
      "set": false,
      "isDefault": true,
      "default": "120",
      "source": "default",
      "hidden": null,
      "readBy": [
        "worker"
      ],
      "description": "Offline time before replicas are substituted",
      "known": true
    },
    {
      "name": "APELORA_REGION",
      "value": "default",
      "set": false,
      "isDefault": true,
      "default": "default",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane",
        "worker"
      ],
      "description": "Constant region label on metrics",
      "known": true
    },
    {
      "name": "APELORA_RESTORE_DRILL_RECORD",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "worker"
      ],
      "description": "The restore drill's result file the restore-age alert reads",
      "known": true
    },
    {
      "name": "APELORA_SECTOR",
      "value": "default",
      "set": false,
      "isDefault": true,
      "default": "default",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane",
        "worker"
      ],
      "description": "Constant sector label on metrics",
      "known": true
    },
    {
      "name": "APELORA_SERVICE_ADDRESSES",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Routed IPv4 (/16–/30) or IPv6 (/112–/126) range for service addresses",
      "known": true
    },
    {
      "name": "APELORA_SHARED_POOL",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Shared storage pool behind the data-replicated volume class (modules that restart on another server after fencing)",
      "known": true
    },
    {
      "name": "APELORA_SITE",
      "value": "default",
      "set": false,
      "isDefault": true,
      "default": "default",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane",
        "worker"
      ],
      "description": "Constant site label on metrics",
      "known": true
    },
    {
      "name": "APELORA_SUPERVISE_SECS",
      "value": "30",
      "set": false,
      "isDefault": true,
      "default": "30",
      "source": "default",
      "hidden": null,
      "readBy": [
        "worker"
      ],
      "description": "Seconds between replica supervisor passes",
      "known": true
    },
    {
      "name": "APELORA_TLS_CERT",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Certificate chain file for HTTPS served by the API itself",
      "known": true
    },
    {
      "name": "APELORA_TLS_KEY",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Private key file for HTTPS served by the API itself",
      "known": true
    },
    {
      "name": "APELORA_TRUSTED_PROXIES",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Proxies whose X-Forwarded-For is believed",
      "known": true
    },
    {
      "name": "APELORA_VOLUME_POOL",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "control-plane"
      ],
      "description": "Storage pool behind the data-local volume class",
      "known": true
    },
    {
      "name": "APELORA_WORKER_ID",
      "value": null,
      "set": false,
      "isDefault": true,
      "default": null,
      "source": "not set",
      "hidden": null,
      "readBy": [
        "worker"
      ],
      "description": "Worker name (default worker-<process id>)",
      "known": true
    },
    {
      "name": "APELORA_WORKER_METRICS_ADDR",
      "value": "127.0.0.1:9471",
      "set": false,
      "isDefault": true,
      "default": "127.0.0.1:9471",
      "source": "default",
      "hidden": null,
      "readBy": [
        "control-plane",
        "worker"
      ],
      "description": "The worker's metrics and liveness listener",
      "known": true
    },
    {
      "name": "DATABASE_URL",
      "value": null,
      "set": true,
      "isDefault": false,
      "default": null,
      "source": "environment",
      "hidden": "secret",
      "readBy": [
        "control-plane",
        "worker"
      ],
      "description": "PostgreSQL connection (contains a password); without it the control plane runs without sign-in on loopback only",
      "known": true
    },
    {
      "name": "RUST_LOG",
      "value": "warn",
      "set": true,
      "isDefault": false,
      "default": "info",
      "source": "environment",
      "hidden": null,
      "readBy": [
        "control-plane",
        "worker"
      ],
      "description": "Which log lines are written",
      "known": true
    }
  ],
  "saved": [
    {
      "name": "auth.local_accounts",
      "value": "off",
      "set": false,
      "isDefault": true,
      "default": "off",
      "source": "default",
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
  "workers": [],
  "readAt": "2026-10-23T22:12:57.929042Z"
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/sign-in`

Public. How people can sign in to this control plane.

**Operation ID:** `sign_in_options`

**Sign-in:** none; this operation is public.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/sign-in" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

```json
{
  "providers": [],
  "apiTokens": true,
  "localAccounts": false,
  "directories": []
}
```

### `POST /api/v1/sign-in/password`

Public. Signs a person in with a username and password and returns an Apelora session. Every refusal answers `invalid_credentials` (unknown, wrong, locked or disabled alike). Limited to 10 attempts a minute per client address.

**Operation ID:** `sign_in_with_password`

**Sign-in:** none; this operation is public.

**Request body** (JSON, illustrative values):

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/sign-in/password" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"username":"example","password":"<redacted>"}'
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

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

**Operation ID:** `complete_password_setup`

**Sign-in:** none; this operation is public.

**Request body** (JSON, illustrative values):

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/sign-in/setup" \
  -H "Content-Type: application/json" \
  --data-raw '{"token":"<redacted>","password":"<redacted>"}'
```

**Response `204`** — Success, with no body.

**Errors:** `400`, `429`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

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

**Response `204`** — Success, with no body.

**Errors:** `401`. The body is `{ "error": { "code": …, "message": … } }`.

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

**Response `200`** — A tar archive.

Content-Type: `application/x-tar`.

Binary download; the command saves the response to a file. For a tar bundle, list the files after a successful download:

```sh
tar -tf support-bundle.tar
```

**MOCK VERIFIED archive listing** (2026-10-23T22:12:58+00:00):

```text
apelora-support-20261023-221258/manifest.json
apelora-support-20261023-221258/versions.json
apelora-support-20261023-221258/settings.json
apelora-support-20261023-221258/health.json
apelora-support-20261023-221258/preflight.json
apelora-support-20261023-221258/jobs-failed.json
apelora-support-20261023-221258/metrics.txt
apelora-support-20261023-221258/logs/README.txt
apelora-support-20261023-221258/README.txt
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

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

**Response `200`** — Success.

Content-Type: `application/json`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

```json
{
  "version": "0.0.0",
  "apiVersion": "v1",
  "incusPinned": "v7.0.2",
  "incusSeries": "7.0",
  "incusTestedWith": "REAL INCUS TESTED 2026-10-23: four-member lab upgraded from package 1:7.0.1-debian13-202609250313 to 1:7.0.2-debian13-202610211947 (stand-by, voters, database leader last). The first member blocked the other three until they matched; all four then Online, server_version 7.0.2, api extension instance_port_forward present. Earlier functional evidence (lifecycle, OVN, evacuation) was produced on 7.0.1.",
  "certificates": [],
  "incus": {
    "connected": false,
    "apiVersion": "1.0",
    "serverVersion": null,
    "clustered": true
  }
}
```

**Errors:** `401`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

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

**Response `200`** — Success.

Content-Type: `application/json`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

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
    "manage-infrastructure",
    "design-applications",
    "deploy"
  ],
  "capabilities": [
    "organization.view",
    "organization.update",
    "project.view",
    "project.create",
    "project.update",
    "project.delete",
    "environment.manage",
    "application.view",
    "application.create",
    "application.design",
    "application.deploy",
    "application.operate",
    "application.delete",
    "application.logs.read",
    "application.metrics.read",
    "capacity.view",
    "instance.manage",
    "user.view",
    "group.manage",
    "role.assign",
    "audit.read",
    "approval.request",
    "approval.grant",
    "cluster.view",
    "cluster.manage",
    "cluster.evacuate",
    "cluster.evacuate_unsafe",
    "cluster.fence_confirm",
    "cluster.sensitive_change",
    "network.manage",
    "storage.manage",
    "hardware.view",
    "hardware.commission",
    "hardware.deploy",
    "hardware.power",
    "hardware.delete",
    "fabric.metrics.read",
    "support.bundle",
    "machine.enrol",
    "alert.respond",
    "alert.configure",
    "quota.manage",
    "organization.create",
    "role.manage",
    "service_identity.manage",
    "access_policy.manage",
    "token.manage",
    "token.create_admin",
    "platform.security.manage",
    "platform.emergency_access",
    "user.manage"
  ],
  "platformPermissions": [
    "organization.view",
    "organization.update",
    "project.view",
    "project.create",
    "project.update",
    "project.delete",
    "environment.manage",
    "application.view",
    "application.create",
    "application.design",
    "application.deploy",
    "application.operate",
    "application.delete",
    "application.logs.read",
    "application.metrics.read",
    "capacity.view",
    "instance.manage",
    "user.view",
    "group.manage",
    "role.assign",
    "audit.read",
    "approval.request",
    "approval.grant",
    "cluster.view",
    "cluster.manage",
    "cluster.evacuate",
    "cluster.evacuate_unsafe",
    "cluster.fence_confirm",
    "cluster.sensitive_change",
    "network.manage",
    "storage.manage",
    "hardware.view",
    "hardware.commission",
    "hardware.deploy",
    "hardware.power",
    "hardware.delete",
    "fabric.metrics.read",
    "support.bundle",
    "machine.enrol",
    "alert.respond",
    "alert.configure",
    "quota.manage",
    "organization.create",
    "role.manage",
    "service_identity.manage",
    "access_policy.manage",
    "token.manage",
    "token.create_admin",
    "platform.security.manage",
    "platform.emergency_access",
    "user.manage"
  ],
  "roles": [],
  "deployProjects": [
    "apelora"
  ],
  "localAccount": false,
  "credential": "api-token"
}
```

**Errors:** `401`. The body is `{ "error": { "code": …, "message": … } }`.

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

**Response `200`** — Metrics in the text exposition format.

Content-Type: `text/plain`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

```text
# HELP apelora_build_info Always 1: which component, version and commit is running.
# TYPE apelora_build_info gauge
apelora_build_info{region="default",site="default",sector="default",component="control-plane",version="0.0.0",commit="unknown"} 1
# HELP apelora_provider_info Always 1: whether this process talks to Incus or to the mock (mode).
# TYPE apelora_provider_info gauge
apelora_provider_info{region="default",site="default",sector="default",mode="mock"} 1
# HELP apelora_http_requests_total API requests answered, by route template, method and status class.
# TYPE apelora_http_requests_total counter
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/alerts",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/alerts/channels",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/alerts/history",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/alerts/rules",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/applications",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/applications",method="POST",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="PATCH",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/approvals",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/audit",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/audit/export",method="GET",status="2xx"} 2
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/capacity",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/cluster",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/cluster/groups",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/cluster/join-tokens",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/cluster/members",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/cluster/recovery",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/cluster/settings",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/database-backups",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/health",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/health/components",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/health/servers",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/identity/assignments",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/identity/audit",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/identity/groups",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="POST",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/identity/organizations/{org}/projects",method="POST",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/identity/permissions",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/identity/personal-tokens",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/identity/policies",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/identity/projects",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/identity/projects/{project}/environments",method="POST",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/identity/roles",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/identity/service-identities",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/identity/sign-in",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/identity/sign-in/directories",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/identity/sign-ins",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/identity/tenancy",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/identity/users",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/image-mirrors",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/instances",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/jobs",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/machines",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/me/sign-ins",method="GET",status="4xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/me/tokens",method="GET",status="4xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/monitoring",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/networks",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/networks/applications",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/networks/settings",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/openapi.json",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/preflight",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/projects",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/provisioners/maas/machines",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/sessions",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/settings",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/sign-in",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/storage-pools",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/storage/orphans",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/storage/pools",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/storage/volumes",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/support-bundle",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/system",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/tokens",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/whoami",method="GET",status="2xx"} 1
apelora_http_requests_total{region="default",site="default",sector="default",route="/api/v1/whoami",method="GET",status="4xx"} 1
# HELP apelora_http_request_duration_seconds Time to answer an API request, by route template and method.
# TYPE apelora_http_request_duration_seconds histogram
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts",method="GET",le="0.005"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/alerts",method="GET"} 0.00671925
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/alerts",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/channels",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/channels",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/channels",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/channels",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/channels",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/channels",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/channels",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/channels",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/channels",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/channels",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/channels",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/channels",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/alerts/channels",method="GET"} 0.004342417
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/alerts/channels",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/history",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/history",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/history",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/history",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/history",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/history",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/history",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/history",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/history",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/history",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/history",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/history",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/alerts/history",method="GET"} 0.002911375
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/alerts/history",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/rules",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/rules",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/rules",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/rules",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/rules",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/rules",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/rules",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/rules",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/rules",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/rules",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/rules",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/alerts/rules",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/alerts/rules",method="GET"} 0.004159666
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/alerts/rules",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="GET",le="0.005"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/applications",method="GET"} 0.007632167
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/applications",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="POST",le="0.005"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="POST",le="0.01"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="POST",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="POST",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="POST",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="POST",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="POST",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="POST",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="POST",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="POST",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="POST",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications",method="POST",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/applications",method="POST"} 0.011411125
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/applications",method="POST"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="GET",le="0.005"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="GET",le="0.01"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="GET"} 0.011496416
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="PATCH",le="0.005"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="PATCH",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="PATCH",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="PATCH",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="PATCH",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="PATCH",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="PATCH",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="PATCH",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="PATCH",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="PATCH",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="PATCH",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="PATCH",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="PATCH"} 0.00931675
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/applications/{name}",method="PATCH"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/approvals",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/approvals",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/approvals",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/approvals",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/approvals",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/approvals",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/approvals",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/approvals",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/approvals",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/approvals",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/approvals",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/approvals",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/approvals",method="GET"} 0.002592208
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/approvals",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/audit",method="GET"} 0.002943542
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/audit",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit/export",method="GET",le="0.005"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit/export",method="GET",le="0.01"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit/export",method="GET",le="0.025"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit/export",method="GET",le="0.05"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit/export",method="GET",le="0.1"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit/export",method="GET",le="0.25"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit/export",method="GET",le="0.5"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit/export",method="GET",le="1"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit/export",method="GET",le="2.5"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit/export",method="GET",le="5"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit/export",method="GET",le="10"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/audit/export",method="GET",le="+Inf"} 2
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/audit/export",method="GET"} 0.007261584
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/audit/export",method="GET"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/capacity",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/capacity",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/capacity",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/capacity",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/capacity",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/capacity",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/capacity",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/capacity",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/capacity",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/capacity",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/capacity",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/capacity",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/capacity",method="GET"} 0.001775542
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/capacity",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/cluster",method="GET"} 0.002214083
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/cluster",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/groups",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/groups",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/groups",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/groups",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/groups",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/groups",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/groups",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/groups",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/groups",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/groups",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/groups",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/groups",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/cluster/groups",method="GET"} 0.001519667
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/cluster/groups",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/join-tokens",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/join-tokens",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/join-tokens",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/join-tokens",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/join-tokens",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/join-tokens",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/join-tokens",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/join-tokens",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/join-tokens",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/join-tokens",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/join-tokens",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/join-tokens",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/cluster/join-tokens",method="GET"} 0.002253
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/cluster/join-tokens",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/members",method="GET",le="0.005"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/members",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/members",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/members",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/members",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/members",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/members",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/members",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/members",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/members",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/members",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/members",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/cluster/members",method="GET"} 0.007178666
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/cluster/members",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/recovery",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/recovery",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/recovery",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/recovery",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/recovery",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/recovery",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/recovery",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/recovery",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/recovery",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/recovery",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/recovery",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/recovery",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/cluster/recovery",method="GET"} 0.001904666
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/cluster/recovery",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/settings",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/settings",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/settings",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/settings",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/settings",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/settings",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/settings",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/settings",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/settings",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/settings",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/settings",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/cluster/settings",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/cluster/settings",method="GET"} 0.001837667
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/cluster/settings",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/database-backups",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/database-backups",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/database-backups",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/database-backups",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/database-backups",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/database-backups",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/database-backups",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/database-backups",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/database-backups",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/database-backups",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/database-backups",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/database-backups",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/database-backups",method="GET"} 0.002180416
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/database-backups",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/health",method="GET"} 0.000158334
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/health",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/components",method="GET",le="0.005"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/components",method="GET",le="0.01"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/components",method="GET",le="0.025"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/components",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/components",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/components",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/components",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/components",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/components",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/components",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/components",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/components",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/health/components",method="GET"} 0.044800541
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/health/components",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/servers",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/servers",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/servers",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/servers",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/servers",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/servers",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/servers",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/servers",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/servers",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/servers",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/servers",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/health/servers",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/health/servers",method="GET"} 0.001400166
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/health/servers",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/assignments",method="GET",le="0.005"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/assignments",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/assignments",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/assignments",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/assignments",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/assignments",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/assignments",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/assignments",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/assignments",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/assignments",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/assignments",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/assignments",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/identity/assignments",method="GET"} 0.005735542
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/identity/assignments",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/audit",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/audit",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/audit",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/audit",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/audit",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/audit",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/audit",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/audit",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/audit",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/audit",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/audit",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/audit",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/identity/audit",method="GET"} 0.003599083
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/identity/audit",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/groups",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/groups",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/groups",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/groups",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/groups",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/groups",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/groups",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/groups",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/groups",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/groups",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/groups",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/groups",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/identity/groups",method="GET"} 0.002794792
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/identity/groups",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="GET"} 0.002949083
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="POST",le="0.005"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="POST",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="POST",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="POST",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="POST",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="POST",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="POST",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="POST",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="POST",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="POST",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="POST",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="POST",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="POST"} 0.006826416
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/identity/organizations",method="POST"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations/{org}/projects",method="POST",le="0.005"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations/{org}/projects",method="POST",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations/{org}/projects",method="POST",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations/{org}/projects",method="POST",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations/{org}/projects",method="POST",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations/{org}/projects",method="POST",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations/{org}/projects",method="POST",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations/{org}/projects",method="POST",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations/{org}/projects",method="POST",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations/{org}/projects",method="POST",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations/{org}/projects",method="POST",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/organizations/{org}/projects",method="POST",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/identity/organizations/{org}/projects",method="POST"} 0.007256583
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/identity/organizations/{org}/projects",method="POST"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/permissions",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/permissions",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/permissions",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/permissions",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/permissions",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/permissions",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/permissions",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/permissions",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/permissions",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/permissions",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/permissions",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/permissions",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/identity/permissions",method="GET"} 0.001302792
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/identity/permissions",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/personal-tokens",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/personal-tokens",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/personal-tokens",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/personal-tokens",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/personal-tokens",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/personal-tokens",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/personal-tokens",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/personal-tokens",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/personal-tokens",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/personal-tokens",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/personal-tokens",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/personal-tokens",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/identity/personal-tokens",method="GET"} 0.003247166
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/identity/personal-tokens",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/policies",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/policies",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/policies",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/policies",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/policies",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/policies",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/policies",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/policies",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/policies",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/policies",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/policies",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/policies",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/identity/policies",method="GET"} 0.002322417
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/identity/policies",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/identity/projects",method="GET"} 0.002296458
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/identity/projects",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects/{project}/environments",method="POST",le="0.005"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects/{project}/environments",method="POST",le="0.01"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects/{project}/environments",method="POST",le="0.025"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects/{project}/environments",method="POST",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects/{project}/environments",method="POST",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects/{project}/environments",method="POST",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects/{project}/environments",method="POST",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects/{project}/environments",method="POST",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects/{project}/environments",method="POST",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects/{project}/environments",method="POST",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects/{project}/environments",method="POST",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/projects/{project}/environments",method="POST",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/identity/projects/{project}/environments",method="POST"} 0.025587167
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/identity/projects/{project}/environments",method="POST"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/roles",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/roles",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/roles",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/roles",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/roles",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/roles",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/roles",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/roles",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/roles",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/roles",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/roles",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/roles",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/identity/roles",method="GET"} 0.002657041
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/identity/roles",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/service-identities",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/service-identities",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/service-identities",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/service-identities",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/service-identities",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/service-identities",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/service-identities",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/service-identities",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/service-identities",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/service-identities",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/service-identities",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/service-identities",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/identity/service-identities",method="GET"} 0.002328708
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/identity/service-identities",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/identity/sign-in",method="GET"} 0.004604084
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/identity/sign-in",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in/directories",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in/directories",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in/directories",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in/directories",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in/directories",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in/directories",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in/directories",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in/directories",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in/directories",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in/directories",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in/directories",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-in/directories",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/identity/sign-in/directories",method="GET"} 0.002818375
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/identity/sign-in/directories",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-ins",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-ins",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-ins",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-ins",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-ins",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-ins",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-ins",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-ins",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-ins",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-ins",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-ins",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/sign-ins",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/identity/sign-ins",method="GET"} 0.002548834
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/identity/sign-ins",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/tenancy",method="GET",le="0.005"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/tenancy",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/tenancy",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/tenancy",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/tenancy",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/tenancy",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/tenancy",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/tenancy",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/tenancy",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/tenancy",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/tenancy",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/tenancy",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/identity/tenancy",method="GET"} 0.008746417
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/identity/tenancy",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/users",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/users",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/users",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/users",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/users",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/users",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/users",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/users",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/users",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/users",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/users",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/identity/users",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/identity/users",method="GET"} 0.002457083
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/identity/users",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/image-mirrors",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/image-mirrors",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/image-mirrors",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/image-mirrors",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/image-mirrors",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/image-mirrors",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/image-mirrors",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/image-mirrors",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/image-mirrors",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/image-mirrors",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/image-mirrors",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/image-mirrors",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/image-mirrors",method="GET"} 0.0010805
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/image-mirrors",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/instances",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/instances",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/instances",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/instances",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/instances",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/instances",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/instances",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/instances",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/instances",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/instances",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/instances",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/instances",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/instances",method="GET"} 0.001365917
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/instances",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/jobs",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/jobs",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/jobs",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/jobs",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/jobs",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/jobs",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/jobs",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/jobs",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/jobs",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/jobs",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/jobs",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/jobs",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/jobs",method="GET"} 0.003428458
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/jobs",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/machines",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/machines",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/machines",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/machines",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/machines",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/machines",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/machines",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/machines",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/machines",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/machines",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/machines",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/machines",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/machines",method="GET"} 0.002176083
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/machines",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/sign-ins",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/sign-ins",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/sign-ins",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/sign-ins",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/sign-ins",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/sign-ins",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/sign-ins",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/sign-ins",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/sign-ins",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/sign-ins",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/sign-ins",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/sign-ins",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/me/sign-ins",method="GET"} 0.002052208
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/me/sign-ins",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/tokens",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/tokens",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/tokens",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/tokens",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/tokens",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/tokens",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/tokens",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/tokens",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/tokens",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/tokens",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/tokens",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/me/tokens",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/me/tokens",method="GET"} 0.002893625
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/me/tokens",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/monitoring",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/monitoring",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/monitoring",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/monitoring",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/monitoring",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/monitoring",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/monitoring",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/monitoring",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/monitoring",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/monitoring",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/monitoring",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/monitoring",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/monitoring",method="GET"} 0.000898083
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/monitoring",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/networks",method="GET"} 0.000945125
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/networks",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/applications",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/applications",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/applications",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/applications",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/applications",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/applications",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/applications",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/applications",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/applications",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/applications",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/applications",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/applications",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/networks/applications",method="GET"} 0.002022459
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/networks/applications",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/settings",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/settings",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/settings",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/settings",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/settings",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/settings",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/settings",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/settings",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/settings",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/settings",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/settings",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/networks/settings",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/networks/settings",method="GET"} 0.003282
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/networks/settings",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/openapi.json",method="GET",le="0.005"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/openapi.json",method="GET",le="0.01"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/openapi.json",method="GET",le="0.025"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/openapi.json",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/openapi.json",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/openapi.json",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/openapi.json",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/openapi.json",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/openapi.json",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/openapi.json",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/openapi.json",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/openapi.json",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/openapi.json",method="GET"} 0.025574042
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/openapi.json",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/preflight",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/preflight",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/preflight",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/preflight",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/preflight",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/preflight",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/preflight",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/preflight",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/preflight",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/preflight",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/preflight",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/preflight",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/preflight",method="GET"} 0.002322125
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/preflight",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/projects",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/projects",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/projects",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/projects",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/projects",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/projects",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/projects",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/projects",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/projects",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/projects",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/projects",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/projects",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/projects",method="GET"} 0.001039292
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/projects",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/provisioners/maas/machines",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/provisioners/maas/machines",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/provisioners/maas/machines",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/provisioners/maas/machines",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/provisioners/maas/machines",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/provisioners/maas/machines",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/provisioners/maas/machines",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/provisioners/maas/machines",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/provisioners/maas/machines",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/provisioners/maas/machines",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/provisioners/maas/machines",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/provisioners/maas/machines",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/provisioners/maas/machines",method="GET"} 0.000869208
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/provisioners/maas/machines",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sessions",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sessions",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sessions",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sessions",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sessions",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sessions",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sessions",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sessions",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sessions",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sessions",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sessions",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sessions",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/sessions",method="GET"} 0.001074333
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/sessions",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/settings",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/settings",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/settings",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/settings",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/settings",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/settings",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/settings",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/settings",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/settings",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/settings",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/settings",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/settings",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/settings",method="GET"} 0.00306425
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/settings",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sign-in",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sign-in",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sign-in",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sign-in",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sign-in",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sign-in",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sign-in",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sign-in",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sign-in",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sign-in",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sign-in",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/sign-in",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/sign-in",method="GET"} 0.0031325
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/sign-in",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage-pools",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage-pools",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage-pools",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage-pools",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage-pools",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage-pools",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage-pools",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage-pools",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage-pools",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage-pools",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage-pools",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage-pools",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/storage-pools",method="GET"} 0.001042
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/storage-pools",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/orphans",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/orphans",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/orphans",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/orphans",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/orphans",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/orphans",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/orphans",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/orphans",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/orphans",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/orphans",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/orphans",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/orphans",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/storage/orphans",method="GET"} 0.003979208
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/storage/orphans",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/pools",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/pools",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/pools",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/pools",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/pools",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/pools",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/pools",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/pools",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/pools",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/pools",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/pools",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/pools",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/storage/pools",method="GET"} 0.001040541
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/storage/pools",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/volumes",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/volumes",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/volumes",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/volumes",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/volumes",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/volumes",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/volumes",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/volumes",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/volumes",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/volumes",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/volumes",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/storage/volumes",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/storage/volumes",method="GET"} 0.00414875
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/storage/volumes",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/support-bundle",method="GET",le="0.005"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/support-bundle",method="GET",le="0.01"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/support-bundle",method="GET",le="0.025"} 0
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/support-bundle",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/support-bundle",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/support-bundle",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/support-bundle",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/support-bundle",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/support-bundle",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/support-bundle",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/support-bundle",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/support-bundle",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/support-bundle",method="GET"} 0.039825542
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/support-bundle",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/system",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/system",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/system",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/system",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/system",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/system",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/system",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/system",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/system",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/system",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/system",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/system",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/system",method="GET"} 0.001946333
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/system",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/tokens",method="GET",le="0.005"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/tokens",method="GET",le="0.01"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/tokens",method="GET",le="0.025"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/tokens",method="GET",le="0.05"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/tokens",method="GET",le="0.1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/tokens",method="GET",le="0.25"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/tokens",method="GET",le="0.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/tokens",method="GET",le="1"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/tokens",method="GET",le="2.5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/tokens",method="GET",le="5"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/tokens",method="GET",le="10"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/tokens",method="GET",le="+Inf"} 1
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/tokens",method="GET"} 0.004336709
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/tokens",method="GET"} 1
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/whoami",method="GET",le="0.005"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/whoami",method="GET",le="0.01"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/whoami",method="GET",le="0.025"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/whoami",method="GET",le="0.05"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/whoami",method="GET",le="0.1"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/whoami",method="GET",le="0.25"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/whoami",method="GET",le="0.5"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/whoami",method="GET",le="1"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/whoami",method="GET",le="2.5"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/whoami",method="GET",le="5"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/whoami",method="GET",le="10"} 2
apelora_http_request_duration_seconds_bucket{region="default",site="default",sector="default",route="/api/v1/whoami",method="GET",le="+Inf"} 2
apelora_http_request_duration_seconds_sum{region="default",site="default",sector="default",route="/api/v1/whoami",method="GET"} 0.001959374
apelora_http_request_duration_seconds_count{region="default",site="default",sector="default",route="/api/v1/whoami",method="GET"} 2
# HELP apelora_http_requests_in_flight API requests being handled now.
# TYPE apelora_http_requests_in_flight gauge
apelora_http_requests_in_flight{region="default",site="default",sector="default"} 1
# HELP apelora_http_rate_limited_total API requests refused with 429 (a rate or quota limit), by route template.
# TYPE apelora_http_rate_limited_total counter
# HELP apelora_auth_attempts_total Credentials checked, by method (oidc, personal_token, service, api_token, none, development, unrecognised) and result (ok, refused, error).
# TYPE apelora_auth_attempts_total counter
apelora_auth_attempts_total{region="default",site="default",sector="default",method="api_token",result="ok"} 64
apelora_auth_attempts_total{region="default",site="default",sector="default",method="none",result="refused"} 1
# HELP apelora_authz_denials_total Requests refused by authorisation, by the permission that was missing.
# TYPE apelora_authz_denials_total counter
apelora_authz_denials_total{region="default",site="default",sector="default",permission="instance.console"} 2
apelora_authz_denials_total{region="default",site="default",sector="default",permission="instance.desktop"} 2
# HELP apelora_store_errors_total Database errors that reached a caller or the job loop, by class (store_unavailable, store_error).
# TYPE apelora_store_errors_total counter
# HELP apelora_jobs Jobs waiting or running, by kind and status (read from PostgreSQL; the same in every API process).
# TYPE apelora_jobs gauge
# HELP apelora_jobs_oldest_runnable_age_seconds How long the oldest runnable pending job has been waiting for a worker (0 when none).
# TYPE apelora_jobs_oldest_runnable_age_seconds gauge
apelora_jobs_oldest_runnable_age_seconds{region="default",site="default",sector="default"} 0
# HELP apelora_jobs_expired_leases Running jobs whose lease has expired: their worker stopped and another one will take them over.
# TYPE apelora_jobs_expired_leases gauge
apelora_jobs_expired_leases{region="default",site="default",sector="default"} 0
# HELP apelora_worker_job_duration_seconds Time one job attempt took, by kind and outcome.
# TYPE apelora_worker_job_duration_seconds histogram
# HELP apelora_worker_job_attempts_total Job attempts finished, by kind and outcome (succeeded, retry, failed, rejected, waiting, cancelled, lost).
# TYPE apelora_worker_job_attempts_total counter
# HELP apelora_worker_lease_lost_total Times this worker found that another worker had taken over its job, by stage (renew, handler, complete).
# TYPE apelora_worker_lease_lost_total counter
# HELP apelora_supervisor_actions_total Replica actions the supervisor took, by action (recreate, restart, substitute, retire, health_restart) and outcome (queued, deferred).
# TYPE apelora_supervisor_actions_total counter
# HELP apelora_supervisor_pass_duration_seconds Time one supervisor pass took, by result (ok, error).
# TYPE apelora_supervisor_pass_duration_seconds histogram
# HELP apelora_supervisor_last_pass_timestamp_seconds When the last supervisor pass finished (Unix seconds).
# TYPE apelora_supervisor_last_pass_timestamp_seconds gauge
# HELP apelora_volume_schedule_runs_total Scheduled snapshot and backup runs, by kind (snapshot, backup) and outcome (ok, failed, not_configured).
# TYPE apelora_volume_schedule_runs_total counter
# HELP apelora_volume_last_backup_timestamp_seconds When the newest volume backup in each backup pool was made (Unix seconds; read from PostgreSQL).
# TYPE apelora_volume_last_backup_timestamp_seconds gauge
# HELP apelora_outbox_pending Outbox messages not delivered yet (read by the relay leader every pass; other workers report nothing).
# TYPE apelora_outbox_pending gauge
# HELP apelora_outbox_oldest_pending_age_seconds How long the oldest undelivered outbox message has waited (0 when none).
# TYPE apelora_outbox_oldest_pending_age_seconds gauge
# HELP apelora_outbox_failing Undelivered outbox messages whose last delivery attempt failed (they are retried with backoff).
# TYPE apelora_outbox_failing gauge
# HELP apelora_outbox_deliveries_total Outbox delivery attempts, by topic (audit.recorded, ...) and outcome (delivered, failed).
# TYPE apelora_outbox_deliveries_total counter
# HELP apelora_member_failures Failed members (Incus reports them Offline) by fencing state (waiting, fenced). Set each pass by the worker holding the replica-supervisor lease; the others report none.
# TYPE apelora_member_failures gauge
# HELP apelora_fence_probes_total Reads of the shared storage's lease state on a member (sanlock, through the fence probe), by outcome (ok, failed).
# TYPE apelora_fence_probes_total counter
# HELP apelora_bmc_power_offs_total Attempts to fence a failed member by switching it off through its BMC (ADR 0014), by outcome (success: the power state read back Off; failed; refused: a guard held it back; unreadable: the power state could not be read).
# TYPE apelora_bmc_power_offs_total counter
# HELP apelora_recoveries_total Instances of a failed member restarted on another member after fencing, by outcome (queued, succeeded, failed).
# TYPE apelora_recoveries_total counter
# HELP apelora_alerts_firing Open firing alerts by severity (critical, warning, info), silenced ones included. Set each pass by the worker holding the alert-evaluator lease; the others report none.
# TYPE apelora_alerts_firing gauge
# HELP apelora_alert_evaluation_duration_seconds Time one alert evaluation pass took, by result (ok, error).
# TYPE apelora_alert_evaluation_duration_seconds histogram
# HELP apelora_incus_requests_total Requests to the Incus API, by endpoint template, method and outcome (ok, not_found, client_error, auth_error, server_error, unreachable, bad_response).
# TYPE apelora_incus_requests_total counter
# HELP apelora_incus_request_duration_seconds Time an Incus API request took, by endpoint template and method.
# TYPE apelora_incus_request_duration_seconds histogram
# HELP apelora_incus_operation_wait_seconds Time spent waiting on one Incus operation call.
# TYPE apelora_incus_operation_wait_seconds histogram
# HELP apelora_incus_up 1 when the last Incus request got an answer, 0 when it could not reach Incus.
# TYPE apelora_incus_up gauge
# HELP apelora_incus_last_success_timestamp_seconds When an Incus request last succeeded (Unix seconds).
# TYPE apelora_incus_last_success_timestamp_seconds gauge
# HELP apelora_db_pool_connections Database connections of this process, by state (in_use, idle, max).
# TYPE apelora_db_pool_connections gauge
apelora_db_pool_connections{region="default",site="default",sector="default",state="idle"} 2
apelora_db_pool_connections{region="default",site="default",sector="default",state="in_use"} 1
apelora_db_pool_connections{region="default",site="default",sector="default",state="max"} 10
# HELP apelora_db_pool_acquire_seconds Time to get a connection from the pool, sampled once per scrape.
# TYPE apelora_db_pool_acquire_seconds histogram
apelora_db_pool_acquire_seconds_bucket{region="default",site="default",sector="default",le="0.001"} 1
apelora_db_pool_acquire_seconds_bucket{region="default",site="default",sector="default",le="0.005"} 1
apelora_db_pool_acquire_seconds_bucket{region="default",site="default",sector="default",le="0.01"} 1
apelora_db_pool_acquire_seconds_bucket{region="default",site="default",sector="default",le="0.025"} 1
apelora_db_pool_acquire_seconds_bucket{region="default",site="default",sector="default",le="0.05"} 1
apelora_db_pool_acquire_seconds_bucket{region="default",site="default",sector="default",le="0.1"} 1
apelora_db_pool_acquire_seconds_bucket{region="default",site="default",sector="default",le="0.25"} 1
apelora_db_pool_acquire_seconds_bucket{region="default",site="default",sector="default",le="0.5"} 1
apelora_db_pool_acquire_seconds_bucket{region="default",site="default",sector="default",le="1"} 1
apelora_db_pool_acquire_seconds_bucket{region="default",site="default",sector="default",le="2.5"} 1
apelora_db_pool_acquire_seconds_bucket{region="default",site="default",sector="default",le="5"} 1
apelora_db_pool_acquire_seconds_bucket{region="default",site="default",sector="default",le="+Inf"} 1
apelora_db_pool_acquire_seconds_sum{region="default",site="default",sector="default"} 0.000404417
apelora_db_pool_acquire_seconds_count{region="default",site="default",sector="default"} 1
# HELP apelora_db_up 1 when the last scrape could get a database connection within 2 seconds, 0 otherwise.
# TYPE apelora_db_up gauge
apelora_db_up{region="default",site="default",sector="default"} 1
# HELP apelora_incus_members Incus cluster members by status, as last read (at most every 30 s, only when scraped).
# TYPE apelora_incus_members gauge
apelora_incus_members{region="default",site="default",sector="default",status="Online"} 3
# HELP apelora_incus_instances Incus instances by status and kind (container, virtual-machine), as last read.
# TYPE apelora_incus_instances gauge
apelora_incus_instances{region="default",site="default",sector="default",status="Running",kind="container"} 3
apelora_incus_instances{region="default",site="default",sector="default",status="Running",kind="virtual-machine"} 1
# HELP apelora_applications Applications that are not archived, by derived status (running, degraded, failed, ...).
# TYPE apelora_applications gauge
apelora_applications{region="default",site="default",sector="default",status="not-deployed"} 1
# HELP apelora_certificate_expiry_timestamp_seconds When the certificates Apelora uses to reach Incus expire (Unix seconds), by certificate (deploy, admin, server).
# TYPE apelora_certificate_expiry_timestamp_seconds gauge
# HELP apelora_inventory_last_read_timestamp_seconds When members, instances and applications were last read successfully for these metrics (Unix seconds).
# TYPE apelora_inventory_last_read_timestamp_seconds gauge
apelora_inventory_last_read_timestamp_seconds{region="default",site="default",sector="default"} 1792793578.370356
# HELP apelora_identity_key_fetches_total Reads of an identity provider's discovery document or signing keys, by source (discovery, key_set) and result (ok, error).
# TYPE apelora_identity_key_fetches_total counter
# HELP process_start_time_seconds Start time of the process since the Unix epoch in seconds.
# TYPE process_start_time_seconds gauge
process_start_time_seconds{region="default",site="default",sector="default"} 1792793577.928904

```

**Errors:** `401`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

