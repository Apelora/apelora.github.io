---
title: Applications API
section: api
slug: applications
order: 4
label: Applications
source: packages/api-client/openapi.json
summary: Applications, drafts, versions, operations and migration.
---
Applications: drafts and published versions, deploying a version, start, shut down, stop, restart and migrate, volumes and status. This page lists 34 operations.

Set variables in the [API overview](/docs/api/overview/). Download [OpenAPI](/assets/api/openapi.json). Examples: **MOCK VERIFIED** (tested with simulated inventory); **Illustrative** (schema values).

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

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `includeArchived` | query | boolean | no | — |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications" \
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
      "name": "shop",
      "latestRevision": null,
      "createdAt": "2026-10-23T22:12:58.07016Z",
      "updatedAt": "2026-10-23T22:12:58.096314Z",
      "description": "Updated through the API",
      "icon": "box",
      "project": {
        "id": "97016fb6-2ad8-4399-a986-73ddc9c88a1b",
        "slug": "docs-project",
        "name": "Documentation project",
        "organizationId": "a80a1413-41a1-498f-868b-c384cf72acc5",
        "organizationSlug": "docs-org"
      },
      "environment": {
        "id": "900a36cf-8241-4afe-8ad4-6a84215a0ca0",
        "slug": "development",
        "name": "Development",
        "kind": "development",
        "incusProject": "docs-org-docs-project-development"
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
        "observedAt": "2026-10-23T22:12:58.129707Z",
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
  ],
  "observedAt": "2026-10-23T22:12:58.129707Z",
  "stale": false
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/applications`

Creates an application in an environment, optionally with its first draft. Needs `application.create` on the environment's project.

**Operation ID:** `create_application`

**Needs:** `application.create` on the environment's project.

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `description` | string | no | — |
| `document` | object | no | The first draft (a Studio document), if any. |
| `environmentId` | string | yes | The environment (and so the project) the application lives in. |
| `icon` | string | no | Icon key; `box` when omitted. |
| `name` | string | yes | Lowercase letters, digits and hyphens, starting with a letter; at most 40 characters. Fixed for the life of the application (instances are named after it). |

```json
{
  "name": "shop",
  "environmentId": "900a36cf-8241-4afe-8ad4-6a84215a0ca0",
  "description": "API documentation example"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"shop","environmentId":"900a36cf-8241-4afe-8ad4-6a84215a0ca0","description":"API documentation example"}'
```

**Response `201`** — Success.

Content-Type: `application/json`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

```json
{
  "name": "shop",
  "latestRevision": null,
  "createdAt": "2026-10-23T22:12:58.07016Z",
  "updatedAt": "2026-10-23T22:12:58.07016Z",
  "description": "API documentation example",
  "icon": "box",
  "project": {
    "id": "97016fb6-2ad8-4399-a986-73ddc9c88a1b",
    "slug": "docs-project",
    "name": "Documentation project",
    "organizationId": "a80a1413-41a1-498f-868b-c384cf72acc5",
    "organizationSlug": "docs-org"
  },
  "environment": {
    "id": "900a36cf-8241-4afe-8ad4-6a84215a0ca0",
    "slug": "development",
    "name": "Development",
    "kind": "development",
    "incusProject": "docs-org-docs-project-development"
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
    "observedAt": "2026-10-23T22:12:58.077795Z",
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

**Errors:** `400`, `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/applications/{name}`

One application with its modules (desired and observed), versions and recent operations. Needs `application.view`.

**Operation ID:** `application`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

```json
{
  "application": {
    "name": "shop",
    "latestRevision": null,
    "createdAt": "2026-10-23T22:12:58.07016Z",
    "updatedAt": "2026-10-23T22:12:58.07016Z",
    "description": "API documentation example",
    "icon": "box",
    "project": {
      "id": "97016fb6-2ad8-4399-a986-73ddc9c88a1b",
      "slug": "docs-project",
      "name": "Documentation project",
      "organizationId": "a80a1413-41a1-498f-868b-c384cf72acc5",
      "organizationSlug": "docs-org"
    },
    "environment": {
      "id": "900a36cf-8241-4afe-8ad4-6a84215a0ca0",
      "slug": "development",
      "name": "Development",
      "kind": "development",
      "incusProject": "docs-org-docs-project-development"
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
      "observedAt": "2026-10-23T22:12:58.084424Z",
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
  "modules": [],
  "versions": [],
  "operations": []
}
```

**Errors:** `401`, `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `PATCH /api/v1/applications/{name}`

Changes an application's description or icon (its name cannot change). Needs `application.design`.

**Operation ID:** `update_application`

**Needs:** `application.design`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `description` | string | no | — |
| `icon` | string | no | — |

```json
{
  "description": "Updated through the API"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PATCH "$APELORA_URL/api/v1/applications/shop" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"description":"Updated through the API"}'
```

**Response `200`** — Success.

Content-Type: `application/json`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

```json
{
  "name": "shop",
  "latestRevision": null,
  "createdAt": "2026-10-23T22:12:58.07016Z",
  "updatedAt": "2026-10-23T22:12:58.096314Z",
  "description": "Updated through the API",
  "icon": "box",
  "project": {
    "id": "97016fb6-2ad8-4399-a986-73ddc9c88a1b",
    "slug": "docs-project",
    "name": "Documentation project",
    "organizationId": "a80a1413-41a1-498f-868b-c384cf72acc5",
    "organizationSlug": "docs-org"
  },
  "environment": {
    "id": "900a36cf-8241-4afe-8ad4-6a84215a0ca0",
    "slug": "development",
    "name": "Development",
    "kind": "development",
    "incusProject": "docs-org-docs-project-development"
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
    "observedAt": "2026-10-23T22:12:58.100469Z",
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

**Errors:** `400`, `403`, `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/applications/{name}/archive`

Archives an application that is not running; it leaves the default list and keeps its data. Needs `application.delete`.

**Operation ID:** `archive_application`

**Needs:** `application.delete`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications/shop/archive" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/applications/{name}/deployments`

Deploys the design: saves it as a new revision and queues the planned changes. Refuses the whole deployment if any module conflicts with an existing instance. Needs `deploy`.

**Operation ID:** `deploy_application`

**Needs:** `deploy`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |
| `Idempotency-Key` | header | string | no | Makes the request safe to repeat |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `connections` | list of object | no | The design's connections; enforced when the control plane has a network uplink. |
| `document` | object | yes | The Studio document, saved as an immutable revision. Ignored when `version` is given. |
| `modules` | list of object | yes | — |
| `project` | string | yes | — |
| `published` | list of object | no | Ports reachable from outside the application (needs connections to be enforced). |
| `removeMissing` | boolean | no | Also delete the application's instances that are no longer in the design. |
| `version` | integer | no | Deploy this published version (its stored document) instead of saving `document` as a new revision. Drafts can never be deployed. |

```json
{
  "project": "apelora",
  "document": {},
  "modules": [
    {
      "module": "example",
      "spec": {
        "kind": "container",
        "name": "example",
        "project": "apelora",
        "source": {
          "alias": "example",
          "protocol": "simplestreams",
          "server": "example",
          "fingerprint": "example"
        },
        "architectures": [
          "example"
        ],
        "config": {
          "key": "example"
        },
        "network": {
          "acl": "example",
          "network": "example",
          "uplink": "example"
        },
        "owner": {
          "application": "example",
          "module": "example",
          "replica": 0
        },
        "profiles": [
          "example"
        ],
        "rootPool": "example",
        "start": false,
        "volumes": [
          {
            "name": "example",
            "sizeMib": 0,
            "class": "data-local",
            "content": "filesystem",
            "path": "example",
            "pool": "example"
          }
        ]
      },
      "availability": "stateless",
      "guestOs": "linux",
      "internet": "none",
      "readiness": {
        "command": [
          "example"
        ],
        "timeoutSecs": 0
      },
      "replicas": 0
    }
  ]
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
  --data-raw '{"project":"apelora","document":{},"modules":[{"module":"example","spec":{"kind":"container","name":"example","project":"apelora","source":{"alias":"example","protocol":"simplestreams","server":"example","fingerprint":"example"},"architectures":["example"],"config":{"key":"example"},"network":{"acl":"example","network":"example","uplink":"example"},"owner":{"application":"example","module":"example","replica":0},"profiles":["example"],"rootPool":"example","start":false,"volumes":[{"name":"example","sizeMib":0,"class":"data-local","content":"filesystem","path":"example","pool":"example"}]},"availability":"stateless","guestOs":"linux","internet":"none","readiness":{"command":["example"],"timeoutSecs":0},"replicas":0}]}'
```

**Response `202`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "application": "example",
  "jobs": [
    {
      "action": "create",
      "instance": "example",
      "jobId": "00000000-0000-4000-8000-000000000001",
      "module": "example"
    }
  ],
  "plan": {
    "items": [
      {
        "action": "create",
        "instance": "example",
        "module": "example",
        "reason": "example",
        "replica": 0,
        "changes": [
          {
            "key": "example",
            "from": "example",
            "to": "example"
          }
        ]
      }
    ],
    "warnings": [
      "example"
    ],
    "quota": {
      "adding": {
        "cpu": 1,
        "diskBytes": 1,
        "instances": 1,
        "memoryBytes": 1
      },
      "allowed": false,
      "scopes": [
        {
          "dimensions": [
            {
              "adding": 1,
              "dimension": "instances",
              "exceeded": false,
              "limit": 1,
              "used": 1
            }
          ],
          "id": "example",
          "kind": "organization",
          "name": "example"
        }
      ]
    }
  },
  "revision": 1,
  "networkJob": "00000000-0000-4000-8000-000000000001"
}
```

**Errors:** `400`, `401`, `403`, `409`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/applications/{name}/draft`

The application's working document. 404 when it has none yet. Needs `application.view`.

**Operation ID:** `application_draft`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/draft" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "document": {},
  "updatedAt": "2026-01-01T09:00:00Z",
  "updatedBy": "example",
  "validationErrors": [
    "example"
  ],
  "version": 1
}
```

**Errors:** `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `PUT /api/v1/applications/{name}/draft`

Saves the draft as the next version. Refused with 409 `draft_conflict` (and the current version) when someone saved since `baseVersion`; nothing is overwritten. Needs `application.design`.

**Operation ID:** `save_application_draft`

**Needs:** `application.design`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `baseVersion` | integer | no | The draft version this edit started from; omit only for the first save. |
| `document` | object | yes | — |

```json
{
  "document": {}
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/applications/shop/draft" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"document":{}}'
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "document": {},
  "updatedAt": "2026-01-01T09:00:00Z",
  "updatedBy": "example",
  "validationErrors": [
    "example"
  ],
  "version": 1
}
```

**Errors:** `400`, `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/applications/{name}/events`

What happened to the application: creation, saves, versions, deployments, operations, refusals. Needs `application.view`.

**Operation ID:** `application_events`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/events" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "items": [
    {
      "action": "example",
      "actor": "example",
      "actorType": "example",
      "at": "2026-01-01T09:00:00Z",
      "detail": {},
      "id": 1,
      "outcome": "example",
      "target": "example",
      "actorName": "example",
      "scope": {}
    }
  ]
}
```

**Errors:** `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/applications/{name}/migration`

Dry run of migrating the application to another server: for each instance whether it keeps running, what is copied and what blocks it. Changes nothing. Needs `application.operate`.

**Operation ID:** `preview_application_migration`

**Needs:** `application.operate`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |
| `target` | query | string | yes | The server to move the application to. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/migration?target=example" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "items": [
    {
      "alreadyThere": false,
      "blocked": [
        "example"
      ],
      "copyMib": 0,
      "from": "example",
      "instance": "example",
      "live": false,
      "module": "example",
      "notes": [
        "example"
      ],
      "stops": false
    }
  ],
  "possible": false,
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  },
  "stops": [
    "example"
  ],
  "target": "example"
}
```

**Errors:** `400`, `403`, `404`, `409`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/applications/{name}/operations`

Recent operations of the application, newest first. Needs `application.view`.

**Operation ID:** `application_operations`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/operations" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "items": [
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
  ]
}
```

**Errors:** `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/applications/{name}/operations`

Starts, shuts down (graceful), stops (immediate), restarts or migrates the application's instances, in dependency order where that matters, as an asynchronous operation. Succeeds only when Incus confirms each instance's state (and, for a migration, its new server). Needs `application.operate` on the application. It only touches instances this application owns; networks, volumes, data and other applications are left alone.

**Operation ID:** `operate_application`

**Needs:** `application.operate` on the application.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |
| `Idempotency-Key` | header | string | no | Makes the request safe to repeat |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `action` | `start`, `stop`, `shutdown`, `restart`, `migrate` | yes | — |
| `confirmDisruption` | boolean | no | Required to stop or restart an application that has single-instance or stateful modules: it acknowledges that their clients lose service meanwhile. |
| `target` | string | no | The server to move the application to. Needed for `migrate`, ignored otherwise. |

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

**Response `202`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

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

**Errors:** `400`, `403`, `404`, `409`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/applications/{name}/operations/{id}`

One operation with the progress of each phase and instance. Needs `application.view`.

**Operation ID:** `application_operation`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |
| `id` | path | string | yes | Operation id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/operations/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

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

**Errors:** `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/applications/{name}/plan`

What deploying the design would change, without changing anything. Needs `deploy`.

**Operation ID:** `plan_application`

**Needs:** `deploy`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `connections` | list of object | no | The design's connections; enforced when the control plane has a network uplink. |
| `modules` | list of object | yes | — |
| `project` | string | yes | — |
| `published` | list of object | no | Ports reachable from outside the application (needs connections to be enforced). |

```json
{
  "project": "apelora",
  "modules": [
    {
      "module": "example",
      "spec": {
        "kind": "container",
        "name": "example",
        "project": "apelora",
        "source": {
          "alias": "example",
          "protocol": "simplestreams",
          "server": "example",
          "fingerprint": "example"
        },
        "architectures": [
          "example"
        ],
        "config": {
          "key": "example"
        },
        "network": {
          "acl": "example",
          "network": "example",
          "uplink": "example"
        },
        "owner": {
          "application": "example",
          "module": "example",
          "replica": 0
        },
        "profiles": [
          "example"
        ],
        "rootPool": "example",
        "start": false,
        "volumes": [
          {
            "name": "example",
            "sizeMib": 0,
            "class": "data-local",
            "content": "filesystem",
            "path": "example",
            "pool": "example"
          }
        ]
      },
      "availability": "stateless",
      "guestOs": "linux",
      "internet": "none",
      "readiness": {
        "command": [
          "example"
        ],
        "timeoutSecs": 0
      },
      "replicas": 0
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
  --data-raw '{"project":"apelora","modules":[{"module":"example","spec":{"kind":"container","name":"example","project":"apelora","source":{"alias":"example","protocol":"simplestreams","server":"example","fingerprint":"example"},"architectures":["example"],"config":{"key":"example"},"network":{"acl":"example","network":"example","uplink":"example"},"owner":{"application":"example","module":"example","replica":0},"profiles":["example"],"rootPool":"example","start":false,"volumes":[{"name":"example","sizeMib":0,"class":"data-local","content":"filesystem","path":"example","pool":"example"}]},"availability":"stateless","guestOs":"linux","internet":"none","readiness":{"command":["example"],"timeoutSecs":0},"replicas":0}]}'
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "items": [
    {
      "action": "create",
      "instance": "example",
      "module": "example",
      "reason": "example",
      "replica": 0,
      "changes": [
        {
          "key": "example",
          "from": "example",
          "to": "example"
        }
      ]
    }
  ],
  "warnings": [
    "example"
  ],
  "quota": {
    "adding": {
      "cpu": 1,
      "diskBytes": 1,
      "instances": 1,
      "memoryBytes": 1
    },
    "allowed": false,
    "scopes": [
      {
        "dimensions": [
          {
            "adding": 1,
            "dimension": "instances",
            "exceeded": false,
            "limit": 1,
            "used": 1
          }
        ],
        "id": "example",
        "kind": "organization",
        "name": "example"
      }
    ]
  }
}
```

**Errors:** `400`, `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/applications/{name}/restore`

Brings an archived application back. Needs `application.delete`.

**Operation ID:** `restore_application`

**Needs:** `application.delete`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications/shop/restore" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `403`, `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/applications/{name}/status`

The application's instances as Incus reports them, by module. Needs `read-inventory`.

**Operation ID:** `application_status`

**Needs:** `read-inventory`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |
| `project` | query | string | no | Only this Incus project. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/status" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "items": [
    {
      "instance": "example",
      "location": "example",
      "module": "example",
      "project": "apelora",
      "status": "example",
      "health": {
        "detail": "example",
        "health": "unknown",
        "since": "example",
        "restartedAt": "2026-01-01T09:00:00Z"
      }
    }
  ],
  "services": [
    {
      "address": "example",
      "module": "example",
      "project": "apelora"
    }
  ],
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  }
}
```

**Errors:** `400`, `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/applications/{name}/versions`

Versions of the application, newest first. Needs `application.view`.

**Operation ID:** `application_versions`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/versions" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "items": [
    {
      "createdAt": "2026-01-01T09:00:00Z",
      "createdBy": "example",
      "published": false,
      "revision": 1,
      "draftVersion": 1,
      "label": "example"
    }
  ]
}
```

**Errors:** `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/applications/{name}/versions`

Releases the current draft as the next immutable published version. Refused while the draft is invalid or when this draft version is already published. Needs `application.design`.

**Operation ID:** `publish_application`

**Needs:** `application.design`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `label` | string | no | A short name for the version, e.g. `after load test`. |

```json
{
  "label": "example"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications/shop/versions" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"label":"example"}'
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "createdAt": "2026-01-01T09:00:00Z",
  "createdBy": "example",
  "published": false,
  "revision": 1,
  "draftVersion": 1,
  "label": "example"
}
```

**Errors:** `403`, `404`, `409`, `422`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/applications/{name}/versions/{revision}`

The document of one version. Needs `application.view`.

**Operation ID:** `application_version`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |
| `revision` | path | integer | yes | Version number |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/versions/1" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "document": {},
  "published": false
}
```

**Errors:** `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/applications/{name}/volumes`

The application's volumes, with what Incus says about each now. Needs `application.view`.

**Operation ID:** `application_volumes`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/volumes" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "items": [
    {
      "class": "example",
      "content": "example",
      "createdAt": "2026-01-01T09:00:00Z",
      "incusName": "example",
      "instance": "example",
      "member": "example",
      "module": "example",
      "name": "example",
      "pool": "example",
      "sizeMib": 1,
      "state": "attached",
      "usedBy": [
        "example"
      ]
    }
  ],
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  }
}
```

**Errors:** `401`, `403`, `404`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `PATCH /api/v1/applications/{name}/volumes/{volume}`

Grows one of the application's volumes, also while its instance runs. Volumes only grow: a smaller size is refused. Needs `application.deploy`; audited.

**Operation ID:** `grow_application_volume`

**Needs:** `application.deploy`; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |
| `volume` | path | string | yes | The volume's Incus name |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `sizeMib` | integer | yes | The new size in MiB; at least the current one (volumes only grow). |

```json
{
  "sizeMib": 0
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PATCH "$APELORA_URL/api/v1/applications/shop/volumes/example" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  --data-raw '{"sizeMib":0}'
```

**Response `204`** — Success, with no body.

**Errors:** `400`, `401`, `403`, `404`, `409`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/applications/{name}/volumes/{volume}`

Deletes one of the application's volumes and its snapshots, for good. The volume's Incus name must be typed again; refused while an instance uses it. Needs `application.delete` (and an approval where the policy asks for one); audited.

**Operation ID:** `delete_application_volume`

**Needs:** `application.delete` (and an approval where the policy asks for one); audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |
| `volume` | path | string | yes | The volume's Incus name |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The volume's Incus name again, typed by the person deleting it. |

```json
{
  "confirm": "example"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/applications/shop/volumes/example" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"example"}'
```

**Response `204`** — Success, with no body.

**Errors:** `400`, `401`, `403`, `404`, `409`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/applications/{name}/volumes/{volume}/backups`

The volume's backups, oldest first, whether each still exists, and its schedules. Needs `application.view`.

**Operation ID:** `volume_backups`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |
| `volume` | path | string | yes | The volume's Incus name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/volumes/example/backups" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "items": [
    {
      "member": "example",
      "name": "example",
      "pool": "example",
      "scheduled": false,
      "sizeMib": 1,
      "takenAt": "2026-01-01T09:00:00Z",
      "beforeRestore": "00000000-0000-4000-8000-000000000001",
      "present": false
    }
  ],
  "schedules": {
    "backups": {
      "everyMinutes": 1,
      "keep": 1,
      "error": "example",
      "lastRunAt": "2026-01-01T09:00:00Z"
    },
    "snapshots": {
      "everyMinutes": 1,
      "keep": 1,
      "error": "example",
      "lastRunAt": "2026-01-01T09:00:00Z"
    }
  },
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  },
  "backupPool": "example"
}
```

**Errors:** `401`, `403`, `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/applications/{name}/volumes/{volume}/backups`

Backs the volume up now: a copy, through a short-lived snapshot, into the backup pool on another member. Kept until someone deletes it (`delete_backup`); scheduled backups are pruned to what the schedule keeps. Queues a `volume.backup` job. Needs `application.operate`; audited.

**Operation ID:** `back_up_volume`

**Needs:** `application.operate`; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |
| `volume` | path | string | yes | The volume's Incus name |
| `Idempotency-Key` | header | string | no | Makes the request safe to repeat |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
# Generate once per distinct change; keep this value when retrying.
IDEMPOTENCY_KEY=$(uuidgen)
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications/shop/volumes/example/backups" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY"
```

**Response `202`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "created": false,
  "jobId": "00000000-0000-4000-8000-000000000001"
}
```

**Errors:** `401`, `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/applications/{name}/volumes/{volume}/backups/{backup}`

Deletes one backup copy. The volume it was taken from is left as it is. The backup's Incus name must be typed again. A copy Incus no longer has is forgotten anyway, so a record of a missing copy can be cleared. Needs `application.delete` (and an approval where a policy asks for one); audited.

**Operation ID:** `delete_volume_backup`

**Needs:** `application.delete` (and an approval where a policy asks for one); audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name. |
| `volume` | path | string | yes | The volume's Incus name. |
| `backup` | path | string | yes | The backup's Incus name. |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The backup's Incus name again, typed by the person deleting it. |

```json
{
  "confirm": "example"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/applications/shop/volumes/example/backups/example" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"example"}'
```

**Response `204`** — Success, with no body.

**Errors:** `400`, `401`, `403`, `404`, `409`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/applications/{name}/volumes/{volume}/backups/{backup}/restore`

Dry run of restoring the volume from one of its backups: what is replaced (data written since the backup, the volume's snapshots), which instances must be stopped, where the safety backup goes, and the steps. Changes nothing. Needs `application.operate`.

**Operation ID:** `preview_volume_restore`

**Needs:** `application.operate`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name. |
| `volume` | path | string | yes | The volume's Incus name. |
| `backup` | path | string | yes | The backup's Incus name. |
| `safetyBackup` | query | boolean | no | Take a safety backup of the current data first (default true). |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/volumes/example/backups/example/restore" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "plan": {
    "backup": "example",
    "backupMember": "example",
    "backupPool": "example",
    "backupTakenAt": "2026-01-01T09:00:00Z",
    "blocked": [
      "example"
    ],
    "member": "example",
    "pool": "example",
    "running": [
      "example"
    ],
    "sizeMib": 0,
    "snapshotsDeleted": [
      "example"
    ],
    "steps": [
      "example"
    ],
    "usedBy": [
      "example"
    ],
    "volume": "example",
    "safetyBackupPool": "example"
  },
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  }
}
```

**Errors:** `401`, `403`, `404`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/applications/{name}/volumes/{volume}/backups/{backup}/restore`

Restores the volume from one of its backups, after the dry run passes again and the volume's name is typed: a safety backup of the current data first (unless declined), then the backup is copied over the volume. Every instance using it must be stopped; they stay stopped. Queues a `volume.restore` job. Needs `application.operate` (and an approval where a policy asks); audited with the job.

**Operation ID:** `restore_volume_backup`

**Needs:** `application.operate` (and an approval where a policy asks); audited with the job.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name. |
| `volume` | path | string | yes | The volume's Incus name. |
| `backup` | path | string | yes | The backup's Incus name. |
| `Idempotency-Key` | header | string | no | Makes the request safe to repeat |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The volume's Incus name again, typed by the person restoring it. |
| `safetyBackup` | boolean | no | Take a safety backup of the current data first (default true). |

```json
{
  "confirm": "example"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
# Generate once per distinct change; keep this value when retrying.
IDEMPOTENCY_KEY=$(uuidgen)
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications/shop/volumes/example/backups/example/restore" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Idempotency-Key: $IDEMPOTENCY_KEY" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"example"}'
```

**Response `202`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "created": false,
  "jobId": "00000000-0000-4000-8000-000000000001"
}
```

**Errors:** `400`, `401`, `403`, `404`, `409`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `PUT /api/v1/applications/{name}/volumes/{volume}/schedules`

Sets or turns off the volume's snapshot and backup schedules. A new or changed schedule first runs at the worker's next pass (within a minute). Needs `application.deploy`; audited.

**Operation ID:** `set_volume_schedules`

**Needs:** `application.deploy`; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |
| `volume` | path | string | yes | The volume's Incus name |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `backups` | one of several | no | — |
| `snapshots` | one of several | no | — |

```json
{
  "backups": {
    "everyMinutes": 0,
    "keep": 0
  }
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/applications/shop/volumes/example/schedules" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  --data-raw '{"backups":{"everyMinutes":0,"keep":0}}'
```

**Response `204`** — Success, with no body.

**Errors:** `400`, `401`, `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/applications/{name}/volumes/{volume}/snapshots`

The volume's snapshots, oldest first. Needs `application.view`.

**Operation ID:** `volume_snapshots`

**Needs:** `application.view`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |
| `volume` | path | string | yes | The volume's Incus name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/applications/shop/volumes/example/snapshots" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "items": [
    {
      "createdAt": "2026-01-01T09:00:00Z",
      "name": "example"
    }
  ],
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  }
}
```

**Errors:** `401`, `403`, `404`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/applications/{name}/volumes/{volume}/snapshots`

Takes a snapshot of the volume, named after the time (`snap-YYYYMMDD-HHMMSS`). While an instance runs the snapshot is only crash-consistent; the response says which. Snapshots are not backups: they live in the same pool. Needs `application.operate`; audited.

**Operation ID:** `take_volume_snapshot`

**Needs:** `application.operate`; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name |
| `volume` | path | string | yes | The volume's Incus name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications/shop/volumes/example/snapshots" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "consistency": "example",
  "name": "example"
}
```

**Errors:** `401`, `403`, `404`, `409`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/applications/{name}/volumes/{volume}/snapshots/{snapshot}`

Deletes one snapshot of the volume. Needs `application.delete`; audited.

**Operation ID:** `delete_volume_snapshot`

**Needs:** `application.delete`; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name. |
| `volume` | path | string | yes | The volume's Incus name. |
| `snapshot` | path | string | yes | Snapshot name. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/applications/shop/volumes/example/snapshots/example" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `401`, `403`, `404`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/applications/{name}/volumes/{volume}/snapshots/{snapshot}/restore`

Puts the volume back to a snapshot: everything written since is lost. The snapshot's name must be typed again, and every instance using the volume must be stopped. Needs `application.operate` (and an approval where the policy asks for one); audited.

**Operation ID:** `restore_volume_snapshot`

**Needs:** `application.operate` (and an approval where the policy asks for one); audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Application name. |
| `volume` | path | string | yes | The volume's Incus name. |
| `snapshot` | path | string | yes | Snapshot name. |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The snapshot's name again, typed by the person restoring it. |

```json
{
  "confirm": "example"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/applications/shop/volumes/example/snapshots/example/restore" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"example"}'
```

**Response `204`** — Success, with no body.

**Errors:** `400`, `401`, `403`, `404`, `409`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

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

**Response `200`** — Success.

Content-Type: `application/json`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-23T22:12:58.318844Z"
  },
  "incusError": null,
  "items": []
}
```

**Errors:** `401`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

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

**Response `200`** — Success.

Content-Type: `application/json`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-23T22:12:58.349853Z"
  },
  "backupPool": null,
  "incusError": null,
  "items": []
}
```

**Errors:** `401`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

