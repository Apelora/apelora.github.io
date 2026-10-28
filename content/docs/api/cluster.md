---
title: Cluster API
section: api
slug: cluster
order: 5
label: Cluster
source: packages/api-client/openapi.json
summary: Members, machines, join tokens, settings and recovery.
---
The cluster's servers: members and their maintenance (evacuate, restore, remove, fencing), rolling upgrades, cluster settings and groups, recovery, machines and join tokens, and MAAS provisioning. This page lists 30 operations.

Set variables in the [API overview](/docs/api/overview/). Download [OpenAPI](/assets/api/openapi.json).

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
| [`GET /api/v1/sectors`](#get-apiv1sectors) | The sectors this control plane knows and whether each answers. |
| [`POST /api/v1/sectors`](#post-apiv1sectors) | Registers another Incus cluster as a sector. |
| [`DELETE /api/v1/sectors/{name}`](#delete-apiv1sectorsname) | Forgets a registered sector. |

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

**TypeScript:**

```ts
const result = await client.request("cluster_groups", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T21:24:20.138754Z"
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

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |

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

**TypeScript:**

```ts
const result = await client.request("list_join_tokens", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T21:24:03.380832Z"
  },
  "items": [
    {
      "memberName": "rack2-01",
      "expiresAt": "2026-10-28T22:24:03.375925Z"
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
| `503` | `cluster_admin_not_configured`, `database_not_configured`, `store_unavailable` |

### `POST /api/v1/cluster/join-tokens`

Approves a new cluster member: asks Incus for a single-use join token. Needs `manage-infrastructure`. The token is in this response only.

**Operation ID:** `create_join_token`

**Needs:** `manage-infrastructure`.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `memberName` | string | yes | Name the new member will join with. |

```json
{
  "memberName": "rack2-01"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/cluster/join-tokens" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"memberName":"rack2-01"}'
```

**TypeScript:**

```ts
const result = await client.request("create_join_token", { body: { memberName: "rack2-01" } });
```

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "memberName": "rack2-01",
  "expiresAt": "2026-10-28T22:24:03.375925Z",
  "token": "<token, shown once>",
  "warnings": []
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `409` | `approval_invalid`, `approval_required` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |
| `503` | `cluster_admin_not_configured`, `database_not_configured` |

### `DELETE /api/v1/cluster/join-tokens/{member}`

Withdraws a new member's approval: revokes its unused join token. Needs `manage-infrastructure`.

**Operation ID:** `revoke_join_token`

**Needs:** `manage-infrastructure`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `member` | path | string | yes | — | Name the token was issued for |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/cluster/join-tokens/rack2-01" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("revoke_join_token", { params: { member: "rack2-01" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |
| `503` | `cluster_admin_not_configured`, `database_not_configured` |

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

**TypeScript:**

```ts
const result = await client.request("cluster_members", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T21:24:03.313107Z"
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
  "sites": {
    "region": "default",
    "site": "default",
    "sector": "default",
    "members": 3,
    "connectedSites": 1,
    "planned": false,
    "survival": "Connected to site default, sector default (3 members), in region default. Surviving a site means deploying the application again in another site's sector. No other site is connected, so that deployment is not planned."
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

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `500` | `invalid_place`, `store_error` |
| `502` | an `incus_…` code |
| `503` | `database_not_configured` |

### `POST /api/v1/cluster/members/{member}/evacuate`

Evacuates a cluster member through Incus after re-running the dry run: refused while anything blocks it. Needs `manage-infrastructure` and the admin identity; audited.

**Operation ID:** `evacuate_member`

**Needs:** `manage-infrastructure` and the admin identity; audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `member` | path | string | yes | — | Cluster member name |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The member's name again, typed by the administrator. |
| `force` | boolean | no | Evacuate although the dry run found blockers (a workload may lose service). Needs the unsafe-evacuation permission and an approval from another person. |

```json
{
  "confirm": "mock-member-02",
  "force": false
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/cluster/members/mock-member-02/evacuate" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"mock-member-02","force":false}'
```

**TypeScript:**

```ts
const result = await client.request("evacuate_member", { params: { member: "mock-member-02" }, body: { confirm: "mock-member-02", force: false } });
```

**Response `202`** — Accepted: the work is queued; the response says how to follow it..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "member": "mock-member-02",
  "operation": "00000000-0000-4000-8000-000000000001",
  "drain": "No application replica moves, so none was taken out of a service address."
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `confirmation_mismatch`, `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `approval_invalid`, `approval_required`, `evacuation_blocked` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |
| `503` | `cluster_admin_not_configured`, `database_not_configured` |

### `GET /api/v1/cluster/members/{member}/evacuation`

Dry run of evacuating a cluster member: per instance, what Incus will do and what it means for the application; what blocks it; what to accept. Changes nothing.

**Operation ID:** `preview_evacuation`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `member` | path | string | yes | — | Cluster member name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/cluster/members/mock-member-03/evacuation" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("preview_evacuation", { params: { member: "mock-member-03" } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T21:24:03.321599Z"
  },
  "plan": {
    "member": "mock-member-03",
    "targets": [
      "mock-member-01",
      "mock-member-02"
    ],
    "items": [
      {
        "project": "default",
        "instance": "mock-db-01",
        "status": "Running",
        "mode": "auto",
        "outcome": "moves if it can; stopped during the move",
        "impact": "not Apelora's"
      }
    ],
    "blocked": [],
    "warnings": []
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

### `POST /api/v1/cluster/members/{member}/fencing`

Confirms that a failed server is powered off (or cut off from the shared storage). This fences it: Apelora then restarts its modules on shared storage on other servers. Refused unless Incus reports the member Offline. Needs `cluster.fence_confirm` and another person's approval; the member's name typed again; audited.

**Operation ID:** `confirm_fenced`

**Needs:** `cluster.fence_confirm` and another person's approval; the member's name typed again; audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `member` | path | string | yes | — | Cluster member name |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The member's name again, typed by the person. |
| `poweredOff` | boolean | yes | Must be `true`: the server is switched off (or cut off from the shared storage). |

```json
{
  "confirm": "mock-member-01",
  "poweredOff": true
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/cluster/members/mock-member-01/fencing" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"mock-member-01","poweredOff":true}'
```

**TypeScript:**

```ts
const result = await client.request("confirm_fenced", { params: { member: "mock-member-01" }, body: { confirm: "mock-member-01", poweredOff: true } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `confirmation_mismatch`, `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `approval_invalid`, `approval_required`, `member_not_offline` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |
| `503` | `database_not_configured` |

### `GET /api/v1/cluster/members/{member}/removal`

Dry run of removing a cluster member for good: what is still on it, what blocks it and what to accept. Changes nothing.

**Operation ID:** `preview_member_removal`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `member` | path | string | yes | — | Cluster member name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/cluster/members/mock-member-03/removal" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("preview_member_removal", { params: { member: "mock-member-03" } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T21:24:03.34092Z"
  },
  "plan": {
    "member": "mock-member-03",
    "status": "Online",
    "instances": [
      "default/mock-db-01"
    ],
    "volumes": [],
    "blocked": [
      "evacuate it first, so Incus moves its instances away",
      "1 instance is still on it (default/mock-db-01); an evacuation leaves instances whose volumes are on the member stopped in place"
    ],
    "warnings": [
      "the cluster keeps 2 database members (fewer than three): losing one more member can stop it",
      "2 members remain: replicas have fewer places to spread over",
      "to use the server again, reinstall it and enrol it as a new machine"
    ]
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

### `POST /api/v1/cluster/members/{member}/remove`

Removes an evacuated, empty member from the cluster for good, after the check runs again: refused while anything blocks it. Needs `cluster.manage`, the admin identity and the member's name typed again; audited.

**Operation ID:** `remove_member`

**Needs:** `cluster.manage`, the admin identity and the member's name typed again; audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `member` | path | string | yes | — | Cluster member name |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The member's name again, typed by the administrator. |
| `force` | boolean | no | Evacuate although the dry run found blockers (a workload may lose service). Needs the unsafe-evacuation permission and an approval from another person. |

```json
{
  "confirm": "mock-member-03",
  "force": false
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/cluster/members/mock-member-03/remove" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"mock-member-03","force":false}'
```

**TypeScript:**

```ts
await client.request("remove_member", { params: { member: "mock-member-03" }, body: { confirm: "mock-member-03", force: false } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `confirmation_mismatch`, `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `approval_invalid`, `approval_required`, `removal_blocked` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |
| `503` | `cluster_admin_not_configured`, `database_not_configured` |

### `POST /api/v1/cluster/members/{member}/restore`

Restores an evacuated member: Incus moves its instances back and starts them. Needs `manage-infrastructure` and the admin identity; audited.

**Operation ID:** `restore_member`

**Needs:** `manage-infrastructure` and the admin identity; audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `member` | path | string | yes | — | Cluster member name |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The member's name again, typed by the administrator. |
| `force` | boolean | no | Evacuate although the dry run found blockers (a workload may lose service). Needs the unsafe-evacuation permission and an approval from another person. |

```json
{
  "confirm": "mock-member-02",
  "force": false
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/cluster/members/mock-member-02/restore" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"mock-member-02","force":false}'
```

**TypeScript:**

```ts
const result = await client.request("restore_member", { params: { member: "mock-member-02" }, body: { confirm: "mock-member-02", force: false } });
```

**Response `202`** — Accepted: the work is queued; the response says how to follow it..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "member": "mock-member-02",
  "operation": "00000000-0000-4000-8000-000000000002",
  "drain": "No application replica moves, so none was taken out of a service address."
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `confirmation_mismatch`, `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | — |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |
| `503` | `cluster_admin_not_configured`, `database_not_configured` |

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

**TypeScript:**

```ts
const result = await client.request("cluster_recovery", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T21:24:03.400079Z"
  },
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

**TypeScript:**

```ts
const result = await client.request("cluster_settings", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T21:24:03.397009Z"
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
| `503` | `cluster_admin_not_configured`, `database_not_configured`, `store_unavailable` |

### `PATCH /api/v1/cluster/settings`

Changes cluster settings through Incus with the admin identity. Every key must be one the Servers page lists and every value is checked. Settings that already hold the value are left out; nothing to change is refused. With `dryRun` it only reports (what each becomes and what to watch for). Applying needs `cluster.sensitive_change` and another person's approval of `cluster-settings:<keys joined by />` (`Apelora-Approval`), spent before the change, and is audited with the old and new values.

**Operation ID:** `change_cluster_settings`

**Needs:** `cluster.sensitive_change` and another person's approval of `cluster-settings:<keys joined by />` (`Apelora-Approval`), spent before the change, and is audited with the old and new values.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `changes` | object | yes | — |
| `changes.<key>` | string or null | no | Any key. |
| `dryRun` | boolean | no | Only report what would change and what to watch for; nothing is changed and no approval is needed. |

```json
{
  "changes": {
    "cluster.join_token_expiry": "3H"
  },
  "dryRun": true
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PATCH "$APELORA_URL/api/v1/cluster/settings" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"changes":{"cluster.join_token_expiry":"3H"},"dryRun":true}'
```

**TypeScript:**

```ts
const result = await client.request("change_cluster_settings", { body: { changes: { "cluster.join_token_expiry": "3H" }, dryRun: true } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "applied": false,
  "changes": [
    {
      "key": "cluster.join_token_expiry",
      "label": "Join tokens expire after",
      "from": "1H",
      "to": "3H",
      "warnings": [
        "Apelora recommends join tokens that last an hour or less."
      ]
    }
  ],
  "approvalTarget": "cluster-settings:cluster.join_token_expiry"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request`, `invalid_setting` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `409` | `approval_invalid`, `approval_required`, `nothing_to_change` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |
| `503` | `cluster_admin_not_configured`, `database_not_configured` |

### `POST /api/v1/cluster/upgrade`

One step of the rolling upgrade. Apelora evacuates and restores. It does not install Incus: `upgraded` records that the package was upgraded on the server. Needs `cluster.evacuate`.

**Operation ID:** `cluster_upgrade`

**Needs:** `cluster.evacuate`.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `action` | string | yes | `start`, `evacuate`, `upgraded`, `restore` or `abandon`. |
| `confirm` | string | yes | `upgrade` to start or abandon; the member's name for the other actions. |
| `member` | string | no | The member, for evacuate, upgraded and restore. |

```json
{
  "action": "start",
  "confirm": "upgrade"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/cluster/upgrade" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"action":"start","confirm":"upgrade"}'
```

**TypeScript:**

```ts
const result = await client.request("cluster_upgrade", { body: { action: "start", confirm: "upgrade" } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

**Response `202`** — Accepted: the work is queued; the response says how to follow it..

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `confirmation_mismatch`, `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `evacuation_blocked`, `no_upgrade`, `not_upgraded`, `upgrade_blocked`, `upgrade_in_progress`, `upgrade_step` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |
| `503` | `cluster_admin_not_configured`, `database_not_configured` |

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

**TypeScript:**

```ts
const result = await client.request("list_machines", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T21:24:20.340661Z"
  },
  "items": [
    {
      "name": "mock-member-03",
      "provider": "manual",
      "providerRef": null,
      "capabilities": {
        "discovers": false,
        "installs": false,
        "powers": false
      },
      "description": "First rack, slot 3",
      "state": "eligible",
      "memberStatus": "Online",
      "architecture": "x86_64",
      "nextStep": "None.",
      "warnings": [],
      "registeredBy": "token:docs-verifier",
      "registeredAt": "2026-10-28T21:24:03.412827Z",
      "approvedBy": null,
      "approvedAt": null,
      "approvalExpiresAt": null,
      "admittedBy": "token:docs-verifier",
      "admittedAt": "2026-10-28T21:24:03.427874Z"
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
| `503` | `cluster_admin_not_configured`, `database_not_configured` |

### `POST /api/v1/machines`

Registers a machine. A name that is already an eligible member is adopted as admitted. Needs `manage-infrastructure`; audited.

**Operation ID:** `register_machine`

**Needs:** `manage-infrastructure`; audited.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `description` | string | no | — |
| `name` | string | yes | The name it will have as a cluster member. |
| `provider` | one of `manual`, `maas` or null | no | — |
| `systemId` | string or null | no | For a `maas` machine: its MAAS system id (from `GET /api/v1/provisioners/maas/machines`). |

```json
{
  "name": "rack2-01",
  "description": "Second rack, slot 1",
  "provider": "manual"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/machines" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"rack2-01","description":"Second rack, slot 1","provider":"manual"}'
```

**TypeScript:**

```ts
const result = await client.request("register_machine", { body: { name: "rack2-01", description: "Second rack, slot 1", provider: "manual" } });
```

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "name": "rack2-01",
  "provider": "manual",
  "providerRef": null,
  "capabilities": {
    "discovers": false,
    "installs": false,
    "powers": false
  },
  "description": "Second rack, slot 1",
  "state": "registered",
  "memberStatus": null,
  "architecture": null,
  "nextStep": "Install Incus on the server, then approve it.",
  "warnings": [],
  "registeredBy": "token:docs-verifier",
  "registeredAt": "2026-10-28T21:24:03.40355Z",
  "approvedBy": null,
  "approvedAt": null,
  "approvalExpiresAt": null,
  "admittedBy": null,
  "admittedAt": null
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request`, `unknown_machine` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `409` | — |
| `429` | `rate_limited` |
| `502` | `provisioner_unavailable`, an `incus_…` code |
| `503` | `cluster_admin_not_configured`, `provisioner_not_configured`, `database_not_configured` |

### `DELETE /api/v1/machines/{name}`

Forgets a machine that is not a cluster member (revoking an unused join token). Needs `manage-infrastructure`; audited.

**Operation ID:** `remove_machine`

**Needs:** `manage-infrastructure`; audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Machine name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/machines/rack2-01" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("remove_machine", { params: { name: "rack2-01" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | — |
| `409` | `approval_invalid`, `approval_required`, `still_a_member` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |
| `503` | `cluster_admin_not_configured`, `database_not_configured` |

### `GET /api/v1/machines/{name}/admission`

The admission checks for a joined machine (dry run; changes nothing). Needs `manage-infrastructure`.

**Operation ID:** `machine_admission`

**Needs:** `manage-infrastructure`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Machine name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/machines/mock-member-03/admission" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("machine_admission", { params: { name: "mock-member-03" } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T21:24:03.422845Z"
  },
  "name": "mock-member-03",
  "admissible": true,
  "checks": [
    {
      "id": "member-online",
      "title": "Member online",
      "status": "pass",
      "detail": "online"
    },
    {
      "id": "incus-version",
      "title": "Incus version",
      "status": "not-checked",
      "detail": "the member did not report its version"
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | — |
| `409` | `not_a_member` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |
| `503` | `cluster_admin_not_configured`, `database_not_configured` |

### `POST /api/v1/machines/{name}/admit`

Admits a joined machine: re-runs the admission checks and, when none fails, lets Incus place instances on it. Needs `manage-infrastructure`; audited.

**Operation ID:** `admit_machine`

**Needs:** `manage-infrastructure`; audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Machine name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/machines/mock-member-03/admit" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("admit_machine", { params: { name: "mock-member-03" } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T21:24:03.427213Z"
  },
  "name": "mock-member-03",
  "admissible": true,
  "checks": [
    {
      "id": "member-online",
      "title": "Member online",
      "status": "pass",
      "detail": "online"
    },
    {
      "id": "incus-version",
      "title": "Incus version",
      "status": "not-checked",
      "detail": "the member did not report its version"
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | — |
| `409` | `admission_blocked`, `not_a_member` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |
| `503` | `cluster_admin_not_configured`, `database_not_configured` |

### `DELETE /api/v1/machines/{name}/approval`

Withdraws an approval: revokes the machine's unused join token. Needs `manage-infrastructure`; audited.

**Operation ID:** `withdraw_machine_approval`

**Needs:** `manage-infrastructure`; audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Machine name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/machines/rack2-01/approval" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("withdraw_machine_approval", { params: { name: "rack2-01" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | — |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |
| `503` | `cluster_admin_not_configured`, `database_not_configured` |

### `POST /api/v1/machines/{name}/approve`

Approves a machine: asks Incus for its single-use join token, returned only in this response with the command to run on the server. Needs `manage-infrastructure`; audited without the token.

**Operation ID:** `approve_machine`

**Needs:** `manage-infrastructure`; audited without the token.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Machine name |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/machines/rack2-01/approve" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("approve_machine", { params: { name: "rack2-01" } });
```

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "name": "rack2-01",
  "expiresAt": "2026-10-28T22:24:03.438768Z",
  "token": "<token, shown once>",
  "enrolCommand": "sudo bash scripts/enrol/enrol-member.sh --name rack2-01 --address <this server's cluster address> --pool-size <size of the local loop pool, such as 20GiB>",
  "warnings": []
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | — |
| `409` | `already_a_member`, `approval_invalid`, `approval_pending`, `approval_required` |
| `429` | `rate_limited` |
| `502` | an `incus_…` code |
| `503` | `cluster_admin_not_configured`, `database_not_configured` |

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

**TypeScript:**

```ts
const result = await client.request("maas_machines", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T21:24:20.386293Z"
  },
  "configured": false,
  "items": []
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `502` | `provisioner_unavailable`, an `incus_…` code |
| `503` | `database_not_configured`, `store_unavailable` |

### `POST /api/v1/provisioners/maas/machines/{system_id}/commission`

Starts commissioning. Needs `hardware.commission` and the hostname typed again. The cloud-init of a later deploy is not part of this. Audited; MAAS is asked first.

**Operation ID:** `maas_commission`

**Needs:** `hardware.commission` and the hostname typed again.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `system_id` | path | string | yes | — | MAAS system id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The machine's hostname, typed again. |

```json
{
  "confirm": "rack3-04"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/provisioners/maas/machines/4y3h7n/commission" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"rack3-04"}'
```

**TypeScript:**

```ts
const result = await client.request("maas_commission", { params: { system_id: "4y3h7n" }, body: { confirm: "rack3-04" } });
```

**Response `202`** — Accepted: the work is queued; the response says how to follow it..

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

```json
{
  "action": "example",
  "hostname": "example",
  "systemId": "example"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `confirmation_mismatch`, `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `429` | `rate_limited` |
| `500` | `store_error` |
| `502` | `provisioner_unavailable`, an `incus_…` code |
| `503` | `provisioner_not_configured`, `database_not_configured` |

### `POST /api/v1/provisioners/maas/machines/{system_id}/deploy`

Installs an operating system. Needs `hardware.deploy` and the hostname typed again. `userData` is sent to MAAS and is not stored or written to the audit log. Audited.

**Operation ID:** `maas_deploy`

**Needs:** `hardware.deploy` and the hostname typed again.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `system_id` | path | string | yes | — | MAAS system id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | — |
| `distroSeries` | string | yes | MAAS's series name, such as `noble`. |
| `userData` | string | yes | Cloud-init. Sent to MAAS and not stored. A join token in it is not kept. |

```json
{
  "confirm": "rack3-04",
  "distroSeries": "noble",
  "userData": ""
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/provisioners/maas/machines/4y3h7n/deploy" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"rack3-04","distroSeries":"noble","userData":""}'
```

**TypeScript:**

```ts
const result = await client.request("maas_deploy", { params: { system_id: "4y3h7n" }, body: { confirm: "rack3-04", distroSeries: "noble", userData: "" } });
```

**Response `202`** — Accepted: the work is queued; the response says how to follow it..

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

```json
{
  "action": "example",
  "hostname": "example",
  "systemId": "example"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `confirmation_mismatch`, `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `429` | `rate_limited` |
| `500` | `store_error` |
| `502` | `provisioner_unavailable`, an `incus_…` code |
| `503` | `provisioner_not_configured`, `database_not_configured` |

### `POST /api/v1/provisioners/maas/machines/{system_id}/release`

Returns the machine to MAAS's pool. Needs `hardware.deploy` and the hostname typed again. Disk erasure needs `hardware.delete` as well and is off unless asked. A secure wipe is not offered. Audited; MAAS is asked first.

**Operation ID:** `maas_release`

**Needs:** `hardware.deploy` and the hostname typed again. `hardware.delete` as well and is off unless asked.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `system_id` | path | string | yes | — | MAAS system id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | — |
| `eraseDisks` | boolean | no | Wipe the installed system. Off unless the caller sets it. A secure wipe is not offered. |

```json
{
  "confirm": "rack3-04",
  "eraseDisks": true
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/provisioners/maas/machines/4y3h7n/release" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"rack3-04","eraseDisks":true}'
```

**TypeScript:**

```ts
const result = await client.request("maas_release", { params: { system_id: "4y3h7n" }, body: { confirm: "rack3-04", eraseDisks: true } });
```

**Response `202`** — Accepted: the work is queued; the response says how to follow it..

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

```json
{
  "action": "example",
  "hostname": "example",
  "systemId": "example"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `confirmation_mismatch`, `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `429` | `rate_limited` |
| `500` | `store_error` |
| `502` | `provisioner_unavailable`, an `incus_…` code |
| `503` | `provisioner_not_configured`, `database_not_configured` |

### `POST /api/v1/provisioners/maas/machines/{system_id}/test`

Starts a hardware test run (burn-in) through MAAS. Needs `hardware.commission` and the hostname typed again. Only a machine that is `Ready`, `Broken` or `Failed testing`: one that is allocated or deployed (an Incus member, for one) is refused, so tests never load a running server. Audited with the test names; MAAS is asked first.

**Operation ID:** `maas_test`

**Needs:** `hardware.commission` and the hostname typed again.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `system_id` | path | string | yes | — | MAAS system id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | — |
| `scripts` | list of string | no | MAAS test script or tag names (up to 16). Empty runs MAAS's default tests. |

```json
{
  "confirm": "rack3-04",
  "scripts": [
    "smartctl-validate"
  ]
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/provisioners/maas/machines/4y3h7n/test" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"rack3-04","scripts":["smartctl-validate"]}'
```

**TypeScript:**

```ts
const result = await client.request("maas_test", { params: { system_id: "4y3h7n" }, body: { confirm: "rack3-04", scripts: ["smartctl-validate"] } });
```

**Response `202`** — Accepted: the work is queued; the response says how to follow it..

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

```json
{
  "action": "example",
  "hostname": "example",
  "systemId": "example"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `confirmation_mismatch`, `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `machine_in_use` |
| `429` | `rate_limited` |
| `500` | `store_error` |
| `502` | `provisioner_unavailable`, an `incus_…` code |
| `503` | `provisioner_not_configured`, `database_not_configured` |

### `GET /api/v1/sectors`

The sectors this control plane knows and whether each answers. Needs `cluster.view`.

**Operation ID:** `sectors`

**Needs:** `cluster.view`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/sectors" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("sectors", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T21:24:03.358479Z"
  },
  "items": [
    {
      "name": "default",
      "site": "default",
      "home": true,
      "url": null,
      "state": "connected",
      "members": 3,
      "incusVersion": null,
      "credentialVars": []
    },
    {
      "name": "site-b",
      "site": "rotterdam",
      "home": false,
      "url": "https://incus.site-b.example.invalid:8443",
      "state": "connected",
      "members": 3,
      "incusVersion": null,
      "credentialVars": [
        "APELORA_SECTOR_SITE_B_CLIENT_CERT",
        "APELORA_SECTOR_SITE_B_CLIENT_KEY",
        "APELORA_SECTOR_SITE_B_SERVER_CERT"
      ],
      "addedBy": "token:docs-verifier",
      "addedAt": "2026-10-28 21:24:03.347818 +00:00:00"
    }
  ],
  "note": "Applications deploy to the home sector only. Registered sectors are read for their state and count towards the sites a second deployment could use; deploying to them is a later step."
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `500` | `invalid_place`, `store_error` |

### `POST /api/v1/sectors`

Registers another Incus cluster as a sector. Stores its name, site, address and the name of its credentials; the identity's files stay on the control plane. Needs `cluster.manage`.

**Operation ID:** `add_sector`

**Needs:** `cluster.manage`.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `credentials` | string | yes | Names the variables `APELORA_SECTOR_<credentials>_CLIENT_CERT`, `_CLIENT_KEY` and `_SERVER_CERT` on the control plane. Never a file or a secret. |
| `name` | string | yes | — |
| `site` | string | yes | — |
| `url` | string | yes | `https://host:port` of its Incus API. |

```json
{
  "name": "site-b",
  "site": "rotterdam",
  "url": "https://incus.site-b.example.invalid:8443",
  "credentials": "SITE_B"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/sectors" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"site-b","site":"rotterdam","url":"https://incus.site-b.example.invalid:8443","credentials":"SITE_B"}'
```

**TypeScript:**

```ts
const result = await client.request("add_sector", { body /* the request body above */ });
```

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "name": "site-b",
  "site": "rotterdam",
  "home": false,
  "url": "https://incus.site-b.example.invalid:8443",
  "state": "connected",
  "members": 3,
  "incusVersion": null,
  "credentialVars": [
    "APELORA_SECTOR_SITE_B_CLIENT_CERT",
    "APELORA_SECTOR_SITE_B_CLIENT_KEY",
    "APELORA_SECTOR_SITE_B_SERVER_CERT"
  ],
  "addedBy": "token:docs-verifier",
  "addedAt": "2026-10-28 21:24:03.347818 +00:00:00"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request`, `invalid_sector` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `409` | `sector_exists` |
| `429` | `rate_limited` |
| `500` | `invalid_place`, `internal` |
| `503` | `no_database`, `database_not_configured`, `store_unavailable` |

### `DELETE /api/v1/sectors/{name}`

Forgets a registered sector. Nothing changes in its Incus. Needs `cluster.manage`.

**Operation ID:** `remove_sector`

**Needs:** `cluster.manage`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `name` | path | string | yes | — | Sector name |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The sector's name, typed again. |

```json
{
  "confirm": "site-b"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/sectors/site-b" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"site-b"}'
```

**TypeScript:**

```ts
await client.request("remove_sector", { params: { name: "site-b" }, body: { confirm: "site-b" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `confirmation_mismatch`, `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `429` | `rate_limited` |
| `503` | `no_database`, `database_not_configured`, `store_unavailable` |

