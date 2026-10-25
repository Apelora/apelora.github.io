---
title: Inventory API
section: api
slug: inventory
order: 2
label: Inventory
source: packages/api-client/openapi.json
summary: Servers, instances, networks, storage, jobs and preflight.
---
What exists in the cluster, as Incus reports it: instances, networks, storage pools, jobs, preflight and capacity. This page lists 14 operations.

Set variables in the [API overview](/docs/api/overview/). Download [OpenAPI](/assets/api/openapi.json).

## Operations

| Operation | What it does |
|---|---|
| [`GET /api/v1/capacity`](#get-apiv1capacity) | How much CPU, memory and volume space the cluster has free, per server and in total, for comparing with a design. |
| [`GET /api/v1/cluster`](#get-apiv1cluster) | The Incus server and its cluster members. |
| [`GET /api/v1/instances`](#get-apiv1instances) | Instances in all projects. |
| [`GET /api/v1/instances/{project}/{name}`](#get-apiv1instancesprojectname) | The instance with the application it belongs to, its recent jobs, and what the caller may do (Start, Stop, Restart, Move and Delete go through the existing instance routes and jobs). |
| [`GET /api/v1/instances/{project}/{name}/console-log`](#get-apiv1instancesprojectnameconsole-log) | The end of the instance's console log (`tailKib`, default 64, at most 1024). |
| [`GET /api/v1/instances/{project}/{name}/logs`](#get-apiv1instancesprojectnamelogs) | The instance's log files as Incus lists them (names only). |
| [`GET /api/v1/instances/{project}/{name}/logs/{file}`](#get-apiv1instancesprojectnamelogsfile) | The end of one of the instance's log files (`tailKib`, default 64, at most 1024). |
| [`GET /api/v1/networks`](#get-apiv1networks) | Networks in all projects. |
| [`GET /api/v1/networks/settings`](#get-apiv1networkssettings) | The network settings in effect: Apelora's uplink and service range, each deploy project's network limits, and the uplink as Incus reports it (with the administrator identity, when configured), with what does not fit together. |
| [`GET /api/v1/preflight`](#get-apiv1preflight) | Read-only readiness checks of the Incus server or cluster, of the projects Apelora deploys into, and of the image mirrors (whether each image server the catalog uses is mirrored and whether the mirrors answer). |
| [`GET /api/v1/projects`](#get-apiv1projects) | Incus projects. |
| [`GET /api/v1/storage-pools`](#get-apiv1storage-pools) | Storage pools. |
| [`GET /api/v1/storage/orphans`](#get-apiv1storageorphans) | Custom volumes in Apelora's projects that no application volume or backup record refers to, in every pool, with their size. |
| [`GET /api/v1/storage/pools`](#get-apiv1storagepools) | Storage pools with how full each is, per member and in total (read from each member's state, like the Health page). |

## Details

### `GET /api/v1/capacity`

How much CPU, memory and volume space the cluster has free, per server and in total, for comparing with a design. Read-only. With `cluster.view` servers are named; with `capacity.view` (held by designers and operators at any scope) they are numbered.

**Operation ID:** `capacity`

**Needs:** a signed-in caller; the server decides what that caller may see.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/capacity" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-25T15:45:26.308625Z"
  },
  "named": true,
  "volumePool": null,
  "volumePoolShared": false,
  "servers": [
    {
      "label": "mock-member-01",
      "acceptsModules": true,
      "reason": null,
      "architecture": "x86_64",
      "cpuThreads": 8,
      "load": 0.6,
      "memory": {
        "usedBytes": 9663676416,
        "totalBytes": 34359738368
      },
      "volumePool": null
    },
    {
      "label": "mock-member-02",
      "acceptsModules": true,
      "reason": null,
      "architecture": "x86_64",
      "cpuThreads": 8,
      "load": 1.4,
      "memory": {
        "usedBytes": 13958643712,
        "totalBytes": 34359738368
      },
      "volumePool": null
    },
    {
      "label": "mock-member-03",
      "acceptsModules": true,
      "reason": null,
      "architecture": "x86_64",
      "cpuThreads": 8,
      "load": 0.3,
      "memory": {
        "usedBytes": 6442450944,
        "totalBytes": 34359738368
      },
      "volumePool": null
    }
  ],
  "totals": {
    "serversAccepting": 3,
    "cpuThreads": 24,
    "memoryFreeBytes": 73014444032,
    "memoryTotalBytes": 103079215104,
    "volumePoolFreeBytes": null
  }
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/cluster`

The Incus server and its cluster members. Needs `read-inventory`.

**Operation ID:** `cluster`

**Needs:** `read-inventory`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/cluster" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-25T15:45:26.31024Z"
  },
  "server": {
    "apiVersion": "1.0",
    "serverVersion": null,
    "kernelVersion": null,
    "apiExtensions": [],
    "architectures": [
      "x86_64"
    ],
    "clustered": true,
    "auth": "mock"
  },
  "members": [
    {
      "name": "mock-member-01",
      "url": "https://mock-member-01.invalid:8443",
      "roles": [
        "database-leader",
        "database"
      ],
      "status": "Online",
      "message": "Fully operational",
      "architecture": "x86_64",
      "failureDomain": "default",
      "database": true,
      "groups": [
        "default"
      ],
      "scheduler": "all"
    },
    {
      "name": "mock-member-02",
      "url": "https://mock-member-02.invalid:8443",
      "roles": [
        "database"
      ],
      "status": "Online",
      "message": "Fully operational",
      "architecture": "x86_64",
      "failureDomain": "default",
      "database": true,
      "groups": [
        "default"
      ],
      "scheduler": "all"
    },
    {
      "name": "mock-member-03",
      "url": "https://mock-member-03.invalid:8443",
      "roles": [
        "database"
      ],
      "status": "Online",
      "message": "Fully operational",
      "architecture": "x86_64",
      "failureDomain": "default",
      "database": true,
      "groups": [
        "default"
      ],
      "scheduler": "all"
    }
  ]
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/instances`

Instances in all projects. Needs `read-inventory`.

**Operation ID:** `instances`

**Needs:** `read-inventory`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/instances" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-25T15:45:26.430566Z"
  },
  "items": [
    {
      "name": "mock-web-01",
      "project": "default",
      "kind": "container",
      "status": "Running",
      "location": "mock-member-01",
      "architecture": "x86_64",
      "description": "mock data",
      "managed": false
    },
    {
      "name": "mock-web-02",
      "project": "default",
      "kind": "container",
      "status": "Running",
      "location": "mock-member-02",
      "architecture": "x86_64",
      "description": "mock data",
      "managed": false
    },
    {
      "name": "mock-db-01",
      "project": "default",
      "kind": "container",
      "status": "Running",
      "location": "mock-member-03",
      "architecture": "x86_64",
      "description": "mock data",
      "managed": false
    },
    {
      "name": "mock-vm-01",
      "project": "default",
      "kind": "virtual-machine",
      "status": "Running",
      "location": "mock-member-02",
      "architecture": "x86_64",
      "description": "mock data",
      "managed": false
    }
  ]
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/instances/{project}/{name}`

The instance with the application it belongs to, its recent jobs, and what the caller may do (Start, Stop, Restart, Move and Delete go through the existing instance routes and jobs).

**Operation ID:** `instance_page`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `project` | path | string | yes | Incus project. |
| `name` | path | string | yes | Instance name. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/instances/apelora/shop" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

```json
{
  "actions": {
    "delete": {
      "allowed": false,
      "reason": "example"
    },
    "logs": {
      "allowed": false,
      "reason": "example"
    },
    "move": {
      "allowed": false,
      "reason": "example"
    },
    "restart": {
      "allowed": false,
      "reason": "example"
    },
    "start": {
      "allowed": false,
      "reason": "example"
    },
    "stop": {
      "allowed": false,
      "reason": "example"
    }
  },
  "instance": {
    "addresses": [
      {
        "address": "example",
        "family": "example",
        "interface": "example",
        "netmask": "example",
        "scope": "example"
      }
    ],
    "architecture": "example",
    "description": "A description",
    "disks": [
      {
        "device": "example",
        "path": "example",
        "pool": "example",
        "size": "example",
        "volume": "example"
      }
    ],
    "image": {
      "description": "A description",
      "fingerprint": "example",
      "os": "example",
      "release": "example"
    },
    "kind": "container",
    "limits": {
      "cpu": "example",
      "memory": "example",
      "rootDisk": "example"
    },
    "location": "example",
    "managed": false,
    "name": "example",
    "profiles": [
      "example"
    ],
    "project": "apelora",
    "snapshots": [
      {
        "name": "example",
        "stateful": false,
        "createdAt": "2026-01-01T09:00:00Z",
        "expiresAt": "2026-01-01T09:00:00Z"
      }
    ],
    "status": "example",
    "createdAt": "2026-01-01T09:00:00Z",
    "lastUsedAt": "2026-01-01T09:00:00Z",
    "owner": {
      "application": "example",
      "module": "example",
      "replica": 0
    },
    "startedAt": "2026-01-01T09:00:00Z",
    "usage": {
      "cpuNs": 1,
      "memoryBytes": 1,
      "memoryPeakBytes": 1,
      "memoryTotalBytes": 1,
      "processes": 1,
      "rootDiskBytes": 1
    }
  },
  "jobs": [
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
      "lastError": "example",
      "queuedBy": "example",
      "requestId": "example",
      "retriedBy": "00000000-0000-4000-8000-000000000001",
      "retryOf": "00000000-0000-4000-8000-000000000001"
    }
  ],
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  },
  "application": "example"
}
```

**Errors:** `400`, `401`, `403`, `404`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/instances/{project}/{name}/console-log`

The end of the instance's console log (`tailKib`, default 64, at most 1024).

**Operation ID:** `instance_console_log`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `project` | path | string | yes | Incus project. |
| `name` | path | string | yes | Instance name. |
| `tailKib` | query | integer | no | How many KiB from the end of the log (1–1024, default 64). |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/instances/apelora/shop/console-log" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

```json
{
  "file": "example",
  "log": {
    "content": "example",
    "size": 0,
    "truncated": false
  },
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  },
  "tailKib": 0
}
```

**Errors:** `400`, `401`, `403`, `404`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/instances/{project}/{name}/logs`

The instance's log files as Incus lists them (names only).

**Operation ID:** `instance_logs`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `project` | path | string | yes | Incus project. |
| `name` | path | string | yes | Instance name. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/instances/apelora/shop/logs" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

```json
{
  "files": [
    "example"
  ],
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  }
}
```

**Errors:** `400`, `401`, `403`, `404`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/instances/{project}/{name}/logs/{file}`

The end of one of the instance's log files (`tailKib`, default 64, at most 1024).

**Operation ID:** `instance_log`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `project` | path | string | yes | Incus project. |
| `name` | path | string | yes | Instance name. |
| `file` | path | string | yes | Log file name, as listed. |
| `tailKib` | query | integer | no | How many KiB from the end of the log (1–1024, default 64). |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/instances/apelora/shop/logs/example" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

```json
{
  "file": "example",
  "log": {
    "content": "example",
    "size": 0,
    "truncated": false
  },
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  },
  "tailKib": 0
}
```

**Errors:** `400`, `401`, `403`, `404`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/networks`

Networks in all projects. Needs `read-inventory`.

**Operation ID:** `networks`

**Needs:** `read-inventory`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/networks" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-25T15:45:26.444982Z"
  },
  "items": [
    {
      "name": "mock-br0",
      "project": "default",
      "kind": "bridge",
      "managed": true,
      "status": "Created",
      "description": "mock data",
      "locations": [
        "mock-member-01",
        "mock-member-02",
        "mock-member-03"
      ]
    }
  ]
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/networks/settings`

The network settings in effect: Apelora's uplink and service range, each deploy project's network limits, and the uplink as Incus reports it (with the administrator identity, when configured), with what does not fit together. Read-only. Needs `cluster.view`.

**Operation ID:** `network_settings`

**Needs:** `cluster.view`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/networks/settings" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-25T15:45:26.449917Z"
  },
  "uplink": null,
  "serviceRange": null,
  "serviceAddressesUsed": 0,
  "serviceAddressesTotal": null,
  "projects": [
    {
      "project": "apelora",
      "found": true,
      "restricted": true,
      "ownNetworks": true,
      "uplinks": [
        "mock-br0"
      ],
      "subnets": [
        "mock-br0:198.18.100.0/28"
      ]
    },
    {
      "project": "docs-org-docs-project-development",
      "found": false,
      "restricted": false,
      "ownNetworks": false,
      "uplinks": [],
      "subnets": []
    }
  ],
  "uplinkObserved": null,
  "uplinkNote": null,
  "findings": [
    {
      "severity": "warn",
      "message": "Project docs-org-docs-project-development does not exist in Incus or is not visible to the deploy identity"
    },
    {
      "severity": "info",
      "message": "No uplink is set (APELORA_NETWORK_UPLINK): connections are not enforced and instances share their project's network"
    }
  ]
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/preflight`

Read-only readiness checks of the Incus server or cluster, of the projects Apelora deploys into, and of the image mirrors (whether each image server the catalog uses is mirrored and whether the mirrors answer). Changes nothing. Needs `read-inventory`.

**Operation ID:** `preflight`

**Needs:** `read-inventory`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/preflight" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-25T15:45:26.451277Z"
  },
  "overall": "fail",
  "checks": [
    {
      "id": "incus-version",
      "title": "Incus version",
      "status": "not-checked",
      "detail": "the server did not report its version"
    },
    {
      "id": "kernel-version",
      "title": "Kernel version",
      "status": "not-checked",
      "detail": "the server did not report its kernel"
    },
    {
      "id": "api-extensions",
      "title": "Required API extensions",
      "status": "fail",
      "detail": "missing: instance_create_start, operation_wait"
    },
    {
      "id": "oci",
      "title": "OCI application containers",
      "status": "warn",
      "detail": "instance_oci is missing; OCI modules cannot be deployed"
    },
    {
      "id": "members",
      "title": "Cluster members",
      "status": "pass",
      "detail": "3 online"
    },
    {
      "id": "project-apelora",
      "title": "Project apelora",
      "status": "pass",
      "detail": "exists and is restricted"
    },
    {
      "id": "storage",
      "title": "Storage pools",
      "status": "pass",
      "detail": "mock-local"
    },
    {
      "id": "volume-pool",
      "title": "Pool for volumes",
      "status": "warn",
      "detail": "none configured (APELORA_VOLUME_POOL): designs with volumes are refused"
    },
    {
      "id": "network",
      "title": "Managed networks",
      "status": "pass",
      "detail": "mock-br0"
    },
    {
      "id": "clock",
      "title": "Clock agreement between members",
      "status": "not-checked",
      "detail": "not measurable through the Incus API; check on the members"
    },
    {
      "id": "latency",
      "title": "Latency between members (≤ 10 ms)",
      "status": "not-checked",
      "detail": "not measurable through the Incus API; check on the members"
    },
    {
      "id": "image-mirrors",
      "title": "Image mirrors",
      "status": "warn",
      "detail": "none configured, so the catalog's 2 image servers are used directly. Fine with internet access; without it, set APELORA_IMAGE_MIRRORS and APELORA_IMAGE_SERVERS=mirrors-only"
    }
  ]
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/projects`

Incus projects. Needs `read-inventory`.

**Operation ID:** `projects`

**Needs:** `read-inventory`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/projects" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-25T15:45:26.452763Z"
  },
  "items": [
    {
      "name": "default",
      "description": "mock data",
      "restricted": false
    },
    {
      "name": "apelora",
      "description": "mock data",
      "restricted": true
    }
  ]
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/storage-pools`

Storage pools. Needs `read-inventory`.

**Operation ID:** `storage_pools`

**Needs:** `read-inventory`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/storage-pools" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-25T15:45:26.461592Z"
  },
  "items": [
    {
      "name": "mock-local",
      "driver": "zfs",
      "status": "Created",
      "description": "mock data",
      "locations": [
        "mock-member-01",
        "mock-member-02",
        "mock-member-03"
      ]
    }
  ]
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/storage/orphans`

Custom volumes in Apelora's projects that no application volume or backup record refers to, in every pool, with their size. Read-only: deleting one is a decision made in Incus or, for a kept application volume, on the application. Needs `cluster.view`.

**Operation ID:** `orphan_volumes`

**Needs:** `cluster.view`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/storage/orphans" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-25T15:45:26.465035Z"
  },
  "projects": [
    "apelora",
    "docs-org-docs-project-development"
  ],
  "items": []
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/storage/pools`

Storage pools with how full each is, per member and in total (read from each member's state, like the Health page). Read-only. Needs `cluster.view`.

**Operation ID:** `storage_pool_usage`

**Needs:** `cluster.view`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/storage/pools" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-25T15:45:26.466287Z"
  },
  "volumePool": null,
  "backupPool": null,
  "items": [
    {
      "name": "mock-local",
      "driver": "zfs",
      "status": "Created",
      "description": "mock data",
      "shared": false,
      "role": null,
      "members": [
        {
          "member": "mock-member-01",
          "usedBytes": 128849018880,
          "totalBytes": 536870912000
        },
        {
          "member": "mock-member-02",
          "usedBytes": 225485783040,
          "totalBytes": 536870912000
        },
        {
          "member": "mock-member-03",
          "usedBytes": 85899345920,
          "totalBytes": 536870912000
        }
      ],
      "total": {
        "usedBytes": 440234147840,
        "totalBytes": 1610612736000
      },
      "unreadable": []
    }
  ]
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

