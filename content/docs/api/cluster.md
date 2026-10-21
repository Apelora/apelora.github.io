---
title: Cluster API
section: api
slug: cluster
order: 5
label: Cluster
source: packages/api-client/openapi.json
summary: Members, machines, join tokens, settings and recovery.
---
The cluster's servers: members, maintenance, machines and join tokens, cluster settings, groups, certificates and recovery. This page documents all 22 operations, each with a request you can copy. Set `APELORA_URL` and `APELORA_TOKEN` as described in [the API overview](/docs/api/overview/).

## Operations

| Operation | What it does |
|---|---|
| [`GET /api/v1/cluster/groups`](#get-apiv1clustergroups) | Cluster groups and their members (empty on a standalone server). |
| [`GET /api/v1/cluster/join-tokens`](#get-apiv1clusterjoin-tokens) | Join tokens waiting to be used (no secrets). |
| [`POST /api/v1/cluster/join-tokens`](#post-apiv1clusterjoin-tokens) | Approves a new cluster member: asks Incus for a single-use join token. |
| [`DELETE /api/v1/cluster/join-tokens/{member}`](#delete-apiv1clusterjoin-tokensmember) | Withdraws a new member's approval: revokes its unused join token. |
| [`GET /api/v1/cluster/members`](#get-apiv1clustermembers) | Members with their database role (voter, stand-by, spare), the leader, other roles, failure domain, groups and Incus release; the database majority (how many voters answer, how many are needed, how many more can be lost); and version skew against the pinned Incus release with what blocks an upgrade. |
| [`POST /api/v1/cluster/members/{member}/evacuate`](#post-apiv1clustermembersmemberevacuate) | Evacuates a cluster member through Incus after re-running the dry run: refused while anything blocks it. |
| [`GET /api/v1/cluster/members/{member}/evacuation`](#get-apiv1clustermembersmemberevacuation) | Dry run of evacuating a cluster member: per instance, what Incus will do and what it means for the application; what blocks it; what to accept. |
| [`POST /api/v1/cluster/members/{member}/fencing`](#post-apiv1clustermembersmemberfencing) | Confirms that a failed server is powered off (or cut off from the shared storage). |
| [`GET /api/v1/cluster/members/{member}/removal`](#get-apiv1clustermembersmemberremoval) | Dry run of removing a cluster member for good: what is still on it, what blocks it and what to accept. |
| [`POST /api/v1/cluster/members/{member}/remove`](#post-apiv1clustermembersmemberremove) | Removes an evacuated, empty member from the cluster for good, after the check runs again: refused while anything blocks it. |
| [`POST /api/v1/cluster/members/{member}/restore`](#post-apiv1clustermembersmemberrestore) | Restores an evacuated member: Incus moves its instances back and starts them. |
| [`GET /api/v1/cluster/recovery`](#get-apiv1clusterrecovery) | Failed members: whether each is fenced (and the evidence), or why Apelora waits; and per instance whether it restarts on another server (and where) or waits (and why). |
| [`GET /api/v1/cluster/settings`](#get-apiv1clustersettings) | Cluster-wide settings (offline and healing thresholds, database voters and stand-bys, join-token lifetime, image replication and updates): the value set, Incus's default and whether the default applies. |
| [`PATCH /api/v1/cluster/settings`](#patch-apiv1clustersettings) | Changes cluster settings through Incus with the admin identity. |
| [`GET /api/v1/machines`](#get-apiv1machines) | Machines being enrolled, with their state derived from Incus. |
| [`POST /api/v1/machines`](#post-apiv1machines) | Registers a machine. |
| [`DELETE /api/v1/machines/{name}`](#delete-apiv1machinesname) | Forgets a machine that is not a cluster member (revoking an unused join token). |
| [`GET /api/v1/machines/{name}/admission`](#get-apiv1machinesnameadmission) | The admission checks for a joined machine (dry run; changes nothing). |
| [`POST /api/v1/machines/{name}/admit`](#post-apiv1machinesnameadmit) | Admits a joined machine: re-runs the admission checks and, when none fails, lets Incus place instances on it. |
| [`DELETE /api/v1/machines/{name}/approval`](#delete-apiv1machinesnameapproval) | Withdraws an approval: revokes the machine's unused join token. |
| [`POST /api/v1/machines/{name}/approve`](#post-apiv1machinesnameapprove) | Approves a machine: asks Incus for its single-use join token, returned only in this response with the command to run on the server. |
| [`GET /api/v1/provisioners/maas/machines`](#get-apiv1provisionersmaasmachines) | The machines MAAS manages, with the Apelora machine and Incus member each became. |

## Details

### `GET /api/v1/cluster/groups`

Cluster groups and their members (empty on a standalone server). Read-only; needs `cluster.view`.

**Needs:** a signed-in caller; the server decides what that caller may see.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/cluster/groups" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "description": "A description",
      "members": [
        "example"
      ],
      "name": "example"
    }
  ],
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  }
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/cluster/join-tokens`

Join tokens waiting to be used (no secrets).

**Needs:** `manage-infrastructure`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/cluster/join-tokens" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "expiresAt": "2026-01-01T09:00:00Z",
      "memberName": "example"
    }
  ],
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  }
}
```

**Errors:** `401`, `403`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/cluster/join-tokens`

Approves a new cluster member: asks Incus for a single-use join token. The token is in this response only.

**Needs:** `manage-infrastructure`.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `memberName` | string | yes | Name the new member will join with. |

```json
{
  "memberName": "example"
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/cluster/join-tokens" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"memberName":"example"}'
```

**Response `201`**:

```json
{
  "expiresAt": "2026-01-01T09:00:00Z",
  "memberName": "example",
  "token": "<redacted>",
  "warnings": [
    "example"
  ]
}
```

**Errors:** `400`, `401`, `403`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/cluster/join-tokens/{member}`

Withdraws a new member's approval: revokes its unused join token.

**Needs:** `manage-infrastructure`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `member` | path | string | yes | Name the token was issued for |

```sh
curl -sS -X DELETE "$APELORA_URL/api/v1/cluster/join-tokens/node-1" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`**, with no body.

**Errors:** `400`, `401`, `403`, `404`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/cluster/members`

Members with their database role (voter, stand-by, spare), the leader, other roles, failure domain, groups and Incus release; the database majority (how many voters answer, how many are needed, how many more can be lost); and version skew against the pinned Incus release with what blocks an upgrade. Read-only; needs `cluster.view`.

**Needs:** a signed-in caller; the server decides what that caller may see.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/cluster/members" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "clustered": false,
  "members": [
    {
      "architecture": "example",
      "databaseExcluded": false,
      "databaseRole": "voter",
      "eventHub": false,
      "failureDomain": "example",
      "groups": [
        "example"
      ],
      "held": false,
      "incusVersion": "example",
      "leader": false,
      "message": "example",
      "name": "example",
      "ovnChassis": false,
      "roles": [
        "example"
      ],
      "status": "example"
    }
  ],
  "quorum": {
    "canLose": 0,
    "leader": "example",
    "needed": 0,
    "nextStep": "example",
    "spares": 0,
    "standbys": 0,
    "standbysUp": 0,
    "state": "healthy",
    "summary": "example",
    "voters": 0,
    "votersUp": 0,
    "warnings": [
      "example"
    ]
  },
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  },
  "versions": {
    "blockers": [
      "example"
    ],
    "groups": [
      {
        "againstPin": "same",
        "members": [
          "example"
        ],
        "version": "example"
      }
    ],
    "notes": [
      "example"
    ],
    "pinned": "example",
    "ready": false,
    "state": "matches-pin",
    "summary": "example"
  }
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/cluster/members/{member}/evacuate`

Evacuates a cluster member through Incus after re-running the dry run: refused while anything blocks it.

**Needs:** `manage-infrastructure` and the admin identity; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `member` | path | string | yes | Cluster member name |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The member's name again, typed by the administrator. |
| `force` | boolean | no | Evacuate although the dry run found blockers (a workload may lose service). Needs the unsafe-evacuation permission and an approval from another person. |

```json
{
  "confirm": "example"
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/cluster/members/node-1/evacuate" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"confirm":"example"}'
```

**Response `202`**:

```json
{
  "member": "example",
  "operation": "example"
}
```

**Errors:** `400`, `401`, `403`, `404`, `409`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/cluster/members/{member}/evacuation`

Dry run of evacuating a cluster member: per instance, what Incus will do and what it means for the application; what blocks it; what to accept. Changes nothing.

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `member` | path | string | yes | Cluster member name |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/cluster/members/node-1/evacuation" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "plan": {
    "blocked": [
      "example"
    ],
    "items": [
      {
        "impact": "example",
        "instance": "example",
        "mode": "example",
        "outcome": "example",
        "project": "apelora",
        "status": "example",
        "application": "example",
        "module": "example"
      }
    ],
    "member": "example",
    "targets": [
      "example"
    ],
    "warnings": [
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

### `POST /api/v1/cluster/members/{member}/fencing`

Confirms that a failed server is powered off (or cut off from the shared storage). This fences it: Apelora then restarts its modules on shared storage on other servers. Refused unless Incus reports the member Offline.

**Needs:** `cluster.fence_confirm` and another person's approval; the member's name typed again; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `member` | path | string | yes | Cluster member name |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The member's name again, typed by the person. |
| `poweredOff` | boolean | yes | Must be `true`: the server is switched off (or cut off from the shared storage). |

```json
{
  "confirm": "example",
  "poweredOff": false
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/cluster/members/node-1/fencing" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"confirm":"example","poweredOff":false}'
```

**Response `200`**:

```json
{
  "fencing": {
    "condition": "waiting",
    "reason": "example",
    "evidence": {
      "at": 1,
      "kind": "storage-lease",
      "summary": "example",
      "confirmedBy": "example",
      "generation": 0,
      "hostId": 0,
      "lockspace": "example",
      "observedBy": "example",
      "provider": "example"
    },
    "leaseState": "free",
    "nextStep": "example",
    "observedAt": 1,
    "observedBy": "example"
  },
  "items": [
    {
      "action": "restart",
      "instance": "example",
      "project": "apelora",
      "reason": "example",
      "application": "example",
      "module": "example",
      "target": "example"
    }
  ],
  "member": "example",
  "status": "example",
  "confirmedBy": "example",
  "decidedAt": "2026-01-01T09:00:00Z",
  "detectedAt": "2026-01-01T09:00:00Z",
  "evidence": {
    "at": 1,
    "kind": "storage-lease",
    "summary": "example",
    "confirmedBy": "example",
    "generation": 0,
    "hostId": 0,
    "lockspace": "example",
    "observedBy": "example",
    "provider": "example"
  },
  "failure": "example",
  "fencedAt": "2026-01-01T09:00:00Z",
  "lastHeartbeat": "2026-01-01T09:00:00Z"
}
```

**Errors:** `400`, `401`, `403`, `404`, `409`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/cluster/members/{member}/removal`

Dry run of removing a cluster member for good: what is still on it, what blocks it and what to accept. Changes nothing.

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `member` | path | string | yes | Cluster member name |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/cluster/members/node-1/removal" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "plan": {
    "blocked": [
      "example"
    ],
    "instances": [
      "example"
    ],
    "member": "example",
    "status": "example",
    "volumes": [
      "example"
    ],
    "warnings": [
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

### `POST /api/v1/cluster/members/{member}/remove`

Removes an evacuated, empty member from the cluster for good, after the check runs again: refused while anything blocks it.

**Needs:** `cluster.manage`, the admin identity and the member's name typed again; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `member` | path | string | yes | Cluster member name |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The member's name again, typed by the administrator. |
| `force` | boolean | no | Evacuate although the dry run found blockers (a workload may lose service). Needs the unsafe-evacuation permission and an approval from another person. |

```json
{
  "confirm": "example"
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/cluster/members/node-1/remove" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"confirm":"example"}'
```

**Response `204`**, with no body.

**Errors:** `400`, `401`, `403`, `404`, `409`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/cluster/members/{member}/restore`

Restores an evacuated member: Incus moves its instances back and starts them.

**Needs:** `manage-infrastructure` and the admin identity; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `member` | path | string | yes | Cluster member name |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The member's name again, typed by the administrator. |
| `force` | boolean | no | Evacuate although the dry run found blockers (a workload may lose service). Needs the unsafe-evacuation permission and an approval from another person. |

```json
{
  "confirm": "example"
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/cluster/members/node-1/restore" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"confirm":"example"}'
```

**Response `202`**:

```json
{
  "member": "example",
  "operation": "example"
}
```

**Errors:** `400`, `401`, `403`, `404`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/cluster/recovery`

Failed members: whether each is fenced (and the evidence), or why Apelora waits; and per instance whether it restarts on another server (and where) or waits (and why). Read-only; needs `cluster.view`.

**Needs:** a signed-in caller; the server decides what that caller may see.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/cluster/recovery" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "fencing": {
        "condition": "waiting",
        "reason": "example",
        "evidence": {
          "at": 1,
          "kind": "storage-lease",
          "summary": "example",
          "confirmedBy": "example",
          "generation": 0,
          "hostId": 0,
          "lockspace": "example",
          "observedBy": "example",
          "provider": "example"
        },
        "leaseState": "free",
        "nextStep": "example",
        "observedAt": 1,
        "observedBy": "example"
      },
      "items": [
        {
          "action": "restart",
          "instance": "example",
          "project": "apelora",
          "reason": "example",
          "application": "example",
          "module": "example",
          "target": "example"
        }
      ],
      "member": "example",
      "status": "example",
      "confirmedBy": "example",
      "decidedAt": "2026-01-01T09:00:00Z",
      "detectedAt": "2026-01-01T09:00:00Z",
      "evidence": {
        "at": 1,
        "kind": "storage-lease",
        "summary": "example",
        "confirmedBy": "example",
        "generation": 0,
        "hostId": 0,
        "lockspace": "example",
        "observedBy": "example",
        "provider": "example"
      },
      "failure": "example",
      "fencedAt": "2026-01-01T09:00:00Z",
      "lastHeartbeat": "2026-01-01T09:00:00Z"
    }
  ],
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  }
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/cluster/settings`

Cluster-wide settings (offline and healing thresholds, database voters and stand-bys, join-token lifetime, image replication and updates): the value set, Incus's default and whether the default applies. Read with the admin identity, since Incus shows its configuration only to an unrestricted one (503 `cluster_admin_not_configured` without it); only these keys are returned. Read-only; needs `cluster.view`.

**Needs:** a signed-in caller; the server decides what that caller may see.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/cluster/settings" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "identity": "example",
  "items": [
    {
      "default": "example",
      "key": "example",
      "label": "example",
      "meaning": "example",
      "usesDefault": false,
      "value": "example"
    }
  ],
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  }
}
```

**Errors:** `401`, `403`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `PATCH /api/v1/cluster/settings`

Changes cluster settings through Incus with the admin identity. Every key must be one the Servers page lists and every value is checked. Settings that already hold the value are left out; nothing to change is refused. With `dryRun` it only reports (what each becomes and what to watch for). Applying needs `cluster.sensitive_change` and another person's approval of `cluster-settings:<keys joined by />` (`Apelora-Approval`), spent before the change, and is audited with the old and new values.

**Needs:** a signed-in caller; the server decides what that caller may see.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `changes` | object | yes | — |
| `dryRun` | boolean | no | Only report what would change and what to watch for; nothing is changed and no approval is needed. |

```json
{
  "changes": {
    "key": "example"
  }
}
```

```sh
curl -sS -X PATCH "$APELORA_URL/api/v1/cluster/settings" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"changes":{"key":"example"}}'
```

**Response `200`**:

```json
{
  "applied": false,
  "approvalTarget": "example",
  "changes": [
    {
      "key": "example",
      "label": "example",
      "warnings": [
        "example"
      ],
      "from": "example",
      "to": "example"
    }
  ]
}
```

**Errors:** `400`, `401`, `403`, `409`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/machines`

Machines being enrolled, with their state derived from Incus.

**Needs:** `manage-infrastructure`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/machines" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "capabilities": {
        "discovers": false,
        "installs": false,
        "powers": false
      },
      "description": "A description",
      "name": "example",
      "nextStep": "example",
      "provider": "manual",
      "registeredAt": "2026-01-01T09:00:00Z",
      "registeredBy": "example",
      "state": "registered",
      "warnings": [
        "example"
      ],
      "admittedAt": "2026-01-01T09:00:00Z",
      "admittedBy": "example",
      "approvalExpiresAt": "2026-01-01T09:00:00Z",
      "approvedAt": "2026-01-01T09:00:00Z",
      "approvedBy": "example"
    }
  ],
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  }
}
```

**Errors:** `401`, `403`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/machines`

Registers a machine. A name that is already an eligible member is adopted as admitted.

**Needs:** `manage-infrastructure`; audited.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `description` | string | no | — |
| `name` | string | yes | The name it will have as a cluster member. |
| `provider` | one of several | no | — |
| `systemId` | string | no | For a `maas` machine: its MAAS system id (from `GET /api/v1/provisioners/maas/machines`). |

```json
{
  "name": "example"
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/machines" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"example"}'
```

**Response `201`**:

```json
{
  "capabilities": {
    "discovers": false,
    "installs": false,
    "powers": false
  },
  "description": "A description",
  "name": "example",
  "nextStep": "example",
  "provider": "manual",
  "registeredAt": "2026-01-01T09:00:00Z",
  "registeredBy": "example",
  "state": "registered",
  "warnings": [
    "example"
  ],
  "admittedAt": "2026-01-01T09:00:00Z",
  "admittedBy": "example",
  "approvalExpiresAt": "2026-01-01T09:00:00Z",
  "approvedAt": "2026-01-01T09:00:00Z",
  "approvedBy": "example"
}
```

**Errors:** `400`, `401`, `403`, `409`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/machines/{name}`

Forgets a machine that is not a cluster member (revoking an unused join token).

**Needs:** `manage-infrastructure`; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Machine name |

```sh
curl -sS -X DELETE "$APELORA_URL/api/v1/machines/shop" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`**, with no body.

**Errors:** `400`, `401`, `403`, `404`, `409`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/machines/{name}/admission`

The admission checks for a joined machine (dry run; changes nothing).

**Needs:** `manage-infrastructure`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Machine name |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/machines/shop/admission" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "admissible": false,
  "checks": [
    {
      "detail": "example",
      "id": "example",
      "status": "pass",
      "title": "example"
    }
  ],
  "name": "example",
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  }
}
```

**Errors:** `400`, `401`, `403`, `404`, `409`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/machines/{name}/admit`

Admits a joined machine: re-runs the admission checks and, when none fails, lets Incus place instances on it.

**Needs:** `manage-infrastructure`; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Machine name |

```sh
curl -sS -X POST "$APELORA_URL/api/v1/machines/shop/admit" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "admissible": false,
  "checks": [
    {
      "detail": "example",
      "id": "example",
      "status": "pass",
      "title": "example"
    }
  ],
  "name": "example",
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  }
}
```

**Errors:** `400`, `401`, `403`, `404`, `409`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/machines/{name}/approval`

Withdraws an approval: revokes the machine's unused join token.

**Needs:** `manage-infrastructure`; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Machine name |

```sh
curl -sS -X DELETE "$APELORA_URL/api/v1/machines/shop/approval" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`**, with no body.

**Errors:** `400`, `401`, `403`, `404`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/machines/{name}/approve`

Approves a machine: asks Incus for its single-use join token, returned only in this response with the command to run on the server.

**Needs:** `manage-infrastructure`; audited without the token.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Machine name |

```sh
curl -sS -X POST "$APELORA_URL/api/v1/machines/shop/approve" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `201`**:

```json
{
  "enrolCommand": "example",
  "expiresAt": "2026-01-01T09:00:00Z",
  "name": "example",
  "token": "<redacted>",
  "warnings": [
    "example"
  ]
}
```

**Errors:** `400`, `401`, `403`, `404`, `409`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/provisioners/maas/machines`

The machines MAAS manages, with the Apelora machine and Incus member each became. Read-only: MAAS is asked to list, nothing else.

**Needs:** `cluster.view`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/provisioners/maas/machines" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "configured": false,
  "items": [
    {
      "addresses": [
        "example"
      ],
      "architecture": "example",
      "cpuCount": 0,
      "hostname": "example",
      "memoryMib": 0,
      "os": "example",
      "pool": "example",
      "powerState": "example",
      "powerType": "example",
      "status": "example",
      "systemId": "example",
      "zone": "example",
      "hardwareUuid": "example",
      "memberStatus": "example"
    }
  ],
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  }
}
```

**Errors:** `401`, `403`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

