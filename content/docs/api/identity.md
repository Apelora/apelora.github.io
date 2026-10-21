---
title: Identity and access API
section: api
slug: identity
order: 8
label: Identity and access
source: packages/api-client/openapi.json
summary: People, groups, roles, scopes, approvals, tokens and sign-in.
---
Identity and access: organisations, projects, people, groups, roles and assignments, approvals, service identities, tokens and sign-in methods. This page documents all 65 operations, each with a request you can copy. Set `APELORA_URL` and `APELORA_TOKEN` as described in [the API overview](/docs/api/overview/).

## Operations

| Operation | What it does |
|---|---|
| [`GET /api/v1/approvals`](#get-apiv1approvals) | Requests and approvals: your own, plus every open one if you may approve. |
| [`POST /api/v1/approvals`](#post-apiv1approvals) | Asks for approval of one risky action on one target. |
| [`POST /api/v1/approvals/{id}/approve`](#post-apiv1approvalsidapprove) | Approves a request made by someone else. |
| [`POST /api/v1/approvals/{id}/cancel`](#post-apiv1approvalsidcancel) | Withdraws your own pending request. |
| [`POST /api/v1/approvals/{id}/reject`](#post-apiv1approvalsidreject) | Rejects a request. |
| [`GET /api/v1/identity/assignments`](#get-apiv1identityassignments) | Role assignments in the caller's scopes. |
| [`POST /api/v1/identity/assignments`](#post-apiv1identityassignments) | Grants a role to a person, group or automation identity at a scope. |
| [`DELETE /api/v1/identity/assignments/{assignment}`](#delete-apiv1identityassignmentsassignment) | Revokes an assignment; the person loses it on their next request. |
| [`POST /api/v1/identity/assignments/preview`](#post-apiv1identityassignmentspreview) | Shows what an assignment would give before it is saved: what the person can already do at the scope, what they could do afterwards, which permissions would be inert, and whether you may save it. |
| [`GET /api/v1/identity/audit`](#get-apiv1identityaudit) | Audit history the caller may read: the same filters and paging as `GET /api/v1/audit`. |
| [`POST /api/v1/identity/emergency-access`](#post-apiv1identityemergency-access) | Grants a person a platform role for a short time, with a recorded reason (break-glass). |
| [`POST /api/v1/identity/environments/{id}/incus-project`](#post-apiv1identityenvironmentsidincus-project) | Creates or adopts the environment's Incus project now (idempotent): the restricted project with its default profile, granted to the deploy identity, then the quotas mirrored. |
| [`GET /api/v1/identity/groups`](#get-apiv1identitygroups) | Groups the caller may see. |
| [`POST /api/v1/identity/groups`](#post-apiv1identitygroups) | Creates a group: an organisation's (needs `group.manage` there) or a platform group (platform `group.manage`). |
| [`GET /api/v1/identity/groups/{group}/members`](#get-apiv1identitygroupsgroupmembers) | Members of a group. |
| [`PUT /api/v1/identity/groups/{group}/members/{user}`](#put-apiv1identitygroupsgroupmembersuser) | Adds a person to a group. |
| [`DELETE /api/v1/identity/groups/{group}/members/{user}`](#delete-apiv1identitygroupsgroupmembersuser) | Removes a person from a group; their access through it ends on their next request. |
| [`POST /api/v1/identity/local-accounts`](#post-apiv1identitylocal-accounts) | Creates a local account and returns its one-time setup link, valid for 24 hours. |
| [`POST /api/v1/identity/local-accounts/{id}/reset`](#post-apiv1identitylocal-accountsidreset) | Takes a local account's password away, revokes every session of theirs and returns a new one-time setup link (24 hours). |
| [`GET /api/v1/identity/organizations`](#get-apiv1identityorganizations) | Organisations the caller may see. |
| [`POST /api/v1/identity/organizations`](#post-apiv1identityorganizations) | Creates an organisation. |
| [`POST /api/v1/identity/organizations/{org}/projects`](#post-apiv1identityorganizationsorgprojects) | Creates a project in an organisation. |
| [`GET /api/v1/identity/permissions`](#get-apiv1identitypermissions) | Every permission, its class and the narrowest scope at which a grant takes effect. |
| [`GET /api/v1/identity/personal-tokens`](#get-apiv1identitypersonal-tokens) | Everyone's personal tokens (or one person's), live ones and those that ended in the last 30 days. |
| [`DELETE /api/v1/identity/personal-tokens/{id}`](#delete-apiv1identitypersonal-tokensid) | Revokes anyone's live personal token. |
| [`GET /api/v1/identity/policies`](#get-apiv1identitypolicies) | Access policies (MFA and approval rules). |
| [`PUT /api/v1/identity/policies`](#put-apiv1identitypolicies) | Creates or updates a policy by name. |
| [`DELETE /api/v1/identity/policies/{id}`](#delete-apiv1identitypoliciesid) | Deletes a policy. |
| [`GET /api/v1/identity/projects`](#get-apiv1identityprojects) | Projects the caller may see, optionally of one organisation. |
| [`GET /api/v1/identity/projects/{project}/environments`](#get-apiv1identityprojectsprojectenvironments) | Environments of a project. |
| [`POST /api/v1/identity/projects/{project}/environments`](#post-apiv1identityprojectsprojectenvironments) | Creates an environment. |
| [`GET /api/v1/identity/quotas/{scope}/{id}`](#get-apiv1identityquotasscopeid) | A scope's quota and use. |
| [`PUT /api/v1/identity/quotas/{scope}/{id}`](#put-apiv1identityquotasscopeid) | Sets a scope's quota (all limits empty removes it), then mirrors the tightest applicable quota onto every environment beneath it. |
| [`GET /api/v1/identity/roles`](#get-apiv1identityroles) | The predefined and custom roles with their permissions. |
| [`POST /api/v1/identity/roles`](#post-apiv1identityroles) | Defines a custom role from explicit permissions. |
| [`DELETE /api/v1/identity/roles/{role}`](#delete-apiv1identityrolesrole) | Deletes a custom role that no assignment uses. |
| [`GET /api/v1/identity/service-identities`](#get-apiv1identityservice-identities) | Registered service identities (the credentials Apelora uses for Incus and MAAS, and automation identities that call this API). |
| [`POST /api/v1/identity/service-identities`](#post-apiv1identityservice-identities) | Registers a service identity. |
| [`POST /api/v1/identity/service-identities/{id}/disable`](#post-apiv1identityservice-identitiesiddisable) | Disables a service identity at once. |
| [`POST /api/v1/identity/service-identities/{id}/enable`](#post-apiv1identityservice-identitiesidenable) | Re-enables a service identity. |
| [`GET /api/v1/identity/sign-in`](#get-apiv1identitysign-in) | Sign-in settings: identity providers (saved and from the environment), whether API tokens are accepted, and local accounts. |
| [`PUT /api/v1/identity/sign-in/api-tokens`](#put-apiv1identitysign-inapi-tokens) | Turns API tokens on or off. |
| [`POST /api/v1/identity/sign-in/check`](#post-apiv1identitysign-incheck) | Reads a provider's discovery document and key set, without saving anything: what an administrator checks before saving. |
| [`GET /api/v1/identity/sign-in/directories`](#get-apiv1identitysign-indirectories) | The directories people sign in with, each checked with a TLS connection now. |
| [`POST /api/v1/identity/sign-in/directories`](#post-apiv1identitysign-indirectories) | Adds a directory; it is offered on the sign-in page at once when enabled. |
| [`PUT /api/v1/identity/sign-in/directories/{id}`](#put-apiv1identitysign-indirectoriesid) | Changes a directory (including turning it off). |
| [`DELETE /api/v1/identity/sign-in/directories/{id}`](#delete-apiv1identitysign-indirectoriesid) | Removes a directory: its people can no longer sign in with it; their accounts and roles in Apelora stay. |
| [`POST /api/v1/identity/sign-in/directories/check`](#post-apiv1identitysign-indirectoriescheck) | Connects with TLS, binds as a test person and reads their entry and groups, without saving anything. |
| [`PUT /api/v1/identity/sign-in/local-accounts`](#put-apiv1identitysign-inlocal-accounts) | Turns sign-in with local accounts on or off. |
| [`POST /api/v1/identity/sign-in/providers`](#post-apiv1identitysign-inproviders) | Adds an identity provider; it is checked and applied at once. |
| [`PUT /api/v1/identity/sign-in/providers/{id}`](#put-apiv1identitysign-inprovidersid) | Changes a provider saved in the Console. |
| [`DELETE /api/v1/identity/sign-in/providers/{id}`](#delete-apiv1identitysign-inprovidersid) | Removes a provider saved in the Console: people stop being able to sign in with it. |
| [`GET /api/v1/identity/sign-ins`](#get-apiv1identitysign-ins) | Everyone's Apelora sessions open now (or one person's). |
| [`DELETE /api/v1/identity/sign-ins/{id}`](#delete-apiv1identitysign-insid) | Ends anyone's session. |
| [`GET /api/v1/identity/tenancy`](#get-apiv1identitytenancy) | Organisations, projects and environments the caller can see, with quotas, use and each environment's Incus project as Incus reports it. |
| [`GET /api/v1/identity/users`](#get-apiv1identityusers) | People who have signed in, as far as the caller may see them: everyone for a platform administrator, otherwise those with a role in the caller's scopes. |
| [`POST /api/v1/identity/users/{user}/disable`](#post-apiv1identityusersuserdisable) | Disables a person: their tokens and Apelora sessions stop working at once. |
| [`POST /api/v1/identity/users/{user}/enable`](#post-apiv1identityusersuserenable) | Re-enables a person. |
| [`GET /api/v1/identity/users/lookup`](#get-apiv1identityuserslookup) | Finds one person by exact user name or e-mail so a role can be given to them. |
| [`GET /api/v1/me/sign-ins`](#get-apiv1mesign-ins) | Your Apelora sessions open now (password and directory sign-ins), most recently used first. |
| [`DELETE /api/v1/me/sign-ins/{id}`](#delete-apiv1mesign-insid) | Ends one of your sessions (signs that browser out). |
| [`GET /api/v1/me/tokens`](#get-apiv1metokens) | Your personal tokens (live ones, and those that ended in the last 30 days), newest first. |
| [`POST /api/v1/me/tokens`](#post-apiv1metokens) | Creates a personal token, shown only in this response. |
| [`DELETE /api/v1/me/tokens/{id}`](#delete-apiv1metokensid) | Revokes one of your live tokens; it stops working at once. |
| [`POST /api/v1/me/tokens/{id}/rotate`](#post-apiv1metokensidrotate) | Rotates one of your live tokens: a successor with the same name (shown only in this response), and the old token keeps working for the overlap (0–1440 minutes, 60 by default), then expires. |

## Details

### `GET /api/v1/approvals`

Requests and approvals: your own, plus every open one if you may approve.

**Needs:** `approval.request` or `approval.grant`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/approvals" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "action": "example",
      "createdAt": "2026-01-01T09:00:00Z",
      "expiresAt": "2026-01-01T09:00:00Z",
      "id": "00000000-0000-4000-8000-000000000001",
      "reason": "example",
      "requester": "example",
      "state": "example",
      "target": "example",
      "approver": "example"
    }
  ]
}
```

**Errors:** `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/approvals`

Asks for approval of one risky action on one target. You must be allowed to do the action yourself; someone else with `approval.grant` then decides.

**Needs:** `approval.request`.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `action` | string | yes | The permission to be exercised, e.g. `hardware.delete`. |
| `reason` | string | no | — |
| `target` | string | yes | What it will be done to, e.g. `machine:rack1-07`. |

```json
{
  "action": "example",
  "target": "example"
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/approvals" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"example","target":"example"}'
```

**Response `201`**:

```json
{
  "action": "example",
  "createdAt": "2026-01-01T09:00:00Z",
  "expiresAt": "2026-01-01T09:00:00Z",
  "id": "00000000-0000-4000-8000-000000000001",
  "reason": "example",
  "requester": "example",
  "state": "example",
  "target": "example",
  "approver": "example"
}
```

**Errors:** `400`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/approvals/{id}/approve`

Approves a request made by someone else. The approval is good for 30 minutes, once.

**Needs:** `approval.grant`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Approval id |

```sh
curl -sS -X POST "$APELORA_URL/api/v1/approvals/00000000-0000-4000-8000-000000000001/approve" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "action": "example",
  "createdAt": "2026-01-01T09:00:00Z",
  "expiresAt": "2026-01-01T09:00:00Z",
  "id": "00000000-0000-4000-8000-000000000001",
  "reason": "example",
  "requester": "example",
  "state": "example",
  "target": "example",
  "approver": "example"
}
```

**Errors:** `403`, `404`, `409`, `410`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/approvals/{id}/cancel`

Withdraws your own pending request.

**Needs:** `approval.request`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Approval id |

```sh
curl -sS -X POST "$APELORA_URL/api/v1/approvals/00000000-0000-4000-8000-000000000001/cancel" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "action": "example",
  "createdAt": "2026-01-01T09:00:00Z",
  "expiresAt": "2026-01-01T09:00:00Z",
  "id": "00000000-0000-4000-8000-000000000001",
  "reason": "example",
  "requester": "example",
  "state": "example",
  "target": "example",
  "approver": "example"
}
```

**Errors:** `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/approvals/{id}/reject`

Rejects a request.

**Needs:** `approval.grant`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Approval id |

```sh
curl -sS -X POST "$APELORA_URL/api/v1/approvals/00000000-0000-4000-8000-000000000001/reject" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "action": "example",
  "createdAt": "2026-01-01T09:00:00Z",
  "expiresAt": "2026-01-01T09:00:00Z",
  "id": "00000000-0000-4000-8000-000000000001",
  "reason": "example",
  "requester": "example",
  "state": "example",
  "target": "example",
  "approver": "example"
}
```

**Errors:** `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/assignments`

Role assignments in the caller's scopes.

**Needs:** `user.view`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `principalType` | query | string | no | — |
| `principalId` | query | string | no | — |
| `includeRevoked` | query | boolean | no | — |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/identity/assignments" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "conditions": {
        "environments": [
          "production"
        ],
        "requireMfa": false
      },
      "createdAt": "2026-01-01T09:00:00Z",
      "createdBy": "example",
      "id": "00000000-0000-4000-8000-000000000001",
      "kind": "standard",
      "principal": {
        "id": "00000000-0000-4000-8000-000000000001",
        "type": "user"
      },
      "role": {
        "key": "example",
        "type": "builtin"
      },
      "roleName": "example",
      "scope": {
        "type": "platform"
      },
      "expiresAt": "2026-01-01T09:00:00Z",
      "reason": "example",
      "revokedAt": "2026-01-01T09:00:00Z"
    }
  ]
}
```

**Errors:** `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/assignments`

Grants a role to a person, group or automation identity at a scope.

**Needs:** `role.assign` there and every permission the role holds (no escalation); audited.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `conditions` | object | no | — |
| `expiresAt` | string | no | RFC 3339. Assignments may expire; emergency grants must. |
| `principal` | one of several | yes | Who an assignment is for. |
| `reason` | string | no | — |
| `role` | one of several | yes | — |
| `scope` | one of several | yes | — |

```json
{
  "principal": {
    "id": "00000000-0000-4000-8000-000000000001",
    "type": "user"
  },
  "role": {
    "key": "example",
    "type": "builtin"
  },
  "scope": {
    "type": "platform"
  }
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/identity/assignments" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"principal":{"id":"00000000-0000-4000-8000-000000000001","type":"user"},"role":{"key":"example","type":"builtin"},"scope":{"type":"platform"}}'
```

**Response `201`**:

```json
{
  "conditions": {
    "environments": [
      "production"
    ],
    "requireMfa": false
  },
  "createdAt": "2026-01-01T09:00:00Z",
  "createdBy": "example",
  "id": "00000000-0000-4000-8000-000000000001",
  "kind": "standard",
  "principal": {
    "id": "00000000-0000-4000-8000-000000000001",
    "type": "user"
  },
  "role": {
    "key": "example",
    "type": "builtin"
  },
  "roleName": "example",
  "scope": {
    "type": "platform"
  },
  "expiresAt": "2026-01-01T09:00:00Z",
  "reason": "example",
  "revokedAt": "2026-01-01T09:00:00Z"
}
```

**Errors:** `400`, `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/identity/assignments/{assignment}`

Revokes an assignment; the person loses it on their next request. Refused when it would leave no enabled platform super admin.

**Needs:** `role.assign` in its scope and every permission the role confers there (you can only take away what you could grant).

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `assignment` | path | string | yes | Assignment id |

```sh
curl -sS -X DELETE "$APELORA_URL/api/v1/identity/assignments/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`**, with no body.

**Errors:** `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/assignments/preview`

Shows what an assignment would give before it is saved: what the person can already do at the scope, what they could do afterwards, which permissions would be inert, and whether you may save it. Changes nothing.

**Needs:** `role.assign`.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `conditions` | object | no | — |
| `expiresAt` | string | no | RFC 3339. Assignments may expire; emergency grants must. |
| `principal` | one of several | yes | Who an assignment is for. |
| `reason` | string | no | — |
| `role` | one of several | yes | — |
| `scope` | one of several | yes | — |

```json
{
  "principal": {
    "id": "00000000-0000-4000-8000-000000000001",
    "type": "user"
  },
  "role": {
    "key": "example",
    "type": "builtin"
  },
  "scope": {
    "type": "platform"
  }
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/identity/assignments/preview" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"principal":{"id":"00000000-0000-4000-8000-000000000001","type":"user"},"role":{"key":"example","type":"builtin"},"scope":{"type":"platform"}}'
```

**Response `200`**:

```json
{
  "added": [
    "example"
  ],
  "after": [
    {
      "class": "tenant",
      "description": "A description",
      "grants": [
        {
          "assignment": "00000000-0000-4000-8000-000000000001",
          "emergency": false,
          "role": {
            "key": "example",
            "type": "builtin"
          },
          "roleName": "example",
          "scope": {
            "type": "platform"
          },
          "viaGroup": "00000000-0000-4000-8000-000000000001"
        }
      ],
      "permission": "example"
    }
  ],
  "allowed": false,
  "before": [
    {
      "class": "tenant",
      "description": "A description",
      "grants": [
        {
          "assignment": "00000000-0000-4000-8000-000000000001",
          "emergency": false,
          "role": {
            "key": "example",
            "type": "builtin"
          },
          "roleName": "example",
          "scope": {
            "type": "platform"
          },
          "viaGroup": "00000000-0000-4000-8000-000000000001"
        }
      ],
      "permission": "example"
    }
  ],
  "inert": [
    "example"
  ],
  "warnings": [
    "example"
  ],
  "error": "example"
}
```

**Errors:** `400`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/audit`

Audit history the caller may read: the same filters and paging as `GET /api/v1/audit`.

**Needs:** `audit.read`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `actor` | query | string | no | Who acted: their stable id (`user:<uuid>`, `service:<uuid>`, `token:<name>`) or, ignoring case, the name they had when they acted. |
| `target` | query | string | no | What was acted on, exactly as recorded (e.g. `local-account:ada` or a group's name). |
| `action` | query | string | no | Only actions starting with this, e.g. `role.` or `emergency_access.`. |
| `outcome` | query | string | no | `success`, `denied` or `failed`. |
| `from` | query | string | no | RFC 3339: events at or after this time. |
| `to` | query | string | no | RFC 3339: events before this time. |
| `before` | query | integer | no | Only events older than this id (paging: the id of the last event of the previous page). |
| `limit` | query | integer | no | Events per page, 1 to 500 (default 100). Not used by the export. |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/identity/audit" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

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

**Errors:** `400`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/emergency-access`

Grants a person a platform role for a short time, with a recorded reason (break-glass). You cannot grant it to yourself; every request made with it is audited.

**Needs:** `platform.emergency_access`.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `minutes` | integer | yes | 5–240 minutes. |
| `reason` | string | yes | Why; at least 10 characters. Recorded in the audit trail. |
| `role` | string | yes | A predefined role key, e.g. `fabric-administrator`. |
| `userId` | string | yes | — |

```json
{
  "userId": "00000000-0000-4000-8000-000000000001",
  "role": "example",
  "reason": "example",
  "minutes": 1
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/identity/emergency-access" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":"00000000-0000-4000-8000-000000000001","role":"example","reason":"example","minutes":1}'
```

**Response `201`**:

```json
{
  "conditions": {
    "environments": [
      "production"
    ],
    "requireMfa": false
  },
  "createdAt": "2026-01-01T09:00:00Z",
  "createdBy": "example",
  "id": "00000000-0000-4000-8000-000000000001",
  "kind": "standard",
  "principal": {
    "id": "00000000-0000-4000-8000-000000000001",
    "type": "user"
  },
  "role": {
    "key": "example",
    "type": "builtin"
  },
  "roleName": "example",
  "scope": {
    "type": "platform"
  },
  "expiresAt": "2026-01-01T09:00:00Z",
  "reason": "example",
  "revokedAt": "2026-01-01T09:00:00Z"
}
```

**Errors:** `400`, `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/environments/{id}/incus-project`

Creates or adopts the environment's Incus project now (idempotent): the restricted project with its default profile, granted to the deploy identity, then the quotas mirrored.

**Needs:** `environment.manage` on the environment's project; 503 without an admin identity.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Environment id |

```sh
curl -sS -X POST "$APELORA_URL/api/v1/identity/environments/00000000-0000-4000-8000-000000000001/incus-project" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "detail": "example",
  "environmentId": "00000000-0000-4000-8000-000000000001",
  "findings": [
    {
      "message": "example",
      "severity": "info",
      "key": "example"
    }
  ],
  "state": "pending",
  "incusProject": "apelora",
  "limits": {
    "detail": "example",
    "environment": "example",
    "environmentId": "00000000-0000-4000-8000-000000000001",
    "limits": {
      "key": "example"
    },
    "result": "applied",
    "incusProject": "apelora"
  }
}
```

**Errors:** `403`, `404`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/groups`

Groups the caller may see.

**Needs:** `user.view`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/identity/groups" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "description": "A description",
      "id": "00000000-0000-4000-8000-000000000001",
      "name": "example",
      "externalName": "example",
      "organizationId": "00000000-0000-4000-8000-000000000001"
    }
  ]
}
```

**Errors:** `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/groups`

Creates a group: an organisation's (needs `group.manage` there) or a platform group (platform `group.manage`). Mapping a group to an identity-provider group name is platform-only.

**Needs:** a signed-in caller; the server decides what that caller may see.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `description` | string | no | — |
| `externalName` | string | no | — |
| `name` | string | yes | — |
| `organizationId` | string | no | — |

```json
{
  "name": "example"
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/identity/groups" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"example"}'
```

**Response `201`**:

```json
{
  "description": "A description",
  "id": "00000000-0000-4000-8000-000000000001",
  "name": "example",
  "externalName": "example",
  "organizationId": "00000000-0000-4000-8000-000000000001"
}
```

**Errors:** `400`, `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/groups/{group}/members`

Members of a group.

**Needs:** `user.view` or `group.manage` on the group's organisation.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `group` | path | string | yes | Group id |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/identity/groups/00000000-0000-4000-8000-000000000001/members" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "createdAt": "2026-01-01T09:00:00Z",
      "disabled": false,
      "id": "00000000-0000-4000-8000-000000000001",
      "issuer": "example",
      "displayName": "example",
      "email": "alex@example.org",
      "lastSeenAt": "2026-01-01T09:00:00Z",
      "username": "example"
    }
  ]
}
```

**Errors:** `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `PUT /api/v1/identity/groups/{group}/members/{user}`

Adds a person to a group.

**Needs:** `group.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `group` | path | string | yes | Group id |
| `user` | path | string | yes | User id |

```sh
curl -sS -X PUT "$APELORA_URL/api/v1/identity/groups/00000000-0000-4000-8000-000000000001/members/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`**, with no body.

**Errors:** `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/identity/groups/{group}/members/{user}`

Removes a person from a group; their access through it ends on their next request.

**Needs:** `group.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `group` | path | string | yes | Group id |
| `user` | path | string | yes | User id |

```sh
curl -sS -X DELETE "$APELORA_URL/api/v1/identity/groups/00000000-0000-4000-8000-000000000001/members/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`**, with no body.

**Errors:** `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/local-accounts`

Creates a local account and returns its one-time setup link, valid for 24 hours. The person chooses their password with it; nobody else ever knows it.

**Needs:** `user.manage`.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `displayName` | string | no | — |
| `email` | string | no | — |
| `username` | string | yes | 2 to 64 of `a-z 0-9 . _ -` (stored lowercase). |

```json
{
  "username": "example"
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/identity/local-accounts" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"example"}'
```

**Response `201`**:

```json
{
  "setupExpiresAt": "2026-01-01T09:00:00Z",
  "setupToken": "<redacted>",
  "user": {
    "createdAt": "2026-01-01T09:00:00Z",
    "disabled": false,
    "id": "00000000-0000-4000-8000-000000000001",
    "issuer": "example",
    "displayName": "example",
    "email": "alex@example.org",
    "lastSeenAt": "2026-01-01T09:00:00Z",
    "username": "example"
  }
}
```

**Errors:** `400`, `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/local-accounts/{id}/reset`

Takes a local account's password away, revokes every session of theirs and returns a new one-time setup link (24 hours). Not for your own account (use Change password).

**Needs:** `user.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | User id of the local account |

```sh
curl -sS -X POST "$APELORA_URL/api/v1/identity/local-accounts/00000000-0000-4000-8000-000000000001/reset" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "setupExpiresAt": "2026-01-01T09:00:00Z",
  "setupToken": "<redacted>"
}
```

**Errors:** `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/organizations`

Organisations the caller may see.

**Needs:** `organization.view` (or a grant below that reaches them).

```sh
curl -sS -X GET "$APELORA_URL/api/v1/identity/organizations" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "createdAt": "2026-01-01T09:00:00Z",
      "disabled": false,
      "id": "00000000-0000-4000-8000-000000000001",
      "name": "example",
      "slug": "example"
    }
  ]
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/organizations`

Creates an organisation.

**Needs:** `organization.create` (platform).

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `name` | string | yes | — |
| `slug` | string | yes | — |

```json
{
  "slug": "example",
  "name": "example"
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/identity/organizations" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slug":"example","name":"example"}'
```

**Response `201`**:

```json
{
  "createdAt": "2026-01-01T09:00:00Z",
  "disabled": false,
  "id": "00000000-0000-4000-8000-000000000001",
  "name": "example",
  "slug": "example"
}
```

**Errors:** `400`, `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/organizations/{org}/projects`

Creates a project in an organisation.

**Needs:** `project.create` on the organisation.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `org` | path | string | yes | Organisation id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `name` | string | yes | — |
| `slug` | string | yes | — |

```json
{
  "slug": "example",
  "name": "example"
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/identity/organizations/00000000-0000-4000-8000-000000000001/projects" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slug":"example","name":"example"}'
```

**Response `201`**:

```json
{
  "createdAt": "2026-01-01T09:00:00Z",
  "id": "00000000-0000-4000-8000-000000000001",
  "name": "example",
  "organizationId": "00000000-0000-4000-8000-000000000001",
  "organizationSlug": "example",
  "slug": "example"
}
```

**Errors:** `400`, `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/permissions`

Every permission, its class and the narrowest scope at which a grant takes effect.

**Needs:** a signed-in caller; the server decides what that caller may see.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/identity/permissions" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "class": "tenant",
      "description": "A description",
      "floor": "platform",
      "id": "example",
      "needsApproval": false
    }
  ]
}
```

### `GET /api/v1/identity/personal-tokens`

Everyone's personal tokens (or one person's), live ones and those that ended in the last 30 days.

**Needs:** `token.manage` on the platform.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `user` | query | string | no | Only this person's. |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/identity/personal-tokens" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "createdAt": "2026-01-01T09:00:00Z",
      "current": false,
      "expiresAt": "2026-01-01T09:00:00Z",
      "id": "00000000-0000-4000-8000-000000000001",
      "name": "example",
      "owner": "example",
      "state": "example",
      "userId": "00000000-0000-4000-8000-000000000001",
      "lastUsedAt": "2026-01-01T09:00:00Z",
      "revokedAt": "2026-01-01T09:00:00Z",
      "revokedBy": "example",
      "rotatedFrom": "00000000-0000-4000-8000-000000000001",
      "successor": "00000000-0000-4000-8000-000000000001"
    }
  ],
  "limit": 1
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/identity/personal-tokens/{id}`

Revokes anyone's live personal token.

**Needs:** `token.manage` on the platform.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Token id |

```sh
curl -sS -X DELETE "$APELORA_URL/api/v1/identity/personal-tokens/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`**, with no body.

**Errors:** `401`, `403`, `404`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/policies`

Access policies (MFA and approval rules).

**Needs:** `access_policy.manage` or `audit.read`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/identity/policies" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "enabled": false,
      "id": "00000000-0000-4000-8000-000000000001",
      "kind": "example",
      "name": "example",
      "parameters": {},
      "updatedAt": "2026-01-01T09:00:00Z",
      "updatedBy": "example"
    }
  ]
}
```

**Errors:** `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `PUT /api/v1/identity/policies`

Creates or updates a policy by name. `mfa`: `{"environments": ["production"], "infrastructure": true}`. `approval`: `{"actions": ["cluster.evacuate"]}` (extra actions that need approval where the API already asks for it).

**Needs:** `access_policy.manage`.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `enabled` | boolean | no | — |
| `kind` | string | yes | — |
| `name` | string | yes | — |
| `parameters` | object | yes | — |

```json
{
  "name": "example",
  "kind": "example",
  "parameters": {}
}
```

```sh
curl -sS -X PUT "$APELORA_URL/api/v1/identity/policies" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"example","kind":"example","parameters":{}}'
```

**Response `200`**:

```json
{
  "enabled": false,
  "id": "00000000-0000-4000-8000-000000000001",
  "kind": "example",
  "name": "example",
  "parameters": {},
  "updatedAt": "2026-01-01T09:00:00Z",
  "updatedBy": "example"
}
```

**Errors:** `400`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/identity/policies/{id}`

Deletes a policy.

**Needs:** `access_policy.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Policy id |

```sh
curl -sS -X DELETE "$APELORA_URL/api/v1/identity/policies/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`**, with no body.

**Errors:** `403`, `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/projects`

Projects the caller may see, optionally of one organisation.

**Needs:** `project.view`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `organization` | query | string | no | — |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/identity/projects" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "createdAt": "2026-01-01T09:00:00Z",
      "id": "00000000-0000-4000-8000-000000000001",
      "name": "example",
      "organizationId": "00000000-0000-4000-8000-000000000001",
      "organizationSlug": "example",
      "slug": "example"
    }
  ]
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/projects/{project}/environments`

Environments of a project.

**Needs:** `project.view` on it.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `project` | path | string | yes | Project id |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/identity/projects/apelora/environments" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "id": "00000000-0000-4000-8000-000000000001",
      "incusDetail": "example",
      "incusProjectConfig": {
        "key": "example"
      },
      "incusProvisioned": false,
      "incusState": "pending",
      "kind": "production",
      "name": "example",
      "projectId": "00000000-0000-4000-8000-000000000001",
      "slug": "example",
      "incusProject": "apelora"
    }
  ]
}
```

**Errors:** `403`, `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/projects/{project}/environments`

Creates an environment. The Incus project it maps to is derived from the names (tenants cannot choose it); platform administrators may map an existing one.

**Needs:** `environment.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `project` | path | string | yes | Project id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `incusProject` | string | no | Platform administrators only: map an existing Incus project instead of the derived name. |
| `kind` | `production`, `staging`, `development`, `other` | yes | Kind of environment; policies such as "production needs MFA" refer to it. |
| `name` | string | yes | — |
| `slug` | string | yes | — |

```json
{
  "slug": "example",
  "name": "example",
  "kind": "production"
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/identity/projects/apelora/environments" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slug":"example","name":"example","kind":"production"}'
```

**Response `201`**:

```json
{
  "id": "00000000-0000-4000-8000-000000000001",
  "incusDetail": "example",
  "incusProjectConfig": {
    "key": "example"
  },
  "incusProvisioned": false,
  "incusState": "pending",
  "kind": "production",
  "name": "example",
  "projectId": "00000000-0000-4000-8000-000000000001",
  "slug": "example",
  "incusProject": "apelora"
}
```

**Errors:** `400`, `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/quotas/{scope}/{id}`

A scope's quota and use.

**Needs:** `organization.view` (organisation) or `project.view` (project, environment) on it, or `quota.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `scope` | path | string | yes | organization, project or environment |
| `id` | path | string | yes | Its id |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/identity/quotas/example/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "bound": {
    "cpu": 1,
    "diskGib": 1,
    "instances": 1,
    "memoryGib": 1
  },
  "canSet": false,
  "id": "00000000-0000-4000-8000-000000000001",
  "kind": "organization",
  "name": "example",
  "quota": {
    "cpu": 1,
    "diskGib": 1,
    "instances": 1,
    "memoryGib": 1
  },
  "updatedAt": "2026-01-01T09:00:00Z",
  "updatedBy": "example",
  "usage": {
    "cpu": 1,
    "diskBytes": 1,
    "instances": 1,
    "memoryBytes": 1
  },
  "usageError": "example"
}
```

**Errors:** `400`, `403`, `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `PUT /api/v1/identity/quotas/{scope}/{id}`

Sets a scope's quota (all limits empty removes it), then mirrors the tightest applicable quota onto every environment beneath it.

**Needs:** `quota.manage`; or, below the organisation, `organization.update` on the organisation (projects, environments) or `project.update` on the project (environments), and then never more than a quota above allows.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `scope` | path | string | yes | organization, project or environment |
| `id` | path | string | yes | Its id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `cpu` | integer | no | — |
| `diskGib` | integer | no | — |
| `instances` | integer | no | — |
| `memoryGib` | integer | no | — |

```json
{
  "cpu": 1
}
```

```sh
curl -sS -X PUT "$APELORA_URL/api/v1/identity/quotas/example/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cpu":1}'
```

**Response `200`**:

```json
{
  "environments": [
    {
      "detail": "example",
      "environment": "example",
      "environmentId": "00000000-0000-4000-8000-000000000001",
      "limits": {
        "key": "example"
      },
      "result": "applied",
      "incusProject": "apelora"
    }
  ],
  "quota": {
    "cpu": 1,
    "diskGib": 1,
    "instances": 1,
    "memoryGib": 1
  }
}
```

**Errors:** `400`, `403`, `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/roles`

The predefined and custom roles with their permissions.

**Needs:** a signed-in caller; the server decides what that caller may see.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/identity/roles" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "builtin": false,
      "description": "A description",
      "id": "example",
      "name": "example",
      "permissions": [
        "example"
      ],
      "reference": {
        "key": "example",
        "type": "builtin"
      },
      "scopes": [
        "platform"
      ]
    }
  ]
}
```

**Errors:** `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/roles`

Defines a custom role from explicit permissions.

**Needs:** `role.manage` (platform), and you may only include permissions you hold yourself.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `description` | string | no | — |
| `name` | string | yes | — |
| `permissions` | list of string | yes | — |

```json
{
  "name": "example",
  "permissions": [
    "example"
  ]
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/identity/roles" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"example","permissions":["example"]}'
```

**Response `201`**:

```json
{
  "builtin": false,
  "description": "A description",
  "id": "example",
  "name": "example",
  "permissions": [
    "example"
  ],
  "reference": {
    "key": "example",
    "type": "builtin"
  },
  "scopes": [
    "platform"
  ]
}
```

**Errors:** `400`, `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/identity/roles/{role}`

Deletes a custom role that no assignment uses.

**Needs:** `role.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `role` | path | string | yes | Custom role id |

```sh
curl -sS -X DELETE "$APELORA_URL/api/v1/identity/roles/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`**, with no body.

**Errors:** `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/service-identities`

Registered service identities (the credentials Apelora uses for Incus and MAAS, and automation identities that call this API).

**Needs:** `service_identity.manage`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/identity/service-identities" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "apiAccess": false,
      "backend": "example",
      "createdAt": "2026-01-01T09:00:00Z",
      "createdBy": "example",
      "disabled": false,
      "id": "00000000-0000-4000-8000-000000000001",
      "kind": "workload",
      "name": "example",
      "operations": [
        "example"
      ],
      "restrictions": {},
      "credentialRef": "example",
      "expiresAt": "2026-01-01T09:00:00Z",
      "lastUsedAt": "2026-01-01T09:00:00Z"
    }
  ]
}
```

**Errors:** `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/service-identities`

Registers a service identity. Outbound kinds (workload, network, storage, provisioning) record only the name of a credential held in the secret store; automation identities get an API token, shown once.

**Needs:** `service_identity.manage`.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `credentialRef` | string | no | — |
| `expiresInDays` | integer | no | Automation identities only: days until their token expires (1–365, default 90). |
| `kind` | `workload`, `network`, `storage`, `provisioning`, `automation` | yes | — |
| `name` | string | yes | — |
| `restrictions` | object | no | — |

```json
{
  "name": "example",
  "kind": "workload"
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/identity/service-identities" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"example","kind":"workload"}'
```

**Response `201`**:

```json
{
  "identity": {
    "apiAccess": false,
    "backend": "example",
    "createdAt": "2026-01-01T09:00:00Z",
    "createdBy": "example",
    "disabled": false,
    "id": "00000000-0000-4000-8000-000000000001",
    "kind": "workload",
    "name": "example",
    "operations": [
      "example"
    ],
    "restrictions": {},
    "credentialRef": "example",
    "expiresAt": "2026-01-01T09:00:00Z",
    "lastUsedAt": "2026-01-01T09:00:00Z"
  },
  "token": "<redacted>"
}
```

**Errors:** `400`, `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/service-identities/{id}/disable`

Disables a service identity at once.

**Needs:** `service_identity.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Service identity id |

```sh
curl -sS -X POST "$APELORA_URL/api/v1/identity/service-identities/00000000-0000-4000-8000-000000000001/disable" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`**, with no body.

**Errors:** `403`, `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/service-identities/{id}/enable`

Re-enables a service identity.

**Needs:** `service_identity.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Service identity id |

```sh
curl -sS -X POST "$APELORA_URL/api/v1/identity/service-identities/00000000-0000-4000-8000-000000000001/enable" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`**, with no body.

**Errors:** `403`, `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/sign-in`

Sign-in settings: identity providers (saved and from the environment), whether API tokens are accepted, and local accounts.

**Needs:** `platform.security.manage`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/identity/sign-in" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "apiTokens": {
    "enabled": false,
    "lockedByEnvironment": false
  },
  "directories": [
    {
      "bindTemplate": "example",
      "emailAttribute": "alex@example.org",
      "enabled": false,
      "groupNameAttribute": "example",
      "id": "00000000-0000-4000-8000-000000000001",
      "idAttribute": "example",
      "name": "example",
      "nameAttribute": "example",
      "reachable": false,
      "startTls": false,
      "updatedBy": "example",
      "url": "https://example.org",
      "usernameAttribute": "example",
      "baseDn": "example"
    }
  ],
  "localAccounts": {
    "enabled": false,
    "pending": 1,
    "ready": 1
  },
  "providers": [
    {
      "audiences": [
        "example"
      ],
      "authorizedParties": [
        "example"
      ],
      "enabled": false,
      "groupsClaim": "example",
      "issuer": "example",
      "mfaAcr": [
        "example"
      ],
      "mfaAmr": [
        "example"
      ],
      "name": "example",
      "reachable": false,
      "scopes": [
        "example"
      ],
      "source": "console",
      "usernameClaim": "example",
      "clientId": "example",
      "error": "example"
    }
  ]
}
```

**Errors:** `401`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `PUT /api/v1/identity/sign-in/api-tokens`

Turns API tokens on or off. Turning them off is refused while no other way in remains (an identity provider that answers, or local accounts that are on with at least one account set up), and for someone signed in with an API token (they would lock themselves out).

**Needs:** `platform.security.manage`; audited.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `enabled` | boolean | yes | — |

```json
{
  "enabled": false
}
```

```sh
curl -sS -X PUT "$APELORA_URL/api/v1/identity/sign-in/api-tokens" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled":false}'
```

**Response `200`**:

```json
{
  "enabled": false,
  "lockedByEnvironment": false
}
```

**Errors:** `400`, `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/sign-in/check`

Reads a provider's discovery document and key set, without saving anything: what an administrator checks before saving.

**Needs:** `platform.security.manage`.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `issuer` | string | yes | — |

```json
{
  "issuer": "example"
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/identity/sign-in/check" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"issuer":"example"}'
```

**Response `200`**:

```json
{
  "authorizationEndpoint": "example",
  "jwksUri": "example",
  "keys": 0,
  "tokenEndpoint": "<redacted>"
}
```

**Errors:** `400`, `403`, `502`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/sign-in/directories`

The directories people sign in with, each checked with a TLS connection now.

**Needs:** `platform.security.manage`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/identity/sign-in/directories" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "bindTemplate": "example",
      "emailAttribute": "alex@example.org",
      "enabled": false,
      "groupNameAttribute": "example",
      "id": "00000000-0000-4000-8000-000000000001",
      "idAttribute": "example",
      "name": "example",
      "nameAttribute": "example",
      "reachable": false,
      "startTls": false,
      "updatedBy": "example",
      "url": "https://example.org",
      "usernameAttribute": "example",
      "baseDn": "example"
    }
  ]
}
```

**Errors:** `401`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/sign-in/directories`

Adds a directory; it is offered on the sign-in page at once when enabled.

**Needs:** `platform.security.manage` (and an approval where the policy asks for one); audited.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `baseDn` | string | no | Where to search for the person's entry after the bind. |
| `bindTemplate` | string | yes | The bind name with `{username}`: a DN (`uid={username},ou=people,dc=example,dc=org`) or a principal name (`{username}@example.org`, which needs `baseDn` and `userFilter`). |
| `caPem` | string | no | The certificate authority that signed the directory's certificate (PEM); empty: the system's trusted roots. |
| `emailAttribute` | string | no | Default `mail`. |
| `enabled` | boolean | no | — |
| `groupAttribute` | string | no | An attribute of the person's entry that lists their groups, e.g. `memberOf`. |
| `groupBaseDn` | string | no | Where to search for groups that name the person. |
| `groupFilter` | string | no | The group search, with `{dn}` and `{username}` (default `(member={dn})`). |
| `groupNameAttribute` | string | no | The group attribute that holds the group's name (default `cn`). |
| `idAttribute` | string | no | The entry's stable id (default `entryUUID`; `objectGUID` is read as hex). |
| `name` | string | yes | What the sign-in form calls it (1 to 60 characters). |
| `nameAttribute` | string | no | Default `cn`. |
| `startTls` | boolean | no | — |
| `url` | string | yes | `ldaps://host[:port]`, or `ldap://host[:port]` with `startTls`. Plain LDAP is refused. |
| `userFilter` | string | no | Finds the person's entry under `baseDn`, with `{username}`, e.g. `(userPrincipalName={username}@example.org)`. Empty: the entry is the bind DN itself. |
| `usernameAttribute` | string | no | Default `uid`. |

```json
{
  "name": "example",
  "url": "https://example.org",
  "bindTemplate": "example"
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/identity/sign-in/directories" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"example","url":"https://example.org","bindTemplate":"example"}'
```

**Response `201`**:

```json
{
  "bindTemplate": "example",
  "emailAttribute": "alex@example.org",
  "enabled": false,
  "groupNameAttribute": "example",
  "id": "00000000-0000-4000-8000-000000000001",
  "idAttribute": "example",
  "name": "example",
  "nameAttribute": "example",
  "reachable": false,
  "startTls": false,
  "updatedBy": "example",
  "url": "https://example.org",
  "usernameAttribute": "example",
  "baseDn": "example"
}
```

**Errors:** `400`, `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `PUT /api/v1/identity/sign-in/directories/{id}`

Changes a directory (including turning it off).

**Needs:** `platform.security.manage`; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Directory id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `baseDn` | string | no | Where to search for the person's entry after the bind. |
| `bindTemplate` | string | yes | The bind name with `{username}`: a DN (`uid={username},ou=people,dc=example,dc=org`) or a principal name (`{username}@example.org`, which needs `baseDn` and `userFilter`). |
| `caPem` | string | no | The certificate authority that signed the directory's certificate (PEM); empty: the system's trusted roots. |
| `emailAttribute` | string | no | Default `mail`. |
| `enabled` | boolean | no | — |
| `groupAttribute` | string | no | An attribute of the person's entry that lists their groups, e.g. `memberOf`. |
| `groupBaseDn` | string | no | Where to search for groups that name the person. |
| `groupFilter` | string | no | The group search, with `{dn}` and `{username}` (default `(member={dn})`). |
| `groupNameAttribute` | string | no | The group attribute that holds the group's name (default `cn`). |
| `idAttribute` | string | no | The entry's stable id (default `entryUUID`; `objectGUID` is read as hex). |
| `name` | string | yes | What the sign-in form calls it (1 to 60 characters). |
| `nameAttribute` | string | no | Default `cn`. |
| `startTls` | boolean | no | — |
| `url` | string | yes | `ldaps://host[:port]`, or `ldap://host[:port]` with `startTls`. Plain LDAP is refused. |
| `userFilter` | string | no | Finds the person's entry under `baseDn`, with `{username}`, e.g. `(userPrincipalName={username}@example.org)`. Empty: the entry is the bind DN itself. |
| `usernameAttribute` | string | no | Default `uid`. |

```json
{
  "name": "example",
  "url": "https://example.org",
  "bindTemplate": "example"
}
```

```sh
curl -sS -X PUT "$APELORA_URL/api/v1/identity/sign-in/directories/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"example","url":"https://example.org","bindTemplate":"example"}'
```

**Response `200`**:

```json
{
  "bindTemplate": "example",
  "emailAttribute": "alex@example.org",
  "enabled": false,
  "groupNameAttribute": "example",
  "id": "00000000-0000-4000-8000-000000000001",
  "idAttribute": "example",
  "name": "example",
  "nameAttribute": "example",
  "reachable": false,
  "startTls": false,
  "updatedBy": "example",
  "url": "https://example.org",
  "usernameAttribute": "example",
  "baseDn": "example"
}
```

**Errors:** `400`, `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/identity/sign-in/directories/{id}`

Removes a directory: its people can no longer sign in with it; their accounts and roles in Apelora stay. Its name must be typed again.

**Needs:** `platform.security.manage`; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Directory id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The directory's name again. |

```json
{
  "confirm": "example"
}
```

```sh
curl -sS -X DELETE "$APELORA_URL/api/v1/identity/sign-in/directories/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"confirm":"example"}'
```

**Response `204`**, with no body.

**Errors:** `400`, `403`, `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/sign-in/directories/check`

Connects with TLS, binds as a test person and reads their entry and groups, without saving anything. Reports what it found or the precise reason it failed.

**Needs:** `platform.security.manage`.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `password` | string | yes | — |
| `settings` | object | yes | The settings of a directory. Empty optional fields take the defaults shown. |
| `username` | string | yes | — |

```json
{
  "settings": {
    "bindTemplate": "example",
    "name": "example",
    "url": "https://example.org",
    "baseDn": "example",
    "caPem": "example",
    "emailAttribute": "alex@example.org",
    "enabled": false,
    "groupAttribute": "example",
    "groupBaseDn": "example",
    "groupFilter": "example",
    "groupNameAttribute": "example",
    "idAttribute": "example",
    "nameAttribute": "example",
    "startTls": false
  },
  "username": "example",
  "password": "<redacted>"
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/identity/sign-in/directories/check" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"settings":{"bindTemplate":"example","name":"example","url":"https://example.org","baseDn":"example","caPem":"example","emailAttribute":"alex@example.org","enabled":false,"groupAttribute":"example","groupBaseDn":"example","groupFilter":"example","groupNameAttribute":"example","idAttribute":"example","nameAttribute":"example","startTls":false},"username":"example","password":"<redacted>"}'
```

**Response `200`**:

```json
{
  "message": "example",
  "ok": false,
  "entry": {
    "dn": "example",
    "groups": [
      "example"
    ],
    "mappedGroups": [
      "example"
    ],
    "subject": "example",
    "username": "example",
    "displayName": "example",
    "email": "alex@example.org"
  },
  "problem": "unreachable"
}
```

**Errors:** `400`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `PUT /api/v1/identity/sign-in/local-accounts`

Turns sign-in with local accounts on or off. Turning it off is refused while nothing else would let people sign in, and for someone signed in with a local account. Turning it off also ends every password session.

**Needs:** `platform.security.manage`; audited.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `enabled` | boolean | yes | — |

```json
{
  "enabled": false
}
```

```sh
curl -sS -X PUT "$APELORA_URL/api/v1/identity/sign-in/local-accounts" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enabled":false}'
```

**Response `200`**:

```json
{
  "enabled": false,
  "pending": 1,
  "ready": 1
}
```

**Errors:** `400`, `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/sign-in/providers`

Adds an identity provider; it is checked and applied at once.

**Needs:** `platform.security.manage` (and an approval where the policy asks for one); audited.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `audiences` | list of string | yes | — |
| `authorizedParties` | list of string | no | — |
| `clientId` | string | no | — |
| `enabled` | boolean | no | — |
| `groupsClaim` | string | no | — |
| `issuer` | string | yes | — |
| `mfaAcr` | list of string | no | — |
| `mfaAmr` | list of string | no | — |
| `name` | string | yes | — |
| `scopes` | list of string | no | — |
| `usernameClaim` | string | no | — |

```json
{
  "name": "example",
  "issuer": "example",
  "audiences": [
    "example"
  ]
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/identity/sign-in/providers" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"example","issuer":"example","audiences":["example"]}'
```

**Response `201`**:

```json
{
  "audiences": [
    "example"
  ],
  "authorizedParties": [
    "example"
  ],
  "enabled": false,
  "groupsClaim": "example",
  "issuer": "example",
  "mfaAcr": [
    "example"
  ],
  "mfaAmr": [
    "example"
  ],
  "name": "example",
  "reachable": false,
  "scopes": [
    "example"
  ],
  "source": "console",
  "usernameClaim": "example",
  "clientId": "example",
  "error": "example"
}
```

**Errors:** `400`, `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `PUT /api/v1/identity/sign-in/providers/{id}`

Changes a provider saved in the Console.

**Needs:** `platform.security.manage`; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Provider id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `audiences` | list of string | yes | — |
| `authorizedParties` | list of string | no | — |
| `clientId` | string | no | — |
| `enabled` | boolean | no | — |
| `groupsClaim` | string | no | — |
| `issuer` | string | yes | — |
| `mfaAcr` | list of string | no | — |
| `mfaAmr` | list of string | no | — |
| `name` | string | yes | — |
| `scopes` | list of string | no | — |
| `usernameClaim` | string | no | — |

```json
{
  "name": "example",
  "issuer": "example",
  "audiences": [
    "example"
  ]
}
```

```sh
curl -sS -X PUT "$APELORA_URL/api/v1/identity/sign-in/providers/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"example","issuer":"example","audiences":["example"]}'
```

**Response `200`**:

```json
{
  "audiences": [
    "example"
  ],
  "authorizedParties": [
    "example"
  ],
  "enabled": false,
  "groupsClaim": "example",
  "issuer": "example",
  "mfaAcr": [
    "example"
  ],
  "mfaAmr": [
    "example"
  ],
  "name": "example",
  "reachable": false,
  "scopes": [
    "example"
  ],
  "source": "console",
  "usernameClaim": "example",
  "clientId": "example",
  "error": "example"
}
```

**Errors:** `400`, `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/identity/sign-in/providers/{id}`

Removes a provider saved in the Console: people stop being able to sign in with it. Its name must be typed again.

**Needs:** `platform.security.manage`; audited.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Provider id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The provider's name again. |

```json
{
  "confirm": "example"
}
```

```sh
curl -sS -X DELETE "$APELORA_URL/api/v1/identity/sign-in/providers/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"confirm":"example"}'
```

**Response `204`**, with no body.

**Errors:** `400`, `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/sign-ins`

Everyone's Apelora sessions open now (or one person's).

**Needs:** `user.manage` on the platform.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `user` | query | string | no | Only this person's. |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/identity/sign-ins" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "absoluteSecs": 1,
  "credential": "example",
  "idleSecs": 1,
  "items": [
    {
      "createdAt": "2026-01-01T09:00:00Z",
      "current": false,
      "endsAt": "2026-01-01T09:00:00Z",
      "expiresAt": "2026-01-01T09:00:00Z",
      "id": "00000000-0000-4000-8000-000000000001",
      "lastUsedAt": "2026-01-01T09:00:00Z",
      "method": "example",
      "person": "example",
      "userId": "00000000-0000-4000-8000-000000000001"
    }
  ]
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/identity/sign-ins/{id}`

Ends anyone's session.

**Needs:** `user.manage` on the platform.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Session id |

```sh
curl -sS -X DELETE "$APELORA_URL/api/v1/identity/sign-ins/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`**, with no body.

**Errors:** `401`, `403`, `404`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/tenancy`

Organisations, projects and environments the caller can see, with quotas, use and each environment's Incus project as Incus reports it.

**Needs:** `organization.view` or `project.view` somewhere (or `quota.manage`).

```sh
curl -sS -X GET "$APELORA_URL/api/v1/identity/tenancy" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "adminConfigured": false,
  "baseline": {
    "key": "example"
  },
  "organizations": [
    {
      "canSetQuota": false,
      "id": "00000000-0000-4000-8000-000000000001",
      "name": "example",
      "projects": [
        {
          "canSetQuota": false,
          "environments": [],
          "id": "00000000-0000-4000-8000-000000000001",
          "name": "example",
          "slug": "example",
          "quota": {
            "cpu": 1,
            "diskGib": 1,
            "instances": 1,
            "memoryGib": 1
          },
          "usage": {
            "cpu": 1,
            "diskBytes": 1,
            "instances": 1,
            "memoryBytes": 1
          }
        }
      ],
      "slug": "example",
      "quota": {
        "cpu": 1,
        "diskGib": 1,
        "instances": 1,
        "memoryGib": 1
      },
      "usage": {
        "cpu": 1,
        "diskBytes": 1,
        "instances": 1,
        "memoryBytes": 1
      }
    }
  ],
  "source": {
    "observedAt": "2026-01-01T09:00:00Z",
    "provider": "mock"
  }
}
```

**Errors:** `401`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/users`

People who have signed in, as far as the caller may see them: everyone for a platform administrator, otherwise those with a role in the caller's scopes.

**Needs:** `user.view`.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/identity/users" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "createdAt": "2026-01-01T09:00:00Z",
      "disabled": false,
      "id": "00000000-0000-4000-8000-000000000001",
      "issuer": "example",
      "displayName": "example",
      "email": "alex@example.org",
      "lastSeenAt": "2026-01-01T09:00:00Z",
      "username": "example"
    }
  ]
}
```

**Errors:** `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/users/{user}/disable`

Disables a person: their tokens and Apelora sessions stop working at once.

**Needs:** `user.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `user` | path | string | yes | User id |

```sh
curl -sS -X POST "$APELORA_URL/api/v1/identity/users/00000000-0000-4000-8000-000000000001/disable" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`**, with no body.

**Errors:** `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/users/{user}/enable`

Re-enables a person.

**Needs:** `user.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `user` | path | string | yes | User id |

```sh
curl -sS -X POST "$APELORA_URL/api/v1/identity/users/00000000-0000-4000-8000-000000000001/enable" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`**, with no body.

**Errors:** `403`, `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/users/lookup`

Finds one person by exact user name or e-mail so a role can be given to them. Someone who has never signed in does not exist yet.

**Needs:** `role.assign` or `group.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `q` | query | string | yes | Exact user name or e-mail address. |

```sh
curl -sS -X GET "$APELORA_URL/api/v1/identity/users/lookup?q=example" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "createdAt": "2026-01-01T09:00:00Z",
      "disabled": false,
      "id": "00000000-0000-4000-8000-000000000001",
      "issuer": "example",
      "displayName": "example",
      "email": "alex@example.org",
      "lastSeenAt": "2026-01-01T09:00:00Z",
      "username": "example"
    }
  ]
}
```

**Errors:** `400`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/me/sign-ins`

Your Apelora sessions open now (password and directory sign-ins), most recently used first. Sign-ins with an identity provider's token are not sessions and are not listed.

**Needs:** a signed-in caller; the server decides what that caller may see.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/me/sign-ins" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "absoluteSecs": 1,
  "credential": "example",
  "idleSecs": 1,
  "items": [
    {
      "createdAt": "2026-01-01T09:00:00Z",
      "current": false,
      "endsAt": "2026-01-01T09:00:00Z",
      "expiresAt": "2026-01-01T09:00:00Z",
      "id": "00000000-0000-4000-8000-000000000001",
      "lastUsedAt": "2026-01-01T09:00:00Z",
      "method": "example",
      "person": "example",
      "userId": "00000000-0000-4000-8000-000000000001"
    }
  ]
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/me/sign-ins/{id}`

Ends one of your sessions (signs that browser out). Another person's answers 404.

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Session id |

```sh
curl -sS -X DELETE "$APELORA_URL/api/v1/me/sign-ins/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`**, with no body.

**Errors:** `401`, `403`, `404`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/me/tokens`

Your personal tokens (live ones, and those that ended in the last 30 days), newest first. Any signed-in person.

**Needs:** a signed-in caller; the server decides what that caller may see.

```sh
curl -sS -X GET "$APELORA_URL/api/v1/me/tokens" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `200`**:

```json
{
  "items": [
    {
      "createdAt": "2026-01-01T09:00:00Z",
      "current": false,
      "expiresAt": "2026-01-01T09:00:00Z",
      "id": "00000000-0000-4000-8000-000000000001",
      "name": "example",
      "owner": "example",
      "state": "example",
      "userId": "00000000-0000-4000-8000-000000000001",
      "lastUsedAt": "2026-01-01T09:00:00Z",
      "revokedAt": "2026-01-01T09:00:00Z",
      "revokedBy": "example",
      "rotatedFrom": "00000000-0000-4000-8000-000000000001",
      "successor": "00000000-0000-4000-8000-000000000001"
    }
  ],
  "limit": 1
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/me/tokens`

Creates a personal token, shown only in this response. It acts as you with whatever you hold when it is used, and never opens terminal sessions or makes other credentials.

**Needs:** a sign-in (not a personal token); 1–365 days, no default; at most 20 live tokens.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `expiresInDays` | integer | no | 1–365 days; required. |
| `name` | string | yes | What it is for, e.g. "laptop backup script". |

```json
{
  "name": "example"
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/me/tokens" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"example"}'
```

**Response `201`**:

```json
{
  "info": {
    "createdAt": "2026-01-01T09:00:00Z",
    "current": false,
    "expiresAt": "2026-01-01T09:00:00Z",
    "id": "00000000-0000-4000-8000-000000000001",
    "name": "example",
    "owner": "example",
    "state": "example",
    "userId": "00000000-0000-4000-8000-000000000001",
    "lastUsedAt": "2026-01-01T09:00:00Z",
    "revokedAt": "2026-01-01T09:00:00Z",
    "revokedBy": "example",
    "rotatedFrom": "00000000-0000-4000-8000-000000000001",
    "successor": "00000000-0000-4000-8000-000000000001"
  },
  "token": "<redacted>"
}
```

**Errors:** `400`, `401`, `403`, `409`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/me/tokens/{id}`

Revokes one of your live tokens; it stops working at once. Another person's token answers 404.

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Token id |

```sh
curl -sS -X DELETE "$APELORA_URL/api/v1/me/tokens/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`**, with no body.

**Errors:** `401`, `403`, `404`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/me/tokens/{id}/rotate`

Rotates one of your live tokens: a successor with the same name (shown only in this response), and the old token keeps working for the overlap (0–1440 minutes, 60 by default), then expires. A token is rotated once; rotate its successor next time.

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Token id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `expiresInDays` | integer | no | The successor's lifetime, 1–365 days; the old token's lifetime when omitted. |
| `overlapMinutes` | integer | no | How long the old token keeps working, 0–1440 minutes; 60 when omitted. |

```json
{
  "expiresInDays": 1
}
```

```sh
curl -sS -X POST "$APELORA_URL/api/v1/me/tokens/00000000-0000-4000-8000-000000000001/rotate" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"expiresInDays":1}'
```

**Response `201`**:

```json
{
  "info": {
    "createdAt": "2026-01-01T09:00:00Z",
    "current": false,
    "expiresAt": "2026-01-01T09:00:00Z",
    "id": "00000000-0000-4000-8000-000000000001",
    "name": "example",
    "owner": "example",
    "state": "example",
    "userId": "00000000-0000-4000-8000-000000000001",
    "lastUsedAt": "2026-01-01T09:00:00Z",
    "revokedAt": "2026-01-01T09:00:00Z",
    "revokedBy": "example",
    "rotatedFrom": "00000000-0000-4000-8000-000000000001",
    "successor": "00000000-0000-4000-8000-000000000001"
  },
  "previous": {
    "createdAt": "2026-01-01T09:00:00Z",
    "current": false,
    "expiresAt": "2026-01-01T09:00:00Z",
    "id": "00000000-0000-4000-8000-000000000001",
    "name": "example",
    "owner": "example",
    "state": "example",
    "userId": "00000000-0000-4000-8000-000000000001",
    "lastUsedAt": "2026-01-01T09:00:00Z",
    "revokedAt": "2026-01-01T09:00:00Z",
    "revokedBy": "example",
    "rotatedFrom": "00000000-0000-4000-8000-000000000001",
    "successor": "00000000-0000-4000-8000-000000000001"
  },
  "token": "<redacted>"
}
```

**Errors:** `400`, `401`, `403`, `404`, `409`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

