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

Set variables in the [API overview](/docs/api/overview/). Download [OpenAPI](/assets/api/openapi.json).

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

**TypeScript:**

```ts
const result = await client.request("alerts", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "alerts": [
    {
      "id": 2,
      "rule": "job-failures",
      "title": "Jobs are failing",
      "subject": "instance.restart",
      "severity": "warning",
      "state": "firing",
      "summary": "2 instance.restart jobs failed in the last 15 minutes; the latest: instance default/mock-web-01 exists but was not created by Apelora; it is left untouched",
      "value": 2,
      "threshold": 1,
      "comparison": "at-least",
      "unit": "failed jobs in 15 minutes",
      "startedAt": "2026-10-28T21:24:08.805105Z",
      "firedAt": "2026-10-28T21:24:08.805105Z",
      "lastSeenAt": "2026-10-28T21:24:18.908483Z",
      "resolvedAt": null,
      "clearingSince": null,
      "acknowledged": null,
      "silencedBy": null,
      "runbook": "alerts.md#jobs-are-failing"
    }
  ],
  "silences": [],
  "counts": {
    "critical": 0,
    "warning": 1,
    "info": 0,
    "needsAttention": 1
  },
  "evaluator": {
    "lastPassAt": "2026-10-28T21:24:18.908483Z",
    "everySecs": 5,
    "worker": "docs-worker",
    "durationSecs": 0.046453167,
    "stale": false,
    "message": "Evaluated every 5 s by docs-worker."
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

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `POST /api/v1/alerts/{id}/acknowledge`

Acknowledges a firing alert: who, when and an optional note. It keeps firing until its condition clears; acknowledging tells others someone is on it. Refused (409) when it is not firing (`not_firing`) or was acknowledged already (`already_acknowledged`). Needs `alert.respond`; audited as `alert.acknowledge`.

**Operation ID:** `acknowledge_alert`

**Needs:** `alert.respond`; audited as `alert.acknowledge`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | integer | yes | — | Alert id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `note` | string or null | no | What is being done about it (at most 500 characters). |

```json
{
  "note": "Looking into the failed job"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/alerts/2/acknowledge" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"note":"Looking into the failed job"}'
```

**TypeScript:**

```ts
const result = await client.request("acknowledge_alert", { params: { id: "2" }, body: { note: "Looking into the failed job" } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": 2,
  "rule": "job-failures",
  "title": "Jobs are failing",
  "subject": "instance.restart",
  "severity": "warning",
  "state": "firing",
  "summary": "2 instance.restart jobs failed in the last 15 minutes; the latest: instance default/mock-web-01 exists but was not created by Apelora; it is left untouched",
  "value": 2,
  "threshold": 1,
  "comparison": "at-least",
  "unit": "failed jobs in 15 minutes",
  "startedAt": "2026-10-28T21:24:08.805105Z",
  "firedAt": "2026-10-28T21:24:08.805105Z",
  "lastSeenAt": "2026-10-28T21:24:18.908483Z",
  "resolvedAt": null,
  "clearingSince": null,
  "acknowledged": {
    "by": "token:docs-verifier",
    "byName": "docs-verifier",
    "at": "2026-10-28T21:24:19.213851Z",
    "note": "Looking into the failed job"
  },
  "silencedBy": null,
  "runbook": "alerts.md#jobs-are-failing"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `already_acknowledged`, `not_firing` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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

**TypeScript:**

```ts
const result = await client.request("alert_channels", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "channels": [
    {
      "id": "0fe817a4-32f1-4fc0-b08a-5e3fb625cc34",
      "name": "On-call webhook",
      "kind": "webhook",
      "host": "hooks.example.invalid",
      "url": "https://hooks.example.invalid/apelora",
      "secretRef": "APELORA_ALERT_SECRET_ONCALL",
      "enabled": true,
      "minSeverity": "critical",
      "delivery": {
        "pending": 1,
        "failing": 0,
        "lastError": null,
        "lastDeliveredAt": null
      },
      "createdAt": "2026-10-28T21:24:03.466763Z",
      "createdBy": "token:docs-verifier",
      "updatedAt": "2026-10-28T21:24:03.476897Z"
    }
  ],
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

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `POST /api/v1/alerts/channels`

Adds a webhook channel. HTTPS only; the signing secret is named, never sent. Needs `alert.configure`; audited as `alert.channel.create` (host only, not the URL).

**Operation ID:** `create_alert_channel`

**Needs:** `alert.configure`; audited as `alert.channel.create` (host only, not the URL).

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `enabled` | boolean | no | — |
| `minSeverity` | one of `info`, `warning`, `critical` or null | no | — |
| `name` | string | yes | 1 to 80 characters, unique. |
| `secretRef` | string | yes | The name of the environment variable on the worker holding the signing secret, e.g. `APELORA_ALERT_SECRET_OPS`. Never the secret itself. |
| `url` | string | yes | `https://…` only, without a user name or password. |

```json
{
  "name": "On-call webhook",
  "url": "https://hooks.example.invalid/apelora",
  "secretRef": "APELORA_ALERT_SECRET_ONCALL",
  "minSeverity": "warning",
  "enabled": true
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/alerts/channels" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"On-call webhook","url":"https://hooks.example.invalid/apelora","secretRef":"APELORA_ALERT_SECRET_ONCALL","minSeverity":"warning","enabled":true}'
```

**TypeScript:**

```ts
const result = await client.request("create_alert_channel", { body /* the request body above */ });
```

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "0fe817a4-32f1-4fc0-b08a-5e3fb625cc34",
  "name": "On-call webhook",
  "kind": "webhook",
  "host": "hooks.example.invalid",
  "url": "https://hooks.example.invalid/apelora",
  "secretRef": "APELORA_ALERT_SECRET_ONCALL",
  "enabled": true,
  "minSeverity": "warning",
  "delivery": {
    "pending": 0,
    "failing": 0,
    "lastError": null,
    "lastDeliveredAt": null
  },
  "createdAt": "2026-10-28T21:24:03.466763Z",
  "createdBy": "token:docs-verifier",
  "updatedAt": "2026-10-28T21:24:03.466763Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `409` | `name_taken` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `PUT /api/v1/alerts/channels/{id}`

Changes a webhook channel. Needs `alert.configure`; audited as `alert.channel.update`.

**Operation ID:** `update_alert_channel`

**Needs:** `alert.configure`; audited as `alert.channel.update`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Channel id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `enabled` | boolean | no | — |
| `minSeverity` | one of `info`, `warning`, `critical` or null | no | — |
| `name` | string | yes | 1 to 80 characters, unique. |
| `secretRef` | string | yes | The name of the environment variable on the worker holding the signing secret, e.g. `APELORA_ALERT_SECRET_OPS`. Never the secret itself. |
| `url` | string | yes | `https://…` only, without a user name or password. |

```json
{
  "name": "On-call webhook",
  "url": "https://hooks.example.invalid/apelora",
  "secretRef": "APELORA_ALERT_SECRET_ONCALL",
  "minSeverity": "critical",
  "enabled": true
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/alerts/channels/0fe817a4-32f1-4fc0-b08a-5e3fb625cc34" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"On-call webhook","url":"https://hooks.example.invalid/apelora","secretRef":"APELORA_ALERT_SECRET_ONCALL","minSeverity":"critical","enabled":true}'
```

**TypeScript:**

```ts
const result = await client.request("update_alert_channel", { params: { id: "0fe817a4-32f1-4fc0-b08a-5e3fb625cc34" }, body /* the request body above */ });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "0fe817a4-32f1-4fc0-b08a-5e3fb625cc34",
  "name": "On-call webhook",
  "kind": "webhook",
  "host": "hooks.example.invalid",
  "url": "https://hooks.example.invalid/apelora",
  "secretRef": "APELORA_ALERT_SECRET_ONCALL",
  "enabled": true,
  "minSeverity": "critical",
  "delivery": {
    "pending": 0,
    "failing": 0,
    "lastError": null,
    "lastDeliveredAt": null
  },
  "createdAt": "2026-10-28T21:24:03.466763Z",
  "createdBy": "token:docs-verifier",
  "updatedAt": "2026-10-28T21:24:03.476897Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `name_taken` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `DELETE /api/v1/alerts/channels/{id}`

Deletes a webhook channel; messages still waiting for it are dropped by the relay. Needs `alert.configure`; audited as `alert.channel.delete`.

**Operation ID:** `delete_alert_channel`

**Needs:** `alert.configure`; audited as `alert.channel.delete`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Channel id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/alerts/channels/0fe817a4-32f1-4fc0-b08a-5e3fb625cc34" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("delete_alert_channel", { params: { id: "0fe817a4-32f1-4fc0-b08a-5e3fb625cc34" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `POST /api/v1/alerts/channels/{id}/test`

Queues a test notification for one channel through the same outbox path as real alerts; the channel's delivery state shows the outcome within seconds. Needs `alert.configure`; audited as `alert.channel.test` in the same transaction as the message.

**Operation ID:** `test_alert_channel`

**Needs:** `alert.configure`; audited as `alert.channel.test` in the same transaction as the message.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Channel id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/alerts/channels/0fe817a4-32f1-4fc0-b08a-5e3fb625cc34/test" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("test_alert_channel", { params: { id: "0fe817a4-32f1-4fc0-b08a-5e3fb625cc34" } });
```

**Response `202`** — Accepted: the work is queued; the response says how to follow it..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "messageId": 101
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `channel_disabled` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `GET /api/v1/alerts/history`

Resolved alerts, newest first, paged by `before`. Kept 90 days. Needs `cluster.view`.

**Operation ID:** `alert_history`

**Needs:** `cluster.view`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `before` | query | integer | no | — | Only alerts with a smaller id (the last one of the previous page). |
| `limit` | query | integer | no | `50` | 1 to 200 (default 50). |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/alerts/history" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**With options** (`before`, `limit`):

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/alerts/history?before=1&limit=1" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Next page:** repeat the request with `before` set to the `id` of the last item. A page shorter than `limit` is the last one.

**TypeScript:**

```ts
const result = await client.request("alert_history", { query: { before: 1, limit: 1 } });
```

**Response `200`** — Done; the response holds the result..

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
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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

**TypeScript:**

```ts
const result = await client.request("alert_rules", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

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
      "sourceState": "ok",
      "firing": 1,
      "runbook": "alerts.md#jobs-are-failing",
      "updatedAt": "2026-10-28T21:24:03.508051Z",
      "updatedBy": "token:docs-verifier"
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
      "sourceState": "ok",
      "firing": 0,
      "runbook": "alerts.md#jobs-are-waiting-too-long",
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

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `PUT /api/v1/alerts/rules/{rule}`

Changes a rule's parameters (on or off, threshold within the rule's bounds, duration up to a day, severity). Takes effect on the evaluator's next pass. Needs `alert.configure`; audited as `alert.rule.update` with the parameters before and after.

**Operation ID:** `update_alert_rule`

**Needs:** `alert.configure`; audited as `alert.rule.update` with the parameters before and after.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `rule` | path | string | yes | — | Rule id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `enabled` | boolean | yes | — |
| `forSecs` | integer | yes | Seconds the condition must hold before firing, and stay clear before resolving. |
| `severity` | one of `info`, `warning`, `critical` | yes | — |
| `threshold` | number | yes | — |

```json
{
  "enabled": true,
  "threshold": 1,
  "forSecs": 0,
  "severity": "warning"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/alerts/rules/job-failures" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"enabled":true,"threshold":1,"forSecs":0,"severity":"warning"}'
```

**TypeScript:**

```ts
const result = await client.request("update_alert_rule", { params: { rule: "job-failures" }, body: { enabled: true, threshold: 1, forSecs: 0, severity: "warning" } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
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
  "updatedAt": "2026-10-28T21:24:03.508051Z",
  "updatedBy": "token:docs-verifier"
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
| `503` | `database_not_configured` |

### `POST /api/v1/alerts/silences`

Silences a rule (every subject, or one) for `minutes` from now: no notification is sent for its alerts that fire or resolve meanwhile. Evaluation and history go on. Needs `alert.respond`; audited as `alert.silence.create`.

**Operation ID:** `create_alert_silence`

**Needs:** `alert.respond`; audited as `alert.silence.create`.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `minutes` | integer | yes | 1 to 10080 (a week). |
| `note` | string or null | no | — |
| `rule` | string | yes | — |
| `subject` | string or null | no | One subject; absent: every subject of the rule. |

```json
{
  "rule": "backup-age",
  "minutes": 120,
  "note": "Backup pool maintenance tonight"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/alerts/silences" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"rule":"backup-age","minutes":120,"note":"Backup pool maintenance tonight"}'
```

**TypeScript:**

```ts
const result = await client.request("create_alert_silence", { body: { rule: "backup-age", minutes: 120, note: "Backup pool maintenance tonight" } });
```

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "697b8f1b-4955-4729-87bd-0440dc471b0c",
  "rule": "backup-age",
  "ruleTitle": "A backup is overdue",
  "subject": null,
  "startsAt": "2026-10-28T21:24:03.531169Z",
  "endsAt": "2026-10-28T23:24:03.531169Z",
  "note": "Backup pool maintenance tonight",
  "createdBy": "token:docs-verifier",
  "createdByName": "docs-verifier"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `DELETE /api/v1/alerts/silences/{id}`

Ends a silence now. Needs `alert.respond`; audited as `alert.silence.end`. 404 when it is not in force (ended or run out).

**Operation ID:** `end_alert_silence`

**Needs:** `alert.respond`; audited as `alert.silence.end`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Silence id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/alerts/silences/697b8f1b-4955-4729-87bd-0440dc471b0c" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("end_alert_silence", { params: { id: "697b8f1b-4955-4729-87bd-0440dc471b0c" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

