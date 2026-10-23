---
title: Alerts API
section: api
slug: alerts
order: 10
label: Alerts
source: packages/api-client/openapi.json
summary: Alerts, silences and webhook channels.
---
Built-in alerts, acknowledgement and silences, and the webhook channels that receive them. This page lists 12 operations.

Set variables in the [API overview](/docs/api/overview/). Download [OpenAPI](/assets/api/openapi.json). Examples: **MOCK VERIFIED** (tested with simulated inventory); **Illustrative** (schema values).

## Operations

| Operation | What it does |
|---|---|
| [`GET /api/v1/alerts`](#get-apiv1alerts) | Firing alerts (most severe and oldest first) with acknowledgement and silence, the silences in force, counts by severity and whether the evaluator runs. |
| [`POST /api/v1/alerts/{id}/acknowledge`](#post-apiv1alertsidacknowledge) | Acknowledges a firing alert: who, when and an optional note. |
| [`GET /api/v1/alerts/channels`](#get-apiv1alertschannels) | Webhook channels with their delivery state. |
| [`POST /api/v1/alerts/channels`](#post-apiv1alertschannels) | Adds a webhook channel. |
| [`PUT /api/v1/alerts/channels/{id}`](#put-apiv1alertschannelsid) | Changes a webhook channel. |
| [`DELETE /api/v1/alerts/channels/{id}`](#delete-apiv1alertschannelsid) | Deletes a webhook channel; messages still waiting for it are dropped by the relay. |
| [`POST /api/v1/alerts/channels/{id}/test`](#post-apiv1alertschannelsidtest) | Queues a test notification for one channel through the same outbox path as real alerts; the channel's delivery state shows the outcome within seconds. |
| [`GET /api/v1/alerts/history`](#get-apiv1alertshistory) | Resolved alerts, newest first, paged by `before`. |
| [`GET /api/v1/alerts/rules`](#get-apiv1alertsrules) | The built-in rules with their parameters in force, their defaults and what the evaluator's last pass said about each source. |
| [`PUT /api/v1/alerts/rules/{rule}`](#put-apiv1alertsrulesrule) | Changes a rule's parameters (on or off, threshold within the rule's bounds, duration up to a day, severity). |
| [`POST /api/v1/alerts/silences`](#post-apiv1alertssilences) | Silences a rule (every subject, or one) for `minutes` from now: no notification is sent for its alerts that fire or resolve meanwhile. |
| [`DELETE /api/v1/alerts/silences/{id}`](#delete-apiv1alertssilencesid) | Ends a silence now. |

## Details

### `GET /api/v1/alerts`

Firing alerts (most severe and oldest first) with acknowledgement and silence, the silences in force, counts by severity and whether the evaluator runs. Needs `cluster.view`.

**Operation ID:** `alerts`

**Needs:** `cluster.view`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/alerts" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

```json
{
  "alerts": [],
  "silences": [],
  "counts": {
    "critical": 0,
    "warning": 0,
    "info": 0,
    "needsAttention": 0
  },
  "evaluator": {
    "lastPassAt": null,
    "everySecs": null,
    "worker": null,
    "durationSecs": null,
    "stale": true,
    "message": "Alerts have not been evaluated yet: no deployment worker has run the alert evaluator (APELORA_ALERT_EVALUATE_SECS, on by default)."
  },
  "actions": {
    "respond": {
      "allowed": true,
      "reason": null
    },
    "configure": {
      "allowed": true,
      "reason": null
    }
  }
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/alerts/{id}/acknowledge`

Acknowledges a firing alert: who, when and an optional note. It keeps firing until its condition clears; acknowledging tells others someone is on it. Refused (409) when it is not firing (`not_firing`) or was acknowledged already (`already_acknowledged`). Needs `alert.respond`; audited as `alert.acknowledge`.

**Operation ID:** `acknowledge_alert`

**Needs:** `alert.respond`; audited as `alert.acknowledge`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | integer | yes | Alert id |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `note` | string | no | What is being done about it (at most 500 characters). |

```json
{
  "note": "example"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/alerts/00000000-0000-4000-8000-000000000001/acknowledge" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"note":"example"}'
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "comparison": "at-least",
  "id": 1,
  "lastSeenAt": "2026-01-01T09:00:00Z",
  "rule": "example",
  "runbook": "example",
  "severity": "info",
  "startedAt": "2026-01-01T09:00:00Z",
  "state": "example",
  "subject": "example",
  "summary": "example",
  "threshold": 1,
  "title": "example",
  "unit": "example",
  "value": 1,
  "acknowledged": {
    "at": "2026-01-01T09:00:00Z",
    "by": "example",
    "byName": "example",
    "note": "example"
  },
  "clearingSince": "example",
  "firedAt": "2026-01-01T09:00:00Z",
  "resolvedAt": "2026-01-01T09:00:00Z",
  "silencedBy": {
    "id": "00000000-0000-4000-8000-000000000001",
    "until": "example"
  }
}
```

**Errors:** `400`, `401`, `403`, `404`, `409`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/alerts/channels`

Webhook channels with their delivery state. The full URL only for callers who may configure channels. Needs `cluster.view`.

**Operation ID:** `alert_channels`

**Needs:** `cluster.view`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/alerts/channels" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

```json
{
  "channels": [],
  "secretPrefix": "APELORA_ALERT_SECRET_",
  "actions": {
    "respond": {
      "allowed": true,
      "reason": null
    },
    "configure": {
      "allowed": true,
      "reason": null
    }
  }
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/alerts/channels`

Adds a webhook channel. HTTPS only; the signing secret is named, never sent. Needs `alert.configure`; audited as `alert.channel.create` (host only, not the URL).

**Operation ID:** `create_alert_channel`

**Needs:** `alert.configure`; audited as `alert.channel.create` (host only, not the URL).

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `enabled` | boolean | no | — |
| `minSeverity` | one of several | no | — |
| `name` | string | yes | 1 to 80 characters, unique. |
| `secretRef` | string | yes | The name of the environment variable on the worker holding the signing secret, e.g. `APELORA_ALERT_SECRET_OPS`. Never the secret itself. |
| `url` | string | yes | `https://…` only, without a user name or password. |

```json
{
  "name": "example",
  "url": "https://example.org",
  "secretRef": "<redacted>"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/alerts/channels" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"example","url":"https://example.org","secretRef":"<redacted>"}'
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "createdAt": "2026-01-01T09:00:00Z",
  "createdBy": "example",
  "delivery": {
    "failing": 1,
    "pending": 1,
    "lastDeliveredAt": "2026-01-01T09:00:00Z",
    "lastError": "example"
  },
  "enabled": false,
  "host": "example",
  "id": "00000000-0000-4000-8000-000000000001",
  "kind": "example",
  "minSeverity": "info",
  "name": "example",
  "secretRef": "<redacted>",
  "updatedAt": "2026-01-01T09:00:00Z",
  "url": "https://example.org"
}
```

**Errors:** `400`, `401`, `403`, `409`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `PUT /api/v1/alerts/channels/{id}`

Changes a webhook channel. Needs `alert.configure`; audited as `alert.channel.update`.

**Operation ID:** `update_alert_channel`

**Needs:** `alert.configure`; audited as `alert.channel.update`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Channel id |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `enabled` | boolean | no | — |
| `minSeverity` | one of several | no | — |
| `name` | string | yes | 1 to 80 characters, unique. |
| `secretRef` | string | yes | The name of the environment variable on the worker holding the signing secret, e.g. `APELORA_ALERT_SECRET_OPS`. Never the secret itself. |
| `url` | string | yes | `https://…` only, without a user name or password. |

```json
{
  "name": "example",
  "url": "https://example.org",
  "secretRef": "<redacted>"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/alerts/channels/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"example","url":"https://example.org","secretRef":"<redacted>"}'
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "createdAt": "2026-01-01T09:00:00Z",
  "createdBy": "example",
  "delivery": {
    "failing": 1,
    "pending": 1,
    "lastDeliveredAt": "2026-01-01T09:00:00Z",
    "lastError": "example"
  },
  "enabled": false,
  "host": "example",
  "id": "00000000-0000-4000-8000-000000000001",
  "kind": "example",
  "minSeverity": "info",
  "name": "example",
  "secretRef": "<redacted>",
  "updatedAt": "2026-01-01T09:00:00Z",
  "url": "https://example.org"
}
```

**Errors:** `400`, `401`, `403`, `404`, `409`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/alerts/channels/{id}`

Deletes a webhook channel; messages still waiting for it are dropped by the relay. Needs `alert.configure`; audited as `alert.channel.delete`.

**Operation ID:** `delete_alert_channel`

**Needs:** `alert.configure`; audited as `alert.channel.delete`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Channel id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/alerts/channels/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `401`, `403`, `404`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/alerts/channels/{id}/test`

Queues a test notification for one channel through the same outbox path as real alerts; the channel's delivery state shows the outcome within seconds. Needs `alert.configure`; audited as `alert.channel.test` in the same transaction as the message.

**Operation ID:** `test_alert_channel`

**Needs:** `alert.configure`; audited as `alert.channel.test` in the same transaction as the message.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Channel id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/alerts/channels/00000000-0000-4000-8000-000000000001/test" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `202`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "messageId": 1
}
```

**Errors:** `401`, `403`, `404`, `409`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/alerts/history`

Resolved alerts, newest first, paged by `before`. Kept 90 days. Needs `cluster.view`.

**Operation ID:** `alert_history`

**Needs:** `cluster.view`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `before` | query | integer | no | Only alerts with a smaller id (the last one of the previous page). |
| `limit` | query | integer | no | 1 to 200 (default 50). |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/alerts/history" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

```json
{
  "items": []
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/alerts/rules`

The built-in rules with their parameters in force, their defaults and what the evaluator's last pass said about each source. Needs `cluster.view`.

**Operation ID:** `alert_rules`

**Needs:** `cluster.view`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/alerts/rules" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**MOCK VERIFIED output** (2026-10-23T22:12:58+00:00, local API with simulated inventory). IDs and timestamps are from that test run.

```json
{
  "rules": [
    {
      "id": "job-failures",
      "title": "Jobs are failing",
      "description": "Jobs of one kind that ended failed in the last 15 minutes. A failed job did not reach its goal after its retries.",
      "unit": "failed jobs in 15 minutes",
      "comparison": "at-least",
      "thresholdEditable": true,
      "thresholdMin": 1,
      "thresholdMax": 1000,
      "params": {
        "enabled": true,
        "threshold": 1,
        "forSecs": 0,
        "severity": "warning"
      },
      "defaults": {
        "enabled": true,
        "threshold": 1,
        "forSecs": 0,
        "severity": "warning"
      },
      "source": "Job queue",
      "sourceState": "unknown",
      "firing": 0,
      "runbook": "alerts.md#jobs-are-failing",
      "updatedAt": null,
      "updatedBy": null
    },
    {
      "id": "job-queue-wait",
      "title": "Jobs are waiting too long",
      "description": "How long the oldest job that could run has waited. Long waits mean no worker is claiming jobs, or workers are busy.",
      "unit": "seconds",
      "comparison": "at-least",
      "thresholdEditable": true,
      "thresholdMin": 10,
      "thresholdMax": 86400,
      "params": {
        "enabled": true,
        "threshold": 300,
        "forSecs": 60,
        "severity": "warning"
      },
      "defaults": {
        "enabled": true,
        "threshold": 300,
        "forSecs": 60,
        "severity": "warning"
      },
      "source": "Job queue",
      "sourceState": "unknown",
      "firing": 0,
      "runbook": "alerts.md#jobs-are-waiting-too-long",
      "updatedAt": null,
      "updatedBy": null
    },
    {
      "id": "job-leases-expired",
      "title": "Running jobs lost their worker",
      "description": "Running jobs whose worker stopped renewing the lease. Another worker takes them over; if none does, they stay stuck.",
      "unit": "jobs",
      "comparison": "at-least",
      "thresholdEditable": true,
      "thresholdMin": 1,
      "thresholdMax": 1000,
      "params": {
        "enabled": true,
        "threshold": 1,
        "forSecs": 120,
        "severity": "warning"
      },
      "defaults": {
        "enabled": true,
        "threshold": 1,
        "forSecs": 120,
        "severity": "warning"
      },
      "source": "Job queue",
      "sourceState": "unknown",
      "firing": 0,
      "runbook": "alerts.md#running-jobs-lost-their-worker",
      "updatedAt": null,
      "updatedBy": null
    },
    {
      "id": "worker-silent",
      "title": "A worker stopped reporting",
      "description": "A deployment worker that did not stop cleanly and has not written its heartbeat for this long (workers write one every 15 seconds).",
      "unit": "seconds since its heartbeat",
      "comparison": "at-least",
      "thresholdEditable": true,
      "thresholdMin": 30,
      "thresholdMax": 86400,
      "params": {
        "enabled": true,
        "threshold": 60,
        "forSecs": 0,
        "severity": "critical"
      },
      "defaults": {
        "enabled": true,
        "threshold": 60,
        "forSecs": 0,
        "severity": "critical"
      },
      "source": "Worker heartbeats",
      "sourceState": "unknown",
      "firing": 0,
      "runbook": "alerts.md#a-worker-stopped-reporting",
      "updatedAt": null,
      "updatedBy": null
    },
    {
      "id": "leader-missing",
      "title": "Nobody holds a leader role",
      "description": "A role only one worker plays (replica supervisor, outbox relay, alert evaluator) has had no holder for this long.",
      "unit": "seconds without a holder",
      "comparison": "at-least",
      "thresholdEditable": true,
      "thresholdMin": 30,
      "thresholdMax": 86400,
      "params": {
        "enabled": true,
        "threshold": 90,
        "forSecs": 0,
        "severity": "warning"
      },
      "defaults": {
        "enabled": true,
        "threshold": 90,
        "forSecs": 0,
        "severity": "warning"
      },
      "source": "Leader leases",
      "sourceState": "unknown",
      "firing": 0,
      "runbook": "alerts.md#nobody-holds-a-leader-role",
      "updatedAt": null,
      "updatedBy": null
    },
    {
      "id": "supervisor-actions",
      "title": "The supervisor is acting often",
      "description": "Replica actions (recreate, restart, substitute, retire) the supervisor took in the last hour. Many in a row usually mean one cause that keeps coming back.",
      "unit": "actions in an hour",
      "comparison": "at-least",
      "thresholdEditable": true,
      "thresholdMin": 1,
      "thresholdMax": 1000,
      "params": {
        "enabled": true,
        "threshold": 4,
        "forSecs": 0,
        "severity": "warning"
      },
      "defaults": {
        "enabled": true,
        "threshold": 4,
        "forSecs": 0,
        "severity": "warning"
      },
      "source": "Supervisor audit rows",
      "sourceState": "unknown",
      "firing": 0,
      "runbook": "alerts.md#the-supervisor-is-acting-often",
      "updatedAt": null,
      "updatedBy": null
    },
    {
      "id": "replica-unhealthy",
      "title": "A replica is unhealthy",
      "description": "An instance the supervisor rates unhealthy (its port check keeps failing).",
      "unit": "while it lasts",
      "comparison": "at-least",
      "thresholdEditable": false,
      "thresholdMin": 1,
      "thresholdMax": 1,
      "params": {
        "enabled": true,
        "threshold": 1,
        "forSecs": 300,
        "severity": "warning"
      },
      "defaults": {
        "enabled": true,
        "threshold": 1,
        "forSecs": 300,
        "severity": "warning"
      },
      "source": "Instance health",
      "sourceState": "unknown",
      "firing": 0,
      "runbook": "alerts.md#a-replica-is-unhealthy",
      "updatedAt": null,
      "updatedBy": null
    },
    {
      "id": "application-status",
      "title": "An application is failed or degraded",
      "description": "An application whose derived status is failed (its last start, stop or restart failed) or degraded (fewer instances run than it should have).",
      "unit": "while it lasts",
      "comparison": "at-least",
      "thresholdEditable": false,
      "thresholdMin": 1,
      "thresholdMax": 1,
      "params": {
        "enabled": true,
        "threshold": 1,
        "forSecs": 600,
        "severity": "warning"
      },
      "defaults": {
        "enabled": true,
        "threshold": 1,
        "forSecs": 600,
        "severity": "warning"
      },
      "source": "Applications",
      "sourceState": "unknown",
      "firing": 0,
      "runbook": "alerts.md#an-application-is-failed-or-degraded",
      "updatedAt": null,
      "updatedBy": null
    },
    {
      "id": "incus-unreachable",
      "title": "Incus cannot be reached",
      "description": "The worker cannot read the member or instance list from Incus. Deployments, moves and recovery wait until it can.",
      "unit": "while it lasts",
      "comparison": "at-least",
      "thresholdEditable": false,
      "thresholdMin": 1,
      "thresholdMax": 1,
      "params": {
        "enabled": true,
        "threshold": 1,
        "forSecs": 60,
        "severity": "critical"
      },
      "defaults": {
        "enabled": true,
        "threshold": 1,
        "forSecs": 60,
        "severity": "critical"
      },
      "source": "Incus",
      "sourceState": "unknown",
      "firing": 0,
      "runbook": "alerts.md#incus-cannot-be-reached",
      "updatedAt": null,
      "updatedBy": null
    },
    {
      "id": "member-offline",
      "title": "A cluster member is not online",
      "description": "An Incus cluster member whose status is not Online. Two of three offline puts the cluster's quorum at risk.",
      "unit": "while it lasts",
      "comparison": "at-least",
      "thresholdEditable": false,
      "thresholdMin": 1,
      "thresholdMax": 1,
      "params": {
        "enabled": true,
        "threshold": 1,
        "forSecs": 120,
        "severity": "critical"
      },
      "defaults": {
        "enabled": true,
        "threshold": 1,
        "forSecs": 120,
        "severity": "critical"
      },
      "source": "Incus members",
      "sourceState": "unknown",
      "firing": 0,
      "runbook": "alerts.md#a-cluster-member-is-not-online",
      "updatedAt": null,
      "updatedBy": null
    },
    {
      "id": "member-unfenced",
      "title": "A failed server is waiting for fencing",
      "description": "A server Incus reports Offline holds modules on shared storage that restart on another server only once it is fenced: its storage lease expired, or a person confirmed it is off. Normally about 140 s after it stopped.",
      "unit": "while it lasts",
      "comparison": "at-least",
      "thresholdEditable": false,
      "thresholdMin": 1,
      "thresholdMax": 1,
      "params": {
        "enabled": true,
        "threshold": 1,
        "forSecs": 300,
        "severity": "critical"
      },
      "defaults": {
        "enabled": true,
        "threshold": 1,
        "forSecs": 300,
        "severity": "critical"
      },
      "source": "Failed servers",
      "sourceState": "unknown",
      "firing": 0,
      "runbook": "alerts.md#a-failed-server-is-waiting-for-fencing",
      "updatedAt": null,
      "updatedBy": null
    },
    {
      "id": "certificate-expiry",
      "title": "A certificate expires soon",
      "description": "Days left before the certificate the worker uses to reach Incus, or the Incus server certificate it trusts, expires.",
      "unit": "days left",
      "comparison": "at-most",
      "thresholdEditable": true,
      "thresholdMin": 1,
      "thresholdMax": 365,
      "params": {
        "enabled": true,
        "threshold": 30,
        "forSecs": 0,
        "severity": "warning"
      },
      "defaults": {
        "enabled": true,
        "threshold": 30,
        "forSecs": 0,
        "severity": "warning"
      },
      "source": "Worker's Incus configuration",
      "sourceState": "unknown",
      "firing": 0,
      "runbook": "alerts.md#a-certificate-expires-soon",
      "updatedAt": null,
      "updatedBy": null
    },
    {
      "id": "backup-failed",
      "title": "A scheduled snapshot or backup failed",
      "description": "The last scheduled snapshot or backup of a volume failed (or no backup pool is configured).",
      "unit": "while it lasts",
      "comparison": "at-least",
      "thresholdEditable": false,
      "thresholdMin": 1,
      "thresholdMax": 1,
      "params": {
        "enabled": true,
        "threshold": 1,
        "forSecs": 0,
        "severity": "warning"
      },
      "defaults": {
        "enabled": true,
        "threshold": 1,
        "forSecs": 0,
        "severity": "warning"
      },
      "source": "Volume schedules",
      "sourceState": "unknown",
      "firing": 0,
      "runbook": "alerts.md#a-scheduled-snapshot-or-backup-failed",
      "updatedAt": null,
      "updatedBy": null
    },
    {
      "id": "backup-age",
      "title": "A backup is overdue",
      "description": "Age of a scheduled volume's newest backup, in schedule periods (2 means two backups were missed in a row).",
      "unit": "schedule periods",
      "comparison": "at-least",
      "thresholdEditable": true,
      "thresholdMin": 1,
      "thresholdMax": 100,
      "params": {
        "enabled": true,
        "threshold": 2,
        "forSecs": 0,
        "severity": "warning"
      },
      "defaults": {
        "enabled": true,
        "threshold": 2,
        "forSecs": 0,
        "severity": "warning"
      },
      "source": "Volume schedules",
      "sourceState": "unknown",
      "firing": 0,
      "runbook": "alerts.md#a-backup-is-overdue",
      "updatedAt": null,
      "updatedBy": null
    },
    {
      "id": "outbox-stuck",
      "title": "Messages are not being delivered",
      "description": "How long the oldest undelivered outbox message (audit copies, alert notifications) has waited.",
      "unit": "seconds",
      "comparison": "at-least",
      "thresholdEditable": true,
      "thresholdMin": 60,
      "thresholdMax": 86400,
      "params": {
        "enabled": true,
        "threshold": 600,
        "forSecs": 0,
        "severity": "warning"
      },
      "defaults": {
        "enabled": true,
        "threshold": 600,
        "forSecs": 0,
        "severity": "warning"
      },
      "source": "Outbox",
      "sourceState": "unknown",
      "firing": 0,
      "runbook": "alerts.md#messages-are-not-being-delivered",
      "updatedAt": null,
      "updatedBy": null
    },
    {
      "id": "restore-drill-age",
      "title": "Apelora's database restore is not proven",
      "description": "Days since a restore of Apelora's own database was last verified by the drill. Read from the drill's record where the worker can see it (APELORA_RESTORE_DRILL_RECORD).",
      "unit": "days",
      "comparison": "at-least",
      "thresholdEditable": true,
      "thresholdMin": 1,
      "thresholdMax": 365,
      "params": {
        "enabled": true,
        "threshold": 35,
        "forSecs": 0,
        "severity": "warning"
      },
      "defaults": {
        "enabled": true,
        "threshold": 35,
        "forSecs": 0,
        "severity": "warning"
      },
      "source": "Restore drill record",
      "sourceState": "unknown",
      "firing": 0,
      "runbook": "alerts.md#apeloras-database-restore-is-not-proven",
      "updatedAt": null,
      "updatedBy": null
    }
  ],
  "actions": {
    "respond": {
      "allowed": true,
      "reason": null
    },
    "configure": {
      "allowed": true,
      "reason": null
    }
  }
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `PUT /api/v1/alerts/rules/{rule}`

Changes a rule's parameters (on or off, threshold within the rule's bounds, duration up to a day, severity). Takes effect on the evaluator's next pass. Needs `alert.configure`; audited as `alert.rule.update` with the parameters before and after.

**Operation ID:** `update_alert_rule`

**Needs:** `alert.configure`; audited as `alert.rule.update` with the parameters before and after.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `rule` | path | string | yes | Rule id |

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `enabled` | boolean | yes | — |
| `forSecs` | integer | yes | Seconds the condition must hold before firing, and stay clear before resolving. |
| `severity` | `info`, `warning`, `critical` | yes | — |
| `threshold` | number | yes | — |

```json
{
  "enabled": false,
  "threshold": 1,
  "forSecs": 0,
  "severity": "info"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/alerts/rules/example" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"enabled":false,"threshold":1,"forSecs":0,"severity":"info"}'
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "comparison": "at-least",
  "defaults": {
    "enabled": false,
    "forSecs": 0,
    "severity": "info",
    "threshold": 1
  },
  "description": "A description",
  "firing": 0,
  "id": "example",
  "params": {
    "enabled": false,
    "forSecs": 0,
    "severity": "info",
    "threshold": 1
  },
  "runbook": "example",
  "source": "example",
  "sourceState": "example",
  "thresholdEditable": false,
  "thresholdMax": 1,
  "thresholdMin": 1,
  "title": "example",
  "unit": "example",
  "updatedAt": "2026-01-01T09:00:00Z",
  "updatedBy": "example"
}
```

**Errors:** `400`, `401`, `403`, `404`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/alerts/silences`

Silences a rule (every subject, or one) for `minutes` from now: no notification is sent for its alerts that fire or resolve meanwhile. Evaluation and history go on. Needs `alert.respond`; audited as `alert.silence.create`.

**Operation ID:** `create_alert_silence`

**Needs:** `alert.respond`; audited as `alert.silence.create`.

**Request body** (JSON, illustrative values):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `minutes` | integer | yes | 1 to 10080 (a week). |
| `note` | string | no | — |
| `rule` | string | yes | — |
| `subject` | string | no | One subject; absent: every subject of the rule. |

```json
{
  "rule": "example",
  "minutes": 0
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/alerts/silences" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"rule":"example","minutes":0}'
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Illustrative response** — generated from the OpenAPI schema; these values are not an observed result.

```json
{
  "createdBy": "example",
  "endsAt": "2026-01-01T09:00:00Z",
  "id": "00000000-0000-4000-8000-000000000001",
  "note": "example",
  "rule": "example",
  "ruleTitle": "example",
  "startsAt": "2026-01-01T09:00:00Z",
  "createdByName": "example",
  "subject": "example"
}
```

**Errors:** `400`, `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/alerts/silences/{id}`

Ends a silence now. Needs `alert.respond`; audited as `alert.silence.end`. 404 when it is not in force (ended or run out).

**Operation ID:** `end_alert_silence`

**Needs:** `alert.respond`; audited as `alert.silence.end`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Silence id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/alerts/silences/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `401`, `403`, `404`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

