---
title: Cluster API
section: api
slug: cluster
order: 5
label: Cluster
source: packages/api-client/openapi.json
summary: Members, machines, join tokens, settings and recovery.
---
The cluster's servers: members, maintenance, machines and join tokens, cluster settings, groups, certificates and recovery. This page lists 27 operations.

Set variables in the [API overview](/docs/api/overview/). Download [OpenAPI](/assets/api/openapi.json). Examples: **MOCK VERIFIED** (tested with simulated inventory); **Illustrative** (schema values).

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
| [`POST /api/v1/cluster/upgrade`](#post-apiv1clusterupgrade) | One step of the rolling upgrade. |
| [`GET /api/v1/machines`](#get-apiv1machines) | Machines being enrolled, with their state derived from Incus. |
| [`POST /api/v1/machines`](#post-apiv1machines) | Registers a machine. |
| [`DELETE /api/v1/machines/{name}`](#delete-apiv1machinesname) | Forgets a machine that is not a cluster member (revoking an unused join token). |
| [`GET /api/v1/machines/{name}/admission`](#get-apiv1machinesnameadmission) | The admission checks for a joined machine (dry run; changes nothing). |
| [`POST /api/v1/machines/{name}/admit`](#post-apiv1machinesnameadmit) | Admits a joined machine: re-runs the admission checks and, when none fails, lets Incus place instances on it. |
| [`DELETE /api/v1/machines/{name}/approval`](#delete-apiv1machinesnameapproval) | Withdraws an approval: revokes the machine's unused join token. |
| [`POST /api/v1/machines/{name}/approve`](#post-apiv1machinesnameapprove) | Approves a machine: asks Incus for its single-use join token, returned only in this response with the command to run on the server. |
| [`GET /api/v1/provisioners/maas/machines`](#get-apiv1provisionersmaasmachines) | The machines MAAS manages, with the Apelora machine and Incus member each became. |
| [`POST /api/v1/provisioners/maas/machines/{system_id}/commission`](#post-apiv1provisionersmaasmachinessystem_idcommission) | Starts commissioning. |
| [`POST /api/v1/provisioners/maas/machines/{system_id}/deploy`](#post-apiv1provisionersmaasmachinessystem_iddeploy) | Installs an operating system. |
| [`POST /api/v1/provisioners/maas/machines/{system_id}/release`](#post-apiv1provisionersmaasmachinessystem_idrelease) | Returns the machine to MAAS's pool. |
| [`POST /api/v1/provisioners/maas/machines/{system_id}/test`](#post-apiv1provisionersmaasmachinessystem_idtest) | Starts a hardware test run (burn-in) through MAAS. |

## Details

### `GET /api/v1/cluster/groups`

Cluster groups and their members (empty on a standalone server). Read-only; needs `cluster.view`.

**Operation ID:** `cluster_groups`

**Needs:** `cluster.view`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/cluster/groups" \
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
    "observedAt": "2026-10-23T22:12:58.163324Z"
  },
  "items": [
    {
      "name": "default",
      "description": "mock data",
      "members": [
        "mock-member-01",
        "mock-member-02",
        "mock-member-03"
      ]
    }
  ]
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/cluster/join-tokens`

Join tokens waiting to be used (no secrets). Needs `manage-infrastructure`.

**Operation ID:** `list_join_tokens`

**Needs:** `manage-infrastructure`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/cluster/join-tokens" \
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
    "observedAt": "2026-10-23T22:12:58.166283Z"
  },
  "items": []
}
```

**Errors:** `401`, `403`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/cluster/join-tokens`

Approves a new cluster member: asks Incus for a single-use join token. Needs `manage-infrastructure`. The token is in this response only.

**Operation ID:** `create_join_token`

**Needs:** `manage-infrastructure`.

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `memberName` | string | yes | Name the new member will join with. |

```json
{
  "memberName": "example"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/cluster/join-tokens" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"memberName":"example"}'
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

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

Withdraws a new member's approval: revokes its unused join token. Needs `manage-infrastructure`.

**Operation ID:** `revoke_join_token`

**Needs:** `manage-infrastructure`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `member` | path | string | yes | Name the token was issued for |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/cluster/join-tokens/node-1" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `400`, `401`, `403`, `404`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/cluster/members`

Members with their database role (voter, stand-by, spare), the leader, other roles, failure domain, groups and Incus release; the database majority (how many voters answer, how many are needed, how many more can be lost); and version skew against the pinned Incus release with what blocks an upgrade. Read-only; needs `cluster.view`.

**Operation ID:** `cluster_members`

**Needs:** `cluster.view`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/cluster/members" \
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
    "observedAt": "2026-10-23T22:12:58.174263Z"
  },
  "clustered": true,
  "members": [
    {
      "name": "mock-member-01",
      "status": "Online",
      "message": "Fully operational",
      "roles": [
        "database-leader",
        "database"
      ],
      "databaseRole": "voter",
      "leader": true,
      "eventHub": false,
      "ovnChassis": false,
      "databaseExcluded": false,
      "upForDatabase": true,
      "failureDomain": "default",
      "groups": [
        "default"
      ],
      "architecture": "x86_64",
      "held": false,
      "incusVersion": null,
      "versionError": null
    },
    {
      "name": "mock-member-02",
      "status": "Online",
      "message": "Fully operational",
      "roles": [
        "database"
      ],
      "databaseRole": "voter",
      "leader": false,
      "eventHub": false,
      "ovnChassis": false,
      "databaseExcluded": false,
      "upForDatabase": true,
      "failureDomain": "default",
      "groups": [
        "default"
      ],
      "architecture": "x86_64",
      "held": false,
      "incusVersion": null,
      "versionError": null
    },
    {
      "name": "mock-member-03",
      "status": "Online",
      "message": "Fully operational",
      "roles": [
        "database"
      ],
      "databaseRole": "voter",
      "leader": false,
      "eventHub": false,
      "ovnChassis": false,
      "databaseExcluded": false,
      "upForDatabase": true,
      "failureDomain": "default",
      "groups": [
        "default"
      ],
      "architecture": "x86_64",
      "held": false,
      "incusVersion": null,
      "versionError": null
    }
  ],
  "quorum": {
    "state": "healthy",
    "voters": 3,
    "votersUp": 3,
    "needed": 2,
    "standbys": 0,
    "standbysUp": 0,
    "spares": 0,
    "leader": "mock-member-01",
    "canLose": 1,
    "summary": "3 of 3 voters answer; 2 needed. 1 voter can be lost at once without stopping changes.",
    "nextStep": null,
    "warnings": []
  },
  "versions": {
    "pinned": "7.0.2",
    "groups": [
      {
        "version": null,
        "members": [
          "mock-member-01",
          "mock-member-02",
          "mock-member-03"
        ],
        "againstPin": "unknown"
      }
    ],
    "state": "unknown",
    "summary": "The Incus release of some members could not be read.",
    "ready": false,
    "blockers": [
      "read every member's release first"
    ],
    "notes": []
  },
  "upgrade": {
    "running": false,
    "order": [
      "mock-member-02",
      "mock-member-03",
      "mock-member-01"
    ],
    "next": "start",
    "summary": "No upgrade is in progress. Starting one walks the members below, spares and stand-bys first and the database leader last. Apelora evacuates and restores; the package upgrade happens on the server."
  }
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/cluster/members/{member}/evacuate`

Evacuates a cluster member through Incus after re-running the dry run: refused while anything blocks it. Needs `manage-infrastructure` and the admin identity; audited.

**Operation ID:** `evacuate_member`

**Needs:** `manage-infrastructure` and the admin identity; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `member` | path | string | yes | Cluster member name |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The member's name again, typed by the administrator. |
| `force` | boolean | no | Evacuate although the dry run found blockers (a workload may lose service). Needs the unsafe-evacuation permission and an approval from another person. |

```json
{
  "confirm": "example"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/cluster/members/node-1/evacuate" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"example"}'
```

**Response `202`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "member": "example",
  "operation": "example"
}
```

**Errors:** `400`, `401`, `403`, `404`, `409`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/cluster/members/{member}/evacuation`

Dry run of evacuating a cluster member: per instance, what Incus will do and what it means for the application; what blocks it; what to accept. Changes nothing.

**Operation ID:** `preview_evacuation`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `member` | path | string | yes | Cluster member name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/cluster/members/node-1/evacuation" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

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

Confirms that a failed server is powered off (or cut off from the shared storage). This fences it: Apelora then restarts its modules on shared storage on other servers. Refused unless Incus reports the member Offline. Needs `cluster.fence_confirm` and another person's approval; the member's name typed again; audited.

**Operation ID:** `confirm_fenced`

**Needs:** `cluster.fence_confirm` and another person's approval; the member's name typed again; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `member` | path | string | yes | Cluster member name |

**Request body** (JSON, illustrative values):

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/cluster/members/node-1/fencing" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"example","poweredOff":false}'
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

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

**Operation ID:** `preview_member_removal`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `member` | path | string | yes | Cluster member name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/cluster/members/node-1/removal" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

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

Removes an evacuated, empty member from the cluster for good, after the check runs again: refused while anything blocks it. Needs `cluster.manage`, the admin identity and the member's name typed again; audited.

**Operation ID:** `remove_member`

**Needs:** `cluster.manage`, the admin identity and the member's name typed again; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `member` | path | string | yes | Cluster member name |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The member's name again, typed by the administrator. |
| `force` | boolean | no | Evacuate although the dry run found blockers (a workload may lose service). Needs the unsafe-evacuation permission and an approval from another person. |

```json
{
  "confirm": "example"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/cluster/members/node-1/remove" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"example"}'
```

**Response `204`** — Success, with no body.

**Errors:** `400`, `401`, `403`, `404`, `409`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/cluster/members/{member}/restore`

Restores an evacuated member: Incus moves its instances back and starts them. Needs `manage-infrastructure` and the admin identity; audited.

**Operation ID:** `restore_member`

**Needs:** `manage-infrastructure` and the admin identity; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `member` | path | string | yes | Cluster member name |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The member's name again, typed by the administrator. |
| `force` | boolean | no | Evacuate although the dry run found blockers (a workload may lose service). Needs the unsafe-evacuation permission and an approval from another person. |

```json
{
  "confirm": "example"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/cluster/members/node-1/restore" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"example"}'
```

**Response `202`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "member": "example",
  "operation": "example"
}
```

**Errors:** `400`, `401`, `403`, `404`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/cluster/recovery`

Failed members: whether each is fenced (and the evidence), or why Apelora waits; and per instance whether it restarts on another server (and where) or waits (and why). Read-only; needs `cluster.view`.

**Operation ID:** `cluster_recovery`

**Needs:** `cluster.view`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/cluster/recovery" \
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
    "observedAt": "2026-10-23T22:12:58.17745Z"
  },
  "items": []
}
```

**Errors:** `401`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/cluster/settings`

Cluster-wide settings (offline and healing thresholds, database voters and stand-bys, join-token lifetime, image replication and updates): the value set, Incus's default and whether the default applies. Read with the admin identity, since Incus shows its configuration only to an unrestricted one (503 `cluster_admin_not_configured` without it); only these keys are returned. Read-only; needs `cluster.view`.

**Operation ID:** `cluster_settings`

**Needs:** `cluster.view`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/cluster/settings" \
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
    "observedAt": "2026-10-23T22:12:58.180011Z"
  },
  "identity": "admin",
  "items": [
    {
      "key": "cluster.offline_threshold",
      "label": "Offline after (seconds)",
      "meaning": "How long a member may miss heartbeats before it counts as offline.",
      "value": null,
      "default": "20",
      "usesDefault": true
    },
    {
      "key": "cluster.healing_threshold",
      "label": "Evacuate offline members after (seconds)",
      "meaning": "0 leaves offline members alone; otherwise Incus evacuates them after this long.",
      "value": null,
      "default": "0",
      "usesDefault": true
    },
    {
      "key": "cluster.max_voters",
      "label": "Database voters",
      "meaning": "How many members vote in the cluster database (an odd number, 3 or more).",
      "value": null,
      "default": "3",
      "usesDefault": true
    },
    {
      "key": "cluster.max_standby",
      "label": "Database stand-bys",
      "meaning": "How many members keep a copy of the cluster database without voting (0 to 5).",
      "value": null,
      "default": "2",
      "usesDefault": true
    },
    {
      "key": "cluster.join_token_expiry",
      "label": "Join tokens expire after",
      "meaning": "Apelora recommends one hour or less.",
      "value": "1H",
      "default": "3H",
      "usesDefault": false
    },
    {
      "key": "cluster.images_minimal_replica",
      "label": "Copies of each image",
      "meaning": "How many members keep each image (-1: every member).",
      "value": null,
      "default": "3",
      "usesDefault": true
    },
    {
      "key": "cluster.rebalance.interval",
      "label": "Rebalance every (minutes)",
      "meaning": "0: Incus does not move instances to even out load.",
      "value": null,
      "default": "0",
      "usesDefault": true
    },
    {
      "key": "images.auto_update_interval",
      "label": "Check for image updates every (hours)",
      "meaning": "0 turns the checks off.",
      "value": null,
      "default": "6",
      "usesDefault": true
    },
    {
      "key": "images.auto_update_cached",
      "label": "Update cached images",
      "meaning": "Whether images cached from image servers are refreshed automatically.",
      "value": null,
      "default": "true",
      "usesDefault": true
    }
  ]
}
```

**Errors:** `401`, `403`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `PATCH /api/v1/cluster/settings`

Changes cluster settings through Incus with the admin identity. Every key must be one the Servers page lists and every value is checked. Settings that already hold the value are left out; nothing to change is refused. With `dryRun` it only reports (what each becomes and what to watch for). Applying needs `cluster.sensitive_change` and another person's approval of `cluster-settings:<keys joined by />` (`Apelora-Approval`), spent before the change, and is audited with the old and new values.

**Operation ID:** `change_cluster_settings`

**Needs:** `cluster.sensitive_change` and another person's approval of `cluster-settings:<keys joined by />` (`Apelora-Approval`), spent before the change, and is audited with the old and new values.

**Request body** (JSON, illustrative values):

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PATCH "$APELORA_URL/api/v1/cluster/settings" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"changes":{"key":"example"}}'
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

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

### `POST /api/v1/cluster/upgrade`

One step of the rolling upgrade. Apelora evacuates and restores. It does not install Incus: `upgraded` records that the package was upgraded on the server. Needs `cluster.evacuate`.

**Operation ID:** `cluster_upgrade`

**Needs:** `cluster.evacuate`.

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `action` | string | yes | `start`, `evacuate`, `upgraded`, `restore` or `abandon`. |
| `confirm` | string | yes | `upgrade` to start or abandon; the member's name for the other actions. |
| `member` | string | no | The member, for evacuate, upgraded and restore. |

```json
{
  "action": "example",
  "confirm": "example"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/cluster/upgrade" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"action":"example","confirm":"example"}'
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "next": "example",
  "order": [
    "example"
  ],
  "running": false,
  "summary": "example",
  "member": "example"
}
```

**Response `202`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "next": "example",
  "order": [
    "example"
  ],
  "running": false,
  "summary": "example",
  "member": "example"
}
```

**Errors:** `400`, `401`, `403`, `409`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/machines`

Machines being enrolled, with their state derived from Incus. Needs `manage-infrastructure`.

**Operation ID:** `list_machines`

**Needs:** `manage-infrastructure`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/machines" \
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
    "observedAt": "2026-10-23T22:12:58.307258Z"
  },
  "items": []
}
```

**Errors:** `401`, `403`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/machines`

Registers a machine. A name that is already an eligible member is adopted as admitted. Needs `manage-infrastructure`; audited.

**Operation ID:** `register_machine`

**Needs:** `manage-infrastructure`; audited.

**Request body** (JSON, illustrative values):

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/machines" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"example"}'
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

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
  "approvedBy": "example",
  "architecture": "example",
  "memberStatus": "example",
  "providerRef": "example"
}
```

**Errors:** `400`, `401`, `403`, `409`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/machines/{name}`

Forgets a machine that is not a cluster member (revoking an unused join token). Needs `manage-infrastructure`; audited.

**Operation ID:** `remove_machine`

**Needs:** `manage-infrastructure`; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Machine name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/machines/shop" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `400`, `401`, `403`, `404`, `409`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/machines/{name}/admission`

The admission checks for a joined machine (dry run; changes nothing). Needs `manage-infrastructure`.

**Operation ID:** `machine_admission`

**Needs:** `manage-infrastructure`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Machine name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/machines/shop/admission" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

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

Admits a joined machine: re-runs the admission checks and, when none fails, lets Incus place instances on it. Needs `manage-infrastructure`; audited.

**Operation ID:** `admit_machine`

**Needs:** `manage-infrastructure`; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Machine name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/machines/shop/admit" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

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

Withdraws an approval: revokes the machine's unused join token. Needs `manage-infrastructure`; audited.

**Operation ID:** `withdraw_machine_approval`

**Needs:** `manage-infrastructure`; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Machine name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/machines/shop/approval" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `400`, `401`, `403`, `404`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/machines/{name}/approve`

Approves a machine: asks Incus for its single-use join token, returned only in this response with the command to run on the server. Needs `manage-infrastructure`; audited without the token.

**Operation ID:** `approve_machine`

**Needs:** `manage-infrastructure`; audited without the token.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `name` | path | string | yes | Machine name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/machines/shop/approve" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

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

The machines MAAS manages, with the Apelora machine and Incus member each became. Needs `cluster.view`. Read-only: MAAS is asked to list, nothing else.

**Operation ID:** `maas_machines`

**Needs:** `cluster.view`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/provisioners/maas/machines" \
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
    "observedAt": "2026-10-23T22:12:58.329317Z"
  },
  "configured": false,
  "items": []
}
```

**Errors:** `401`, `403`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/provisioners/maas/machines/{system_id}/commission`

Starts commissioning. Needs `hardware.commission` and the hostname typed again. The cloud-init of a later deploy is not part of this. Audited; MAAS is asked first.

**Operation ID:** `maas_commission`

**Needs:** `hardware.commission` and the hostname typed again.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `system_id` | path | string | yes | MAAS system id |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The machine's hostname, typed again. |

```json
{
  "confirm": "example"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/provisioners/maas/machines/00000000-0000-4000-8000-000000000001/commission" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"example"}'
```

**Response `202`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "action": "example",
  "hostname": "example",
  "systemId": "example"
}
```

**Errors:** `400`, `401`, `403`, `404`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/provisioners/maas/machines/{system_id}/deploy`

Installs an operating system. Needs `hardware.deploy` and the hostname typed again. `userData` is sent to MAAS and is not stored or written to the audit log. Audited.

**Operation ID:** `maas_deploy`

**Needs:** `hardware.deploy` and the hostname typed again.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `system_id` | path | string | yes | MAAS system id |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | — |
| `distroSeries` | string | yes | MAAS's series name, such as `noble`. |
| `userData` | string | yes | Cloud-init. Sent to MAAS and not stored. A join token in it is not kept. |

```json
{
  "confirm": "example",
  "distroSeries": "example",
  "userData": "example"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/provisioners/maas/machines/00000000-0000-4000-8000-000000000001/deploy" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"example","distroSeries":"example","userData":"example"}'
```

**Response `202`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "action": "example",
  "hostname": "example",
  "systemId": "example"
}
```

**Errors:** `400`, `401`, `403`, `404`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/provisioners/maas/machines/{system_id}/release`

Returns the machine to MAAS's pool. Needs `hardware.deploy` and the hostname typed again. Disk erasure needs `hardware.delete` as well and is off unless asked. A secure wipe is not offered. Audited; MAAS is asked first.

**Operation ID:** `maas_release`

**Needs:** `hardware.deploy` and the hostname typed again. `hardware.delete` as well and is off unless asked.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `system_id` | path | string | yes | MAAS system id |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | — |
| `eraseDisks` | boolean | no | Wipe the installed system. Off unless the caller sets it. A secure wipe is not offered. |

```json
{
  "confirm": "example"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/provisioners/maas/machines/00000000-0000-4000-8000-000000000001/release" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"example"}'
```

**Response `202`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "action": "example",
  "hostname": "example",
  "systemId": "example"
}
```

**Errors:** `400`, `401`, `403`, `404`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/provisioners/maas/machines/{system_id}/test`

Starts a hardware test run (burn-in) through MAAS. Needs `hardware.commission` and the hostname typed again. Only a machine that is `Ready`, `Broken` or `Failed testing`: one that is allocated or deployed (an Incus member, for one) is refused, so tests never load a running server. Audited with the test names; MAAS is asked first.

**Operation ID:** `maas_test`

**Needs:** `hardware.commission` and the hostname typed again.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `system_id` | path | string | yes | MAAS system id |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | — |
| `scripts` | list of string | no | MAAS test script or tag names (up to 16). Empty runs MAAS's default tests. |

```json
{
  "confirm": "example"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/provisioners/maas/machines/00000000-0000-4000-8000-000000000001/test" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"example"}'
```

**Response `202`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "action": "example",
  "hostname": "example",
  "systemId": "example"
}
```

**Errors:** `400`, `401`, `403`, `404`, `409`, `502`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

