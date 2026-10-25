---
title: Identity and access API
section: api
slug: identity
order: 8
label: Identity and access
source: packages/api-client/openapi.json
summary: People, groups, roles, scopes, approvals, tokens and sign-in.
---
Identity and access: organisations, projects, people, groups, roles and assignments, approvals, service identities, tokens and sign-in methods. This page lists 65 operations.

Set variables in the [API overview](/docs/api/overview/). Download [OpenAPI](/assets/api/openapi.json).

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

Requests and approvals: your own, plus every open one if you may approve. Needs `approval.request` or `approval.grant`.

**Operation ID:** `approvals`

**Needs:** `approval.request` or `approval.grant`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/approvals" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": []
}
```

**Errors:** `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/approvals`

Asks for approval of one risky action on one target. You must be allowed to do the action yourself; someone else with `approval.grant` then decides. Needs `approval.request`.

**Operation ID:** `request_approval`

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/approvals" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"action":"example","target":"example"}'
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

Approves a request made by someone else. Needs `approval.grant`. The approval is good for 30 minutes, once.

**Operation ID:** `approve_request`

**Needs:** `approval.grant`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Approval id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/approvals/00000000-0000-4000-8000-000000000001/approve" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

Withdraws your own pending request. Needs `approval.request`.

**Operation ID:** `cancel_request`

**Needs:** `approval.request`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Approval id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/approvals/00000000-0000-4000-8000-000000000001/cancel" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

Rejects a request. Needs `approval.grant`.

**Operation ID:** `reject_request`

**Needs:** `approval.grant`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Approval id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/approvals/00000000-0000-4000-8000-000000000001/reject" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

Role assignments in the caller's scopes. Needs `user.view`.

**Operation ID:** `assignments`

**Needs:** `user.view`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `principalType` | query | string | no | — |
| `principalId` | query | string | no | — |
| `includeRevoked` | query | boolean | no | — |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/assignments" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": []
}
```

**Errors:** `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/assignments`

Grants a role to a person, group or automation identity at a scope. Needs `role.assign` there and every permission the role holds (no escalation); audited.

**Operation ID:** `create_assignment`

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/assignments" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"principal":{"id":"00000000-0000-4000-8000-000000000001","type":"user"},"role":{"key":"example","type":"builtin"},"scope":{"type":"platform"}}'
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

Revokes an assignment; the person loses it on their next request. Needs `role.assign` in its scope and every permission the role confers there (you can only take away what you could grant). Refused when it would leave no enabled platform super admin.

**Operation ID:** `revoke_assignment`

**Needs:** `role.assign` in its scope and every permission the role confers there (you can only take away what you could grant).

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `assignment` | path | string | yes | Assignment id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/assignments/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/assignments/preview`

Shows what an assignment would give before it is saved: what the person can already do at the scope, what they could do afterwards, which permissions would be inert, and whether you may save it. Changes nothing. Needs `role.assign`.

**Operation ID:** `preview_assignment`

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/assignments/preview" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"principal":{"id":"00000000-0000-4000-8000-000000000001","type":"user"},"role":{"key":"example","type":"builtin"},"scope":{"type":"platform"}}'
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

Audit history the caller may read: the same filters and paging as `GET /api/v1/audit`. Needs `audit.read`.

**Operation ID:** `identity_audit`

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/audit" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": 9,
      "at": "2026-10-25T15:45:26.305016Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "audit.exported",
      "target": "audit",
      "outcome": "success",
      "scope": null,
      "detail": {
        "filters": {},
        "format": "jsonl",
        "name": "docs-verifier",
        "requestId": "c6731271-c099-4c26-a9c7-2cadbf4397e4",
        "role": "fabric-admin"
      }
    },
    {
      "id": 8,
      "at": "2026-10-25T15:45:26.301188Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "audit.exported",
      "target": "audit",
      "outcome": "success",
      "scope": null,
      "detail": {
        "filters": {},
        "format": "csv",
        "name": "docs-verifier",
        "requestId": "f40becf0-a989-46f6-9f13-205b79aadee9",
        "role": "fabric-admin"
      }
    },
    {
      "id": 7,
      "at": "2026-10-25T15:45:26.245229Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "application.update",
      "target": "shop",
      "outcome": "success",
      "scope": {
        "application": "2b123d49-d55a-40f8-b166-11cdf5682888",
        "organization": "9542a736-cc45-4015-98a8-f3206b0451b9",
        "project": "69c3851c-6d02-4784-9bdc-17f7c449d59d"
      },
      "detail": {
        "descriptionChanged": true,
        "icon": null,
        "name": "docs-verifier",
        "requestId": "43851f2a-79c5-4d4f-83b3-5135a8eec01f",
        "role": "fabric-admin"
      }
    },
    {
      "id": 6,
      "at": "2026-10-25T15:45:26.208646Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "application.create",
      "target": "shop",
      "outcome": "success",
      "scope": {
        "application": "2b123d49-d55a-40f8-b166-11cdf5682888",
        "organization": "9542a736-cc45-4015-98a8-f3206b0451b9",
        "project": "69c3851c-6d02-4784-9bdc-17f7c449d59d"
      },
      "detail": {
        "environment": "development",
        "icon": "box",
        "name": "docs-verifier",
        "requestId": "7cb9b6bf-01ad-4cc7-81bf-8ddd65b03a44",
        "role": "fabric-admin"
      }
    },
    {
      "id": 5,
      "at": "2026-10-25T15:45:26.189916Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "environment.incus_project.prepare",
      "target": "docs-org-docs-project-development",
      "outcome": "success",
      "scope": {
        "application": null,
        "organization": "9542a736-cc45-4015-98a8-f3206b0451b9",
        "project": "69c3851c-6d02-4784-9bdc-17f7c449d59d"
      },
      "detail": {
        "detail": "Incus project docs-org-docs-project-development created by Apelora with the baseline restrictions",
        "environment": "dabff187-1aab-4289-8c16-d72e656f93b4",
        "incusProject": "docs-org-docs-project-development",
        "name": "docs-verifier",
        "requestId": "f158561e-ff0e-48f2-b85c-d132ba167da5",
        "role": "fabric-admin",
        "state": "created"
      }
    },
    {
      "id": 4,
      "at": "2026-10-25T15:45:26.178648Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "environment.create",
      "target": "development",
      "outcome": "success",
      "scope": {
        "application": null,
        "organization": "9542a736-cc45-4015-98a8-f3206b0451b9",
        "project": "69c3851c-6d02-4784-9bdc-17f7c449d59d"
      },
      "detail": {
        "chosenByPlatformAdmin": false,
        "id": "dabff187-1aab-4289-8c16-d72e656f93b4",
        "incusProject": "docs-org-docs-project-development",
        "kind": "development",
        "name": "docs-verifier",
        "requestId": "f158561e-ff0e-48f2-b85c-d132ba167da5",
        "role": "fabric-admin"
      }
    },
    {
      "id": 3,
      "at": "2026-10-25T15:45:26.165897Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "project.create",
      "target": "docs-project",
      "outcome": "success",
      "scope": {
        "application": null,
        "organization": "9542a736-cc45-4015-98a8-f3206b0451b9",
        "project": "69c3851c-6d02-4784-9bdc-17f7c449d59d"
      },
      "detail": {
        "id": "69c3851c-6d02-4784-9bdc-17f7c449d59d",
        "name": "docs-verifier",
        "requestId": "b11c8b7d-570a-421c-8ffd-f4af9085e4cd",
        "role": "fabric-admin"
      }
    },
    {
      "id": 2,
      "at": "2026-10-25T15:45:26.158353Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "organization.create",
      "target": "docs-org",
      "outcome": "success",
      "scope": {
        "application": null,
        "organization": "9542a736-cc45-4015-98a8-f3206b0451b9",
        "project": null
      },
      "detail": {
        "id": "9542a736-cc45-4015-98a8-f3206b0451b9",
        "name": "docs-verifier",
        "requestId": "385c9d8c-f6e8-4108-b830-b79c2ad0c9cb",
        "role": "fabric-admin"
      }
    },
    {
      "id": 1,
      "at": "2026-10-25T15:45:26.003476Z",
      "actor": "cli",
      "actorType": "cli",
      "actorName": null,
      "action": "token.create",
      "target": "docs-verifier",
      "outcome": "success",
      "scope": null,
      "detail": {
        "expiresInDays": 1,
        "id": "726a0075-6258-4585-8ce7-60c829d0b7fc",
        "role": "fabric-admin"
      }
    }
  ]
}
```

**Errors:** `400`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/emergency-access`

Grants a person a platform role for a short time, with a recorded reason (break-glass). You cannot grant it to yourself; every request made with it is audited. Needs `platform.emergency_access`.

**Operation ID:** `grant_emergency_access`

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/emergency-access" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"userId":"00000000-0000-4000-8000-000000000001","role":"example","reason":"example","minutes":1}'
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

Creates or adopts the environment's Incus project now (idempotent): the restricted project with its default profile, granted to the deploy identity, then the quotas mirrored. Needs `environment.manage` on the environment's project; 503 without an admin identity.

**Operation ID:** `prepare_incus_project`

**Needs:** `environment.manage` on the environment's project; 503 without an admin identity.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Environment id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/environments/00000000-0000-4000-8000-000000000001/incus-project" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

Groups the caller may see. Needs `user.view`.

**Operation ID:** `groups`

**Needs:** `user.view`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/groups" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": []
}
```

**Errors:** `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/groups`

Creates a group: an organisation's (needs `group.manage` there) or a platform group (platform `group.manage`). Mapping a group to an identity-provider group name is platform-only.

**Operation ID:** `create_group`

**Needs:** `group.manage` there) or a platform group (platform `group.manage`).

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/groups" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"example"}'
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

Members of a group. Needs `user.view` or `group.manage` on the group's organisation.

**Operation ID:** `group_members`

**Needs:** `user.view` or `group.manage` on the group's organisation.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `group` | path | string | yes | Group id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/groups/00000000-0000-4000-8000-000000000001/members" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

Adds a person to a group. Needs `group.manage`.

**Operation ID:** `add_group_member`

**Needs:** `group.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `group` | path | string | yes | Group id |
| `user` | path | string | yes | User id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/identity/groups/00000000-0000-4000-8000-000000000001/members/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/identity/groups/{group}/members/{user}`

Removes a person from a group; their access through it ends on their next request. Needs `group.manage`.

**Operation ID:** `remove_group_member`

**Needs:** `group.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `group` | path | string | yes | Group id |
| `user` | path | string | yes | User id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/groups/00000000-0000-4000-8000-000000000001/members/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/local-accounts`

Creates a local account and returns its one-time setup link, valid for 24 hours. The person chooses their password with it; nobody else ever knows it. Needs `user.manage`.

**Operation ID:** `create_local_account`

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/local-accounts" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"username":"example"}'
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

Takes a local account's password away, revokes every session of theirs and returns a new one-time setup link (24 hours). Not for your own account (use Change password). Needs `user.manage`.

**Operation ID:** `reset_local_account`

**Needs:** `user.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | User id of the local account |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/local-accounts/00000000-0000-4000-8000-000000000001/reset" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

```json
{
  "setupExpiresAt": "2026-01-01T09:00:00Z",
  "setupToken": "<redacted>"
}
```

**Errors:** `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/organizations`

Organisations the caller may see. Needs `organization.view` (or a grant below that reaches them).

**Operation ID:** `organizations`

**Needs:** `organization.view` (or a grant below that reaches them).

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/organizations" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "slug": "default",
      "name": "Default",
      "createdAt": "2026-10-25T15:45:25.861711Z",
      "disabled": false
    },
    {
      "id": "9542a736-cc45-4015-98a8-f3206b0451b9",
      "slug": "docs-org",
      "name": "Documentation example",
      "createdAt": "2026-10-25T15:45:26.158353Z",
      "disabled": false
    }
  ]
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/organizations`

Creates an organisation. Needs `organization.create` (platform).

**Operation ID:** `create_organization`

**Needs:** `organization.create` (platform).

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `name` | string | yes | — |
| `slug` | string | yes | — |

```json
{
  "slug": "docs-org",
  "name": "Documentation example"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/organizations" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"slug":"docs-org","name":"Documentation example"}'
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "9542a736-cc45-4015-98a8-f3206b0451b9",
  "slug": "docs-org",
  "name": "Documentation example",
  "createdAt": "2026-10-25T15:45:26.158353Z",
  "disabled": false
}
```

**Errors:** `400`, `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/organizations/{org}/projects`

Creates a project in an organisation. Needs `project.create` on the organisation.

**Operation ID:** `create_project`

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
  "slug": "docs-project",
  "name": "Documentation project"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/organizations/9542a736-cc45-4015-98a8-f3206b0451b9/projects" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"slug":"docs-project","name":"Documentation project"}'
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "69c3851c-6d02-4784-9bdc-17f7c449d59d",
  "organizationId": "9542a736-cc45-4015-98a8-f3206b0451b9",
  "organizationSlug": "docs-org",
  "slug": "docs-project",
  "name": "Documentation project",
  "createdAt": "2026-10-25T15:45:26.165897Z"
}
```

**Errors:** `400`, `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/permissions`

Every permission, its class and the narrowest scope at which a grant takes effect.

**Operation ID:** `permissions`

**Needs:** a signed-in caller; the server decides what that caller may see.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/permissions" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "organization.view",
      "class": "tenant",
      "floor": "organization",
      "needsApproval": false,
      "description": "See an organisation and its projects"
    },
    {
      "id": "organization.update",
      "class": "tenant",
      "floor": "organization",
      "needsApproval": false,
      "description": "Rename an organisation and change its settings"
    },
    {
      "id": "project.view",
      "class": "tenant",
      "floor": "project",
      "needsApproval": false,
      "description": "See a project and its environments"
    },
    {
      "id": "project.create",
      "class": "tenant",
      "floor": "organization",
      "needsApproval": false,
      "description": "Create projects in an organisation"
    },
    {
      "id": "project.update",
      "class": "tenant",
      "floor": "project",
      "needsApproval": false,
      "description": "Change a project"
    },
    {
      "id": "project.delete",
      "class": "tenant",
      "floor": "project",
      "needsApproval": false,
      "description": "Delete an empty project"
    },
    {
      "id": "environment.manage",
      "class": "tenant",
      "floor": "project",
      "needsApproval": false,
      "description": "Create and change environments and their Incus project mapping requests"
    },
    {
      "id": "application.view",
      "class": "tenant",
      "floor": "application",
      "needsApproval": false,
      "description": "See applications and their status"
    },
    {
      "id": "application.create",
      "class": "tenant",
      "floor": "project",
      "needsApproval": false,
      "description": "Create an application"
    },
    {
      "id": "application.design",
      "class": "tenant",
      "floor": "application",
      "needsApproval": false,
      "description": "Edit the application graph and preview a plan"
    },
    {
      "id": "application.deploy",
      "class": "tenant",
      "floor": "application",
      "needsApproval": false,
      "description": "Deploy a design to its environment"
    },
    {
      "id": "application.operate",
      "class": "tenant",
      "floor": "application",
      "needsApproval": false,
      "description": "Start, stop, restart and recover an application"
    },
    {
      "id": "application.delete",
      "class": "tenant",
      "floor": "application",
      "needsApproval": false,
      "description": "Remove an application and its instances"
    },
    {
      "id": "application.logs.read",
      "class": "tenant",
      "floor": "application",
      "needsApproval": false,
      "description": "Read application logs"
    },
    {
      "id": "application.metrics.read",
      "class": "tenant",
      "floor": "application",
      "needsApproval": false,
      "description": "Read application metrics"
    },
    {
      "id": "capacity.view",
      "class": "tenant",
      "floor": "application",
      "needsApproval": false,
      "description": "See how much CPU, memory and disk the cluster has free (totals and numbered servers, no names)"
    },
    {
      "id": "instance.manage",
      "class": "tenant",
      "floor": "project",
      "needsApproval": false,
      "description": "Create, change and delete single instances in a project's environments"
    },
    {
      "id": "instance.console",
      "class": "tenant",
      "floor": "application",
      "needsApproval": false,
      "description": "Open a terminal or PowerShell session in a running module of the application"
    },
    {
      "id": "instance.desktop",
      "class": "tenant",
      "floor": "application",
      "needsApproval": false,
      "description": "Open a remote desktop (RDP) session to a running Windows module of the application"
    },
    {
      "id": "user.view",
      "class": "tenant",
      "floor": "project",
      "needsApproval": false,
      "description": "See users with access in the scope"
    },
    {
      "id": "group.manage",
      "class": "tenant",
      "floor": "organization",
      "needsApproval": false,
      "description": "Create groups and change their members"
    },
    {
      "id": "role.assign",
      "class": "tenant",
      "floor": "project",
      "needsApproval": false,
      "description": "Grant and revoke roles in the scope (never more than you hold)"
    },
    {
      "id": "audit.read",
      "class": "tenant",
      "floor": "application",
      "needsApproval": false,
      "description": "Read audit events of the scope"
    },
    {
      "id": "approval.request",
      "class": "tenant",
      "floor": "application",
      "needsApproval": false,
      "description": "Ask for approval of a protected action"
    },
    {
      "id": "approval.grant",
      "class": "tenant",
      "floor": "project",
      "needsApproval": false,
      "description": "Approve or reject another person's request"
    },
    {
      "id": "cluster.view",
      "class": "infrastructure",
      "floor": "platform",
      "needsApproval": false,
      "description": "See the Incus cluster, members, networks and storage pools"
    },
    {
      "id": "cluster.manage",
      "class": "infrastructure",
      "floor": "platform",
      "needsApproval": false,
      "description": "Join tokens, enrolment holds and other cluster changes"
    },
    {
      "id": "cluster.evacuate",
      "class": "infrastructure",
      "floor": "platform",
      "needsApproval": false,
      "description": "Evacuate a member when no workload would be left without service"
    },
    {
      "id": "cluster.evacuate_unsafe",
      "class": "infrastructure",
      "floor": "platform",
      "needsApproval": true,
      "description": "Evacuate a member although some workload would lose service"
    },
    {
      "id": "cluster.fence_confirm",
      "class": "infrastructure",
      "floor": "platform",
      "needsApproval": true,
      "description": "Confirm that a failed server is powered off, so its modules on shared storage restart on other servers"
    },
    {
      "id": "cluster.sensitive_change",
      "class": "infrastructure",
      "floor": "platform",
      "needsApproval": true,
      "description": "Change cluster authentication, trust or other sensitive settings"
    },
    {
      "id": "network.manage",
      "class": "infrastructure",
      "floor": "platform",
      "needsApproval": false,
      "description": "Manage networks, uplinks and address ranges"
    },
    {
      "id": "storage.manage",
      "class": "infrastructure",
      "floor": "platform",
      "needsApproval": false,
      "description": "Manage storage pools and volume classes"
    },
    {
      "id": "hardware.view",
      "class": "infrastructure",
      "floor": "pool",
      "needsApproval": false,
      "description": "See physical machines"
    },
    {
      "id": "hardware.commission",
      "class": "infrastructure",
      "floor": "pool",
      "needsApproval": false,
      "description": "Commission and test physical machines"
    },
    {
      "id": "hardware.deploy",
      "class": "infrastructure",
      "floor": "pool",
      "needsApproval": false,
      "description": "Install an operating system on a physical machine"
    },
    {
      "id": "hardware.power",
      "class": "infrastructure",
      "floor": "pool",
      "needsApproval": true,
      "description": "Power a physical machine on, off or restart it"
    },
    {
      "id": "hardware.delete",
      "class": "infrastructure",
      "floor": "pool",
      "needsApproval": true,
      "description": "Remove a physical machine from inventory or wipe it"
    },
    {
      "id": "fabric.metrics.read",
      "class": "infrastructure",
      "floor": "platform",
      "needsApproval": false,
      "description": "Scrape the control plane's metrics (GET /metrics) and see how monitoring is set up"
    },
    {
      "id": "support.bundle",
      "class": "infrastructure",
      "floor": "platform",
      "needsApproval": false,
      "description": "Download a support bundle: versions, settings without secrets, health, preflight, failed jobs and metrics"
    },
    {
      "id": "machine.enrol",
      "class": "infrastructure",
      "floor": "platform",
      "needsApproval": false,
      "description": "Register machines and approve them to join the cluster"
    },
    {
      "id": "alert.respond",
      "class": "infrastructure",
      "floor": "platform",
      "needsApproval": false,
      "description": "Acknowledge alerts and silence them for a time window"
    },
    {
      "id": "alert.configure",
      "class": "infrastructure",
      "floor": "platform",
      "needsApproval": false,
      "description": "Change alert rules (on or off, thresholds, durations, severities) and notification channels (webhooks)"
    },
    {
      "id": "quota.manage",
      "class": "infrastructure",
      "floor": "platform",
      "needsApproval": false,
      "description": "Set resource quotas on organisations, projects and environments (mirrored to Incus project limits)"
    },
    {
      "id": "organization.create",
      "class": "security",
      "floor": "platform",
      "needsApproval": false,
      "description": "Create organisations"
    },
    {
      "id": "role.manage",
      "class": "security",
      "floor": "platform",
      "needsApproval": false,
      "description": "Define custom roles"
    },
    {
      "id": "service_identity.manage",
      "class": "security",
      "floor": "platform",
      "needsApproval": false,
      "description": "Register and disable service identities"
    },
    {
      "id": "access_policy.manage",
      "class": "security",
      "floor": "platform",
      "needsApproval": false,
      "description": "Change access policies (MFA and approval rules)"
    },
    {
      "id": "token.manage",
      "class": "security",
      "floor": "platform",
      "needsApproval": false,
      "description": "Create and revoke API tokens"
    },
    {
      "id": "token.create_admin",
      "class": "security",
      "floor": "platform",
      "needsApproval": true,
      "description": "Create an API token with the fabric-admin role (needs another person's approval)"
    },
    {
      "id": "platform.security.manage",
      "class": "security",
      "floor": "platform",
      "needsApproval": false,
      "description": "Change identity provider settings and other platform security"
    },
    {
      "id": "platform.emergency_access",
      "class": "security",
      "floor": "platform",
      "needsApproval": false,
      "description": "Grant time-limited emergency access"
    },
    {
      "id": "user.manage",
      "class": "security",
      "floor": "platform",
      "needsApproval": false,
      "description": "Create and reset local accounts, disable users and see every user"
    }
  ]
}
```

**Errors:** `401`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/personal-tokens`

Everyone's personal tokens (or one person's), live ones and those that ended in the last 30 days. Needs `token.manage` on the platform.

**Operation ID:** `personal_tokens`

**Needs:** `token.manage` on the platform.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `user` | query | string | no | Only this person's. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/personal-tokens" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [],
  "limit": 20
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/identity/personal-tokens/{id}`

Revokes anyone's live personal token. Needs `token.manage` on the platform.

**Operation ID:** `revoke_personal_token`

**Needs:** `token.manage` on the platform.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Token id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/personal-tokens/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `401`, `403`, `404`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/policies`

Access policies (MFA and approval rules). Needs `access_policy.manage` or `audit.read`.

**Operation ID:** `policies`

**Needs:** `access_policy.manage` or `audit.read`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/policies" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": []
}
```

**Errors:** `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `PUT /api/v1/identity/policies`

Creates or updates a policy by name. `mfa`: `{"environments": ["production"], "infrastructure": true}`. `approval`: `{"actions": ["cluster.evacuate"]}` (extra actions that need approval where the API already asks for it). Needs `access_policy.manage`.

**Operation ID:** `save_policy`

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/identity/policies" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"example","kind":"example","parameters":{}}'
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

Deletes a policy. Needs `access_policy.manage`.

**Operation ID:** `delete_policy`

**Needs:** `access_policy.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Policy id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/policies/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `403`, `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/projects`

Projects the caller may see, optionally of one organisation. Needs `project.view`.

**Operation ID:** `projects_list`

**Needs:** `project.view`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `organization` | query | string | no | — |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/projects" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "00000000-0000-0000-0000-000000000002",
      "organizationId": "00000000-0000-0000-0000-000000000001",
      "organizationSlug": "default",
      "slug": "default",
      "name": "Default",
      "createdAt": "2026-10-25T15:45:25.861711Z"
    },
    {
      "id": "69c3851c-6d02-4784-9bdc-17f7c449d59d",
      "organizationId": "9542a736-cc45-4015-98a8-f3206b0451b9",
      "organizationSlug": "docs-org",
      "slug": "docs-project",
      "name": "Documentation project",
      "createdAt": "2026-10-25T15:45:26.165897Z"
    }
  ]
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/projects/{project}/environments`

Environments of a project. Needs `project.view` on it.

**Operation ID:** `environments`

**Needs:** `project.view` on it.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `project` | path | string | yes | Project id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/projects/apelora/environments" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

Creates an environment. The Incus project it maps to is derived from the names (tenants cannot choose it); platform administrators may map an existing one. Needs `environment.manage`.

**Operation ID:** `create_environment`

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
  "slug": "development",
  "name": "Development",
  "kind": "development"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/projects/69c3851c-6d02-4784-9bdc-17f7c449d59d/environments" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"slug":"development","name":"Development","kind":"development"}'
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "dabff187-1aab-4289-8c16-d72e656f93b4",
  "projectId": "69c3851c-6d02-4784-9bdc-17f7c449d59d",
  "slug": "development",
  "name": "Development",
  "kind": "development",
  "incusProject": "docs-org-docs-project-development",
  "incusProjectConfig": {
    "features.images": "false",
    "features.networks": "false",
    "features.profiles": "true",
    "features.storage.buckets": "true",
    "features.storage.volumes": "true",
    "restricted": "true",
    "restricted.backups": "block",
    "restricted.cluster.target": "allow",
    "restricted.containers.interception": "block",
    "restricted.containers.lowlevel": "block",
    "restricted.containers.nesting": "block",
    "restricted.containers.privilege": "unprivileged",
    "restricted.devices.disk": "managed",
    "restricted.devices.gpu": "block",
    "restricted.devices.infiniband": "block",
    "restricted.devices.nic": "managed",
    "restricted.devices.pci": "block",
    "restricted.devices.proxy": "block",
    "restricted.devices.unix-block": "block",
    "restricted.devices.unix-char": "block",
    "restricted.devices.unix-hotplug": "block",
    "restricted.devices.usb": "block",
    "restricted.networks.zones": "block",
    "restricted.snapshots": "allow",
    "restricted.virtual-machines.lowlevel": "block"
  },
  "incusProvisioned": true,
  "incusState": "created",
  "incusDetail": "Incus project docs-org-docs-project-development created by Apelora with the baseline restrictions"
}
```

**Errors:** `400`, `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/quotas/{scope}/{id}`

A scope's quota and use. Needs `organization.view` (organisation) or `project.view` (project, environment) on it, or `quota.manage`.

**Operation ID:** `quota`

**Needs:** `organization.view` (organisation) or `project.view` (project, environment) on it, or `quota.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `scope` | path | string | yes | organization, project or environment |
| `id` | path | string | yes | Its id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/quotas/example/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

Sets a scope's quota (all limits empty removes it), then mirrors the tightest applicable quota onto every environment beneath it. Needs `quota.manage`; or, below the organisation, `organization.update` on the organisation (projects, environments) or `project.update` on the project (environments), and then never more than a quota above allows.

**Operation ID:** `set_quota`

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/identity/quotas/example/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"cpu":1}'
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

**Operation ID:** `roles`

**Needs:** a signed-in caller; the server decides what that caller may see.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/roles" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "builtin:platform-super-admin",
      "reference": {
        "type": "builtin",
        "key": "platform-super-admin"
      },
      "name": "Platform Super Admin",
      "description": "Everything, including identity, security settings and emergency access. Keep to a few named people.",
      "builtin": true,
      "permissions": [
        "access_policy.manage",
        "alert.configure",
        "alert.respond",
        "application.create",
        "application.delete",
        "application.deploy",
        "application.design",
        "application.logs.read",
        "application.metrics.read",
        "application.operate",
        "application.view",
        "approval.grant",
        "approval.request",
        "audit.read",
        "capacity.view",
        "cluster.evacuate",
        "cluster.evacuate_unsafe",
        "cluster.fence_confirm",
        "cluster.manage",
        "cluster.sensitive_change",
        "cluster.view",
        "environment.manage",
        "fabric.metrics.read",
        "group.manage",
        "hardware.commission",
        "hardware.delete",
        "hardware.deploy",
        "hardware.power",
        "hardware.view",
        "instance.console",
        "instance.desktop",
        "instance.manage",
        "machine.enrol",
        "network.manage",
        "organization.create",
        "organization.update",
        "organization.view",
        "platform.emergency_access",
        "platform.security.manage",
        "project.create",
        "project.delete",
        "project.update",
        "project.view",
        "quota.manage",
        "role.assign",
        "role.manage",
        "service_identity.manage",
        "storage.manage",
        "support.bundle",
        "token.create_admin",
        "token.manage",
        "user.manage",
        "user.view"
      ],
      "scopes": [
        "platform"
      ]
    },
    {
      "id": "builtin:fabric-administrator",
      "reference": {
        "type": "builtin",
        "key": "fabric-administrator"
      },
      "name": "Fabric Administrator",
      "description": "Runs the cluster: members, networks, storage and enrolment. Does not manage people or hardware power.",
      "builtin": true,
      "permissions": [
        "alert.configure",
        "alert.respond",
        "application.metrics.read",
        "application.view",
        "approval.grant",
        "approval.request",
        "audit.read",
        "cluster.evacuate",
        "cluster.evacuate_unsafe",
        "cluster.fence_confirm",
        "cluster.manage",
        "cluster.sensitive_change",
        "cluster.view",
        "fabric.metrics.read",
        "hardware.view",
        "machine.enrol",
        "network.manage",
        "organization.view",
        "project.view",
        "quota.manage",
        "storage.manage",
        "support.bundle"
      ],
      "scopes": [
        "platform"
      ]
    },
    {
      "id": "builtin:hardware-operator",
      "reference": {
        "type": "builtin",
        "key": "hardware-operator"
      },
      "name": "Hardware Operator",
      "description": "Commissions, installs and powers physical machines in assigned hardware pools. No Incus or application access.",
      "builtin": true,
      "permissions": [
        "approval.request",
        "hardware.commission",
        "hardware.delete",
        "hardware.deploy",
        "hardware.power",
        "hardware.view"
      ],
      "scopes": [
        "platform",
        "pool"
      ]
    },
    {
      "id": "builtin:organization-owner",
      "reference": {
        "type": "builtin",
        "key": "organization-owner"
      },
      "name": "Organization Owner",
      "description": "Runs one organisation: its projects, people and applications, within the limits the platform allocates. No infrastructure access.",
      "builtin": true,
      "permissions": [
        "application.create",
        "application.delete",
        "application.deploy",
        "application.design",
        "application.logs.read",
        "application.metrics.read",
        "application.operate",
        "application.view",
        "approval.grant",
        "approval.request",
        "audit.read",
        "capacity.view",
        "environment.manage",
        "group.manage",
        "instance.console",
        "instance.desktop",
        "instance.manage",
        "organization.update",
        "organization.view",
        "project.create",
        "project.delete",
        "project.update",
        "project.view",
        "role.assign",
        "user.view"
      ],
      "scopes": [
        "organization"
      ]
    },
    {
      "id": "builtin:project-administrator",
      "reference": {
        "type": "builtin",
        "key": "project-administrator"
      },
      "name": "Project Administrator",
      "description": "Runs one project: its members, environments and applications.",
      "builtin": true,
      "permissions": [
        "application.create",
        "application.delete",
        "application.deploy",
        "application.design",
        "application.logs.read",
        "application.metrics.read",
        "application.operate",
        "application.view",
        "approval.grant",
        "approval.request",
        "audit.read",
        "capacity.view",
        "environment.manage",
        "instance.console",
        "instance.desktop",
        "instance.manage",
        "project.delete",
        "project.update",
        "project.view",
        "role.assign",
        "user.view"
      ],
      "scopes": [
        "project"
      ]
    },
    {
      "id": "builtin:application-designer",
      "reference": {
        "type": "builtin",
        "key": "application-designer"
      },
      "name": "Application Designer",
      "description": "Creates and edits application graphs and previews plans. Cannot deploy.",
      "builtin": true,
      "permissions": [
        "application.create",
        "application.design",
        "application.logs.read",
        "application.metrics.read",
        "application.view",
        "capacity.view",
        "project.view"
      ],
      "scopes": [
        "project",
        "application"
      ]
    },
    {
      "id": "builtin:application-operator",
      "reference": {
        "type": "builtin",
        "key": "application-operator"
      },
      "name": "Application Operator",
      "description": "Deploys approved designs and starts, stops and recovers applications.",
      "builtin": true,
      "permissions": [
        "application.deploy",
        "application.logs.read",
        "application.metrics.read",
        "application.operate",
        "application.view",
        "approval.request",
        "capacity.view",
        "project.view"
      ],
      "scopes": [
        "project",
        "application"
      ]
    },
    {
      "id": "builtin:instance-access",
      "reference": {
        "type": "builtin",
        "key": "instance-access"
      },
      "name": "Instance Access",
      "description": "Opens a terminal, PowerShell or remote desktop session on running modules, and reads the scope. Cannot change or operate anything else; production sessions need another person's approval.",
      "builtin": true,
      "permissions": [
        "application.logs.read",
        "application.metrics.read",
        "application.view",
        "approval.request",
        "instance.console",
        "instance.desktop",
        "project.view"
      ],
      "scopes": [
        "project",
        "application"
      ]
    },
    {
      "id": "builtin:viewer",
      "reference": {
        "type": "builtin",
        "key": "viewer"
      },
      "name": "Viewer",
      "description": "Reads what the scope contains.",
      "builtin": true,
      "permissions": [
        "application.metrics.read",
        "application.view",
        "capacity.view",
        "cluster.view",
        "fabric.metrics.read",
        "hardware.view",
        "organization.view",
        "project.view"
      ],
      "scopes": [
        "platform",
        "organization",
        "project",
        "application"
      ]
    },
    {
      "id": "builtin:auditor",
      "reference": {
        "type": "builtin",
        "key": "auditor"
      },
      "name": "Auditor",
      "description": "Reads what the scope contains, plus its audit trail, changing nothing.",
      "builtin": true,
      "permissions": [
        "application.logs.read",
        "application.metrics.read",
        "application.view",
        "audit.read",
        "cluster.view",
        "fabric.metrics.read",
        "hardware.view",
        "organization.view",
        "project.view",
        "user.view"
      ],
      "scopes": [
        "platform",
        "organization",
        "project",
        "application"
      ]
    },
    {
      "id": "builtin:metrics-reader",
      "reference": {
        "type": "builtin",
        "key": "metrics-reader"
      },
      "name": "Metrics Reader",
      "description": "Scrapes the control plane's metrics and nothing else. Meant for the service identity of the installation's own metrics collector.",
      "builtin": true,
      "permissions": [
        "fabric.metrics.read"
      ],
      "scopes": [
        "platform"
      ]
    }
  ]
}
```

**Errors:** `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/roles`

Defines a custom role from explicit permissions. Needs `role.manage` (platform), and you may only include permissions you hold yourself.

**Operation ID:** `create_role`

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/roles" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"example","permissions":["example"]}'
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

Deletes a custom role that no assignment uses. Needs `role.manage`.

**Operation ID:** `delete_role`

**Needs:** `role.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `role` | path | string | yes | Custom role id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/roles/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/service-identities`

Registered service identities (the credentials Apelora uses for Incus and MAAS, and automation identities that call this API). Needs `service_identity.manage`.

**Operation ID:** `service_identities`

**Needs:** `service_identity.manage`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/service-identities" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": []
}
```

**Errors:** `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/service-identities`

Registers a service identity. Outbound kinds (workload, network, storage, provisioning) record only the name of a credential held in the secret store; automation identities get an API token, shown once. Needs `service_identity.manage`.

**Operation ID:** `create_service_identity`

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/service-identities" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"example","kind":"workload"}'
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

Disables a service identity at once. Needs `service_identity.manage`.

**Operation ID:** `disable_service_identity`

**Needs:** `service_identity.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Service identity id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/service-identities/00000000-0000-4000-8000-000000000001/disable" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `403`, `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/service-identities/{id}/enable`

Re-enables a service identity. Needs `service_identity.manage`.

**Operation ID:** `enable_service_identity`

**Needs:** `service_identity.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Service identity id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/service-identities/00000000-0000-4000-8000-000000000001/enable" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `403`, `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/sign-in`

Sign-in settings: identity providers (saved and from the environment), whether API tokens are accepted, and local accounts. Needs `platform.security.manage`.

**Operation ID:** `sign_in_settings`

**Needs:** `platform.security.manage`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/sign-in" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "providers": [],
  "apiTokens": {
    "enabled": true,
    "lockedByEnvironment": false
  },
  "localAccounts": {
    "enabled": false,
    "ready": 0,
    "pending": 0
  },
  "directories": []
}
```

**Errors:** `401`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `PUT /api/v1/identity/sign-in/api-tokens`

Turns API tokens on or off. Turning them off is refused while no other way in remains (an identity provider that answers, or local accounts that are on with at least one account set up), and for someone signed in with an API token (they would lock themselves out). Needs `platform.security.manage`; audited.

**Operation ID:** `set_api_tokens`

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/identity/sign-in/api-tokens" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"enabled":false}'
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

```json
{
  "enabled": false,
  "lockedByEnvironment": false
}
```

**Errors:** `400`, `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/sign-in/check`

Reads a provider's discovery document and key set, without saving anything: what an administrator checks before saving. Needs `platform.security.manage`.

**Operation ID:** `check_identity_provider`

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/sign-in/check" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"issuer":"example"}'
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

The directories people sign in with, each checked with a TLS connection now. Needs `platform.security.manage`.

**Operation ID:** `list_directories`

**Needs:** `platform.security.manage`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/sign-in/directories" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": []
}
```

**Errors:** `401`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/sign-in/directories`

Adds a directory; it is offered on the sign-in page at once when enabled. Needs `platform.security.manage` (and an approval where the policy asks for one); audited.

**Operation ID:** `create_directory`

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/sign-in/directories" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"example","url":"https://example.org","bindTemplate":"example"}'
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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
  "baseDn": "example",
  "caPem": "example",
  "error": "example",
  "groupAttribute": "example",
  "groupBaseDn": "example",
  "groupFilter": "example",
  "problem": "unreachable",
  "userFilter": "example"
}
```

**Errors:** `400`, `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `PUT /api/v1/identity/sign-in/directories/{id}`

Changes a directory (including turning it off). Needs `platform.security.manage`; audited.

**Operation ID:** `update_directory`

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/identity/sign-in/directories/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"example","url":"https://example.org","bindTemplate":"example"}'
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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
  "baseDn": "example",
  "caPem": "example",
  "error": "example",
  "groupAttribute": "example",
  "groupBaseDn": "example",
  "groupFilter": "example",
  "problem": "unreachable",
  "userFilter": "example"
}
```

**Errors:** `400`, `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/identity/sign-in/directories/{id}`

Removes a directory: its people can no longer sign in with it; their accounts and roles in Apelora stay. Its name must be typed again. Needs `platform.security.manage`; audited.

**Operation ID:** `delete_directory`

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/sign-in/directories/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"example"}'
```

**Response `204`** — Success, with no body.

**Errors:** `400`, `403`, `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/sign-in/directories/check`

Connects with TLS, binds as a test person and reads their entry and groups, without saving anything. Reports what it found or the precise reason it failed. Needs `platform.security.manage`.

**Operation ID:** `check_directory`

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
    "startTls": false,
    "userFilter": "example",
    "usernameAttribute": "example"
  },
  "username": "example",
  "password": "<redacted>"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/sign-in/directories/check" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"settings":{"bindTemplate":"example","name":"example","url":"https://example.org","baseDn":"example","caPem":"example","emailAttribute":"alex@example.org","enabled":false,"groupAttribute":"example","groupBaseDn":"example","groupFilter":"example","groupNameAttribute":"example","idAttribute":"example","nameAttribute":"example","startTls":false,"userFilter":"example","usernameAttribute":"example"},"username":"example","password":"<redacted>"}'
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

Turns sign-in with local accounts on or off. Turning it off is refused while nothing else would let people sign in, and for someone signed in with a local account. Turning it off also ends every password session. Needs `platform.security.manage`; audited.

**Operation ID:** `set_local_accounts`

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/identity/sign-in/local-accounts" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"enabled":false}'
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

```json
{
  "enabled": false,
  "pending": 1,
  "ready": 1
}
```

**Errors:** `400`, `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/sign-in/providers`

Adds an identity provider; it is checked and applied at once. Needs `platform.security.manage` (and an approval where the policy asks for one); audited.

**Operation ID:** `create_identity_provider`

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/sign-in/providers" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"example","issuer":"example","audiences":["example"]}'
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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
  "error": "example",
  "id": "00000000-0000-4000-8000-000000000001",
  "updatedBy": "example"
}
```

**Errors:** `400`, `403`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `PUT /api/v1/identity/sign-in/providers/{id}`

Changes a provider saved in the Console. Needs `platform.security.manage`; audited.

**Operation ID:** `update_identity_provider`

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/identity/sign-in/providers/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"example","issuer":"example","audiences":["example"]}'
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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
  "error": "example",
  "id": "00000000-0000-4000-8000-000000000001",
  "updatedBy": "example"
}
```

**Errors:** `400`, `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/identity/sign-in/providers/{id}`

Removes a provider saved in the Console: people stop being able to sign in with it. Its name must be typed again. Needs `platform.security.manage`; audited.

**Operation ID:** `delete_identity_provider`

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/sign-in/providers/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"example"}'
```

**Response `204`** — Success, with no body.

**Errors:** `400`, `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/sign-ins`

Everyone's Apelora sessions open now (or one person's). Needs `user.manage` on the platform.

**Operation ID:** `sign_ins`

**Needs:** `user.manage` on the platform.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `user` | query | string | no | Only this person's. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/sign-ins" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [],
  "credential": "api-token",
  "idleSecs": 3600,
  "absoluteSecs": 28800
}
```

**Errors:** `401`, `403`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `DELETE /api/v1/identity/sign-ins/{id}`

Ends anyone's session. Needs `user.manage` on the platform.

**Operation ID:** `end_sign_in`

**Needs:** `user.manage` on the platform.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Session id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/sign-ins/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `401`, `403`, `404`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/tenancy`

Organisations, projects and environments the caller can see, with quotas, use and each environment's Incus project as Incus reports it. Needs `organization.view` or `project.view` somewhere (or `quota.manage`).

**Operation ID:** `tenancy`

**Needs:** `organization.view` or `project.view` somewhere (or `quota.manage`).

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/tenancy" \
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
    "observedAt": "2026-10-25T15:45:26.424726Z"
  },
  "adminConfigured": true,
  "baseline": {
    "features.images": "false",
    "features.networks": "false",
    "features.profiles": "true",
    "features.storage.buckets": "true",
    "features.storage.volumes": "true",
    "restricted": "true",
    "restricted.backups": "block",
    "restricted.cluster.target": "allow",
    "restricted.containers.interception": "block",
    "restricted.containers.lowlevel": "block",
    "restricted.containers.nesting": "block",
    "restricted.containers.privilege": "unprivileged",
    "restricted.devices.disk": "managed",
    "restricted.devices.gpu": "block",
    "restricted.devices.infiniband": "block",
    "restricted.devices.nic": "managed",
    "restricted.devices.pci": "block",
    "restricted.devices.proxy": "block",
    "restricted.devices.unix-block": "block",
    "restricted.devices.unix-char": "block",
    "restricted.devices.unix-hotplug": "block",
    "restricted.devices.usb": "block",
    "restricted.networks.zones": "block",
    "restricted.snapshots": "allow",
    "restricted.virtual-machines.lowlevel": "block"
  },
  "organizations": [
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "slug": "default",
      "name": "Default",
      "quota": null,
      "usage": {
        "instances": 0,
        "cpu": 0,
        "memoryBytes": 0,
        "diskBytes": 0
      },
      "canSetQuota": true,
      "projects": [
        {
          "id": "00000000-0000-0000-0000-000000000002",
          "slug": "default",
          "name": "Default",
          "quota": null,
          "usage": {
            "instances": 0,
            "cpu": 0,
            "memoryBytes": 0,
            "diskBytes": 0
          },
          "canSetQuota": true,
          "environments": [
            {
              "id": "00000000-0000-0000-0000-000000000003",
              "slug": "default",
              "name": "Default",
              "kind": "other",
              "incusProject": "apelora",
              "incusState": "pending",
              "incusDetail": "a platform deploy project (APELORA_DEPLOY_PROJECTS), set up by the operator; Prepare Incus project checks it and adopts it",
              "checkedAt": null,
              "quota": null,
              "effective": {
                "instances": null,
                "cpu": null,
                "memoryGib": null,
                "diskGib": null
              },
              "apeloraLimits": {},
              "incus": {
                "restrictions": {
                  "restricted": "true",
                  "restricted.cluster.target": "allow",
                  "restricted.snapshots": "allow"
                },
                "limits": {},
                "usage": {
                  "instances": {
                    "used": 0,
                    "limit": null
                  },
                  "cpu": {
                    "used": 0,
                    "limit": null
                  },
                  "memory": {
                    "used": 0,
                    "limit": null
                  },
                  "disk": {
                    "used": 0,
                    "limit": null
                  }
                }
              },
              "incusError": null,
              "findings": [],
              "canSetQuota": true,
              "canPrepare": true
            }
          ]
        }
      ]
    },
    {
      "id": "9542a736-cc45-4015-98a8-f3206b0451b9",
      "slug": "docs-org",
      "name": "Documentation example",
      "quota": null,
      "usage": {
        "instances": 0,
        "cpu": 0,
        "memoryBytes": 0,
        "diskBytes": 0
      },
      "canSetQuota": true,
      "projects": [
        {
          "id": "69c3851c-6d02-4784-9bdc-17f7c449d59d",
          "slug": "docs-project",
          "name": "Documentation project",
          "quota": null,
          "usage": {
            "instances": 0,
            "cpu": 0,
            "memoryBytes": 0,
            "diskBytes": 0
          },
          "canSetQuota": true,
          "environments": [
            {
              "id": "dabff187-1aab-4289-8c16-d72e656f93b4",
              "slug": "development",
              "name": "Development",
              "kind": "development",
              "incusProject": "docs-org-docs-project-development",
              "incusState": "created",
              "incusDetail": "Incus project docs-org-docs-project-development created by Apelora with the baseline restrictions",
              "checkedAt": "2026-10-25T15:45:26.189916Z",
              "quota": null,
              "effective": {
                "instances": null,
                "cpu": null,
                "memoryGib": null,
                "diskGib": null
              },
              "apeloraLimits": {},
              "incus": {
                "restrictions": {
                  "features.images": "false",
                  "features.networks": "false",
                  "features.profiles": "true",
                  "features.storage.buckets": "true",
                  "features.storage.volumes": "true",
                  "restricted": "true",
                  "restricted.backups": "block",
                  "restricted.cluster.target": "allow",
                  "restricted.containers.interception": "block",
                  "restricted.containers.lowlevel": "block",
                  "restricted.containers.nesting": "block",
                  "restricted.containers.privilege": "unprivileged",
                  "restricted.devices.disk": "managed",
                  "restricted.devices.gpu": "block",
                  "restricted.devices.infiniband": "block",
                  "restricted.devices.nic": "managed",
                  "restricted.devices.pci": "block",
                  "restricted.devices.proxy": "block",
                  "restricted.devices.unix-block": "block",
                  "restricted.devices.unix-char": "block",
                  "restricted.devices.unix-hotplug": "block",
                  "restricted.devices.usb": "block",
                  "restricted.networks.zones": "block",
                  "restricted.snapshots": "allow",
                  "restricted.virtual-machines.lowlevel": "block"
                },
                "limits": {},
                "usage": {
                  "instances": {
                    "used": 0,
                    "limit": null
                  },
                  "cpu": {
                    "used": 0,
                    "limit": null
                  },
                  "memory": {
                    "used": 0,
                    "limit": null
                  },
                  "disk": {
                    "used": 0,
                    "limit": null
                  }
                }
              },
              "incusError": null,
              "findings": [],
              "canSetQuota": true,
              "canPrepare": true
            }
          ]
        }
      ]
    }
  ]
}
```

**Errors:** `401`, `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/users`

People who have signed in, as far as the caller may see them: everyone for a platform administrator, otherwise those with a role in the caller's scopes. Needs `user.view`.

**Operation ID:** `users`

**Needs:** `user.view`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/users" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": []
}
```

**Errors:** `403`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/users/{user}/disable`

Disables a person: their tokens and Apelora sessions stop working at once. Needs `user.manage`.

**Operation ID:** `disable_user`

**Needs:** `user.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `user` | path | string | yes | User id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/users/00000000-0000-4000-8000-000000000001/disable" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `403`, `404`, `409`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/identity/users/{user}/enable`

Re-enables a person. Needs `user.manage`.

**Operation ID:** `enable_user`

**Needs:** `user.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `user` | path | string | yes | User id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/users/00000000-0000-4000-8000-000000000001/enable" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `403`, `404`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/identity/users/lookup`

Finds one person by exact user name or e-mail so a role can be given to them. Someone who has never signed in does not exist yet. Needs `role.assign` or `group.manage`.

**Operation ID:** `lookup_user`

**Needs:** `role.assign` or `group.manage`.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `q` | query | string | yes | Exact user name or e-mail address. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/users/lookup?q=example" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

**Operation ID:** `my_sign_ins`

**Needs:** a signed-in caller; the server decides what that caller may see.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/me/sign-ins" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

**Operation ID:** `end_my_sign_in`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Session id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/me/sign-ins/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `401`, `403`, `404`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `GET /api/v1/me/tokens`

Your personal tokens (live ones, and those that ended in the last 30 days), newest first. Any signed-in person.

**Operation ID:** `my_tokens`

**Needs:** a signed-in caller; the server decides what that caller may see.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/me/tokens" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

Creates a personal token, shown only in this response. It acts as you with whatever you hold when it is used, and never opens terminal sessions or makes other credentials. Needs a sign-in (not a personal token); 1–365 days, no default; at most 20 live tokens.

**Operation ID:** `create_my_token`

**Needs:** a signed-in caller; the server decides what that caller may see.

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/me/tokens" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"example"}'
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

**Operation ID:** `revoke_my_token`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Meaning |
|---|---|---|---|---|
| `id` | path | string | yes | Token id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/me/tokens/00000000-0000-4000-8000-000000000001" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**Response `204`** — Success, with no body.

**Errors:** `401`, `403`, `404`, `503`. The body is `{ "error": { "code": …, "message": … } }`.

### `POST /api/v1/me/tokens/{id}/rotate`

Rotates one of your live tokens: a successor with the same name (shown only in this response), and the old token keeps working for the overlap (0–1440 minutes, 60 by default), then expires. A token is rotated once; rotate its successor next time.

**Operation ID:** `rotate_my_token`

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

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/me/tokens/00000000-0000-4000-8000-000000000001/rotate" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"expiresInDays":1}'
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** (placeholder values that show the shape):

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

