---
title: Alerts API
section: api
slug: alerts
order: 10
label: Alerts
source: packages/api-client/openapi.json
summary: Alerts, silences and webhook channels.
---
Built-in alerts, acknowledgement and silences, and the webhook channels that receive them. This page documents all 12 operations, each with a request you can copy. Set `APELORA_URL` and `APELORA_TOKEN` as described in [the API overview](/docs/api/overview/).

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

Firing alerts (most severe and oldest first) with acknowledgement and silence, the silences in force, counts by severity and whether the evaluator runs.

**Needs:** `cluster.view`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/alerts" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "actions": {
    "configure": {
      "allowed": false,
      "reason": "example"
    },
    "respond": {
      "allowed": false,
      "reason": "example"
    }
  },
  "alerts": [
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
      "value": 1
    }
  ],
  "counts": {
    "critical": 0,
    "info": 0,
    "needsAttention": 0,
    "warning": 0
  },
  "evaluator": {
    "message": "example",
    "stale": false,
    "durationSecs": 1,
    "everySecs": 1,
    "lastPassAt": "2026-01-01T09:00:00Z",
    "worker": "example"
  },
  "silences": [
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
  ]
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/alerts/{id}/acknowledge`

Acknowledges a firing alert: who, when and an optional note. It keeps firing until its condition clears; acknowledging tells others someone is on it. Refused (409) when it is not firing (`not_firing`) or was acknowledged already (`already_acknowledged`).

**Needs:** `alert.respond`; audited as `alert.acknowledge`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | integer | yes | Alert id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `note` | string | no | What is being done about it (at most 500 characters). |

```json
{
  "note": "example"
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/alerts/00000000-0000-4000-8000-000000000001/acknowledge" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"note":"example"}'
```

**Response `200`**:

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
  "value": 1
}
```

**Errors:** `400`, `401`, `403`, `404`, `409`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/alerts/channels`

Webhook channels with their delivery state. The full URL only for callers who may configure channels.

**Needs:** `cluster.view`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/alerts/channels" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "actions": {
    "configure": {
      "allowed": false,
      "reason": "example"
    },
    "respond": {
      "allowed": false,
      "reason": "example"
    }
  },
  "channels": [
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
  ],
  "secretPrefix": "<redacted>"
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/alerts/channels`

Adds a webhook channel. HTTPS only; the signing secret is named, never sent.

**Needs:** `alert.configure`; audited as `alert.channel.create` (host only, not the URL).

**Request body** (JSON):

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

```sh
curl -sS -X POST "$APELORA_URL/api/v1/alerts/channels" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"example","url":"https://example.org","secretRef":"<redacted>"}'
```

**Response `201`**:

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

Changes a webhook channel.

**Needs:** `alert.configure`; audited as `alert.channel.update`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Channel id |

**Request body** (JSON):

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

```sh
curl -sS -X PUT "$APELORA_URL/api/v1/alerts/channels/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"example","url":"https://example.org","secretRef":"<redacted>"}'
```

**Response `200`**:

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

Deletes a webhook channel; messages still waiting for it are dropped by the relay.

**Needs:** `alert.configure`; audited as `alert.channel.delete`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Channel id |

```sh
curl -sS -X DELETE "$APELORA_URL/api/v1/alerts/channels/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`**, with no body.

**Errors:** `401`, `403`, `404`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/alerts/channels/{id}/test`

Queues a test notification for one channel through the same outbox path as real alerts; the channel's delivery state shows the outcome within seconds.

**Needs:** `alert.configure`; audited as `alert.channel.test` in the same transaction as the message.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Channel id |

```sh
curl -sS -X POST "$APELORA_URL/api/v1/alerts/channels/00000000-0000-4000-8000-000000000001/test" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `202`**:

```json
{
  "messageId": 1
}
```

**Errors:** `401`, `403`, `404`, `409`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/alerts/history`

Resolved alerts, newest first, paged by `before`. Kept 90 days.

**Needs:** `cluster.view`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `before` | query | integer | no | Only alerts with a smaller id (the last one of the previous page). |
| `limit` | query | integer | no | 1 to 200 (default 50). |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/alerts/history" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
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
      "value": 1
    }
  ]
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/alerts/rules`

The built-in rules with their parameters in force, their defaults and what the evaluator's last pass said about each source.

**Needs:** `cluster.view`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/alerts/rules" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "actions": {
    "configure": {
      "allowed": false,
      "reason": "example"
    },
    "respond": {
      "allowed": false,
      "reason": "example"
    }
  },
  "rules": [
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
      "unit": "example"
    }
  ]
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `PUT /api/v1/alerts/rules/{rule}`

Changes a rule's parameters (on or off, threshold within the rule's bounds, duration up to a day, severity). Takes effect on the evaluator's next pass.

**Needs:** `alert.configure`; audited as `alert.rule.update` with the parameters before and after.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `rule` | path | string | yes | Rule id |

**Request body** (JSON):

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

```sh
curl -sS -X PUT "$APELORA_URL/api/v1/alerts/rules/example" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled":false,"threshold":1,"forSecs":0,"severity":"info"}'
```

**Response `200`**:

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
  "unit": "example"
}
```

**Errors:** `400`, `401`, `403`, `404`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/alerts/silences`

Silences a rule (every subject, or one) for `minutes` from now: no notification is sent for its alerts that fire or resolve meanwhile. Evaluation and history go on.

**Needs:** `alert.respond`; audited as `alert.silence.create`.

**Request body** (JSON):

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

```sh
curl -sS -X POST "$APELORA_URL/api/v1/alerts/silences" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rule":"example","minutes":0}'
```

**Response `201`**:

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

Ends a silence now. 404 when it is not in force (ended or run out).

**Needs:** `alert.respond`; audited as `alert.silence.end`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Silence id |

```sh
curl -sS -X DELETE "$APELORA_URL/api/v1/alerts/silences/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`**, with no body.

**Errors:** `401`, `403`, `404`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

