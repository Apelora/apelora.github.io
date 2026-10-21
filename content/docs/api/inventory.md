---
title: Inventory API
section: api
slug: inventory
order: 2
label: Inventory
source: packages/api-client/openapi.json
summary: Servers, instances, networks, storage, jobs and preflight.
---
What exists in the cluster, as Incus reports it: instances, networks, storage pools, jobs, preflight and capacity. This page documents all 14 operations, each with a request you can copy. Set `APELORA_URL` and `APELORA_TOKEN` as described in [the API overview](/docs/api/overview/).

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

**Needs:** a signed-in caller; the server decides what that caller may see.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/capacity" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "named": false,
  "servers": [
    {
      "acceptsModules": false,
      "architecture": "example",
      "label": "example",
      "cpuThreads": 0,
      "load": 1,
      "memory": {
        "totalBytes": 0,
        "usedBytes": 0
      },
      "reason": "example",
      "volumePool": {
        "totalBytes": 0,
        "usedBytes": 0
      }
    }
  ],
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  },
  "totals": {
    "cpuThreads": 0,
    "memoryFreeBytes": 0,
    "memoryTotalBytes": 0,
    "serversAccepting": 0,
    "volumePoolFreeBytes": 0
  },
  "volumePoolShared": false,
  "volumePool": "example"
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/cluster`

The Incus server and its cluster members.

**Needs:** `read-inventory`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/cluster" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "members": [
    {
      "architecture": "example",
      "database": false,
      "failureDomain": "example",
      "groups": [
        "example"
      ],
      "message": "example",
      "name": "example",
      "roles": [
        "example"
      ],
      "status": "example",
      "url": "https://example.org",
      "scheduler": "example"
    }
  ],
  "server": {
    "apiExtensions": [
      "example"
    ],
    "apiVersion": "example",
    "auth": "example",
    "clustered": false,
    "kernelVersion": "example",
    "serverVersion": "example",
    "architectures": [
      "example"
    ]
  },
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  }
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/instances`

Instances in all projects.

**Needs:** `read-inventory`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/instances" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "architecture": "example",
      "description": "A description",
      "kind": "container",
      "location": "example",
      "name": "example",
      "project": "apelora",
      "status": "example",
      "evacuate": "example",
      "limits": {
        "key": "example"
      },
      "managed": false,
      "owner": {
        "application": "example",
        "module": "example",
        "replica": 0
      },
      "unreachable": false
    }
  ],
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  }
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/instances/{project}/{name}`

The instance with the application it belongs to, its recent jobs, and what the caller may do (Start, Stop, Restart, Move and Delete go through the existing instance routes and jobs).

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `project` | path | string | yes | Incus project. |
| `name` | path | string | yes | Instance name. |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/instances/apelora/shop" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

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
  …
```

**Errors:** `400`, `401`, `403`, `404`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/instances/{project}/{name}/console-log`

The end of the instance's console log (`tailKib`, default 64, at most 1024).

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `project` | path | string | yes | Incus project. |
| `name` | path | string | yes | Instance name. |
| `tailKib` | query | integer | no | How many KiB from the end of the log (1–1024, default 64). |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/instances/apelora/shop/console-log" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

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

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `project` | path | string | yes | Incus project. |
| `name` | path | string | yes | Instance name. |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/instances/apelora/shop/logs" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

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

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `project` | path | string | yes | Incus project. |
| `name` | path | string | yes | Instance name. |
| `file` | path | string | yes | Log file name, as listed. |
| `tailKib` | query | integer | no | How many KiB from the end of the log (1–1024, default 64). |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/instances/apelora/shop/logs/example" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

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

Networks in all projects.

**Needs:** `read-inventory`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/networks" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "description": "A description",
      "kind": "example",
      "managed": false,
      "name": "example",
      "project": "apelora",
      "status": "example",
      "locations": [
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

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/networks/settings`

The network settings in effect: Apelora's uplink and service range, each deploy project's network limits, and the uplink as Incus reports it (with the administrator identity, when configured), with what does not fit together. Read-only.

**Needs:** `cluster.view`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/networks/settings" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "findings": [
    {
      "message": "example",
      "severity": "example"
    }
  ],
  "projects": [
    {
      "found": false,
      "ownNetworks": false,
      "project": "apelora",
      "restricted": false,
      "subnets": [
        "example"
      ],
      "uplinks": [
        "example"
      ]
    }
  ],
  "serviceAddressesUsed": 1,
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  },
  "serviceAddressesTotal": 0,
  "serviceRange": "example",
  "uplink": "example",
  "uplinkNote": "example",
  "uplinkObserved": {
    "ipv4Routes": [
      "example"
    ],
    "kind": "example",
    "name": "example",
    "ovnRanges": [
      "example"
    ],
    "status": "example",
    "ipv4Address": "example"
  }
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/preflight`

Read-only readiness checks of the Incus server or cluster, of the projects Apelora deploys into, and of the image mirrors (whether each image server the catalog uses is mirrored and whether the mirrors answer). Changes nothing.

**Needs:** `read-inventory`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/preflight" \
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
  "overall": "pass",
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  }
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/projects`

Incus projects.

**Needs:** `read-inventory`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/projects" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "description": "A description",
      "name": "example",
      "restricted": false
    }
  ],
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  }
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/storage-pools`

Storage pools.

**Needs:** `read-inventory`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/storage-pools" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "description": "A description",
      "driver": "example",
      "name": "example",
      "status": "example",
      "locations": [
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

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/storage/orphans`

Custom volumes in Apelora's projects that no application volume or backup record refers to, in every pool, with their size. Read-only: deleting one is a decision made in Incus or, for a kept application volume, on the application.

**Needs:** `cluster.view`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/storage/orphans" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "content": "example",
      "createdAt": "2026-01-01T09:00:00Z",
      "member": "example",
      "name": "example",
      "pool": "example",
      "project": "apelora",
      "reason": "example",
      "usedBy": [
        "example"
      ],
      "application": "example",
      "backupOf": "example",
      "sizeMib": 0
    }
  ],
  "projects": [
    "apelora"
  ],
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  }
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/storage/pools`

Storage pools with how full each is, per member and in total (read from each member's state, like the Health page). Read-only.

**Needs:** `cluster.view`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/storage/pools" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "description": "A description",
      "driver": "example",
      "members": [
        {
          "member": "example",
          "totalBytes": 0,
          "usedBytes": 0
        }
      ],
      "name": "example",
      "shared": false,
      "status": "example",
      "unreadable": [
        "example"
      ],
      "role": "example",
      "total": {
        "totalBytes": 0,
        "usedBytes": 0
      }
    }
  ],
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  },
  "backupPool": "example",
  "volumePool": "example"
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

