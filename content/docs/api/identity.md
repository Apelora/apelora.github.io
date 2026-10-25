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

**TypeScript:**

```ts
const result = await client.request("approvals", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "fc367426-5510-4f72-8d72-49300c1dd929",
      "action": "hardware.delete",
      "target": "machine:rack1-07",
      "requester": "token:docs-verifier",
      "approver": null,
      "state": "pending",
      "reason": "Retire the old storage server",
      "createdAt": "2026-10-25T16:32:59.583507Z",
      "expiresAt": "2026-10-26T16:32:59Z"
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |

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
  "action": "hardware.delete",
  "target": "machine:rack1-07",
  "reason": "Retire the old storage server"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/approvals" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"action":"hardware.delete","target":"machine:rack1-07","reason":"Retire the old storage server"}'
```

**TypeScript:**

```ts
const result = await client.request("request_approval", { body: { action: "hardware.delete", target: "machine:rack1-07", reason: "Retire the old storage server" } });
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "fc367426-5510-4f72-8d72-49300c1dd929",
  "action": "hardware.delete",
  "target": "machine:rack1-07",
  "requester": "token:docs-verifier",
  "approver": null,
  "state": "pending",
  "reason": "Retire the old storage server",
  "createdAt": "2026-10-25T16:32:59.583507Z",
  "expiresAt": "2026-10-26T16:32:59Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `forbidden`, `mfa_required` |

### `POST /api/v1/approvals/{id}/approve`

Approves a request made by someone else. Needs `approval.grant`. The approval is good for 30 minutes, once.

**Operation ID:** `approve_request`

**Needs:** `approval.grant`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Approval id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/approvals/0e10f6b7-4669-4ac1-b701-4189beec0763/approve" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("approve_request", { params: { id: "0e10f6b7-4669-4ac1-b701-4189beec0763" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "0e10f6b7-4669-4ac1-b701-4189beec0763",
  "action": "token.create_admin",
  "target": "token:fabric-admin",
  "requester": "user:f3c76895-ba34-4437-ad45-1829e8c3f061",
  "approver": "user:d53a8e83-d414-487e-8621-d60d32817bb8",
  "state": "approved",
  "reason": "A second administrator token for the backup site",
  "createdAt": "2026-10-25T16:32:59.605972Z",
  "expiresAt": "2026-10-25T17:02:59Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |
| `404` | — |
| `409` | — |
| `410` | — |

### `POST /api/v1/approvals/{id}/cancel`

Withdraws your own pending request. Needs `approval.request`.

**Operation ID:** `cancel_request`

**Needs:** `approval.request`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Approval id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/approvals/3a7f13d3-1810-412e-a5f1-73558d83f1ca/cancel" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("cancel_request", { params: { id: "3a7f13d3-1810-412e-a5f1-73558d83f1ca" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "3a7f13d3-1810-412e-a5f1-73558d83f1ca",
  "action": "hardware.delete",
  "target": "machine:rack1-08",
  "requester": "token:docs-verifier",
  "approver": null,
  "state": "cancelled",
  "reason": "Retire the spare server",
  "createdAt": "2026-10-25T16:32:59.596136Z",
  "expiresAt": "2026-10-26T16:32:59Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |
| `404` | — |
| `409` | — |

### `POST /api/v1/approvals/{id}/reject`

Rejects a request. Needs `approval.grant`.

**Operation ID:** `reject_request`

**Needs:** `approval.grant`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Approval id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/approvals/fc367426-5510-4f72-8d72-49300c1dd929/reject" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("reject_request", { params: { id: "fc367426-5510-4f72-8d72-49300c1dd929" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "fc367426-5510-4f72-8d72-49300c1dd929",
  "action": "hardware.delete",
  "target": "machine:rack1-07",
  "requester": "token:docs-verifier",
  "approver": "user:d53a8e83-d414-487e-8621-d60d32817bb8",
  "state": "rejected",
  "reason": "Retire the old storage server",
  "createdAt": "2026-10-25T16:32:59.583507Z",
  "expiresAt": "2026-10-26T16:32:59Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |
| `404` | — |
| `409` | — |

### `GET /api/v1/identity/assignments`

Role assignments in the caller's scopes. Needs `user.view`.

**Operation ID:** `assignments`

**Needs:** `user.view`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `principalType` | query | one of `user`, `group`, `service` | no | — | Only the assignments of one principal: its kind. Give it together with `principalId`. |
| `principalId` | query | string (uuid) | no | — | Only the assignments of one principal: its id. Give it together with `principalType`. |
| `includeRevoked` | query | boolean | no | `false` | Also list revoked assignments. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/assignments" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**With options** (`principalType`, `principalId`, `includeRevoked`):

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/assignments?principalType=group&principalId=5e6825cf-f763-4033-8a8a-0ac73f0e391b&includeRevoked=true" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("assignments", { query: { principalType: "group", principalId: "5e6825cf-f763-4033-8a8a-0ac73f0e391b", includeRevoked: true } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "items": [
    {
      "id": "75abbf09-383e-4fbb-ac76-ef66c5177263",
      "principal": {
        "type": "group",
        "id": "5e6825cf-f763-4033-8a8a-0ac73f0e391b"
      },
      "role": {
        "type": "custom",
        "id": "991c41b6-ac70-440d-8c76-6dc4033a495a"
      },
      "roleName": "Release manager",
      "scope": {
        "type": "project",
        "id": "96dd378f-883d-443e-b4b0-5e929f0f7dea"
      },
      "conditions": {
        "requireMfa": false,
        "environments": [
          "production"
        ]
      },
      "kind": "standard",
      "expiresAt": null,
      "reason": "The shop team releases to production",
      "createdBy": "token:docs-verifier",
      "createdAt": "2026-10-25T16:32:59.504701Z",
      "revokedAt": null
    },
    {
      "id": "9878ee9e-9f90-4816-972b-874523570b7e",
      "principal": {
        "type": "user",
        "id": "f3c76895-ba34-4437-ad45-1829e8c3f061"
      },
      "role": {
        "type": "builtin",
        "key": "platform-super-admin"
      },
      "roleName": "Platform Super Admin",
      "scope": {
        "type": "platform"
      },
      "conditions": {
        "requireMfa": false
      },
      "kind": "standard",
      "expiresAt": null,
      "reason": "Platform administrators of this installation",
      "createdBy": "token:docs-verifier",
      "createdAt": "2026-10-25T16:32:58.586356Z",
      "revokedAt": null
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |

### `POST /api/v1/identity/assignments`

Grants a role to a person, group or automation identity at a scope. Needs `role.assign` there and every permission the role holds (no escalation); audited.

**Operation ID:** `create_assignment`

**Needs:** `role.assign` there and every permission the role holds (no escalation); audited.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `conditions` | object | no | — |
| `conditions.environments` | list, each one of `production`, `staging`, `development`, `other` or null | no | The grant counts only for resources in environments of these kinds. |
| `conditions.requireMfa` | boolean | no | The grant counts only when the caller signed in with multi-factor authentication. |
| `expiresAt` | string or null | no | RFC 3339. Assignments may expire; emergency grants must. |
| `principal` | object | yes | Who an assignment is for. |
| `principal.id` | string (uuid) | yes | — |
| `principal.type` | one of `user`, `group`, `service` | yes | — |
| `reason` | string or null | no | — |
| `role` | object | yes | — |
| `role.key` | string | when `type` is `builtin` | — |
| `role.type` | one of `builtin`, `custom` | yes | — |
| `role.id` | string (uuid) | when `type` is `custom` | — |
| `scope` | object | yes | — |
| `scope.type` | one of `platform`, `organization`, `project`, `application`, `pool` | yes | — |
| `scope.id` | string (uuid) | when `type` is `organization`, `project`, `application` | — |
| `scope.name` | string | when `type` is `pool` | — |

```json
{
  "principal": {
    "type": "group",
    "id": "5e6825cf-f763-4033-8a8a-0ac73f0e391b"
  },
  "role": {
    "type": "custom",
    "id": "991c41b6-ac70-440d-8c76-6dc4033a495a"
  },
  "scope": {
    "type": "project",
    "id": "96dd378f-883d-443e-b4b0-5e929f0f7dea"
  },
  "conditions": {
    "environments": [
      "production"
    ],
    "requireMfa": false
  },
  "reason": "The shop team releases to production"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/assignments" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"principal":{"type":"group","id":"5e6825cf-f763-4033-8a8a-0ac73f0e391b"},"role":{"type":"custom","id":"991c41b6-ac70-440d-8c76-6dc4033a495a"},"scope":{"type":"project","id":"96dd378f-883d-443e-b4b0-5e929f0f7dea"},"conditions":{"environments":["production"],"requireMfa":false},"reason":"The shop team releases to production"}'
```

**TypeScript:**

```ts
const result = await client.request("create_assignment", { body /* the request body above */ });
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "75abbf09-383e-4fbb-ac76-ef66c5177263",
  "principal": {
    "type": "group",
    "id": "5e6825cf-f763-4033-8a8a-0ac73f0e391b"
  },
  "role": {
    "type": "custom",
    "id": "991c41b6-ac70-440d-8c76-6dc4033a495a"
  },
  "roleName": "Release manager",
  "scope": {
    "type": "project",
    "id": "96dd378f-883d-443e-b4b0-5e929f0f7dea"
  },
  "conditions": {
    "requireMfa": false,
    "environments": [
      "production"
    ]
  },
  "kind": "standard",
  "expiresAt": null,
  "reason": "The shop team releases to production",
  "createdBy": "token:docs-verifier",
  "createdAt": "2026-10-25T16:32:59.504701Z",
  "revokedAt": null
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `assignment_refused`, `forbidden` |
| `409` | `user_disabled` |

### `DELETE /api/v1/identity/assignments/{assignment}`

Revokes an assignment; the person loses it on their next request. Needs `role.assign` in its scope and every permission the role confers there (you can only take away what you could grant). Refused when it would leave no enabled platform super admin.

**Operation ID:** `revoke_assignment`

**Needs:** `role.assign` in its scope and every permission the role confers there (you can only take away what you could grant).

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `assignment` | path | string (uuid) | yes | — | Assignment id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/assignments/75abbf09-383e-4fbb-ac76-ef66c5177263" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("revoke_assignment", { params: { assignment: "75abbf09-383e-4fbb-ac76-ef66c5177263" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `revocation_refused`, `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `last_super_admin` |

### `POST /api/v1/identity/assignments/preview`

Shows what an assignment would give before it is saved: what the person can already do at the scope, what they could do afterwards, which permissions would be inert, and whether you may save it. Changes nothing. Needs `role.assign`.

**Operation ID:** `preview_assignment`

**Needs:** `role.assign`.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `conditions` | object | no | — |
| `conditions.environments` | list, each one of `production`, `staging`, `development`, `other` or null | no | The grant counts only for resources in environments of these kinds. |
| `conditions.requireMfa` | boolean | no | The grant counts only when the caller signed in with multi-factor authentication. |
| `expiresAt` | string or null | no | RFC 3339. Assignments may expire; emergency grants must. |
| `principal` | object | yes | Who an assignment is for. |
| `principal.id` | string (uuid) | yes | — |
| `principal.type` | one of `user`, `group`, `service` | yes | — |
| `reason` | string or null | no | — |
| `role` | object | yes | — |
| `role.key` | string | when `type` is `builtin` | — |
| `role.type` | one of `builtin`, `custom` | yes | — |
| `role.id` | string (uuid) | when `type` is `custom` | — |
| `scope` | object | yes | — |
| `scope.type` | one of `platform`, `organization`, `project`, `application`, `pool` | yes | — |
| `scope.id` | string (uuid) | when `type` is `organization`, `project`, `application` | — |
| `scope.name` | string | when `type` is `pool` | — |

```json
{
  "principal": {
    "type": "group",
    "id": "5e6825cf-f763-4033-8a8a-0ac73f0e391b"
  },
  "role": {
    "type": "custom",
    "id": "991c41b6-ac70-440d-8c76-6dc4033a495a"
  },
  "scope": {
    "type": "project",
    "id": "96dd378f-883d-443e-b4b0-5e929f0f7dea"
  },
  "conditions": {
    "environments": [
      "production"
    ],
    "requireMfa": false
  },
  "reason": "The shop team releases to production"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/assignments/preview" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"principal":{"type":"group","id":"5e6825cf-f763-4033-8a8a-0ac73f0e391b"},"role":{"type":"custom","id":"991c41b6-ac70-440d-8c76-6dc4033a495a"},"scope":{"type":"project","id":"96dd378f-883d-443e-b4b0-5e929f0f7dea"},"conditions":{"environments":["production"],"requireMfa":false},"reason":"The shop team releases to production"}'
```

**TypeScript:**

```ts
const result = await client.request("preview_assignment", { body /* the request body above */ });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "allowed": true,
  "error": null,
  "before": [],
  "after": [],
  "added": [],
  "inert": [],
  "warnings": []
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `forbidden` |

### `GET /api/v1/identity/audit`

Audit history the caller may read: the same filters and paging as `GET /api/v1/audit`. Needs `audit.read`.

**Operation ID:** `identity_audit`

**Needs:** `audit.read`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `actor` | query | string | no | — | Who acted: their stable id (`user:<uuid>`, `service:<uuid>`, `token:<name>`) or, ignoring case, the name they had when they acted. |
| `target` | query | string | no | — | What was acted on, exactly as recorded (e.g. `local-account:ada` or a group's name). |
| `action` | query | string | no | — | Only actions starting with this, e.g. `role.` or `emergency_access.`. |
| `outcome` | query | string | no | — | `success`, `denied` or `failed`. |
| `from` | query | string | no | — | RFC 3339: events at or after this time. |
| `to` | query | string | no | — | RFC 3339: events before this time. |
| `before` | query | integer | no | — | Only events older than this id (paging: the id of the last event of the previous page). |
| `limit` | query | integer | no | `100` | Events per page, 1 to 500 (default 100). Not used by the export. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/audit" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**With options** (`action`, `limit`):

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/audit?action=role.&limit=5" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**Next page:** repeat the request with `before` set to the `id` of the last item. A page shorter than `limit` is the last one.

**TypeScript:**

```ts
const result = await client.request("identity_audit", { query: { action: "role.", limit: 5 } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "items": [
    {
      "id": 109,
      "at": "2026-10-25T16:33:05.254393Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "alert.channel.delete",
      "target": "alert-channel:On-call webhook",
      "outcome": "success",
      "scope": null,
      "detail": {
        "enabled": true,
        "host": "hooks.example.invalid",
        "id": "455aa2df-8831-497c-a671-f2fa2fcbb2d9",
        "minSeverity": "critical",
        "name": "docs-verifier",
        "requestId": "79e836e2-148b-4072-947b-19c5cb7d31e6",
        "role": "fabric-admin",
        "secretRef": "APELORA_ALERT_SECRET_ONCALL"
      }
    },
    {
      "id": 108,
      "at": "2026-10-25T16:33:05.24455Z",
      "actor": "token:docs-verifier",
      "actorType": "token",
      "actorName": "docs-verifier",
      "action": "alert.acknowledge",
      "target": "alert:2",
      "outcome": "success",
      "scope": null,
      "detail": {
        "name": "docs-verifier",
        "note": "Looking into the failed job",
        "requestId": "52e3a17e-f174-4251-95e7-ac613ee9ae7b",
        "role": "fabric-admin",
        "rule": "job-failures",
        "severity": "warning",
        "subject": "instance.restart"
      }
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `forbidden` |

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
| `userId` | string (uuid) | yes | — |

```json
{
  "userId": "f3c76895-ba34-4437-ad45-1829e8c3f061",
  "role": "fabric-administrator",
  "minutes": 30,
  "reason": "Restore access during the identity provider outage"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/emergency-access" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"userId":"f3c76895-ba34-4437-ad45-1829e8c3f061","role":"fabric-administrator","minutes":30,"reason":"Restore access during the identity provider outage"}'
```

**TypeScript:**

```ts
const result = await client.request("grant_emergency_access", { body /* the request body above */ });
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "1119e482-e70d-450b-aa0c-ec964446d1de",
  "principal": {
    "type": "user",
    "id": "f3c76895-ba34-4437-ad45-1829e8c3f061"
  },
  "role": {
    "type": "builtin",
    "key": "fabric-administrator"
  },
  "roleName": "Fabric Administrator",
  "scope": {
    "type": "platform"
  },
  "conditions": {
    "requireMfa": false
  },
  "kind": "emergency",
  "expiresAt": "2026-10-25T17:02:59.530894Z",
  "reason": "Restore access during the identity provider outage",
  "createdBy": "user:d53a8e83-d414-487e-8621-d60d32817bb8",
  "createdAt": "2026-10-25T16:32:59.531933Z",
  "revokedAt": null
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `assignment_refused`, `forbidden`, `mfa_required` |
| `409` | `self_grant`, `user_disabled` |

### `POST /api/v1/identity/environments/{id}/incus-project`

Creates or adopts the environment's Incus project now (idempotent): the restricted project with its default profile, granted to the deploy identity, then the quotas mirrored. Needs `environment.manage` on the environment's project; 503 without an admin identity.

**Operation ID:** `prepare_incus_project`

**Needs:** `environment.manage` on the environment's project; 503 without an admin identity.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Environment id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/environments/0b7fa228-4c47-4af8-9a53-28df2612fd4e/incus-project" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("prepare_incus_project", { params: { id: "0b7fa228-4c47-4af8-9a53-28df2612fd4e" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "environmentId": "0b7fa228-4c47-4af8-9a53-28df2612fd4e",
  "incusProject": "shop-prod",
  "state": "created",
  "detail": "Incus project shop-prod created by Apelora with the baseline restrictions",
  "findings": [],
  "limits": {
    "environmentId": "0b7fa228-4c47-4af8-9a53-28df2612fd4e",
    "environment": "Production",
    "incusProject": "shop-prod",
    "result": "unchanged",
    "limits": {},
    "detail": "Incus already has these limits"
  }
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `503` | `cluster_admin_not_configured`, `database_not_configured` |

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

**TypeScript:**

```ts
const result = await client.request("groups", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "5e6825cf-f763-4033-8a8a-0ac73f0e391b",
      "organizationId": "0c039899-47c5-4f07-a59e-13ca204a9fe2",
      "name": "shop-operators",
      "externalName": null,
      "description": "People who run the online shop"
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |

### `POST /api/v1/identity/groups`

Creates a group: an organisation's (needs `group.manage` there) or a platform group (platform `group.manage`). Mapping a group to an identity-provider group name is platform-only.

**Operation ID:** `create_group`

**Needs:** `group.manage` there) or a platform group (platform `group.manage`).

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `description` | string | no | — |
| `externalName` | string or null | no | — |
| `name` | string | yes | — |
| `organizationId` | string (uuid) or null | no | — |

```json
{
  "name": "shop-operators",
  "description": "People who run the online shop",
  "organizationId": "0c039899-47c5-4f07-a59e-13ca204a9fe2"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/groups" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"shop-operators","description":"People who run the online shop","organizationId":"0c039899-47c5-4f07-a59e-13ca204a9fe2"}'
```

**TypeScript:**

```ts
const result = await client.request("create_group", { body /* the request body above */ });
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "5e6825cf-f763-4033-8a8a-0ac73f0e391b",
  "organizationId": "0c039899-47c5-4f07-a59e-13ca204a9fe2",
  "name": "shop-operators",
  "externalName": null,
  "description": "People who run the online shop"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `forbidden`, `mfa_required` |
| `409` | — |

### `GET /api/v1/identity/groups/{group}/members`

Members of a group. Needs `user.view` or `group.manage` on the group's organisation.

**Operation ID:** `group_members`

**Needs:** `user.view` or `group.manage` on the group's organisation.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `group` | path | string (uuid) | yes | — | Group id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/groups/5e6825cf-f763-4033-8a8a-0ac73f0e391b/members" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("group_members", { params: { group: "5e6825cf-f763-4033-8a8a-0ac73f0e391b" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "3842bad8-f785-4d27-88cc-6a3052706f93",
      "username": "lin",
      "email": "lin@example.org",
      "displayName": "Lin Chen",
      "issuer": "apelora:local",
      "createdAt": "2026-10-25T16:32:58.169731Z",
      "lastSeenAt": "2026-10-25T16:32:58.566839Z",
      "disabled": false
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |

### `PUT /api/v1/identity/groups/{group}/members/{user}`

Adds a person to a group. Needs `group.manage`.

**Operation ID:** `add_group_member`

**Needs:** `group.manage`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `group` | path | string (uuid) | yes | — | Group id |
| `user` | path | string (uuid) | yes | — | User id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/identity/groups/5e6825cf-f763-4033-8a8a-0ac73f0e391b/members/3842bad8-f785-4d27-88cc-6a3052706f93" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("add_group_member", { params: { group: "5e6825cf-f763-4033-8a8a-0ac73f0e391b", user: "3842bad8-f785-4d27-88cc-6a3052706f93" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `last_super_admin`, `managed_by_provider` |

### `DELETE /api/v1/identity/groups/{group}/members/{user}`

Removes a person from a group; their access through it ends on their next request. Needs `group.manage`.

**Operation ID:** `remove_group_member`

**Needs:** `group.manage`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `group` | path | string (uuid) | yes | — | Group id |
| `user` | path | string (uuid) | yes | — | User id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/groups/5e6825cf-f763-4033-8a8a-0ac73f0e391b/members/3842bad8-f785-4d27-88cc-6a3052706f93" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("remove_group_member", { params: { group: "5e6825cf-f763-4033-8a8a-0ac73f0e391b", user: "3842bad8-f785-4d27-88cc-6a3052706f93" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |
| `409` | `last_super_admin`, `managed_by_provider` |

### `POST /api/v1/identity/local-accounts`

Creates a local account and returns its one-time setup link, valid for 24 hours. The person chooses their password with it; nobody else ever knows it. Needs `user.manage`.

**Operation ID:** `create_local_account`

**Needs:** `user.manage`.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `displayName` | string or null | no | — |
| `email` | string or null | no | — |
| `username` | string | yes | 2 to 64 of `a-z 0-9 . _ -` (stored lowercase). |

```json
{
  "username": "ada",
  "displayName": "Ada Lovelace",
  "email": "ada@example.org"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/local-accounts" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"username":"ada","displayName":"Ada Lovelace","email":"ada@example.org"}'
```

**TypeScript:**

```ts
const result = await client.request("create_local_account", { body: { username: "ada", displayName: "Ada Lovelace", email: "ada@example.org" } });
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "user": {
    "id": "d53a8e83-d414-487e-8621-d60d32817bb8",
    "username": "ada",
    "email": "ada@example.org",
    "displayName": "Ada Lovelace",
    "issuer": "apelora:local",
    "createdAt": "2026-10-25T16:32:57.325917Z",
    "lastSeenAt": null,
    "disabled": false
  },
  "setupToken": "<setup token, shown once>",
  "setupExpiresAt": "2026-10-26T16:32:57.325917Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `forbidden`, `mfa_required` |
| `409` | `approval_invalid`, `approval_required`, `username_taken` |

### `POST /api/v1/identity/local-accounts/{id}/reset`

Takes a local account's password away, revokes every session of theirs and returns a new one-time setup link (24 hours). Not for your own account (use Change password). Needs `user.manage`.

**Operation ID:** `reset_local_account`

**Needs:** `user.manage`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | User id of the local account |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/local-accounts/3842bad8-f785-4d27-88cc-6a3052706f93/reset" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("reset_local_account", { params: { id: "3842bad8-f785-4d27-88cc-6a3052706f93" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "setupToken": "<setup token, shown once>",
  "setupExpiresAt": "2026-10-26T16:32:58.597883Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `approval_invalid`, `approval_required`, `self_reset` |

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

**TypeScript:**

```ts
const result = await client.request("organizations", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "0c039899-47c5-4f07-a59e-13ca204a9fe2",
      "slug": "acme",
      "name": "Acme Corporation",
      "createdAt": "2026-10-25T16:32:57.197282Z",
      "disabled": false
    },
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "slug": "default",
      "name": "Default",
      "createdAt": "2026-10-25T16:32:56.889219Z",
      "disabled": false
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `503` | `database_not_configured` |

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
  "slug": "acme",
  "name": "Acme Corporation"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/organizations" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"slug":"acme","name":"Acme Corporation"}'
```

**TypeScript:**

```ts
const result = await client.request("create_organization", { body: { slug: "acme", name: "Acme Corporation" } });
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "0c039899-47c5-4f07-a59e-13ca204a9fe2",
  "slug": "acme",
  "name": "Acme Corporation",
  "createdAt": "2026-10-25T16:32:57.197282Z",
  "disabled": false
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `forbidden`, `mfa_required` |
| `409` | — |

### `POST /api/v1/identity/organizations/{org}/projects`

Creates a project in an organisation. Needs `project.create` on the organisation.

**Operation ID:** `create_project`

**Needs:** `project.create` on the organisation.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `org` | path | string (uuid) | yes | — | Organisation id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `name` | string | yes | — |
| `slug` | string | yes | — |

```json
{
  "slug": "shop",
  "name": "Online shop"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/organizations/0c039899-47c5-4f07-a59e-13ca204a9fe2/projects" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"slug":"shop","name":"Online shop"}'
```

**TypeScript:**

```ts
const result = await client.request("create_project", { params: { org: "0c039899-47c5-4f07-a59e-13ca204a9fe2" }, body: { slug: "shop", name: "Online shop" } });
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "96dd378f-883d-443e-b4b0-5e929f0f7dea",
  "organizationId": "0c039899-47c5-4f07-a59e-13ca204a9fe2",
  "organizationSlug": "acme",
  "slug": "shop",
  "name": "Online shop",
  "createdAt": "2026-10-25T16:32:57.20592Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | — |

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

**TypeScript:**

```ts
const result = await client.request("permissions", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

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
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |

### `GET /api/v1/identity/personal-tokens`

Everyone's personal tokens (or one person's), live ones and those that ended in the last 30 days. Needs `token.manage` on the platform.

**Operation ID:** `personal_tokens`

**Needs:** `token.manage` on the platform.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `user` | query | string (uuid) | no | — | Only this person's. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/personal-tokens" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**With options** (`user`):

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/personal-tokens?user=d53a8e83-d414-487e-8621-d60d32817bb8" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("personal_tokens", { query: { user: "d53a8e83-d414-487e-8621-d60d32817bb8" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "items": [
    {
      "id": "69eb6307-3e57-4bb6-a3fb-e74176c52d9d",
      "name": "backup-script",
      "userId": "d53a8e83-d414-487e-8621-d60d32817bb8",
      "owner": "ada",
      "state": "active",
      "createdAt": "2026-10-25T16:32:59.057586Z",
      "expiresAt": "2026-11-01T16:32:59.057586Z",
      "lastUsedAt": null,
      "revokedAt": null,
      "revokedBy": null,
      "rotatedFrom": null,
      "successor": null,
      "current": false
    },
    {
      "id": "49dd235a-7ef3-44cd-97a6-d96200ced7a8",
      "name": "laptop-cli",
      "userId": "d53a8e83-d414-487e-8621-d60d32817bb8",
      "owner": "ada",
      "state": "active",
      "createdAt": "2026-10-25T16:32:59.047106Z",
      "expiresAt": "2026-11-24T16:32:59.047106Z",
      "lastUsedAt": null,
      "revokedAt": null,
      "revokedBy": null,
      "rotatedFrom": "10410ec8-6cbd-4d5c-a0d3-20b1762acff9",
      "successor": null,
      "current": false
    }
  ],
  "limit": 20
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `503` | `database_not_configured` |

### `DELETE /api/v1/identity/personal-tokens/{id}`

Revokes anyone's live personal token. Needs `token.manage` on the platform.

**Operation ID:** `revoke_personal_token`

**Needs:** `token.manage` on the platform.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Token id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/personal-tokens/69eb6307-3e57-4bb6-a3fb-e74176c52d9d" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("revoke_personal_token", { params: { id: "69eb6307-3e57-4bb6-a3fb-e74176c52d9d" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | — |
| `503` | `database_not_configured` |

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

**TypeScript:**

```ts
const result = await client.request("policies", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "bc8d8d96-3564-452f-96db-3197e17c5bfd",
      "name": "approve-machine-removal",
      "kind": "approval",
      "parameters": {
        "actions": [
          "hardware.delete"
        ]
      },
      "enabled": true,
      "updatedBy": "token:docs-verifier",
      "updatedAt": "2026-10-25T16:32:59.545917Z"
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |

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
  "name": "approve-machine-removal",
  "kind": "approval",
  "parameters": {
    "actions": [
      "hardware.delete"
    ]
  },
  "enabled": true
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/identity/policies" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"approve-machine-removal","kind":"approval","parameters":{"actions":["hardware.delete"]},"enabled":true}'
```

**TypeScript:**

```ts
const result = await client.request("save_policy", { body /* the request body above */ });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "bc8d8d96-3564-452f-96db-3197e17c5bfd",
  "name": "approve-machine-removal",
  "kind": "approval",
  "parameters": {
    "actions": [
      "hardware.delete"
    ]
  },
  "enabled": true,
  "updatedBy": "token:docs-verifier",
  "updatedAt": "2026-10-25T16:32:59.545917Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `forbidden`, `mfa_required` |

### `DELETE /api/v1/identity/policies/{id}`

Deletes a policy. Needs `access_policy.manage`.

**Operation ID:** `delete_policy`

**Needs:** `access_policy.manage`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Policy id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/policies/bc8d8d96-3564-452f-96db-3197e17c5bfd" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("delete_policy", { params: { id: "bc8d8d96-3564-452f-96db-3197e17c5bfd" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |
| `404` | — |

### `GET /api/v1/identity/projects`

Projects the caller may see, optionally of one organisation. Needs `project.view`.

**Operation ID:** `projects_list`

**Needs:** `project.view`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `organization` | query | string (uuid) | no | — | Only the projects of this organisation (its id). |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/projects" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**With options** (`organization`):

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/projects?organization=0c039899-47c5-4f07-a59e-13ca204a9fe2" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("projects_list", { query: { organization: "0c039899-47c5-4f07-a59e-13ca204a9fe2" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "96dd378f-883d-443e-b4b0-5e929f0f7dea",
      "organizationId": "0c039899-47c5-4f07-a59e-13ca204a9fe2",
      "organizationSlug": "acme",
      "slug": "shop",
      "name": "Online shop",
      "createdAt": "2026-10-25T16:32:57.20592Z"
    },
    {
      "id": "00000000-0000-0000-0000-000000000002",
      "organizationId": "00000000-0000-0000-0000-000000000001",
      "organizationSlug": "default",
      "slug": "default",
      "name": "Default",
      "createdAt": "2026-10-25T16:32:56.889219Z"
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `503` | `database_not_configured` |

### `GET /api/v1/identity/projects/{project}/environments`

Environments of a project. Needs `project.view` on it.

**Operation ID:** `environments`

**Needs:** `project.view` on it.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `project` | path | string (uuid) | yes | — | Project id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/projects/96dd378f-883d-443e-b4b0-5e929f0f7dea/environments" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("environments", { params: { project: "96dd378f-883d-443e-b4b0-5e929f0f7dea" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "0b7fa228-4c47-4af8-9a53-28df2612fd4e",
      "projectId": "96dd378f-883d-443e-b4b0-5e929f0f7dea",
      "slug": "production",
      "name": "Production",
      "kind": "production",
      "incusProject": "shop-prod",
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
      "incusDetail": "Incus project shop-prod created by Apelora with the baseline restrictions"
    },
    {
      "id": "5a2bed50-145e-4a9e-9df5-974de12cc193",
      "projectId": "96dd378f-883d-443e-b4b0-5e929f0f7dea",
      "slug": "staging",
      "name": "Staging",
      "kind": "staging",
      "incusProject": "acme-shop-staging",
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
      "incusDetail": "Incus project acme-shop-staging created by Apelora with the baseline restrictions"
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |

### `POST /api/v1/identity/projects/{project}/environments`

Creates an environment. The Incus project it maps to is derived from the names (tenants cannot choose it); platform administrators may map an existing one. Needs `environment.manage`.

**Operation ID:** `create_environment`

**Needs:** `environment.manage`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `project` | path | string (uuid) | yes | — | Project id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `incusProject` | string or null | no | Platform administrators only: map an existing Incus project instead of the derived name. |
| `kind` | one of `production`, `staging`, `development`, `other` | yes | Kind of environment; policies such as "production needs MFA" refer to it. |
| `name` | string | yes | — |
| `slug` | string | yes | — |

```json
{
  "slug": "production",
  "name": "Production",
  "kind": "production",
  "incusProject": "shop-prod"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/projects/96dd378f-883d-443e-b4b0-5e929f0f7dea/environments" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"slug":"production","name":"Production","kind":"production","incusProject":"shop-prod"}'
```

**TypeScript:**

```ts
const result = await client.request("create_environment", { params: { project: "96dd378f-883d-443e-b4b0-5e929f0f7dea" }, body: { slug: "production", name: "Production", kind: "production", incusProject: "shop-prod" } });
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "0b7fa228-4c47-4af8-9a53-28df2612fd4e",
  "projectId": "96dd378f-883d-443e-b4b0-5e929f0f7dea",
  "slug": "production",
  "name": "Production",
  "kind": "production",
  "incusProject": "shop-prod",
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
  "incusDetail": "Incus project shop-prod created by Apelora with the baseline restrictions"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `forbidden`, `mfa_required` |
| `409` | `reserved_name` |

### `GET /api/v1/identity/quotas/{scope}/{id}`

A scope's quota and use. Needs `organization.view` (organisation) or `project.view` (project, environment) on it, or `quota.manage`.

**Operation ID:** `quota`

**Needs:** `organization.view` (organisation) or `project.view` (project, environment) on it, or `quota.manage`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `scope` | path | string | yes | — | organization, project or environment |
| `id` | path | string (uuid) | yes | — | Its id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/quotas/project/96dd378f-883d-443e-b4b0-5e929f0f7dea" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("quota", { params: { scope: "project", id: "96dd378f-883d-443e-b4b0-5e929f0f7dea" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "kind": "project",
  "id": "96dd378f-883d-443e-b4b0-5e929f0f7dea",
  "name": "Online shop",
  "quota": {
    "instances": 20,
    "cpu": 16,
    "memoryGib": 64,
    "diskGib": 500
  },
  "bound": {
    "instances": null,
    "cpu": null,
    "memoryGib": null,
    "diskGib": null
  },
  "usage": {
    "instances": 0,
    "cpu": 0,
    "memoryBytes": 0,
    "diskBytes": 0
  },
  "usageError": null,
  "updatedBy": "token:docs-verifier",
  "updatedAt": "2026-10-25T16:32:57.278691Z",
  "canSet": true
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |

### `PUT /api/v1/identity/quotas/{scope}/{id}`

Sets a scope's quota (all limits empty removes it), then mirrors the tightest applicable quota onto every environment beneath it. Needs `quota.manage`; or, below the organisation, `organization.update` on the organisation (projects, environments) or `project.update` on the project (environments), and then never more than a quota above allows.

**Operation ID:** `set_quota`

**Needs:** `quota.manage`; or, below the organisation, `organization.update` on the organisation (projects, environments) or `project.update` on the project (environments), and then never more than a quota above allows.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `scope` | path | string | yes | — | organization, project or environment |
| `id` | path | string (uuid) | yes | — | Its id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `cpu` | integer or null | no | — |
| `diskGib` | integer or null | no | — |
| `instances` | integer or null | no | — |
| `memoryGib` | integer or null | no | — |

```json
{
  "cpu": 16,
  "memoryGib": 64,
  "diskGib": 500,
  "instances": 20
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/identity/quotas/project/96dd378f-883d-443e-b4b0-5e929f0f7dea" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"cpu":16,"memoryGib":64,"diskGib":500,"instances":20}'
```

**TypeScript:**

```ts
const result = await client.request("set_quota", { params: { scope: "project", id: "96dd378f-883d-443e-b4b0-5e929f0f7dea" }, body: { cpu: 16, memoryGib: 64, diskGib: 500, instances: 20 } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "quota": {
    "instances": 20,
    "cpu": 16,
    "memoryGib": 64,
    "diskGib": 500
  },
  "environments": [
    {
      "environmentId": "0b7fa228-4c47-4af8-9a53-28df2612fd4e",
      "environment": "Production",
      "incusProject": "shop-prod",
      "result": "applied",
      "limits": {
        "limits.cpu": "16",
        "limits.disk": "500GiB",
        "limits.instances": "20",
        "limits.memory": "64GiB"
      },
      "detail": "Incus enforces these limits"
    },
    {
      "environmentId": "5a2bed50-145e-4a9e-9df5-974de12cc193",
      "environment": "Staging",
      "incusProject": "acme-shop-staging",
      "result": "applied",
      "limits": {
        "limits.cpu": "16",
        "limits.disk": "500GiB",
        "limits.instances": "20",
        "limits.memory": "64GiB"
      },
      "detail": "Incus enforces these limits"
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request`, `quota_above_parent` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |

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

**TypeScript:**

```ts
const result = await client.request("roles", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

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
        "application.create"
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
        "application.view"
      ],
      "scopes": [
        "platform"
      ]
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |

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
  "name": "Release manager",
  "description": "Publishes and deploys application versions",
  "permissions": [
    "application.view",
    "application.design",
    "application.deploy",
    "application.operate"
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
  --data-raw '{"name":"Release manager","description":"Publishes and deploys application versions","permissions":["application.view","application.design","application.deploy","application.operate"]}'
```

**TypeScript:**

```ts
const result = await client.request("create_role", { body /* the request body above */ });
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "custom:991c41b6-ac70-440d-8c76-6dc4033a495a",
  "reference": {
    "type": "custom",
    "id": "991c41b6-ac70-440d-8c76-6dc4033a495a"
  },
  "name": "Release manager",
  "description": "Publishes and deploys application versions",
  "builtin": false,
  "permissions": [
    "application.deploy",
    "application.design",
    "application.operate",
    "application.view"
  ],
  "scopes": [
    "platform",
    "organization",
    "project",
    "application"
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `would_escalate`, `forbidden`, `mfa_required` |
| `409` | — |

### `DELETE /api/v1/identity/roles/{role}`

Deletes a custom role that no assignment uses. Needs `role.manage`.

**Operation ID:** `delete_role`

**Needs:** `role.manage`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `role` | path | string (uuid) | yes | — | Custom role id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/roles/d2f01cee-de00-4e6a-8517-0bce6d8e9d0e" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("delete_role", { params: { role: "d2f01cee-de00-4e6a-8517-0bce6d8e9d0e" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |
| `404` | — |
| `409` | — |

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

**TypeScript:**

```ts
const result = await client.request("service_identities", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "33711ea0-56fc-4676-bee9-c587fab583c7",
      "name": "ci-pipeline",
      "kind": "automation",
      "backend": "apelora",
      "operations": [],
      "credentialRef": null,
      "restrictions": {},
      "createdBy": "token:docs-verifier",
      "createdAt": "2026-10-25T16:32:59.535548Z",
      "expiresAt": "2027-01-23T16:32:59.535568Z",
      "disabled": false,
      "lastUsedAt": null,
      "apiAccess": true
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |

### `POST /api/v1/identity/service-identities`

Registers a service identity. Outbound kinds (workload, network, storage, provisioning) record only the name of a credential held in the secret store; automation identities get an API token, shown once. Needs `service_identity.manage`.

**Operation ID:** `create_service_identity`

**Needs:** `service_identity.manage`.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `credentialRef` | string or null | no | — |
| `expiresInDays` | integer or null | no | Automation identities only: days until their token expires (1–365, default 90). |
| `kind` | one of `workload`, `network`, `storage`, `provisioning`, `automation` | yes | — |
| `name` | string | yes | — |
| `restrictions` | object | no | — |

```json
{
  "name": "ci-pipeline",
  "kind": "automation",
  "expiresInDays": 90
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/service-identities" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"ci-pipeline","kind":"automation","expiresInDays":90}'
```

**TypeScript:**

```ts
const result = await client.request("create_service_identity", { body: { name: "ci-pipeline", kind: "automation", expiresInDays: 90 } });
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "token": "<token, shown once>",
  "identity": {
    "id": "33711ea0-56fc-4676-bee9-c587fab583c7",
    "name": "ci-pipeline",
    "kind": "automation",
    "backend": "apelora",
    "operations": [],
    "credentialRef": null,
    "restrictions": {},
    "createdBy": "token:docs-verifier",
    "createdAt": "2026-10-25T16:32:59.535548Z",
    "expiresAt": "2027-01-23T16:32:59.535568Z",
    "disabled": false,
    "lastUsedAt": null,
    "apiAccess": true
  }
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `forbidden`, `mfa_required` |
| `409` | — |

### `POST /api/v1/identity/service-identities/{id}/disable`

Disables a service identity at once. Needs `service_identity.manage`.

**Operation ID:** `disable_service_identity`

**Needs:** `service_identity.manage`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Service identity id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/service-identities/33711ea0-56fc-4676-bee9-c587fab583c7/disable" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("disable_service_identity", { params: { id: "33711ea0-56fc-4676-bee9-c587fab583c7" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |
| `404` | — |

### `POST /api/v1/identity/service-identities/{id}/enable`

Re-enables a service identity. Needs `service_identity.manage`.

**Operation ID:** `enable_service_identity`

**Needs:** `service_identity.manage`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Service identity id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/service-identities/33711ea0-56fc-4676-bee9-c587fab583c7/enable" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("enable_service_identity", { params: { id: "33711ea0-56fc-4676-bee9-c587fab583c7" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |
| `404` | — |

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

**TypeScript:**

```ts
const result = await client.request("sign_in_settings", {});
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
    "enabled": true,
    "ready": 2,
    "pending": 1
  },
  "directories": []
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |

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
  "enabled": true
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/identity/sign-in/api-tokens" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"enabled":true}'
```

**TypeScript:**

```ts
const result = await client.request("set_api_tokens", { body: { enabled: true } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "enabled": true,
  "lockedByEnvironment": false
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `forbidden`, `mfa_required` |
| `409` | `approval_invalid`, `approval_required`, `locked_by_environment`, `would_lock_out` |

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
  "issuer": "https://login.example.invalid/realms/acme"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/sign-in/check" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"issuer":"https://login.example.invalid/realms/acme"}'
```

**TypeScript:**

```ts
const result = await client.request("check_identity_provider", { body: { issuer: "https://login.example.invalid/realms/acme" } });
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

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `forbidden`, `mfa_required` |
| `502` | `provider_unreachable`, an `incus_…` code |

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

**TypeScript:**

```ts
const result = await client.request("list_directories", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "dd56d275-6b1f-466d-b056-93edd31c7317",
      "name": "Head office directory",
      "url": "ldaps://ldap.example.invalid",
      "startTls": false,
      "caPem": null,
      "bindTemplate": "uid={username},ou=people,dc=acme,dc=example",
      "baseDn": "dc=acme,dc=example",
      "userFilter": null,
      "idAttribute": "entryUUID",
      "usernameAttribute": "uid",
      "emailAttribute": "mail",
      "nameAttribute": "cn",
      "groupAttribute": null,
      "groupBaseDn": "ou=groups,dc=acme,dc=example",
      "groupFilter": "(member={dn})",
      "groupNameAttribute": "cn",
      "enabled": false,
      "reachable": false,
      "problem": null,
      "error": null,
      "updatedBy": "token:docs-verifier"
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |

### `POST /api/v1/identity/sign-in/directories`

Adds a directory; it is offered on the sign-in page at once when enabled. Needs `platform.security.manage` (and an approval where the policy asks for one); audited.

**Operation ID:** `create_directory`

**Needs:** `platform.security.manage` (and an approval where the policy asks for one); audited.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `baseDn` | string or null | no | Where to search for the person's entry after the bind. |
| `bindTemplate` | string | yes | The bind name with `{username}`: a DN (`uid={username},ou=people,dc=example,dc=org`) or a principal name (`{username}@example.org`, which needs `baseDn` and `userFilter`). |
| `caPem` | string or null | no | The certificate authority that signed the directory's certificate (PEM); empty: the system's trusted roots. |
| `emailAttribute` | string or null | no | Default `mail`. |
| `enabled` | boolean | no | — |
| `groupAttribute` | string or null | no | An attribute of the person's entry that lists their groups, e.g. `memberOf`. |
| `groupBaseDn` | string or null | no | Where to search for groups that name the person. |
| `groupFilter` | string or null | no | The group search, with `{dn}` and `{username}` (default `(member={dn})`). |
| `groupNameAttribute` | string or null | no | The group attribute that holds the group's name (default `cn`). |
| `idAttribute` | string or null | no | The entry's stable id (default `entryUUID`; `objectGUID` is read as hex). |
| `name` | string | yes | What the sign-in form calls it (1 to 60 characters). |
| `nameAttribute` | string or null | no | Default `cn`. |
| `startTls` | boolean | no | — |
| `url` | string | yes | `ldaps://host[:port]`, or `ldap://host[:port]` with `startTls`. Plain LDAP is refused. |
| `userFilter` | string or null | no | Finds the person's entry under `baseDn`, with `{username}`, e.g. `(userPrincipalName={username}@example.org)`. Empty: the entry is the bind DN itself. |
| `usernameAttribute` | string or null | no | Default `uid`. |

```json
{
  "name": "Head office directory",
  "url": "ldaps://ldap.example.invalid",
  "bindTemplate": "uid={username},ou=people,dc=acme,dc=example",
  "baseDn": "dc=acme,dc=example",
  "groupBaseDn": "ou=groups,dc=acme,dc=example",
  "enabled": false
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/sign-in/directories" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"Head office directory","url":"ldaps://ldap.example.invalid","bindTemplate":"uid={username},ou=people,dc=acme,dc=example","baseDn":"dc=acme,dc=example","groupBaseDn":"ou=groups,dc=acme,dc=example","enabled":false}'
```

**TypeScript:**

```ts
const result = await client.request("create_directory", { body /* the request body above */ });
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "dd56d275-6b1f-466d-b056-93edd31c7317",
  "name": "Head office directory",
  "url": "ldaps://ldap.example.invalid",
  "startTls": false,
  "caPem": null,
  "bindTemplate": "uid={username},ou=people,dc=acme,dc=example",
  "baseDn": "dc=acme,dc=example",
  "userFilter": null,
  "idAttribute": "entryUUID",
  "usernameAttribute": "uid",
  "emailAttribute": "mail",
  "nameAttribute": "cn",
  "groupAttribute": null,
  "groupBaseDn": "ou=groups,dc=acme,dc=example",
  "groupFilter": "(member={dn})",
  "groupNameAttribute": "cn",
  "enabled": false,
  "reachable": false,
  "problem": null,
  "error": null,
  "updatedBy": "token:docs-verifier"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `forbidden`, `mfa_required` |
| `409` | `approval_invalid`, `approval_required`, `conflict`, `directory_exists` |

### `PUT /api/v1/identity/sign-in/directories/{id}`

Changes a directory (including turning it off). Needs `platform.security.manage`; audited.

**Operation ID:** `update_directory`

**Needs:** `platform.security.manage`; audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Directory id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `baseDn` | string or null | no | Where to search for the person's entry after the bind. |
| `bindTemplate` | string | yes | The bind name with `{username}`: a DN (`uid={username},ou=people,dc=example,dc=org`) or a principal name (`{username}@example.org`, which needs `baseDn` and `userFilter`). |
| `caPem` | string or null | no | The certificate authority that signed the directory's certificate (PEM); empty: the system's trusted roots. |
| `emailAttribute` | string or null | no | Default `mail`. |
| `enabled` | boolean | no | — |
| `groupAttribute` | string or null | no | An attribute of the person's entry that lists their groups, e.g. `memberOf`. |
| `groupBaseDn` | string or null | no | Where to search for groups that name the person. |
| `groupFilter` | string or null | no | The group search, with `{dn}` and `{username}` (default `(member={dn})`). |
| `groupNameAttribute` | string or null | no | The group attribute that holds the group's name (default `cn`). |
| `idAttribute` | string or null | no | The entry's stable id (default `entryUUID`; `objectGUID` is read as hex). |
| `name` | string | yes | What the sign-in form calls it (1 to 60 characters). |
| `nameAttribute` | string or null | no | Default `cn`. |
| `startTls` | boolean | no | — |
| `url` | string | yes | `ldaps://host[:port]`, or `ldap://host[:port]` with `startTls`. Plain LDAP is refused. |
| `userFilter` | string or null | no | Finds the person's entry under `baseDn`, with `{username}`, e.g. `(userPrincipalName={username}@example.org)`. Empty: the entry is the bind DN itself. |
| `usernameAttribute` | string or null | no | Default `uid`. |

```json
{
  "name": "Head office directory",
  "url": "ldaps://ldap.example.invalid",
  "bindTemplate": "uid={username},ou=people,dc=acme,dc=example",
  "baseDn": "dc=acme,dc=example",
  "groupBaseDn": "ou=groups,dc=acme,dc=example",
  "enabled": false,
  "startTls": false,
  "emailAttribute": "mail"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/identity/sign-in/directories/dd56d275-6b1f-466d-b056-93edd31c7317" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"Head office directory","url":"ldaps://ldap.example.invalid","bindTemplate":"uid={username},ou=people,dc=acme,dc=example","baseDn":"dc=acme,dc=example","groupBaseDn":"ou=groups,dc=acme,dc=example","enabled":false,"startTls":false,"emailAttribute":"mail"}'
```

**TypeScript:**

```ts
const result = await client.request("update_directory", { params: { id: "dd56d275-6b1f-466d-b056-93edd31c7317" }, body /* the request body above */ });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "dd56d275-6b1f-466d-b056-93edd31c7317",
  "name": "Head office directory",
  "url": "ldaps://ldap.example.invalid",
  "startTls": false,
  "caPem": null,
  "bindTemplate": "uid={username},ou=people,dc=acme,dc=example",
  "baseDn": "dc=acme,dc=example",
  "userFilter": null,
  "idAttribute": "entryUUID",
  "usernameAttribute": "uid",
  "emailAttribute": "mail",
  "nameAttribute": "cn",
  "groupAttribute": null,
  "groupBaseDn": "ou=groups,dc=acme,dc=example",
  "groupFilter": "(member={dn})",
  "groupNameAttribute": "cn",
  "enabled": false,
  "reachable": false,
  "problem": null,
  "error": null,
  "updatedBy": "token:docs-verifier"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `approval_invalid`, `approval_required`, `conflict`, `directory_exists` |

### `DELETE /api/v1/identity/sign-in/directories/{id}`

Removes a directory: its people can no longer sign in with it; their accounts and roles in Apelora stay. Its name must be typed again. Needs `platform.security.manage`; audited.

**Operation ID:** `delete_directory`

**Needs:** `platform.security.manage`; audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Directory id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The directory's name again. |

```json
{
  "confirm": "Head office directory"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/sign-in/directories/dd56d275-6b1f-466d-b056-93edd31c7317" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"Head office directory"}'
```

**TypeScript:**

```ts
await client.request("delete_directory", { params: { id: "dd56d275-6b1f-466d-b056-93edd31c7317" }, body: { confirm: "Head office directory" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `confirmation_mismatch`, `invalid_request` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |

### `POST /api/v1/identity/sign-in/directories/check`

Connects with TLS, binds as a test person and reads their entry and groups, without saving anything. Reports what it found or the precise reason it failed. Needs `platform.security.manage`.

**Operation ID:** `check_directory`

**Needs:** `platform.security.manage`.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `password` | string | yes | — |
| `settings` | object | yes | The settings of a directory. Empty optional fields take the defaults shown. |
| `settings.baseDn` | string or null | no | Where to search for the person's entry after the bind. |
| `settings.bindTemplate` | string | yes | The bind name with `{username}`: a DN (`uid={username},ou=people,dc=example,dc=org`) or a principal name (`{username}@example.org`, which needs `baseDn` and `userFilter`). |
| `settings.caPem` | string or null | no | The certificate authority that signed the directory's certificate (PEM); empty: the system's trusted roots. |
| `settings.emailAttribute` | string or null | no | Default `mail`. |
| `settings.enabled` | boolean | no | — |
| `settings.groupAttribute` | string or null | no | An attribute of the person's entry that lists their groups, e.g. `memberOf`. |
| `settings.groupBaseDn` | string or null | no | Where to search for groups that name the person. |
| `settings.groupFilter` | string or null | no | The group search, with `{dn}` and `{username}` (default `(member={dn})`). |
| `settings.groupNameAttribute` | string or null | no | The group attribute that holds the group's name (default `cn`). |
| `settings.idAttribute` | string or null | no | The entry's stable id (default `entryUUID`; `objectGUID` is read as hex). |
| `settings.name` | string | yes | What the sign-in form calls it (1 to 60 characters). |
| `settings.nameAttribute` | string or null | no | Default `cn`. |
| `settings.startTls` | boolean | no | — |
| `settings.url` | string | yes | `ldaps://host[:port]`, or `ldap://host[:port]` with `startTls`. Plain LDAP is refused. |
| `settings.userFilter` | string or null | no | Finds the person's entry under `baseDn`, with `{username}`, e.g. `(userPrincipalName={username}@example.org)`. Empty: the entry is the bind DN itself. |
| `settings.usernameAttribute` | string or null | no | Default `uid`. |
| `username` | string | yes | — |

```json
{
  "settings": {
    "name": "Head office directory",
    "url": "ldaps://ldap.example.invalid",
    "bindTemplate": "uid={username},ou=people,dc=acme,dc=example"
  },
  "username": "ada",
  "password": "<password>"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/sign-in/directories/check" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"settings":{"name":"Head office directory","url":"ldaps://ldap.example.invalid","bindTemplate":"uid={username},ou=people,dc=acme,dc=example"},"username":"ada","password":"<password>"}'
```

**TypeScript:**

```ts
const result = await client.request("check_directory", { body /* the request body above */ });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "ok": false,
  "problem": "unreachable",
  "message": "nothing answered at this address: failed to lookup address information: nodename nor servname provided, or not known",
  "entry": null
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `forbidden`, `mfa_required` |

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
  "enabled": true
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/identity/sign-in/local-accounts" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"enabled":true}'
```

**TypeScript:**

```ts
const result = await client.request("set_local_accounts", { body: { enabled: true } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "enabled": true,
  "ready": 0,
  "pending": 0
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `forbidden`, `mfa_required` |
| `409` | `approval_invalid`, `approval_required`, `would_lock_out` |

### `POST /api/v1/identity/sign-in/providers`

Adds an identity provider; it is checked and applied at once. Needs `platform.security.manage` (and an approval where the policy asks for one); audited.

**Operation ID:** `create_identity_provider`

**Needs:** `platform.security.manage` (and an approval where the policy asks for one); audited.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `audiences` | list of string | yes | — |
| `authorizedParties` | list of string | no | — |
| `clientId` | string or null | no | — |
| `enabled` | boolean | no | — |
| `groupsClaim` | string or null | no | — |
| `issuer` | string | yes | — |
| `mfaAcr` | list of string | no | — |
| `mfaAmr` | list of string or null | no | — |
| `name` | string | yes | — |
| `scopes` | list of string | no | — |
| `usernameClaim` | string or null | no | — |

```json
{
  "name": "Company sign-in",
  "issuer": "https://login.example.invalid/realms/acme",
  "audiences": [
    "apelora"
  ],
  "clientId": "apelora-console",
  "scopes": [
    "openid",
    "profile",
    "email"
  ],
  "groupsClaim": "groups",
  "enabled": false
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/sign-in/providers" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"Company sign-in","issuer":"https://login.example.invalid/realms/acme","audiences":["apelora"],"clientId":"apelora-console","scopes":["openid","profile","email"],"groupsClaim":"groups","enabled":false}'
```

**TypeScript:**

```ts
const result = await client.request("create_identity_provider", { body /* the request body above */ });
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "09d4d206-aa90-4bac-a457-2f22d5729777",
  "source": "console",
  "name": "Company sign-in",
  "issuer": "https://login.example.invalid/realms/acme",
  "audiences": [
    "apelora"
  ],
  "clientId": "apelora-console",
  "scopes": [
    "openid",
    "profile",
    "email"
  ],
  "groupsClaim": "groups",
  "usernameClaim": "preferred_username",
  "mfaAmr": [
    "mfa",
    "otp",
    "hwk"
  ],
  "mfaAcr": [],
  "authorizedParties": [],
  "enabled": false,
  "reachable": false,
  "error": null,
  "updatedBy": "token:docs-verifier"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `forbidden`, `mfa_required` |
| `409` | `approval_invalid`, `approval_required`, `conflict`, `provider_exists` |

### `PUT /api/v1/identity/sign-in/providers/{id}`

Changes a provider saved in the Console. Needs `platform.security.manage`; audited.

**Operation ID:** `update_identity_provider`

**Needs:** `platform.security.manage`; audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Provider id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `audiences` | list of string | yes | — |
| `authorizedParties` | list of string | no | — |
| `clientId` | string or null | no | — |
| `enabled` | boolean | no | — |
| `groupsClaim` | string or null | no | — |
| `issuer` | string | yes | — |
| `mfaAcr` | list of string | no | — |
| `mfaAmr` | list of string or null | no | — |
| `name` | string | yes | — |
| `scopes` | list of string | no | — |
| `usernameClaim` | string or null | no | — |

```json
{
  "name": "Company sign-in",
  "issuer": "https://login.example.invalid/realms/acme",
  "audiences": [
    "apelora"
  ],
  "clientId": "apelora-console",
  "scopes": [
    "openid",
    "profile",
    "email",
    "groups"
  ],
  "groupsClaim": "groups",
  "enabled": false
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/identity/sign-in/providers/09d4d206-aa90-4bac-a457-2f22d5729777" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"Company sign-in","issuer":"https://login.example.invalid/realms/acme","audiences":["apelora"],"clientId":"apelora-console","scopes":["openid","profile","email","groups"],"groupsClaim":"groups","enabled":false}'
```

**TypeScript:**

```ts
const result = await client.request("update_identity_provider", { params: { id: "09d4d206-aa90-4bac-a457-2f22d5729777" }, body /* the request body above */ });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "09d4d206-aa90-4bac-a457-2f22d5729777",
  "source": "console",
  "name": "Company sign-in",
  "issuer": "https://login.example.invalid/realms/acme",
  "audiences": [
    "apelora"
  ],
  "clientId": "apelora-console",
  "scopes": [
    "openid",
    "profile",
    "email",
    "groups"
  ],
  "groupsClaim": "groups",
  "usernameClaim": "preferred_username",
  "mfaAmr": [
    "mfa",
    "otp",
    "hwk"
  ],
  "mfaAcr": [],
  "authorizedParties": [],
  "enabled": false,
  "reachable": false,
  "error": null,
  "updatedBy": "token:docs-verifier"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `approval_invalid`, `approval_required`, `conflict`, `provider_exists`, `would_lock_out` |

### `DELETE /api/v1/identity/sign-in/providers/{id}`

Removes a provider saved in the Console: people stop being able to sign in with it. Its name must be typed again. Needs `platform.security.manage`; audited.

**Operation ID:** `delete_identity_provider`

**Needs:** `platform.security.manage`; audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Provider id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `confirm` | string | yes | The provider's name again. |

```json
{
  "confirm": "Company sign-in"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/sign-in/providers/09d4d206-aa90-4bac-a457-2f22d5729777" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  --data-raw '{"confirm":"Company sign-in"}'
```

**TypeScript:**

```ts
await client.request("delete_identity_provider", { params: { id: "09d4d206-aa90-4bac-a457-2f22d5729777" }, body: { confirm: "Company sign-in" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `confirmation_mismatch`, `invalid_request` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `approval_invalid`, `approval_required`, `would_lock_out` |

### `GET /api/v1/identity/sign-ins`

Everyone's Apelora sessions open now (or one person's). Needs `user.manage` on the platform.

**Operation ID:** `sign_ins`

**Needs:** `user.manage` on the platform.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `user` | query | string (uuid) | no | — | Only this person's. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/sign-ins" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**With options** (`user`):

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/sign-ins?user=d53a8e83-d414-487e-8621-d60d32817bb8" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("sign_ins", { query: { user: "d53a8e83-d414-487e-8621-d60d32817bb8" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "items": [
    {
      "id": "408fc7b2-a0e1-4636-a820-6516b94056c5",
      "userId": "d53a8e83-d414-487e-8621-d60d32817bb8",
      "person": "ada",
      "method": "password",
      "createdAt": "2026-10-25T16:32:57.737086Z",
      "lastUsedAt": "2026-10-25T16:32:59.008739Z",
      "expiresAt": "2026-10-26T00:32:57.737086Z",
      "endsAt": "2026-10-25T17:32:59.008739Z",
      "current": false
    },
    {
      "id": "05c354b0-0996-44fb-8484-d01cd30469b7",
      "userId": "d53a8e83-d414-487e-8621-d60d32817bb8",
      "person": "ada",
      "method": "password",
      "createdAt": "2026-10-25T16:32:59.004466Z",
      "lastUsedAt": "2026-10-25T16:32:59.004466Z",
      "expiresAt": "2026-10-26T00:32:59.004466Z",
      "endsAt": "2026-10-25T17:32:59.004466Z",
      "current": false
    }
  ],
  "credential": "api-token",
  "idleSecs": 3600,
  "absoluteSecs": 28800
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `503` | `database_not_configured` |

### `DELETE /api/v1/identity/sign-ins/{id}`

Ends anyone's session. Needs `user.manage` on the platform.

**Operation ID:** `end_sign_in`

**Needs:** `user.manage` on the platform.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Session id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/sign-ins/fa852466-090e-4e31-8c62-e6980d9fb449" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("end_sign_in", { params: { id: "fa852466-090e-4e31-8c62-e6980d9fb449" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `503` | `database_not_configured` |

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

**TypeScript:**

```ts
const result = await client.request("tenancy", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-25T16:32:57.308181Z"
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
      "id": "0c039899-47c5-4f07-a59e-13ca204a9fe2",
      "slug": "acme",
      "name": "Acme Corporation",
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
          "id": "96dd378f-883d-443e-b4b0-5e929f0f7dea",
          "slug": "shop",
          "name": "Online shop",
          "quota": {
            "instances": 20,
            "cpu": 16,
            "memoryGib": 64,
            "diskGib": 500
          },
          "usage": {
            "instances": 0,
            "cpu": 0,
            "memoryBytes": 0,
            "diskBytes": 0
          },
          "canSetQuota": true,
          "environments": [
            {
              "id": "0b7fa228-4c47-4af8-9a53-28df2612fd4e",
              "slug": "production",
              "name": "Production",
              "kind": "production",
              "incusProject": "shop-prod",
              "incusState": "created",
              "incusDetail": "Incus project shop-prod created by Apelora with the baseline restrictions",
              "checkedAt": "2026-10-25T16:32:57.287593Z",
              "quota": null,
              "effective": {
                "instances": 20,
                "cpu": 16,
                "memoryGib": 64,
                "diskGib": 500
              },
              "apeloraLimits": {
                "limits.cpu": "16",
                "limits.disk": "500GiB",
                "limits.instances": "20",
                "limits.memory": "64GiB"
              },
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
                "limits": {
                  "limits.cpu": "16",
                  "limits.disk": "500GiB",
                  "limits.instances": "20",
                  "limits.memory": "64GiB"
                },
                "usage": {
                  "instances": {
                    "used": 0,
                    "limit": 20
                  },
                  "cpu": {
                    "used": 0,
                    "limit": 16
                  },
                  "memory": {
                    "used": 0,
                    "limit": 68719476736
                  },
                  "disk": {
                    "used": 0,
                    "limit": 536870912000
                  }
                }
              },
              "incusError": null,
              "findings": [],
              "canSetQuota": true,
              "canPrepare": true
            },
            {
              "id": "5a2bed50-145e-4a9e-9df5-974de12cc193",
              "slug": "staging",
              "name": "Staging",
              "kind": "staging",
              "incusProject": "acme-shop-staging",
              "incusState": "created",
              "incusDetail": "Incus project acme-shop-staging created by Apelora with the baseline restrictions",
              "checkedAt": "2026-10-25T16:32:57.293142Z",
              "quota": null,
              "effective": {
                "instances": 20,
                "cpu": 16,
                "memoryGib": 64,
                "diskGib": 500
              },
              "apeloraLimits": {
                "limits.cpu": "16",
                "limits.disk": "500GiB",
                "limits.instances": "20",
                "limits.memory": "64GiB"
              },
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
                "limits": {
                  "limits.cpu": "16",
                  "limits.disk": "500GiB",
                  "limits.instances": "20",
                  "limits.memory": "64GiB"
                },
                "usage": {
                  "instances": {
                    "used": 0,
                    "limit": 20
                  },
                  "cpu": {
                    "used": 0,
                    "limit": 16
                  },
                  "memory": {
                    "used": 0,
                    "limit": 68719476736
                  },
                  "disk": {
                    "used": 0,
                    "limit": 536870912000
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
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |

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

**TypeScript:**

```ts
const result = await client.request("users", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "items": [
    {
      "id": "d53a8e83-d414-487e-8621-d60d32817bb8",
      "username": "ada",
      "email": "ada@example.org",
      "displayName": "Ada Lovelace",
      "issuer": "apelora:local",
      "createdAt": "2026-10-25T16:32:57.325917Z",
      "lastSeenAt": "2026-10-25T16:32:57.737086Z",
      "disabled": false
    },
    {
      "id": "f3c76895-ba34-4437-ad45-1829e8c3f061",
      "username": "grace",
      "email": "grace@example.org",
      "displayName": "Grace Hopper",
      "issuer": "apelora:local",
      "createdAt": "2026-10-25T16:32:57.745618Z",
      "lastSeenAt": "2026-10-25T16:32:58.160592Z",
      "disabled": false
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |

### `POST /api/v1/identity/users/{user}/disable`

Disables a person: their tokens and Apelora sessions stop working at once. Needs `user.manage`.

**Operation ID:** `disable_user`

**Needs:** `user.manage`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `user` | path | string (uuid) | yes | — | User id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/users/3842bad8-f785-4d27-88cc-6a3052706f93/disable" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("disable_user", { params: { user: "3842bad8-f785-4d27-88cc-6a3052706f93" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |
| `404` | — |
| `409` | `last_super_admin`, `self_lockout` |

### `POST /api/v1/identity/users/{user}/enable`

Re-enables a person. Needs `user.manage`.

**Operation ID:** `enable_user`

**Needs:** `user.manage`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `user` | path | string (uuid) | yes | — | User id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/users/3842bad8-f785-4d27-88cc-6a3052706f93/enable" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("enable_user", { params: { user: "3842bad8-f785-4d27-88cc-6a3052706f93" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `403` | `forbidden`, `mfa_required` |
| `404` | — |

### `GET /api/v1/identity/users/lookup`

Finds one person by exact user name or e-mail so a role can be given to them. Someone who has never signed in does not exist yet. Needs `role.assign` or `group.manage`.

**Operation ID:** `lookup_user`

**Needs:** `role.assign` or `group.manage`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `q` | query | string | yes | — | Exact user name or e-mail address. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/users/lookup?q=ada" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("lookup_user", { query: { q: "ada" } });
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "d53a8e83-d414-487e-8621-d60d32817bb8",
      "username": "ada",
      "email": "ada@example.org",
      "displayName": "Ada Lovelace",
      "issuer": "apelora:local",
      "createdAt": "2026-10-25T16:32:57.325917Z",
      "lastSeenAt": "2026-10-25T16:32:57.737086Z",
      "disabled": false
    }
  ]
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `403` | `forbidden`, `mfa_required` |

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

**TypeScript:**

```ts
const result = await client.request("my_sign_ins", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "items": [
    {
      "id": "408fc7b2-a0e1-4636-a820-6516b94056c5",
      "userId": "d53a8e83-d414-487e-8621-d60d32817bb8",
      "person": "ada",
      "method": "password",
      "createdAt": "2026-10-25T16:32:57.737086Z",
      "lastUsedAt": "2026-10-25T16:32:59.008739Z",
      "expiresAt": "2026-10-26T00:32:57.737086Z",
      "endsAt": "2026-10-25T17:32:59.008739Z",
      "current": true
    },
    {
      "id": "05c354b0-0996-44fb-8484-d01cd30469b7",
      "userId": "d53a8e83-d414-487e-8621-d60d32817bb8",
      "person": "ada",
      "method": "password",
      "createdAt": "2026-10-25T16:32:59.004466Z",
      "lastUsedAt": "2026-10-25T16:32:59.004466Z",
      "expiresAt": "2026-10-26T00:32:59.004466Z",
      "endsAt": "2026-10-25T17:32:59.004466Z",
      "current": false
    }
  ],
  "credential": "session",
  "idleSecs": 3600,
  "absoluteSecs": 28800
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `people_only`, `forbidden`, `mfa_required` |
| `503` | `database_not_configured` |

### `DELETE /api/v1/me/sign-ins/{id}`

Ends one of your sessions (signs that browser out). Another person's answers 404.

**Operation ID:** `end_my_sign_in`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Session id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/me/sign-ins/05c354b0-0996-44fb-8484-d01cd30469b7" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("end_my_sign_in", { params: { id: "05c354b0-0996-44fb-8484-d01cd30469b7" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `people_only`, `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `503` | `database_not_configured` |

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

**TypeScript:**

```ts
const result = await client.request("my_tokens", {});
```

**Response `200`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "10410ec8-6cbd-4d5c-a0d3-20b1762acff9",
      "name": "laptop-cli",
      "userId": "d53a8e83-d414-487e-8621-d60d32817bb8",
      "owner": "ada",
      "state": "active",
      "createdAt": "2026-10-25T16:32:59.034982Z",
      "expiresAt": "2026-11-24T16:32:59.034982Z",
      "lastUsedAt": null,
      "revokedAt": null,
      "revokedBy": null,
      "rotatedFrom": null,
      "successor": null,
      "current": false
    }
  ],
  "limit": 20
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `people_only`, `forbidden`, `mfa_required` |
| `503` | `database_not_configured` |

### `POST /api/v1/me/tokens`

Creates a personal token, shown only in this response. It acts as you with whatever you hold when it is used, and never opens terminal sessions or makes other credentials. Needs a sign-in (not a personal token); 1–365 days, no default; at most 20 live tokens.

**Operation ID:** `create_my_token`

**Needs:** a signed-in caller; the server decides what that caller may see.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `expiresInDays` | integer or null | no | 1–365 days; required. |
| `name` | string | yes | What it is for, e.g. "laptop backup script". |

```json
{
  "name": "laptop-cli",
  "expiresInDays": 30
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/me/tokens" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"laptop-cli","expiresInDays":30}'
```

**TypeScript:**

```ts
const result = await client.request("create_my_token", { body: { name: "laptop-cli", expiresInDays: 30 } });
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "token": "<token, shown once>",
  "info": {
    "id": "10410ec8-6cbd-4d5c-a0d3-20b1762acff9",
    "name": "laptop-cli",
    "userId": "d53a8e83-d414-487e-8621-d60d32817bb8",
    "owner": "ada",
    "state": "active",
    "createdAt": "2026-10-25T16:32:59.034982Z",
    "expiresAt": "2026-11-24T16:32:59.034982Z",
    "lastUsedAt": null,
    "revokedAt": null,
    "revokedBy": null,
    "rotatedFrom": null,
    "successor": null,
    "current": false
  }
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `people_only`, `forbidden`, `mfa_required` |
| `409` | `too_many_tokens` |
| `503` | `database_not_configured` |

### `DELETE /api/v1/me/tokens/{id}`

Revokes one of your live tokens; it stops working at once. Another person's token answers 404.

**Operation ID:** `revoke_my_token`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Token id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/me/tokens/49dd235a-7ef3-44cd-97a6-d96200ced7a8" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("revoke_my_token", { params: { id: "49dd235a-7ef3-44cd-97a6-d96200ced7a8" } });
```

**Response `204`** — Success, with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `people_only`, `forbidden`, `mfa_required` |
| `404` | — |
| `503` | `database_not_configured` |

### `POST /api/v1/me/tokens/{id}/rotate`

Rotates one of your live tokens: a successor with the same name (shown only in this response), and the old token keeps working for the overlap (0–1440 minutes, 60 by default), then expires. A token is rotated once; rotate its successor next time.

**Operation ID:** `rotate_my_token`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Token id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `expiresInDays` | integer or null | no | The successor's lifetime, 1–365 days; the old token's lifetime when omitted. |
| `overlapMinutes` | integer or null | no | How long the old token keeps working, 0–1440 minutes; 60 when omitted. |

```json
{
  "expiresInDays": 30,
  "overlapMinutes": 60
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/me/tokens/10410ec8-6cbd-4d5c-a0d3-20b1762acff9/rotate" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"expiresInDays":30,"overlapMinutes":60}'
```

**TypeScript:**

```ts
const result = await client.request("rotate_my_token", { params: { id: "10410ec8-6cbd-4d5c-a0d3-20b1762acff9" }, body: { expiresInDays: 30, overlapMinutes: 60 } });
```

**Response `201`** — Success.

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "token": "<token, shown once>",
  "info": {
    "id": "49dd235a-7ef3-44cd-97a6-d96200ced7a8",
    "name": "laptop-cli",
    "userId": "d53a8e83-d414-487e-8621-d60d32817bb8",
    "owner": "ada",
    "state": "active",
    "createdAt": "2026-10-25T16:32:59.047106Z",
    "expiresAt": "2026-11-24T16:32:59.047106Z",
    "lastUsedAt": null,
    "revokedAt": null,
    "revokedBy": null,
    "rotatedFrom": "10410ec8-6cbd-4d5c-a0d3-20b1762acff9",
    "successor": null,
    "current": false
  },
  "previous": {
    "id": "10410ec8-6cbd-4d5c-a0d3-20b1762acff9",
    "name": "laptop-cli",
    "userId": "d53a8e83-d414-487e-8621-d60d32817bb8",
    "owner": "ada",
    "state": "rotating",
    "createdAt": "2026-10-25T16:32:59.034982Z",
    "expiresAt": "2026-10-25T17:32:59.047106Z",
    "lastUsedAt": null,
    "revokedAt": null,
    "revokedBy": null,
    "rotatedFrom": null,
    "successor": "49dd235a-7ef3-44cd-97a6-d96200ced7a8",
    "current": false
  }
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `people_only`, `forbidden`, `mfa_required` |
| `404` | — |
| `409` | `already_rotated`, `too_many_tokens` |
| `503` | `database_not_configured` |

