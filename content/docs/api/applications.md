---
title: Applications API
section: api
slug: applications
order: 4
label: Applications
source: packages/api-client/openapi.json
summary: Applications, drafts, versions, plans, deployments, operations and volumes.
---
Applications: drafts and published versions, planning and deploying a version, start, shut down, stop, restart and migrate, status and events, networks, and volumes with their snapshots, backups and schedules. This page lists 34 operations.

Set variables in the [API overview](/docs/api/overview/). Download [OpenAPI](/assets/api/openapi.json).

## Operations

| Operation | What it does |
|---|---|
| [`GET /api/v1/applications`](#get-apiv1applications) | Applications the caller may see, each with design status, derived runtime status, replica health, and the actions they may take now. |
| [`POST /api/v1/applications`](#post-apiv1applications) | Creates an application in an environment, optionally with its first draft. |
| [`GET /api/v1/applications/{name}`](#get-apiv1applicationsname) | One application with its modules (desired and observed), versions and recent operations. |
| [`PATCH /api/v1/applications/{name}`](#patch-apiv1applicationsname) | Changes an application's description or icon (its name cannot change). |
| [`POST /api/v1/applications/{name}/archive`](#post-apiv1applicationsnamearchive) | Archives an application that is not running; it leaves the default list and keeps its data. |
| [`POST /api/v1/applications/{name}/deployments`](#post-apiv1applicationsnamedeployments) | Deploys the design: saves it as a new revision and queues the planned changes. |
| [`GET /api/v1/applications/{name}/draft`](#get-apiv1applicationsnamedraft) | The application's working document. |
| [`PUT /api/v1/applications/{name}/draft`](#put-apiv1applicationsnamedraft) | Saves the draft as the next version. |
| [`GET /api/v1/applications/{name}/events`](#get-apiv1applicationsnameevents) | What happened to the application: creation, saves, versions, deployments, operations, refusals. |
| [`GET /api/v1/applications/{name}/migration`](#get-apiv1applicationsnamemigration) | Dry run of migrating the application to another server: for each instance whether it keeps running, what is copied and what blocks it. |
| [`GET /api/v1/applications/{name}/operations`](#get-apiv1applicationsnameoperations) | Recent operations of the application, newest first. |
| [`POST /api/v1/applications/{name}/operations`](#post-apiv1applicationsnameoperations) | Starts, shuts down (graceful), stops (immediate), restarts or migrates the application's instances, in dependency order where that matters, as an asynchronous operation. |
| [`GET /api/v1/applications/{name}/operations/{id}`](#get-apiv1applicationsnameoperationsid) | One operation with the progress of each phase and instance. |
| [`POST /api/v1/applications/{name}/plan`](#post-apiv1applicationsnameplan) | What deploying the design would change, without changing anything. |
| [`POST /api/v1/applications/{name}/restore`](#post-apiv1applicationsnamerestore) | Brings an archived application back. |
| [`GET /api/v1/applications/{name}/status`](#get-apiv1applicationsnamestatus) | The application's instances as Incus reports them, by module. |
| [`GET /api/v1/applications/{name}/versions`](#get-apiv1applicationsnameversions) | Versions of the application, newest first. |
| [`POST /api/v1/applications/{name}/versions`](#post-apiv1applicationsnameversions) | Releases the current draft as the next immutable published version. |
| [`GET /api/v1/applications/{name}/versions/{revision}`](#get-apiv1applicationsnameversionsrevision) | The document of one version. |
| [`GET /api/v1/applications/{name}/volumes`](#get-apiv1applicationsnamevolumes) | The application's volumes, with what Incus says about each now. |
| [`PATCH /api/v1/applications/{name}/volumes/{volume}`](#patch-apiv1applicationsnamevolumesvolume) | Grows one of the application's volumes, also while its instance runs. |
| [`DELETE /api/v1/applications/{name}/volumes/{volume}`](#delete-apiv1applicationsnamevolumesvolume) | Deletes one of the application's volumes and its snapshots, for good. |
| [`GET /api/v1/applications/{name}/volumes/{volume}/backups`](#get-apiv1applicationsnamevolumesvolumebackups) | The volume's backups, oldest first, whether each still exists, and its schedules. |
| [`POST /api/v1/applications/{name}/volumes/{volume}/backups`](#post-apiv1applicationsnamevolumesvolumebackups) | Backs the volume up now: a copy, through a short-lived snapshot, into the backup pool on another member. |
| [`DELETE /api/v1/applications/{name}/volumes/{volume}/backups/{backup}`](#delete-apiv1applicationsnamevolumesvolumebackupsbackup) | Deletes one backup copy. |
| [`GET /api/v1/applications/{name}/volumes/{volume}/backups/{backup}/restore`](#get-apiv1applicationsnamevolumesvolumebackupsbackuprestore) | Dry run of restoring the volume from one of its backups: what is replaced (data written since the backup, the volume's snapshots), which instances must be stopped, where the safety backup goes, and the steps. |
| [`POST /api/v1/applications/{name}/volumes/{volume}/backups/{backup}/restore`](#post-apiv1applicationsnamevolumesvolumebackupsbackuprestore) | Restores the volume from one of its backups, after the dry run passes again and the volume's name is typed: a safety backup of the current data first (unless declined), then the backup is copied over the volume. |
| [`PUT /api/v1/applications/{name}/volumes/{volume}/schedules`](#put-apiv1applicationsnamevolumesvolumeschedules) | Sets or turns off the volume's snapshot and backup schedules. |
| [`GET /api/v1/applications/{name}/volumes/{volume}/snapshots`](#get-apiv1applicationsnamevolumesvolumesnapshots) | The volume's snapshots, oldest first. |
| [`POST /api/v1/applications/{name}/volumes/{volume}/snapshots`](#post-apiv1applicationsnamevolumesvolumesnapshots) | Takes a snapshot of the volume, named after the time (`snap-YYYYMMDD-HHMMSS`). |
| [`DELETE /api/v1/applications/{name}/volumes/{volume}/snapshots/{snapshot}`](#delete-apiv1applicationsnamevolumesvolumesnapshotssnapshot) | Deletes one snapshot of the volume. |
| [`POST /api/v1/applications/{name}/volumes/{volume}/snapshots/{snapshot}/restore`](#post-apiv1applicationsnamevolumesvolumesnapshotssnapshotrestore) | Puts the volume back to a snapshot: everything written since is lost. |
| [`GET /api/v1/networks/applications`](#get-apiv1networksapplications) | Each application the caller may view that has a recorded deployment: its network, the rules compiled from its design, its service and published addresses, and what Incus holds for each, with the differences. |
| [`GET /api/v1/storage/volumes`](#get-apiv1storagevolumes) | Every application volume the caller may see, with what Incus reports, its schedules and how many backups it has. |

## Details

### `GET /api/v1/applications`

Applications the caller may see, each with design status, derived runtime status, replica health, and the actions they may take now. Needs `application.view`.

**Operation ID:** `applications`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `includeArchived` | query | boolean | no | `false` | Also list archived applications. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**With options** (`includeArchived`):

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications?includeArchived=true" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("applications", { query: { includeArchived: true } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "name": "blog",
      "latestRevision": null,
      "createdAt": "2026-10-26T01:11:06.60422Z",
      "updatedAt": "2026-10-26T01:11:06.60422Z",
      "description": "Company blog",
      "icon": "box",
      "project": {
        "id": "ca6b5d54-056b-4fb1-aa09-285b1fea04bc",
        "slug": "shop",
        "name": "Online shop",
        "organizationId": "fe187562-d709-4365-b5e7-280f1349b8c8",
        "organizationSlug": "acme"
      },
      "environment": {
        "id": "0efab737-09c7-4c70-b80f-899ddb533491",
        "slug": "staging",
        "name": "Staging",
        "kind": "staging",
        "incusProject": "acme-shop-staging"
      },
      "archived": false,
      "design": {
        "status": "draft",
        "draftVersion": null,
        "validationErrors": 0,
        "publishedVersion": null,
        "hasUnpublishedChanges": false,
        "updatedAt": null
      },
      "deployment": {
        "status": "not-deployed",
        "observedAt": "2026-10-26T01:11:06.658502Z",
        "stale": false,
        "source": "mock",
        "deployedVersion": null,
        "modules": 0,
        "replicas": {
          "desired": 0,
          "running": 0,
          "healthy": 0,
          "unhealthy": 0
        },
        "lastActivityAt": null,
        "operation": null
      },
      "actions": {
        "start": {
          "allowed": false,
          "reason": "deploy a published version first"
        },
        "stop": {
          "allowed": false,
          "reason": "deploy a published version first"
        },
        "shutdown": {
          "allowed": false,
          "reason": "deploy a published version first"
        },
        "restart": {
          "allowed": false,
          "reason": "deploy a published version first"
        },
        "migrate": {
          "allowed": false,
          "reason": "deploy a published version first"
        }
      }
    },
    {
      "name": "shop",
      "latestRevision": 1,
      "createdAt": "2026-10-26T01:11:06.596689Z",
      "updatedAt": "2026-10-26T01:11:06.61884Z",
      "description": "Storefront, API and order database",
      "icon": "cart",
      "project": {
        "id": "ca6b5d54-056b-4fb1-aa09-285b1fea04bc",
        "slug": "shop",
        "name": "Online shop",
        "organizationId": "fe187562-d709-4365-b5e7-280f1349b8c8",
        "organizationSlug": "acme"
      },
      "environment": {
        "id": "00ef28fc-677a-4657-8bf8-e6fc1b4f8704",
        "slug": "production",
        "name": "Production",
        "kind": "production",
        "incusProject": "shop-prod"
      },
      "archived": false,
      "design": {
        "status": "published",
        "draftVersion": 1,
        "validationErrors": 0,
        "publishedVersion": 1,
        "hasUnpublishedChanges": false,
        "updatedAt": "2026-10-26T01:11:06.61884Z"
      },
      "deployment": {
        "status": "degraded",
        "observedAt": "2026-10-26T01:11:06.658502Z",
        "stale": false,
        "source": "mock",
        "deployedVersion": 1,
        "modules": 3,
        "replicas": {
          "desired": 3,
          "running": 0,
          "healthy": 0,
          "unhealthy": 0
        },
        "lastActivityAt": "2026-10-26T01:11:06.650288Z",
        "operation": null
      },
      "actions": {
        "start": {
          "allowed": true,
          "reason": null
        },
        "stop": {
          "allowed": false,
          "reason": "nothing is running"
        },
        "shutdown": {
          "allowed": false,
          "reason": "nothing is running"
        },
        "restart": {
          "allowed": false,
          "reason": "nothing is running"
        },
        "migrate": {
          "allowed": true,
          "reason": null
        }
      }
    }
  ],
  "observedAt": "2026-10-26T01:11:06.658502Z",
  "stale": false
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `POST /api/v1/applications`

Creates an application in an environment, optionally with its first draft. Needs `application.create` on the environment's project.

**Operation ID:** `create_application`

**Needs:** `application.create` on the environment's project.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `description` | string | no | — |
| `document` | object or null | no | The first draft (a Studio document), if any. |
| `environmentId` | string (uuid) | yes | The environment (and so the project) the application lives in. |
| `icon` | string or null | no | Icon key; `box` when omitted. |
| `name` | string | yes | Lowercase letters, digits and hyphens, starting with a letter; at most 40 characters. Fixed for the life of the application (instances are named after it). |

```json
{
  "name": "shop",
  "environmentId": "00ef28fc-677a-4657-8bf8-e6fc1b4f8704",
  "description": "Storefront and order database",
  "icon": "cart"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"shop","environmentId":"00ef28fc-677a-4657-8bf8-e6fc1b4f8704","description":"Storefront and order database","icon":"cart"}'
```

**TypeScript:**

```ts
const result = await client.request("create_application", { body /* the request body above */ });
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "name": "shop",
  "latestRevision": null,
  "createdAt": "2026-10-26T01:11:06.596689Z",
  "updatedAt": "2026-10-26T01:11:06.596689Z",
  "description": "Storefront and order database",
  "icon": "cart",
  "project": {
    "id": "ca6b5d54-056b-4fb1-aa09-285b1fea04bc",
    "slug": "shop",
    "name": "Online shop",
    "organizationId": "fe187562-d709-4365-b5e7-280f1349b8c8",
    "organizationSlug": "acme"
  },
  "environment": {
    "id": "00ef28fc-677a-4657-8bf8-e6fc1b4f8704",
    "slug": "production",
    "name": "Production",
    "kind": "production",
    "incusProject": "shop-prod"
  },
  "archived": false,
  "design": {
    "status": "draft",
    "draftVersion": null,
    "validationErrors": 0,
    "publishedVersion": null,
    "hasUnpublishedChanges": false,
    "updatedAt": null
  },
  "deployment": {
    "status": "not-deployed",
    "observedAt": "2026-10-26T01:11:06.600828Z",
    "stale": false,
    "source": "mock",
    "deployedVersion": null,
    "modules": 0,
    "replicas": {
      "desired": 0,
      "running": 0,
      "healthy": 0,
      "unhealthy": 0
    },
    "lastActivityAt": null,
    "operation": null
  },
  "actions": {
    "start": {
      "allowed": false,
      "reason": "deploy a published version first"
    },
    "stop": {
      "allowed": false,
      "reason": "deploy a published version first"
    },
    "shutdown": {
      "allowed": false,
      "reason": "deploy a published version first"
    },
    "restart": {
      "allowed": false,
      "reason": "deploy a published version first"
    },
    "migrate": {
      "allowed": false,
      "reason": "deploy a published version first"
    }
  }
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `409` | `draft_conflict` |
| `429` | `rate_limited` |

### `GET /api/v1/applications/{name}`

One application with its modules (desired and observed), versions and recent operations. Needs `application.view`.

**Operation ID:** `application`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("application", { params: { name: "shop" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "application": {
    "name": "shop",
    "latestRevision": 1,
    "createdAt": "2026-10-26T01:11:06.596689Z",
    "updatedAt": "2026-10-26T01:11:06.61884Z",
    "description": "Storefront, API and order database",
    "icon": "cart",
    "project": {
      "id": "ca6b5d54-056b-4fb1-aa09-285b1fea04bc",
      "slug": "shop",
      "name": "Online shop",
      "organizationId": "fe187562-d709-4365-b5e7-280f1349b8c8",
      "organizationSlug": "acme"
    },
    "environment": {
      "id": "00ef28fc-677a-4657-8bf8-e6fc1b4f8704",
      "slug": "production",
      "name": "Production",
      "kind": "production",
      "incusProject": "shop-prod"
    },
    "archived": false,
    "design": {
      "status": "published",
      "draftVersion": 1,
      "validationErrors": 0,
      "publishedVersion": 1,
      "hasUnpublishedChanges": false,
      "updatedAt": "2026-10-26T01:11:06.61884Z"
    },
    "deployment": {
      "status": "degraded",
      "observedAt": "2026-10-26T01:11:06.672576Z",
      "stale": false,
      "source": "mock",
      "deployedVersion": 1,
      "modules": 3,
      "replicas": {
        "desired": 3,
        "running": 0,
        "healthy": 0,
        "unhealthy": 0
      },
      "lastActivityAt": "2026-10-26T01:11:06.650288Z",
      "operation": null
    },
    "actions": {
      "start": {
        "allowed": true,
        "reason": null
      },
      "stop": {
        "allowed": false,
        "reason": "nothing is running"
      },
      "shutdown": {
        "allowed": false,
        "reason": "nothing is running"
      },
      "restart": {
        "allowed": false,
        "reason": "nothing is running"
      },
      "migrate": {
        "allowed": true,
        "reason": null
      }
    }
  },
  "modules": [
    {
      "module": "web-01",
      "replicas": 1,
      "availability": "stateless",
      "instances": []
    },
    {
      "module": "db-01",
      "replicas": 1,
      "availability": "stateful",
      "instances": []
    }
  ],
  "versions": [
    {
      "revision": 1,
      "published": true,
      "label": "First release",
      "draftVersion": 1,
      "createdBy": "token:docs-verifier",
      "createdAt": "2026-10-26T01:11:06.627777Z"
    }
  ],
  "operations": []
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `404` | `not_found` |
| `429` | `rate_limited` |

### `PATCH /api/v1/applications/{name}`

Changes an application's description or icon (its name cannot change). Needs `application.design`.

**Operation ID:** `update_application`

**Needs:** `application.design`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `description` | string or null | no | — |
| `icon` | string or null | no | — |

```json
{
  "description": "Storefront, API and order database"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PATCH "$APELORA_URL/api/v1/applications/shop" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"description":"Storefront, API and order database"}'
```

**TypeScript:**

```ts
const result = await client.request("update_application", { params: { name: "shop" }, body: { description: "Storefront, API and order database" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "name": "shop",
  "latestRevision": null,
  "createdAt": "2026-10-26T01:11:06.596689Z",
  "updatedAt": "2026-10-26T01:11:06.611275Z",
  "description": "Storefront, API and order database",
  "icon": "cart",
  "project": {
    "id": "ca6b5d54-056b-4fb1-aa09-285b1fea04bc",
    "slug": "shop",
    "name": "Online shop",
    "organizationId": "fe187562-d709-4365-b5e7-280f1349b8c8",
    "organizationSlug": "acme"
  },
  "environment": {
    "id": "00ef28fc-677a-4657-8bf8-e6fc1b4f8704",
    "slug": "production",
    "name": "Production",
    "kind": "production",
    "incusProject": "shop-prod"
  },
  "archived": false,
  "design": {
    "status": "draft",
    "draftVersion": null,
    "validationErrors": 0,
    "publishedVersion": null,
    "hasUnpublishedChanges": false,
    "updatedAt": null
  },
  "deployment": {
    "status": "not-deployed",
    "observedAt": "2026-10-26T01:11:06.613864Z",
    "stale": false,
    "source": "mock",
    "deployedVersion": null,
    "modules": 0,
    "replicas": {
      "desired": 0,
      "running": 0,
      "healthy": 0,
      "unhealthy": 0
    },
    "lastActivityAt": null,
    "operation": null
  },
  "actions": {
    "start": {
      "allowed": false,
      "reason": "deploy a published version first"
    },
    "stop": {
      "allowed": false,
      "reason": "deploy a published version first"
    },
    "shutdown": {
      "allowed": false,
      "reason": "deploy a published version first"
    },
    "restart": {
      "allowed": false,
      "reason": "deploy a published version first"
    },
    "migrate": {
      "allowed": false,
      "reason": "deploy a published version first"
    }
  }
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `429` | `rate_limited` |

### `POST /api/v1/applications/{name}/archive`

Archives an application that is not running; it leaves the default list and keeps its data. Needs `application.delete`.

**Operation ID:** `archive_application`

**Needs:** `application.delete`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications/blog/archive" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("archive_application", { params: { name: "blog" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `still_running` |
| `429` | `rate_limited` |

### `POST /api/v1/applications/{name}/deployments`

Deploys the design: saves it as a new revision and queues the planned changes. Refuses the whole deployment if any module conflicts with an existing instance. Needs `deploy`.

**Operation ID:** `deploy_application`

**Needs:** `deploy`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |
| `Idempotency-Key` | header | string | no | — | Makes the request safe to repeat |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `connections` | list of object or null | no | The design's connections; enforced when the control plane has a network uplink. |
| `connections[].from` | string | yes | — |
| `connections[].port` | integer or null | no | `None`: any port of the transport (the protocol has no well-known port). |
| `connections[].to` | string | yes | — |
| `connections[].transport` | string | yes | `tcp` or `udp`. |
| `document` | object | yes | The Studio document, saved as an immutable revision. Ignored when `version` is given. |
| `modules` | list of object | yes | — |
| `modules[].availability` | one of `stateless`, `singleton`, `stateful` | no | How a module may be run and recovered (from its catalog class). |
| `modules[].dnsResolver` | boolean | no | This module answers service names for the application. Absent means it does not: a resolver is never added unless the design asks for one. |
| `modules[].guestOs` | one of `linux`, `windows` | no | The operating system inside (from the class): decides which sessions it offers. |
| `modules[].internet` | one of `none`, `web`, `any` | no | What it may reach outside the application (enforced with the connections). |
| `modules[].module` | string | yes | The module's stable id in the design (e.g. `nginx-01`). |
| `modules[].readiness` | object or null | no | — |
| `modules[].replicas` | integer | no | How many instances (1–9); more than one only for stateless modules. |
| `modules[].spec` | object | yes | Image, kind and settings; the control plane sets the name, project and owner. |
| `project` | string | yes | — |
| `published` | list of object | no | Ports reachable from outside the application (needs connections to be enforced). |
| `published[].module` | string | yes | — |
| `published[].port` | integer | yes | — |
| `published[].transport` | string | yes | `tcp` or `udp`. |
| `removeMissing` | boolean | no | Also delete the application's instances that are no longer in the design. |
| `version` | integer or null | no | Deploy this published version (its stored document) instead of saving `document` as a new revision. Drafts can never be deployed. |

```json
{
  "project": "shop-prod",
  "document": {
    "apiVersion": "fabric.apelora/v1alpha1",
    "kind": "ApplicationAssembly",
    "metadata": {
      "name": "shop",
      "uid": "assembly-shop"
    },
    "spec": {
      "modules": [],
      "connections": []
    }
  },
  "modules": [
    {
      "module": "web-01",
      "replicas": 1,
      "availability": "stateless",
      "spec": {
        "project": "shop-prod",
        "name": "shop-web-01",
        "kind": "container",
        "start": true,
        "source": {
          "protocol": "oci",
          "server": "https://docker.io",
          "alias": "library/nginx@sha256:eb1c896deef834f4e056829fd6dadac8305501f16cc71ba65fb252c8d0aa168e"
        },
        "architectures": [
          "x86_64",
          "aarch64"
        ],
        "config": {
          "limits.cpu": "1",
          "limits.memory": "512MiB"
        }
      }
    },
    {
      "module": "db-01",
      "replicas": 1,
      "availability": "stateful",
      "spec": {
        "project": "shop-prod",
        "name": "shop-db-01",
        "kind": "container",
        "start": true,
        "source": {
          "protocol": "simplestreams",
          "server": "https://images.linuxcontainers.org",
          "alias": "debian/13"
        },
        "architectures": [
          "x86_64",
          "aarch64"
        ],
        "config": {
          "limits.cpu": "2",
          "limits.memory": "2GiB"
        },
        "volumes": [
          {
            "name": "data",
            "sizeMib": 10240,
            "path": "/var/lib/data"
          }
        ]
      }
    },
    {
      "module": "cache-01",
      "replicas": 1,
      "availability": "stateful",
      "spec": {
        "project": "shop-prod",
        "name": "shop-cache-01",
        "kind": "container",
        "start": true,
        "source": {
          "protocol": "simplestreams",
          "server": "https://images.linuxcontainers.org",
          "alias": "debian/13"
        },
        "architectures": [
          "x86_64",
          "aarch64"
        ],
        "config": {
          "limits.cpu": "1",
          "limits.memory": "1GiB"
        },
        "volumes": [
          {
            "name": "cache",
            "sizeMib": 2048,
            "path": "/var/cache/shop"
          }
        ]
      }
    }
  ],
  "connections": [
    {
      "from": "web-01",
      "to": "db-01",
      "transport": "tcp",
      "port": 5432
    },
    {
      "from": "web-01",
      "to": "cache-01",
      "transport": "tcp",
      "port": 6379
    }
  ],
  "published": [
    {
      "module": "web-01",
      "transport": "tcp",
      "port": 80
    }
  ],
  "removeMissing": false,
  "version": 1
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
# Generate once per distinct change; keep this value when retrying.
IDEMPOTENCY_KEY=$(uuidgen)
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications/shop/deployments" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -H "Content-Type: application/json" \
  --data-raw '{"project":"shop-prod","document":{"apiVersion":"fabric.apelora/v1alpha1","kind":"ApplicationAssembly","metadata":{"name":"shop","uid":"assembly-shop"},"spec":{"modules":[],"connections":[]}},"modules":[{"module":"web-01","replicas":1,"availability":"stateless","spec":{"project":"shop-prod","name":"shop-web-01","kind":"container","start":true,"source":{"protocol":"oci","server":"https://docker.io","alias":"library/nginx@sha256:eb1c896deef834f4e056829fd6dadac8305501f16cc71ba65fb252c8d0aa168e"},"architectures":["x86_64","aarch64"],"config":{"limits.cpu":"1","limits.memory":"512MiB"}}},{"module":"db-01","replicas":1,"availability":"stateful","spec":{"project":"shop-prod","name":"shop-db-01","kind":"container","start":true,"source":{"protocol":"simplestreams","server":"https://images.linuxcontainers.org","alias":"debian/13"},"architectures":["x86_64","aarch64"],"config":{"limits.cpu":"2","limits.memory":"2GiB"},"volumes":[{"name":"data","sizeMib":10240,"path":"/var/lib/data"}]}},{"module":"cache-01","replicas":1,"availability":"stateful","spec":{"project":"shop-prod","name":"shop-cache-01","kind":"container","start":true,"source":{"protocol":"simplestreams","server":"https://images.linuxcontainers.org","alias":"debian/13"},"architectures":["x86_64","aarch64"],"config":{"limits.cpu":"1","limits.memory":"1GiB"},"volumes":[{"name":"cache","sizeMib":2048,"path":"/var/cache/shop"}]}}],"connections":[{"from":"web-01","to":"db-01","transport":"tcp","port":5432},{"from":"web-01","to":"cache-01","transport":"tcp","port":6379}],"published":[{"module":"web-01","transport":"tcp","port":80}],"removeMissing":false,"version":1}'
```

**TypeScript:**

```ts
const result = await client.request("deploy_application", { params: { name: "shop" }, body /* the request body above */, idempotencyKey: newIdempotencyKey() });
```

**Response `202`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "application": "shop",
  "revision": 1,
  "plan": {
    "items": [
      {
        "module": "web-01",
        "replica": 1,
        "instance": "shop-web-01",
        "action": "create",
        "reason": "not deployed yet"
      },
      {
        "module": "db-01",
        "replica": 1,
        "instance": "shop-db-01",
        "action": "create",
        "reason": "not deployed yet"
      }
    ],
    "warnings": [
      "single points of failure: cache-01, db-01, web-01 run as one instance",
      "not published: web-01 (publishing needs enforced connections and APELORA_SERVICE_ADDRESSES)",
      "connections are not enforced: the control plane has no network uplink (APELORA_NETWORK_UPLINK); instances share the project's network"
    ],
    "quota": {
      "allowed": true,
      "adding": {
        "instances": 3,
        "cpu": 4,
        "memoryBytes": 3758096384,
        "diskBytes": 45097156608
      },
      "scopes": [
        {
          "kind": "project",
          "id": "ca6b5d54-056b-4fb1-aa09-285b1fea04bc",
          "name": "Online shop",
          "dimensions": [
            {
              "dimension": "instances",
              "used": 0,
              "adding": 3,
              "limit": 20,
              "exceeded": false
            },
            {
              "dimension": "cpu",
              "used": 0,
              "adding": 4,
              "limit": 16,
              "exceeded": false
            }
          ]
        }
      ]
    }
  },
  "jobs": [
    {
      "module": "web-01",
      "instance": "shop-web-01",
      "action": "create",
      "jobId": "ebddac70-3561-4d2b-9198-d92aa47c308d"
    },
    {
      "module": "db-01",
      "instance": "shop-db-01",
      "action": "create",
      "jobId": "5d642ea4-0abf-44ff-8b2a-57ff033fbc63"
    }
  ],
  "networkJob": null
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `project_not_allowed`, `forbidden`, `mfa_required` |
| `409` | `incus_project_exists`, `not_published`, `plan_conflict`, `project_mismatch`, `quota_exceeded`, `service_range_exhausted` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |
| `503` | `incus_project_not_ready`, `quota_unverifiable`, `database_not_configured` |

### `GET /api/v1/applications/{name}/draft`

The application's working document. 404 when it has none yet. Needs `application.view`.

**Operation ID:** `application_draft`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/draft" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("application_draft", { params: { name: "shop" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "version": 1,
  "document": {
    "apiVersion": "fabric.apelora/v1alpha1",
    "kind": "ApplicationAssembly",
    "metadata": {
      "name": "shop",
      "uid": "assembly-shop"
    },
    "spec": {
      "connections": [],
      "modules": []
    }
  },
  "validationErrors": [],
  "updatedBy": "token:docs-verifier",
  "updatedAt": "2026-10-26T01:11:06.61884Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `404` | `no_draft`, `not_found` |
| `429` | `rate_limited` |

### `PUT /api/v1/applications/{name}/draft`

Saves the draft as the next version. Refused with 409 `draft_conflict` (and the current version) when someone saved since `baseVersion`; nothing is overwritten. Needs `application.design`.

**Operation ID:** `save_application_draft`

**Needs:** `application.design`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `baseVersion` | integer or null | no | The draft version this edit started from; omit only for the first save. |
| `document` | object | yes | — |

```json
{
  "document": {
    "apiVersion": "fabric.apelora/v1alpha1",
    "kind": "ApplicationAssembly",
    "metadata": {
      "name": "shop",
      "uid": "assembly-shop"
    },
    "spec": {
      "modules": [],
      "connections": []
    }
  }
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/applications/shop/draft" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"document":{"apiVersion":"fabric.apelora/v1alpha1","kind":"ApplicationAssembly","metadata":{"name":"shop","uid":"assembly-shop"},"spec":{"modules":[],"connections":[]}}}'
```

**TypeScript:**

```ts
const result = await client.request("save_application_draft", { params: { name: "shop" }, body /* the request body above */ });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "version": 1,
  "document": {
    "apiVersion": "fabric.apelora/v1alpha1",
    "kind": "ApplicationAssembly",
    "metadata": {
      "name": "shop",
      "uid": "assembly-shop"
    },
    "spec": {
      "connections": [],
      "modules": []
    }
  },
  "validationErrors": [],
  "updatedBy": "token:docs-verifier",
  "updatedAt": "2026-10-26T01:11:06.61884Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `409` | — |
| `429` | `rate_limited` |

### `GET /api/v1/applications/{name}/events`

What happened to the application: creation, saves, versions, deployments, operations, refusals. Needs `application.view`.

**Operation ID:** `application_events`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/events" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("application_events", { params: { name: "shop" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "items": [
    {
      "id": 77,
      "at": "2026-10-26T01:11:06.650288Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "application.deploy.requested",
      "target": "shop-prod/shop",
      "outcome": "success",
      "scope": {
        "application": "212d921a-9a00-4dd9-9cd7-f79882910ad1",
        "organization": "fe187562-d709-4365-b5e7-280f1349b8c8",
        "project": "ca6b5d54-056b-4fb1-aa09-285b1fea04bc"
      },
      "detail": {
        "create": 3,
        "keep": 0,
        "name": "docs-verifier",
        "remove": 0,
        "requestId": "4745dbf4-62a5-4080-a1f3-b7167ec1d686",
        "resize": 0,
        "revision": 1,
        "role": "fabric-admin"
      }
    },
    {
      "id": 76,
      "at": "2026-10-26T01:11:06.627777Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "application.version.publish",
      "target": "shop",
      "outcome": "success",
      "scope": {
        "application": "212d921a-9a00-4dd9-9cd7-f79882910ad1",
        "organization": "fe187562-d709-4365-b5e7-280f1349b8c8",
        "project": "ca6b5d54-056b-4fb1-aa09-285b1fea04bc"
      },
      "detail": {
        "draftVersion": 1,
        "name": "docs-verifier",
        "requestId": "349cafb0-8028-458d-918c-487404435104",
        "revision": 1,
        "role": "fabric-admin"
      }
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `404` | `not_found` |
| `429` | `rate_limited` |

### `GET /api/v1/applications/{name}/migration`

Dry run of migrating the application to another server: for each instance whether it keeps running, what is copied and what blocks it. Changes nothing. Needs `application.operate`.

**Operation ID:** `preview_application_migration`

**Needs:** `application.operate`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |
| `target` | query | string | yes | — | The server to move the application to. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/migration?target=mock-member-02" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("preview_application_migration", { params: { name: "shop" }, query: { target: "mock-member-02" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-26T01:11:07.96467Z"
  },
  "target": "mock-member-02",
  "items": [],
  "possible": false,
  "stops": []
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `project_not_allowed`, `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `not_deployed` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |

### `GET /api/v1/applications/{name}/operations`

Recent operations of the application, newest first. Needs `application.view`.

**Operation ID:** `application_operations`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/operations" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("application_operations", { params: { name: "shop" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": []
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `404` | `not_found` |
| `429` | `rate_limited` |

### `POST /api/v1/applications/{name}/operations`

Starts, shuts down (graceful), stops (immediate), restarts or migrates the application's instances, in dependency order where that matters, as an asynchronous operation. Succeeds only when Incus confirms each instance's state (and, for a migration, its new server). Needs `application.operate` on the application. It only touches instances this application owns; networks, volumes, data and other applications are left alone.

**Operation ID:** `operate_application`

**Needs:** `application.operate` on the application.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |
| `Idempotency-Key` | header | string | no | — | Makes the request safe to repeat |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `action` | one of `start`, `stop`, `shutdown`, `restart`, `migrate` | yes | — |
| `confirmDisruption` | boolean | no | Required to stop or restart an application that has single-instance or stateful modules: it acknowledges that their clients lose service meanwhile. |
| `target` | string or null | no | The server to move the application to. Needed for `migrate`, ignored otherwise. |

```json
{
  "action": "start"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
# Generate once per distinct change; keep this value when retrying.
IDEMPOTENCY_KEY=$(uuidgen)
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications/shop/operations" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -H "Content-Type: application/json" \
  --data-raw '{"action":"start"}'
```

**TypeScript:**

```ts
const result = await client.request("operate_application", { params: { name: "shop" }, body: { action: "start" }, idempotencyKey: newIdempotencyKey() });
```

**Response `202`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

```json
{
  "created": false,
  "operation": {
    "createdAt": "2026-01-01T09:00:00Z",
    "id": "00000000-0000-4000-8000-000000000001",
    "kind": "start",
    "phases": [
      {
        "action": "example",
        "state": "example",
        "steps": [
          {
            "instance": "example",
            "module": "example",
            "state": "example",
            "error": "example"
          }
        ]
      }
    ],
    "requestedBy": "example",
    "state": "pending",
    "stepsDone": 0,
    "stepsTotal": 0,
    "error": "example",
    "finishedAt": "2026-01-01T09:00:00Z",
    "startedAt": "2026-01-01T09:00:00Z"
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
| `409` | `action_not_available`, `already_running`, `already_stopped`, `confirmation_required`, `member_unreachable`, `migration_blocked`, `not_deployed`, `nothing_deployed`, `nothing_to_do`, `operation_in_progress` |
| `429` | `rate_limited` |
| `503` | `incus_unreachable`, `database_not_configured` |

### `GET /api/v1/applications/{name}/operations/{id}`

One operation with the progress of each phase and instance. Needs `application.view`.

**Operation ID:** `application_operation`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |
| `id` | path | string (uuid) | yes | — | Operation id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/operations/854deaeb-4d8c-4e97-8dfb-271d62218be6" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("application_operation", { params: { name: "shop", id: "854deaeb-4d8c-4e97-8dfb-271d62218be6" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

```json
{
  "createdAt": "2026-01-01T09:00:00Z",
  "id": "00000000-0000-4000-8000-000000000001",
  "kind": "start",
  "phases": [
    {
      "action": "example",
      "state": "example",
      "steps": [
        {
          "instance": "example",
          "module": "example",
          "state": "example",
          "error": "example"
        }
      ]
    }
  ],
  "requestedBy": "example",
  "state": "pending",
  "stepsDone": 0,
  "stepsTotal": 0,
  "error": "example",
  "finishedAt": "2026-01-01T09:00:00Z",
  "startedAt": "2026-01-01T09:00:00Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `404` | `not_found` |
| `429` | `rate_limited` |

### `POST /api/v1/applications/{name}/plan`

What deploying the design would change, without changing anything. Needs `deploy`.

**Operation ID:** `plan_application`

**Needs:** `deploy`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `connections` | list of object or null | no | The design's connections; enforced when the control plane has a network uplink. |
| `connections[].from` | string | yes | — |
| `connections[].port` | integer or null | no | `None`: any port of the transport (the protocol has no well-known port). |
| `connections[].to` | string | yes | — |
| `connections[].transport` | string | yes | `tcp` or `udp`. |
| `modules` | list of object | yes | — |
| `modules[].availability` | one of `stateless`, `singleton`, `stateful` | no | How a module may be run and recovered (from its catalog class). |
| `modules[].dnsResolver` | boolean | no | This module answers service names for the application. Absent means it does not: a resolver is never added unless the design asks for one. |
| `modules[].guestOs` | one of `linux`, `windows` | no | The operating system inside (from the class): decides which sessions it offers. |
| `modules[].internet` | one of `none`, `web`, `any` | no | What it may reach outside the application (enforced with the connections). |
| `modules[].module` | string | yes | The module's stable id in the design (e.g. `nginx-01`). |
| `modules[].readiness` | object or null | no | — |
| `modules[].replicas` | integer | no | How many instances (1–9); more than one only for stateless modules. |
| `modules[].spec` | object | yes | Image, kind and settings; the control plane sets the name, project and owner. |
| `project` | string | yes | — |
| `published` | list of object | no | Ports reachable from outside the application (needs connections to be enforced). |
| `published[].module` | string | yes | — |
| `published[].port` | integer | yes | — |
| `published[].transport` | string | yes | `tcp` or `udp`. |

```json
{
  "project": "shop-prod",
  "modules": [
    {
      "module": "web-01",
      "replicas": 1,
      "availability": "stateless",
      "spec": {
        "project": "shop-prod",
        "name": "shop-web-01",
        "kind": "container",
        "start": true,
        "source": {
          "protocol": "oci",
          "server": "https://docker.io",
          "alias": "library/nginx@sha256:eb1c896deef834f4e056829fd6dadac8305501f16cc71ba65fb252c8d0aa168e"
        },
        "architectures": [
          "x86_64",
          "aarch64"
        ],
        "config": {
          "limits.cpu": "1",
          "limits.memory": "512MiB"
        }
      }
    },
    {
      "module": "db-01",
      "replicas": 1,
      "availability": "stateful",
      "spec": {
        "project": "shop-prod",
        "name": "shop-db-01",
        "kind": "container",
        "start": true,
        "source": {
          "protocol": "simplestreams",
          "server": "https://images.linuxcontainers.org",
          "alias": "debian/13"
        },
        "architectures": [
          "x86_64",
          "aarch64"
        ],
        "config": {
          "limits.cpu": "2",
          "limits.memory": "2GiB"
        },
        "volumes": [
          {
            "name": "data",
            "sizeMib": 10240,
            "path": "/var/lib/data"
          }
        ]
      }
    },
    {
      "module": "cache-01",
      "replicas": 1,
      "availability": "stateful",
      "spec": {
        "project": "shop-prod",
        "name": "shop-cache-01",
        "kind": "container",
        "start": true,
        "source": {
          "protocol": "simplestreams",
          "server": "https://images.linuxcontainers.org",
          "alias": "debian/13"
        },
        "architectures": [
          "x86_64",
          "aarch64"
        ],
        "config": {
          "limits.cpu": "1",
          "limits.memory": "1GiB"
        },
        "volumes": [
          {
            "name": "cache",
            "sizeMib": 2048,
            "path": "/var/cache/shop"
          }
        ]
      }
    }
  ],
  "connections": [
    {
      "from": "web-01",
      "to": "db-01",
      "transport": "tcp",
      "port": 5432
    },
    {
      "from": "web-01",
      "to": "cache-01",
      "transport": "tcp",
      "port": 6379
    }
  ],
  "published": [
    {
      "module": "web-01",
      "transport": "tcp",
      "port": 80
    }
  ]
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications/shop/plan" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"project":"shop-prod","modules":[{"module":"web-01","replicas":1,"availability":"stateless","spec":{"project":"shop-prod","name":"shop-web-01","kind":"container","start":true,"source":{"protocol":"oci","server":"https://docker.io","alias":"library/nginx@sha256:eb1c896deef834f4e056829fd6dadac8305501f16cc71ba65fb252c8d0aa168e"},"architectures":["x86_64","aarch64"],"config":{"limits.cpu":"1","limits.memory":"512MiB"}}},{"module":"db-01","replicas":1,"availability":"stateful","spec":{"project":"shop-prod","name":"shop-db-01","kind":"container","start":true,"source":{"protocol":"simplestreams","server":"https://images.linuxcontainers.org","alias":"debian/13"},"architectures":["x86_64","aarch64"],"config":{"limits.cpu":"2","limits.memory":"2GiB"},"volumes":[{"name":"data","sizeMib":10240,"path":"/var/lib/data"}]}},{"module":"cache-01","replicas":1,"availability":"stateful","spec":{"project":"shop-prod","name":"shop-cache-01","kind":"container","start":true,"source":{"protocol":"simplestreams","server":"https://images.linuxcontainers.org","alias":"debian/13"},"architectures":["x86_64","aarch64"],"config":{"limits.cpu":"1","limits.memory":"1GiB"},"volumes":[{"name":"cache","sizeMib":2048,"path":"/var/cache/shop"}]}}],"connections":[{"from":"web-01","to":"db-01","transport":"tcp","port":5432},{"from":"web-01","to":"cache-01","transport":"tcp","port":6379}],"published":[{"module":"web-01","transport":"tcp","port":80}]}'
```

**TypeScript:**

```ts
const result = await client.request("plan_application", { params: { name: "shop" }, body /* the request body above */ });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "items": [
    {
      "module": "web-01",
      "replica": 1,
      "instance": "shop-web-01",
      "action": "create",
      "reason": "not deployed yet"
    },
    {
      "module": "db-01",
      "replica": 1,
      "instance": "shop-db-01",
      "action": "create",
      "reason": "not deployed yet"
    }
  ],
  "warnings": [
    "single points of failure: cache-01, db-01, web-01 run as one instance",
    "not published: web-01 (publishing needs enforced connections and APELORA_SERVICE_ADDRESSES)",
    "connections are not enforced: the control plane has no network uplink (APELORA_NETWORK_UPLINK); instances share the project's network"
  ],
  "quota": {
    "allowed": true,
    "adding": {
      "instances": 3,
      "cpu": 4,
      "memoryBytes": 3758096384,
      "diskBytes": 45097156608
    },
    "scopes": [
      {
        "kind": "project",
        "id": "ca6b5d54-056b-4fb1-aa09-285b1fea04bc",
        "name": "Online shop",
        "dimensions": [
          {
            "dimension": "instances",
            "used": 0,
            "adding": 3,
            "limit": 20,
            "exceeded": false
          },
          {
            "dimension": "cpu",
            "used": 0,
            "adding": 4,
            "limit": 16,
            "exceeded": false
          }
        ]
      }
    ]
  }
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `project_not_allowed`, `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |

### `POST /api/v1/applications/{name}/restore`

Brings an archived application back. Needs `application.delete`.

**Operation ID:** `restore_application`

**Needs:** `application.delete`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications/blog/restore" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("restore_application", { params: { name: "blog" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `429` | `rate_limited` |

### `GET /api/v1/applications/{name}/status`

The application's instances as Incus reports them, by module. Needs `read-inventory`.

**Operation ID:** `application_status`

**Needs:** `read-inventory`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |
| `project` | query | string | no | — | Only this Incus project. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/status" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**With options** (`project`):

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/status?project=shop-prod" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("application_status", { params: { name: "shop" }, query: { project: "shop-prod" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-26T01:11:07.979798Z"
  },
  "items": [],
  "services": []
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |

### `GET /api/v1/applications/{name}/versions`

Versions of the application, newest first. Needs `application.view`.

**Operation ID:** `application_versions`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/versions" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("application_versions", { params: { name: "shop" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "revision": 1,
      "published": true,
      "label": "First release",
      "draftVersion": 1,
      "createdBy": "token:docs-verifier",
      "createdAt": "2026-10-26T01:11:06.627777Z"
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `404` | `not_found` |
| `429` | `rate_limited` |

### `POST /api/v1/applications/{name}/versions`

Releases the current draft as the next immutable published version. Refused while the draft is invalid or when this draft version is already published. Needs `application.design`.

**Operation ID:** `publish_application`

**Needs:** `application.design`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `label` | string or null | no | A short name for the version, e.g. `after load test`. |

```json
{
  "label": "First release"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications/shop/versions" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"label":"First release"}'
```

**TypeScript:**

```ts
const result = await client.request("publish_application", { params: { name: "shop" }, body: { label: "First release" } });
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "revision": 1,
  "published": true,
  "label": "First release",
  "draftVersion": 1,
  "createdBy": "token:docs-verifier",
  "createdAt": "2026-10-26T01:11:06.627777Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `no_draft`, `not_found` |
| `409` | `already_published` |
| `422` | `draft_invalid` |
| `429` | `rate_limited` |

### `GET /api/v1/applications/{name}/versions/{revision}`

The document of one version. Needs `application.view`.

**Operation ID:** `application_version`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |
| `revision` | path | integer | yes | — | Version number |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/versions/1" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("application_version", { params: { name: "shop", revision: "1" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "document": {
    "apiVersion": "fabric.apelora/v1alpha1",
    "kind": "ApplicationAssembly",
    "metadata": {
      "name": "shop",
      "uid": "assembly-shop"
    },
    "spec": {
      "connections": [],
      "modules": []
    }
  },
  "published": true
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `404` | `not_found` |
| `429` | `rate_limited` |

### `GET /api/v1/applications/{name}/volumes`

The application's volumes, with what Incus says about each now. Needs `application.view`.

**Operation ID:** `application_volumes`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/volumes" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("application_volumes", { params: { name: "shop" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-26T01:11:07.991494Z"
  },
  "items": [
    {
      "module": "cache-01",
      "instance": "shop-cache-01",
      "name": "cache",
      "incusName": "shop-cache-01-cache",
      "pool": "mock-local",
      "member": "mock-member-01",
      "sizeMib": 2048,
      "content": "filesystem",
      "class": "data-local",
      "state": "missing",
      "usedBy": [],
      "createdAt": "2026-10-26T01:11:07.487928Z"
    },
    {
      "module": "db-01",
      "instance": "shop-db-01",
      "name": "data",
      "incusName": "shop-db-01-data",
      "pool": "mock-local",
      "member": "mock-member-01",
      "sizeMib": 10240,
      "content": "filesystem",
      "class": "data-local",
      "state": "missing",
      "usedBy": [],
      "createdAt": "2026-10-26T01:11:07.474271Z"
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |

### `PATCH /api/v1/applications/{name}/volumes/{volume}`

Grows one of the application's volumes, also while its instance runs. Volumes only grow: a smaller size is refused. Needs `application.deploy`; audited.

**Operation ID:** `grow_application_volume`

**Needs:** `application.deploy`; audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |
| `volume` | path | string | yes | — | The volume's Incus name |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `sizeMib` | integer | yes | The new size in MiB; at least the current one (volumes only grow). |

```json
{
  "sizeMib": 20480
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PATCH "$APELORA_URL/api/v1/applications/shop/volumes/shop-db-01-data" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  --data-raw '{"sizeMib":20480}'
```

**TypeScript:**

```ts
await client.request("grow_application_volume", { params: { name: "shop", volume: "shop-db-01-data" }, body: { sizeMib: 20480 } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | — |
| `429` | `rate_limited` |
| `502` | `incus_not_found` |

### `DELETE /api/v1/applications/{name}/volumes/{volume}`

Deletes one of the application's volumes and its snapshots, for good. The volume's Incus name must be typed again; refused while an instance uses it. Needs `application.delete` (and an approval where the policy asks for one); audited.

**Operation ID:** `delete_application_volume`

**Needs:** `application.delete` (and an approval where the policy asks for one); audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |
| `volume` | path | string | yes | — | The volume's Incus name |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The volume's Incus name again, typed by the person deleting it. |

```json
{
  "confirm": "shop-cache-01-cache"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/applications/shop/volumes/shop-cache-01-cache" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"shop-cache-01-cache"}'
```

**TypeScript:**

```ts
await client.request("delete_application_volume", { params: { name: "shop", volume: "shop-cache-01-cache" }, body: { confirm: "shop-cache-01-cache" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `confirmation_mismatch`, `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `approval_invalid`, `approval_required`, `volume_in_use` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |

### `GET /api/v1/applications/{name}/volumes/{volume}/backups`

The volume's backups, oldest first, whether each still exists, and its schedules. Needs `application.view`.

**Operation ID:** `volume_backups`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |
| `volume` | path | string | yes | — | The volume's Incus name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/volumes/shop-db-01-data/backups" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("volume_backups", { params: { name: "shop", volume: "shop-db-01-data" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-26T01:11:09.684561Z"
  },
  "backupPool": "mock-local",
  "schedules": {
    "snapshots": {
      "everyMinutes": 60,
      "keep": 24,
      "lastRunAt": null,
      "error": null
    },
    "backups": {
      "everyMinutes": 1440,
      "keep": 7,
      "lastRunAt": null,
      "error": null
    }
  },
  "items": [
    {
      "name": "shop-db-01-data-bk-20261026011108",
      "pool": "mock-local",
      "member": "mock-member-02",
      "sizeMib": 10240,
      "takenAt": "2026-10-26T01:11:08.039202Z",
      "scheduled": false,
      "beforeRestore": null,
      "present": false
    },
    {
      "name": "shop-db-01-data-bk-20261026011109",
      "pool": "mock-local",
      "member": "mock-member-02",
      "sizeMib": 10240,
      "takenAt": "2026-10-26T01:11:09.148524Z",
      "scheduled": false,
      "beforeRestore": null,
      "present": false
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `429` | `rate_limited` |

### `POST /api/v1/applications/{name}/volumes/{volume}/backups`

Backs the volume up now: a copy, through a short-lived snapshot, into the backup pool on another member. Kept until someone deletes it (`delete_backup`); scheduled backups are pruned to what the schedule keeps. Queues a `volume.backup` job. Needs `application.operate`; audited.

**Operation ID:** `back_up_volume`

**Needs:** `application.operate`; audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |
| `volume` | path | string | yes | — | The volume's Incus name |
| `Idempotency-Key` | header | string | no | — | Makes the request safe to repeat |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
# Generate once per distinct change; keep this value when retrying.
IDEMPOTENCY_KEY=$(uuidgen)
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications/shop/volumes/shop-db-01-data/backups" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY"
```

**TypeScript:**

```ts
const result = await client.request("back_up_volume", { params: { name: "shop", volume: "shop-db-01-data" }, idempotencyKey: newIdempotencyKey() });
```

**Response `202`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "jobId": "3399cf17-318a-4339-8c67-918001e6fd47",
  "created": true
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `backup_pool_missing` |
| `429` | `rate_limited` |

### `DELETE /api/v1/applications/{name}/volumes/{volume}/backups/{backup}`

Deletes one backup copy. The volume it was taken from is left as it is. The backup's Incus name must be typed again. A copy Incus no longer has is forgotten anyway, so a record of a missing copy can be cleared. Needs `application.delete` (and an approval where a policy asks for one); audited.

**Operation ID:** `delete_volume_backup`

**Needs:** `application.delete` (and an approval where a policy asks for one); audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name. |
| `volume` | path | string | yes | — | The volume's Incus name. |
| `backup` | path | string | yes | — | The backup's Incus name. |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The backup's Incus name again, typed by the person deleting it. |

```json
{
  "confirm": "shop-db-01-data-bk-20261026011109"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/applications/shop/volumes/shop-db-01-data/backups/shop-db-01-data-bk-20261026011109" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"shop-db-01-data-bk-20261026011109"}'
```

**TypeScript:**

```ts
await client.request("delete_volume_backup", { params: { name: "shop", volume: "shop-db-01-data", backup: "shop-db-01-data-bk-20261026011109" }, body: { confirm: "shop-db-01-data-bk-20261026011109" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `confirmation_mismatch`, `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `approval_invalid`, `approval_required` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |

### `GET /api/v1/applications/{name}/volumes/{volume}/backups/{backup}/restore`

Dry run of restoring the volume from one of its backups: what is replaced (data written since the backup, the volume's snapshots), which instances must be stopped, where the safety backup goes, and the steps. Changes nothing. Needs `application.operate`.

**Operation ID:** `preview_volume_restore`

**Needs:** `application.operate`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name. |
| `volume` | path | string | yes | — | The volume's Incus name. |
| `backup` | path | string | yes | — | The backup's Incus name. |
| `safetyBackup` | query | boolean | no | `true` | Take a safety backup of the current data first (default true). |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/volumes/shop-db-01-data/backups/shop-db-01-data-bk-20261026011108/restore" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**With options** (`safetyBackup`):

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/volumes/shop-db-01-data/backups/shop-db-01-data-bk-20261026011108/restore?safetyBackup=false" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("preview_volume_restore", { params: { name: "shop", volume: "shop-db-01-data", backup: "shop-db-01-data-bk-20261026011108" }, query: { safetyBackup: false } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-26T01:11:09.692033Z"
  },
  "plan": {
    "volume": "shop-db-01-data",
    "pool": "mock-local",
    "member": "mock-member-01",
    "sizeMib": 10240,
    "backup": "shop-db-01-data-bk-20261026011108",
    "backupPool": "mock-local",
    "backupMember": "mock-member-02",
    "backupTakenAt": "2026-10-26T01:11:08.039202Z",
    "snapshotsDeleted": [],
    "usedBy": [],
    "running": [],
    "safetyBackupPool": "mock-local",
    "blocked": [
      "volume shop-db-01-data is not in Incus (its member may be unreachable); nothing can be restored into it",
      "backup shop-db-01-data-bk-20261026011108 is not in Incus"
    ],
    "steps": [
      "Copy the volume as it is now into pool mock-local (a safety backup, listed with the others)",
      "Copy backup shop-db-01-data-bk-20261026011108 over volume shop-db-01-data on mock-member-01"
    ]
  }
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |

### `POST /api/v1/applications/{name}/volumes/{volume}/backups/{backup}/restore`

Restores the volume from one of its backups, after the dry run passes again and the volume's name is typed: a safety backup of the current data first (unless declined), then the backup is copied over the volume. Every instance using it must be stopped; they stay stopped. Queues a `volume.restore` job. Needs `application.operate` (and an approval where a policy asks); audited with the job.

**Operation ID:** `restore_volume_backup`

**Needs:** `application.operate` (and an approval where a policy asks); audited with the job.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name. |
| `volume` | path | string | yes | — | The volume's Incus name. |
| `backup` | path | string | yes | — | The backup's Incus name. |
| `Idempotency-Key` | header | string | no | — | Makes the request safe to repeat |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The volume's Incus name again, typed by the person restoring it. |
| `safetyBackup` | boolean | no | Take a safety backup of the current data first (default true). |

```json
{
  "confirm": "shop-db-01-data",
  "safetyBackup": true
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
# Generate once per distinct change; keep this value when retrying.
IDEMPOTENCY_KEY=$(uuidgen)
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications/shop/volumes/shop-db-01-data/backups/shop-db-01-data-bk-20261026011108/restore" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"shop-db-01-data","safetyBackup":true}'
```

**TypeScript:**

```ts
const result = await client.request("restore_volume_backup", { params: { name: "shop", volume: "shop-db-01-data", backup: "shop-db-01-data-bk-20261026011108" }, body: { confirm: "shop-db-01-data", safetyBackup: true }, idempotencyKey: newIdempotencyKey() });
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
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `approval_invalid`, `approval_required`, `restore_blocked` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |

### `PUT /api/v1/applications/{name}/volumes/{volume}/schedules`

Sets or turns off the volume's snapshot and backup schedules. A new or changed schedule first runs at the worker's next pass (within a minute). Needs `application.deploy`; audited.

**Operation ID:** `set_volume_schedules`

**Needs:** `application.deploy`; audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |
| `volume` | path | string | yes | — | The volume's Incus name |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `backups` | object or null | no | — |
| `backups.everyMinutes` | integer | yes | Minutes between two runs: 15 minutes to one week. |
| `backups.keep` | integer | yes | How many of the scheduled results are kept: 1 to 50. |
| `snapshots` | object or null | no | — |
| `snapshots.everyMinutes` | integer | yes | Minutes between two runs: 15 minutes to one week. |
| `snapshots.keep` | integer | yes | How many of the scheduled results are kept: 1 to 50. |

```json
{
  "snapshots": {
    "everyMinutes": 60,
    "keep": 24
  },
  "backups": {
    "everyMinutes": 1440,
    "keep": 7
  }
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/applications/shop/volumes/shop-db-01-data/schedules" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  --data-raw '{"snapshots":{"everyMinutes":60,"keep":24},"backups":{"everyMinutes":1440,"keep":7}}'
```

**TypeScript:**

```ts
await client.request("set_volume_schedules", { params: { name: "shop", volume: "shop-db-01-data" }, body: { snapshots: { everyMinutes: 60, keep: 24 }, backups: { everyMinutes: 1440, keep: 7 } } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `backup_pool_missing` |
| `429` | `rate_limited` |

### `GET /api/v1/applications/{name}/volumes/{volume}/snapshots`

The volume's snapshots, oldest first. Needs `application.view`.

**Operation ID:** `volume_snapshots`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |
| `volume` | path | string | yes | — | The volume's Incus name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/volumes/shop-db-01-data/snapshots" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("volume_snapshots", { params: { name: "shop", volume: "shop-db-01-data" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-26T01:11:08.009149Z"
  },
  "items": []
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |

### `POST /api/v1/applications/{name}/volumes/{volume}/snapshots`

Takes a snapshot of the volume, named after the time (`snap-YYYYMMDD-HHMMSS`). While an instance runs the snapshot is only crash-consistent; the response says which. Snapshots are not backups: they live in the same pool. Needs `application.operate`; audited.

**Operation ID:** `take_volume_snapshot`

**Needs:** `application.operate`; audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name |
| `volume` | path | string | yes | — | The volume's Incus name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications/shop/volumes/shop-db-01-data/snapshots" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("take_volume_snapshot", { params: { name: "shop", volume: "shop-db-01-data" } });
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

```json
{
  "consistency": "example",
  "name": "example"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `snapshots_not_allowed`, `volume_missing` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |

### `DELETE /api/v1/applications/{name}/volumes/{volume}/snapshots/{snapshot}`

Deletes one snapshot of the volume. Needs `application.delete`; audited.

**Operation ID:** `delete_volume_snapshot`

**Needs:** `application.delete`; audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name. |
| `volume` | path | string | yes | — | The volume's Incus name. |
| `snapshot` | path | string | yes | — | Snapshot name. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/applications/shop/volumes/shop-db-01-data/snapshots/snap-20261025-120000" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("delete_volume_snapshot", { params: { name: "shop", volume: "shop-db-01-data", snapshot: "snap-20261025-120000" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `429` | `rate_limited` |
| `502` | `incus_not_found` |

### `POST /api/v1/applications/{name}/volumes/{volume}/snapshots/{snapshot}/restore`

Puts the volume back to a snapshot: everything written since is lost. The snapshot's name must be typed again, and every instance using the volume must be stopped. Needs `application.operate` (and an approval where the policy asks for one); audited.

**Operation ID:** `restore_volume_snapshot`

**Needs:** `application.operate` (and an approval where the policy asks for one); audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Application name. |
| `volume` | path | string | yes | — | The volume's Incus name. |
| `snapshot` | path | string | yes | — | Snapshot name. |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The snapshot's name again, typed by the person restoring it. |

```json
{
  "confirm": "snap-20261025-120000"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications/shop/volumes/shop-db-01-data/snapshots/snap-20261025-120000/restore" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"snap-20261025-120000"}'
```

**TypeScript:**

```ts
await client.request("restore_volume_snapshot", { params: { name: "shop", volume: "shop-db-01-data", snapshot: "snap-20261025-120000" }, body: { confirm: "snap-20261025-120000" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `confirmation_mismatch`, `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `approval_invalid`, `approval_required`, `volume_in_use`, `volume_missing` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |

### `GET /api/v1/networks/applications`

Each application the caller may view that has a recorded deployment: its network, the rules compiled from its design, its service and published addresses, and what Incus holds for each, with the differences. Read-only. Needs `application.view` on each application.

**Operation ID:** `application_networks`

**Needs:** `application.view` on each application.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/networks/applications" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("application_networks", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-26T01:11:13.427229Z"
  },
  "incusError": null,
  "items": [
    {
      "application": "shop",
      "project": "shop-prod",
      "revision": 1,
      "enforced": false,
      "network": "shop",
      "uplink": null,
      "serviceRange": null,
      "networkObserved": null,
      "connections": [
        {
          "from": "web-01",
          "to": "db-01",
          "transport": "tcp",
          "port": 5432
        },
        {
          "from": "web-01",
          "to": "cache-01",
          "transport": "tcp",
          "port": 6379
        }
      ],
      "published": [],
      "modules": [],
      "services": [],
      "drift": []
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

### `GET /api/v1/storage/volumes`

Every application volume the caller may see, with what Incus reports, its schedules and how many backups it has. Read-only. Needs `application.view` on each application.

**Operation ID:** `storage_volumes`

**Needs:** `application.view` on each application.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/storage/volumes" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("storage_volumes", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-26T01:11:08.001354Z"
  },
  "backupPool": "mock-local",
  "incusError": null,
  "items": [
    {
      "application": "shop",
      "module": "cache-01",
      "instance": "shop-cache-01",
      "name": "cache",
      "incusName": "shop-cache-01-cache",
      "pool": "mock-local",
      "member": "mock-member-01",
      "sizeMib": 2048,
      "class": "data-local",
      "state": "missing",
      "usedBy": [],
      "schedules": {
        "snapshots": null,
        "backups": null
      },
      "backups": 0,
      "lastBackupAt": null
    },
    {
      "application": "shop",
      "module": "db-01",
      "instance": "shop-db-01",
      "name": "data",
      "incusName": "shop-db-01-data",
      "pool": "mock-local",
      "member": "mock-member-01",
      "sizeMib": 10240,
      "class": "data-local",
      "state": "missing",
      "usedBy": [],
      "schedules": {
        "snapshots": null,
        "backups": null
      },
      "backups": 0,
      "lastBackupAt": null
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

