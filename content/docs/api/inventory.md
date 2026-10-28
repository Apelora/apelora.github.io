---
title: Inventory API
section: api
slug: inventory
order: 2
label: Inventory
source: packages/api-client/openapi.json
summary: Servers, instances and logs, networks, storage, capacity and preflight.
---
What exists in the cluster, as Incus reports it: servers and capacity, instances and their logs, Incus projects, networks, storage pools and volumes nobody owns, and preflight checks. This page lists 15 operations.

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
| [`GET /api/v1/networks/applications`](#get-apiv1networksapplications) | Each application the caller may view that has a recorded deployment: its network, the rules compiled from its design, its service and published addresses, and what Incus holds for each, with the differences. |
| [`GET /api/v1/networks/settings`](#get-apiv1networkssettings) | The network settings in effect: Apelora's uplink and service range, each deploy project's network limits, and the uplink as Incus reports it (with the administrator identity, when configured), with what does not fit together. |
| [`GET /api/v1/preflight`](#get-apiv1preflight) | Read-only readiness checks of the Incus server or cluster, of the projects Apelora deploys into, and of the image mirrors (whether each image server the catalog uses is mirrored and whether the mirrors answer). |
| [`GET /api/v1/projects`](#get-apiv1projects) | Incus projects. |
| [`GET /api/v1/storage/orphans`](#get-apiv1storageorphans) | Custom volumes in Apelora's projects that no application volume or backup record refers to, in every pool, with their size. |
| [`GET /api/v1/storage/pools`](#get-apiv1storagepools) | Storage pools with how full each is, per member and in total (read from each member's state, like the Health page). |
| [`GET /api/v1/storage/volumes`](#get-apiv1storagevolumes) | Every application volume the caller may see, with what Incus reports, its schedules and how many backups it has. |

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

**TypeScript:**

```ts
const result = await client.request("capacity", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T22:51:27.761801Z"
  },
  "named": true,
  "volumePool": "mock-local",
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
      "volumePool": {
        "usedBytes": 128849018880,
        "totalBytes": 536870912000
      }
    },
    {
      "label": "mock-member-02",
      "acceptsModules": false,
      "reason": "It is Evacuated",
      "architecture": "x86_64",
      "cpuThreads": 8,
      "load": 1.4,
      "memory": {
        "usedBytes": 13958643712,
        "totalBytes": 34359738368
      },
      "volumePool": {
        "usedBytes": 225485783040,
        "totalBytes": 536870912000
      }
    }
  ],
  "totals": {
    "serversAccepting": 2,
    "cpuThreads": 16,
    "memoryFreeBytes": 52613349376,
    "memoryTotalBytes": 68719476736,
    "volumePoolFreeBytes": 858993459200
  }
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |

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

**TypeScript:**

```ts
const result = await client.request("cluster", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T22:51:27.765858Z"
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
      "status": "Evacuated",
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

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |

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

**TypeScript:**

```ts
const result = await client.request("instances", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T22:51:11.477831Z"
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

### `GET /api/v1/instances/{project}/{name}`

The instance with the application it belongs to, its recent jobs, and what the caller may do (Start, Stop, Restart, Move and Delete go through the existing instance routes and jobs).

**Operation ID:** `instance_page`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `project` | path | string | yes | — | Incus project. |
| `name` | path | string | yes | — | Instance name. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/instances/default/mock-web-01" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("instance_page", { params: { project: "default", name: "mock-web-01" } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T22:51:11.488017Z"
  },
  "instance": {
    "name": "mock-web-01",
    "project": "default",
    "kind": "container",
    "status": "Running",
    "location": "mock-member-01",
    "architecture": "x86_64",
    "description": "mock data",
    "managed": false,
    "createdAt": "2026-10-01T09:00:00Z",
    "lastUsedAt": "2026-10-20T08:00:00Z",
    "startedAt": "2026-10-20T08:00:00Z",
    "profiles": [
      "default"
    ],
    "image": {
      "description": "Mock image",
      "os": "Debian",
      "release": "13",
      "fingerprint": null
    },
    "limits": {
      "cpu": "2",
      "memory": "2GiB",
      "rootDisk": "10GiB"
    },
    "usage": {
      "cpuNs": 42000000000,
      "memoryBytes": 268435456,
      "memoryPeakBytes": 301989888,
      "memoryTotalBytes": 2147483648,
      "processes": 23,
      "rootDiskBytes": 1073741824
    },
    "addresses": [
      {
        "interface": "eth0",
        "family": "inet",
        "address": "10.0.0.10",
        "netmask": "24",
        "scope": "global"
      }
    ],
    "disks": [
      {
        "device": "root",
        "path": "/",
        "pool": "mock-local",
        "volume": null,
        "size": "10GiB"
      }
    ],
    "snapshots": []
  },
  "application": null,
  "jobs": [],
  "actions": {
    "start": {
      "allowed": false,
      "reason": "Not managed by Apelora: Apelora changes only instances it created."
    },
    "stop": {
      "allowed": false,
      "reason": "Not managed by Apelora: Apelora changes only instances it created."
    },
    "restart": {
      "allowed": false,
      "reason": "Not managed by Apelora: Apelora changes only instances it created."
    },
    "move": {
      "allowed": false,
      "reason": "Not managed by Apelora: Apelora changes only instances it created."
    },
    "delete": {
      "allowed": false,
      "reason": "Not managed by Apelora: Apelora changes only instances it created."
    },
    "logs": {
      "allowed": true,
      "reason": null
    }
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
| `503` | `database_not_configured` |

### `GET /api/v1/instances/{project}/{name}/console-log`

The end of the instance's console log (`tailKib`, default 64, at most 1024).

**Operation ID:** `instance_console_log`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `project` | path | string | yes | — | Incus project. |
| `name` | path | string | yes | — | Instance name. |
| `tailKib` | query | integer | no | `64` | How many KiB from the end of the log (1–1024, default 64). |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/instances/default/mock-vm-01/console-log" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**With options** (`tailKib`):

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/instances/default/mock-vm-01/console-log?tailKib=8" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("instance_console_log", { params: { project: "default", name: "mock-vm-01" }, query: { tailKib: 8 } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T22:51:11.501009Z"
  },
  "file": "console",
  "tailKib": 64,
  "log": {
    "content": "Mock · console of default/mock-vm-01; not read from Incus\nMock · mock-vm-01 reached its login prompt\n",
    "size": 103,
    "truncated": false
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
| `502` | an `incus_…` code |
| `503` | `database_not_configured` |

### `GET /api/v1/instances/{project}/{name}/logs`

The instance's log files as Incus lists them (names only).

**Operation ID:** `instance_logs`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `project` | path | string | yes | — | Incus project. |
| `name` | path | string | yes | — | Instance name. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/instances/default/mock-web-01/logs" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("instance_logs", { params: { project: "default", name: "mock-web-01" } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T22:51:11.491656Z"
  },
  "files": [
    "lxc.log"
  ]
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
| `502` | an `incus_…` code |
| `503` | `database_not_configured` |

### `GET /api/v1/instances/{project}/{name}/logs/{file}`

The end of one of the instance's log files (`tailKib`, default 64, at most 1024).

**Operation ID:** `instance_log`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `project` | path | string | yes | — | Incus project. |
| `name` | path | string | yes | — | Instance name. |
| `file` | path | string | yes | — | Log file name, as listed. |
| `tailKib` | query | integer | no | `64` | How many KiB from the end of the log (1–1024, default 64). |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/instances/default/mock-web-01/logs/lxc.log" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**With options** (`tailKib`):

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/instances/default/mock-web-01/logs/lxc.log?tailKib=16" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("instance_log", { params: { project: "default", name: "mock-web-01", file: "lxc.log" }, query: { tailKib: 16 } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T22:51:11.49457Z"
  },
  "file": "lxc.log",
  "tailKib": 64,
  "log": {
    "content": "Mock · fixture log of default/mock-web-01; not read from Incus\nMock · mock-web-01 is Running\n",
    "size": 95,
    "truncated": false
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
| `502` | an `incus_…` code |
| `503` | `database_not_configured` |

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

**TypeScript:**

```ts
const result = await client.request("networks", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T22:51:28.040733Z"
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

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
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

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T22:51:28.051683Z"
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
| `503` | `database_not_configured` |

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

**TypeScript:**

```ts
const result = await client.request("network_settings", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T22:51:28.059228Z"
  },
  "uplink": null,
  "serviceRange": null,
  "serviceAddressesUsed": 0,
  "serviceAddressesTotal": null,
  "projects": [
    {
      "project": "acme-shop-staging",
      "found": false,
      "restricted": false,
      "ownNetworks": false,
      "uplinks": [],
      "subnets": []
    },
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
    }
  ],
  "uplinkObserved": null,
  "uplinkNote": null,
  "findings": [
    {
      "severity": "warn",
      "message": "Project acme-shop-staging does not exist in Incus or is not visible to the deploy identity"
    },
    {
      "severity": "warn",
      "message": "Project shop-prod does not exist in Incus or is not visible to the deploy identity"
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

**TypeScript:**

```ts
const result = await client.request("preflight", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T22:51:28.064152Z"
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

### `GET /api/v1/projects`

Incus projects. Needs `read-inventory`.

**Operation ID:** `incus_projects`

**Needs:** `read-inventory`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/projects" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("incus_projects", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T22:51:28.068798Z"
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

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |

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

**TypeScript:**

```ts
const result = await client.request("orphan_volumes", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T22:51:28.129281Z"
  },
  "projects": [
    "acme-shop-staging",
    "apelora",
    "default",
    "shop-prod"
  ],
  "items": []
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |
| `503` | `database_not_configured` |

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

**TypeScript:**

```ts
const result = await client.request("storage_pool_usage", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T22:51:28.13845Z"
  },
  "volumePool": "mock-local",
  "backupPool": "mock-local",
  "items": [
    {
      "name": "mock-local",
      "driver": "zfs",
      "status": "Created",
      "description": "mock data",
      "shared": false,
      "role": "volumes",
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

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |

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

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T22:51:12.137388Z"
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
      "state": "attached",
      "usedBy": [
        "shop-cache-01"
      ],
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
      "state": "attached",
      "usedBy": [
        "shop-db-01"
      ],
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
| `503` | `database_not_configured` |

