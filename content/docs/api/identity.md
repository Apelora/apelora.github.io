---
title: Identity and access API
section: api
slug: identity
order: 8
label: Identity and access
source: packages/api-client/openapi.json
summary: People, groups, roles, scopes, approvals, tokens and sign-in.
---
Identity and access: organisations, projects, people, groups, roles and assignments, approvals, service identities, tokens and sign-in methods. This page lists 67 operations.

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
| [`PUT /api/v1/identity/groups/{group}/external`](#put-apiv1identitygroupsgroupexternal) | Maps a platform group onto a group of an identity provider or directory, or sets the source of a mapping made before sources were recorded (`needsSource`). |
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
| [`GET /api/v1/identity/projects/{projectId}/environments`](#get-apiv1identityprojectsprojectidenvironments) | Environments of a project. |
| [`POST /api/v1/identity/projects/{projectId}/environments`](#post-apiv1identityprojectsprojectidenvironments) | Creates an environment. |
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
| [`PUT /api/v1/me/password`](#put-apiv1mepassword) | Changes the caller's own password (local accounts only). |
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

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "c8b2b070-7c3b-45f8-90a7-e088b639fa00",
      "action": "hardware.delete",
      "target": "machine:rack1-07",
      "requester": "token:docs-verifier",
      "approver": null,
      "state": "pending",
      "reason": "Retire the old storage server",
      "createdAt": "2026-10-28T23:26:49.23035Z",
      "expiresAt": "2026-10-29T23:26:49Z"
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
| `503` | `database_not_configured` |

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

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "c8b2b070-7c3b-45f8-90a7-e088b639fa00",
  "action": "hardware.delete",
  "target": "machine:rack1-07",
  "requester": "token:docs-verifier",
  "approver": null,
  "state": "pending",
  "reason": "Retire the old storage server",
  "createdAt": "2026-10-28T23:26:49.23035Z",
  "expiresAt": "2026-10-29T23:26:49Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `too_many_open_requests`, `rate_limited` |
| `503` | `database_not_configured` |

### `POST /api/v1/approvals/{id}/approve`

Approves a request made by someone else. Needs `approval.grant`, held by a signed-in person: API tokens are refused (`approval_needs_a_person`). The approval is good for 30 minutes, once.

**Operation ID:** `approve_approval`

**Needs:** `approval.grant`, held by a signed-in person: API tokens are refused (`approval_needs_a_person`).

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Approval id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/approvals/d87a7c8a-51df-4ec9-bdff-f860b633b093/approve" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("approve_approval", { params: { id: "d87a7c8a-51df-4ec9-bdff-f860b633b093" } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "d87a7c8a-51df-4ec9-bdff-f860b633b093",
  "action": "token.create_admin",
  "target": "token:fabric-admin",
  "requester": "user:e99e9737-dc0f-47bf-ae49-3c27edc0b26a",
  "approver": "user:c9bef258-1dba-45cb-9d15-1a1231ded712",
  "state": "approved",
  "reason": "A second administrator token for the backup site",
  "createdAt": "2026-10-28T23:26:49.43187Z",
  "expiresAt": "2026-10-28T23:56:49Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `approval_needs_a_person`, `forbidden`, `mfa_required` |
| `404` | — |
| `409` | — |
| `410` | — |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `POST /api/v1/approvals/{id}/cancel`

Withdraws your own pending request. Needs `approval.request`.

**Operation ID:** `cancel_approval`

**Needs:** `approval.request`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Approval id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/approvals/001d43dd-bbb7-4763-b0a3-3334d92060b7/cancel" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("cancel_approval", { params: { id: "001d43dd-bbb7-4763-b0a3-3334d92060b7" } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "001d43dd-bbb7-4763-b0a3-3334d92060b7",
  "action": "hardware.delete",
  "target": "machine:rack1-08",
  "requester": "token:docs-verifier",
  "approver": null,
  "state": "cancelled",
  "reason": "Retire the spare server",
  "createdAt": "2026-10-28T23:26:49.325705Z",
  "expiresAt": "2026-10-29T23:26:49Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | — |
| `409` | — |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `POST /api/v1/approvals/{id}/reject`

Rejects a request. Needs `approval.grant`, held by a signed-in person (API tokens are refused).

**Operation ID:** `reject_approval`

**Needs:** `approval.grant`, held by a signed-in person (API tokens are refused).

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Approval id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/approvals/c8b2b070-7c3b-45f8-90a7-e088b639fa00/reject" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("reject_approval", { params: { id: "c8b2b070-7c3b-45f8-90a7-e088b639fa00" } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "c8b2b070-7c3b-45f8-90a7-e088b639fa00",
  "action": "hardware.delete",
  "target": "machine:rack1-07",
  "requester": "token:docs-verifier",
  "approver": "user:c9bef258-1dba-45cb-9d15-1a1231ded712",
  "state": "rejected",
  "reason": "Retire the old storage server",
  "createdAt": "2026-10-28T23:26:49.23035Z",
  "expiresAt": "2026-10-29T23:26:49Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `approval_needs_a_person`, `forbidden`, `mfa_required` |
| `404` | — |
| `409` | — |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/assignments?principalType=group&principalId=480b17b0-9973-4fbe-95a8-b87a6edbfb89&includeRevoked=true" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("assignments", { query: { principalType: "group", principalId: "480b17b0-9973-4fbe-95a8-b87a6edbfb89", includeRevoked: true } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "items": [
    {
      "id": "6474123f-8854-4d16-9128-2eaf3cd6a242",
      "principal": {
        "type": "group",
        "id": "480b17b0-9973-4fbe-95a8-b87a6edbfb89"
      },
      "role": {
        "type": "custom",
        "id": "d668bdc7-b604-4e98-ab44-a7e0dcd17d10"
      },
      "roleName": "Release manager",
      "scope": {
        "type": "project",
        "id": "deff5baa-28d1-4534-b980-108a88f9fa09"
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
      "createdAt": "2026-10-28T23:26:48.22976Z",
      "revokedAt": null
    },
    {
      "id": "e1567043-704c-46ae-a953-64276fa42dd2",
      "principal": {
        "type": "user",
        "id": "e99e9737-dc0f-47bf-ae49-3c27edc0b26a"
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
      "createdAt": "2026-10-28T23:26:45.572088Z",
      "revokedAt": null
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
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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
| `expiresAt` | string (date-time) or null | no | RFC 3339. Assignments may expire; emergency grants must. |
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
    "id": "480b17b0-9973-4fbe-95a8-b87a6edbfb89"
  },
  "role": {
    "type": "custom",
    "id": "d668bdc7-b604-4e98-ab44-a7e0dcd17d10"
  },
  "scope": {
    "type": "project",
    "id": "deff5baa-28d1-4534-b980-108a88f9fa09"
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
  --data-raw '{"principal":{"type":"group","id":"480b17b0-9973-4fbe-95a8-b87a6edbfb89"},"role":{"type":"custom","id":"d668bdc7-b604-4e98-ab44-a7e0dcd17d10"},"scope":{"type":"project","id":"deff5baa-28d1-4534-b980-108a88f9fa09"},"conditions":{"environments":["production"],"requireMfa":false},"reason":"The shop team releases to production"}'
```

**TypeScript:**

```ts
const result = await client.request("create_assignment", { body /* the request body above */ });
```

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "6474123f-8854-4d16-9128-2eaf3cd6a242",
  "principal": {
    "type": "group",
    "id": "480b17b0-9973-4fbe-95a8-b87a6edbfb89"
  },
  "role": {
    "type": "custom",
    "id": "d668bdc7-b604-4e98-ab44-a7e0dcd17d10"
  },
  "roleName": "Release manager",
  "scope": {
    "type": "project",
    "id": "deff5baa-28d1-4534-b980-108a88f9fa09"
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
  "createdAt": "2026-10-28T23:26:48.22976Z",
  "revokedAt": null
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `assignment_refused`, `forbidden` |
| `404` | `not_found` |
| `409` | `user_disabled` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/assignments/6474123f-8854-4d16-9128-2eaf3cd6a242" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("revoke_assignment", { params: { assignment: "6474123f-8854-4d16-9128-2eaf3cd6a242" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `revocation_refused`, `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `last_super_admin` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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
| `expiresAt` | string (date-time) or null | no | RFC 3339. Assignments may expire; emergency grants must. |
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
    "id": "480b17b0-9973-4fbe-95a8-b87a6edbfb89"
  },
  "role": {
    "type": "custom",
    "id": "d668bdc7-b604-4e98-ab44-a7e0dcd17d10"
  },
  "scope": {
    "type": "project",
    "id": "deff5baa-28d1-4534-b980-108a88f9fa09"
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
  --data-raw '{"principal":{"type":"group","id":"480b17b0-9973-4fbe-95a8-b87a6edbfb89"},"role":{"type":"custom","id":"d668bdc7-b604-4e98-ab44-a7e0dcd17d10"},"scope":{"type":"project","id":"deff5baa-28d1-4534-b980-108a88f9fa09"},"conditions":{"environments":["production"],"requireMfa":false},"reason":"The shop team releases to production"}'
```

**TypeScript:**

```ts
const result = await client.request("preview_assignment", { body /* the request body above */ });
```

**Response `200`** — Done; the response holds the result..

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
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden` |
| `404` | `not_found` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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
| `after` | query | string | no | — | Paging: the `next` of the previous page. |
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

**Next page:** repeat the request with `after` set to the response's `next`. The last page has no `next`.

**TypeScript:**

```ts
const result = await client.request("identity_audit", { query: { action: "role.", limit: 5 } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "items": [
    {
      "id": 130,
      "at": "2026-10-28T23:27:10.140545Z",
      "actor": "user:c9bef258-1dba-45cb-9d15-1a1231ded712",
      "actorType": "user",
      "actorName": "ada",
      "action": "session.request",
      "target": "instance:shop/shop-db-01",
      "outcome": "success",
      "scope": {
        "application": "ba2bc39d-a895-44cf-88df-95f994325364",
        "organization": "14c169c3-7c7f-4898-9428-a78d1da537fe",
        "project": "deff5baa-28d1-4534-b980-108a88f9fa09"
      },
      "detail": {
        "approval": "34b33dd8-634d-4088-a3b0-0e503d6466c6",
        "kind": "terminal",
        "name": "ada",
        "requestId": "63493e0f-89a3-47b2-be74-1a0d960bdfcb",
        "session": "2521f680-76da-4290-bbce-c6b8739ba349"
      }
    },
    {
      "id": 129,
      "at": "2026-10-28T23:27:10.022023Z",
      "actor": "user:e99e9737-dc0f-47bf-ae49-3c27edc0b26a",
      "actorType": "user",
      "actorName": "grace",
      "action": "approval.grant",
      "target": "instance:shop/shop-db-01",
      "outcome": "success",
      "scope": null,
      "detail": {
        "action": "instance.console",
        "emergencyAccess": true,
        "id": "34b33dd8-634d-4088-a3b0-0e503d6466c6",
        "name": "grace",
        "requestId": "4eb0dcb5-fe33-4ac1-9613-ae45ba8d18e2",
        "requester": "user:c9bef258-1dba-45cb-9d15-1a1231ded712"
      }
    }
  ],
  "next": "31"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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
  "userId": "e99e9737-dc0f-47bf-ae49-3c27edc0b26a",
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
  --data-raw '{"userId":"e99e9737-dc0f-47bf-ae49-3c27edc0b26a","role":"fabric-administrator","minutes":30,"reason":"Restore access during the identity provider outage"}'
```

**TypeScript:**

```ts
const result = await client.request("grant_emergency_access", { body /* the request body above */ });
```

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "2ff3eb30-dd02-42be-a186-17c814870831",
  "principal": {
    "type": "user",
    "id": "e99e9737-dc0f-47bf-ae49-3c27edc0b26a"
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
  "expiresAt": "2026-10-28T23:56:48.581133Z",
  "reason": "Restore access during the identity provider outage",
  "createdBy": "user:c9bef258-1dba-45cb-9d15-1a1231ded712",
  "createdAt": "2026-10-28T23:26:48.590564Z",
  "revokedAt": null
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `assignment_refused`, `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `self_grant`, `user_disabled` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `POST /api/v1/identity/environments/{id}/incus-project`

Creates or adopts the environment's Incus project now (idempotent): the restricted project with its default profile, granted to the deploy identity, then the quotas mirrored. An existing project is adopted only when it carries this environment's marker or a platform administrator named it when creating the environment; otherwise 409 `incus_project_exists`. Needs `environment.manage` on the environment's project; 503 without an admin identity.

**Operation ID:** `prepare_incus_project`

**Needs:** `environment.manage` on the environment's project; 503 without an admin identity.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Environment id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/environments/897a4582-0cc0-4132-b2e6-523daef9858f/incus-project" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("prepare_incus_project", { params: { id: "897a4582-0cc0-4132-b2e6-523daef9858f" } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "environmentId": "897a4582-0cc0-4132-b2e6-523daef9858f",
  "incusProject": "shop-prod",
  "state": "created",
  "detail": "Incus project shop-prod created by Apelora with the baseline restrictions",
  "findings": [],
  "limits": {
    "environmentId": "897a4582-0cc0-4132-b2e6-523daef9858f",
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
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `incus_project_exists` |
| `429` | `rate_limited` |
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

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "480b17b0-9973-4fbe-95a8-b87a6edbfb89",
      "organizationId": "14c169c3-7c7f-4898-9428-a78d1da537fe",
      "name": "shop-operators",
      "externalName": null,
      "externalSource": null,
      "needsSource": false,
      "description": "People who run the online shop"
    }
  ],
  "sources": []
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `POST /api/v1/identity/groups`

Creates a group: an organisation's (needs `group.manage` there) or a platform group (platform `group.manage`). Mapping a group to a group of an identity provider or directory is platform-only and needs the source (`externalSource`): only that source's credentials map onto it, and a directory group is named by its full DN.

**Operation ID:** `create_group`

**Needs:** `group.manage` there) or a platform group (platform `group.manage`).

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `description` | string | no | — |
| `externalName` | string or null | no | The group's name in the source's tokens; for a directory, the group's full DN. |
| `externalSource` | string or null | no | Required with `externalName`: one of the `sources` the group list names. |
| `name` | string | yes | — |
| `organizationId` | string (uuid) or null | no | — |

```json
{
  "name": "shop-operators",
  "description": "People who run the online shop",
  "organizationId": "14c169c3-7c7f-4898-9428-a78d1da537fe"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/groups" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"shop-operators","description":"People who run the online shop","organizationId":"14c169c3-7c7f-4898-9428-a78d1da537fe"}'
```

**TypeScript:**

```ts
const result = await client.request("create_group", { body /* the request body above */ });
```

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "480b17b0-9973-4fbe-95a8-b87a6edbfb89",
  "organizationId": "14c169c3-7c7f-4898-9428-a78d1da537fe",
  "name": "shop-operators",
  "externalName": null,
  "externalSource": null,
  "needsSource": false,
  "description": "People who run the online shop"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | — |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `PUT /api/v1/identity/groups/{group}/external`

Maps a platform group onto a group of an identity provider or directory, or sets the source of a mapping made before sources were recorded (`needsSource`). Needs platform `group.manage`, and, since the source's members then receive the group's roles, the right to grant each of them (the escalation guard; `membership_refused`). A directory group is named by its full DN.

**Operation ID:** `set_group_external`

**Needs:** a signed-in caller; the server decides what that caller may see.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `group` | path | string (uuid) | yes | — | Group id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `name` | string | yes | The group's name in the source's tokens; for a directory, the group's full DN. |
| `source` | string | yes | One of the `sources` the group list names. |

```json
{
  "source": "directory:f3c86ac0-74e6-4bcc-9cb6-9a530a47e0e6",
  "name": "cn=admins,ou=groups,dc=acme,dc=example"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/identity/groups/fef24d8f-11e3-4523-a646-1ee7cf546d51/external" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"source":"directory:f3c86ac0-74e6-4bcc-9cb6-9a530a47e0e6","name":"cn=admins,ou=groups,dc=acme,dc=example"}'
```

**TypeScript:**

```ts
const result = await client.request("set_group_external", { params: { group: "fef24d8f-11e3-4523-a646-1ee7cf546d51" }, body /* the request body above */ });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "fef24d8f-11e3-4523-a646-1ee7cf546d51",
  "organizationId": null,
  "name": "head-office-admins",
  "externalName": "cn=admins,ou=groups,dc=acme,dc=example",
  "externalSource": "directory:f3c86ac0-74e6-4bcc-9cb6-9a530a47e0e6",
  "needsSource": false,
  "description": "Administrators from the head office directory"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `membership_refused`, `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | — |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `GET /api/v1/identity/groups/{group}/members`

Members of a group. Needs `user.view` or `group.manage` on the group's organisation.

**Operation ID:** `group_members`

**Needs:** `user.view` or `group.manage` on the group's organisation.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `group` | path | string (uuid) | yes | — | Group id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/groups/480b17b0-9973-4fbe-95a8-b87a6edbfb89/members" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("group_members", { params: { group: "480b17b0-9973-4fbe-95a8-b87a6edbfb89" } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "5a4c9822-5bf1-4981-b339-6acfca601b50",
      "username": "lin",
      "email": "lin@example.org",
      "displayName": "Lin Chen",
      "issuer": "apelora:local",
      "createdAt": "2026-10-28T23:26:44.801952Z",
      "lastSeenAt": "2026-10-28T23:26:45.447981Z",
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
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `PUT /api/v1/identity/groups/{group}/members/{user}`

Adds a person to a group. Needs `group.manage`, and, since a member receives the group's roles, the right to grant each of them to that person (the same escalation guard as a direct assignment; refused with `membership_refused`).

**Operation ID:** `add_group_member`

**Needs:** `group.manage`, and, since a member receives the group's roles, the right to grant each of them to that person (the same escalation guard as a direct assignment; refused with `membership_refused`).

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `group` | path | string (uuid) | yes | — | Group id |
| `user` | path | string (uuid) | yes | — | User id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/identity/groups/480b17b0-9973-4fbe-95a8-b87a6edbfb89/members/5a4c9822-5bf1-4981-b339-6acfca601b50" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("add_group_member", { params: { group: "480b17b0-9973-4fbe-95a8-b87a6edbfb89", user: "5a4c9822-5bf1-4981-b339-6acfca601b50" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `membership_refused`, `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `last_super_admin`, `managed_by_provider` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/groups/480b17b0-9973-4fbe-95a8-b87a6edbfb89/members/5a4c9822-5bf1-4981-b339-6acfca601b50" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("remove_group_member", { params: { group: "480b17b0-9973-4fbe-95a8-b87a6edbfb89", user: "5a4c9822-5bf1-4981-b339-6acfca601b50" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `membership_refused`, `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `last_super_admin`, `managed_by_provider` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "user": {
    "id": "c9bef258-1dba-45cb-9d15-1a1231ded712",
    "username": "ada",
    "email": "ada@example.org",
    "displayName": "Ada Lovelace",
    "issuer": "apelora:local",
    "createdAt": "2026-10-28T23:26:43.378816Z",
    "lastSeenAt": null,
    "disabled": false
  },
  "setupToken": "<setup token, shown once>",
  "setupExpiresAt": "2026-10-29T23:26:43.378816Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `409` | `approval_invalid`, `approval_required`, `username_taken` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/local-accounts/5a4c9822-5bf1-4981-b339-6acfca601b50/reset" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("reset_local_account", { params: { id: "5a4c9822-5bf1-4981-b339-6acfca601b50" } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "setupToken": "<setup token, shown once>",
  "setupExpiresAt": "2026-10-29T23:26:45.645857Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `approval_invalid`, `approval_required`, `self_reset` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "14c169c3-7c7f-4898-9428-a78d1da537fe",
      "slug": "acme",
      "name": "Acme Corporation",
      "createdAt": "2026-10-28T23:26:42.642582Z",
      "disabled": false
    },
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "slug": "default",
      "name": "Default",
      "createdAt": "2026-10-28T23:26:41.633124Z",
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
| `429` | `rate_limited` |
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

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "14c169c3-7c7f-4898-9428-a78d1da537fe",
  "slug": "acme",
  "name": "Acme Corporation",
  "createdAt": "2026-10-28T23:26:42.642582Z",
  "disabled": false
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `409` | — |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/organizations/14c169c3-7c7f-4898-9428-a78d1da537fe/projects" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"slug":"shop","name":"Online shop"}'
```

**TypeScript:**

```ts
const result = await client.request("create_project", { params: { org: "14c169c3-7c7f-4898-9428-a78d1da537fe" }, body: { slug: "shop", name: "Online shop" } });
```

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "deff5baa-28d1-4534-b980-108a88f9fa09",
  "organizationId": "14c169c3-7c7f-4898-9428-a78d1da537fe",
  "organizationSlug": "acme",
  "slug": "shop",
  "name": "Online shop",
  "createdAt": "2026-10-28T23:26:42.689663Z"
}
```

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | — |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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

**Response `200`** — Done; the response holds the result..

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
| `429` | `rate_limited` |

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
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/personal-tokens?user=c9bef258-1dba-45cb-9d15-1a1231ded712" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("personal_tokens", { query: { user: "c9bef258-1dba-45cb-9d15-1a1231ded712" } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "items": [
    {
      "id": "f34f848e-a96a-4de1-baec-af28e8bad5d6",
      "name": "backup-script",
      "userId": "c9bef258-1dba-45cb-9d15-1a1231ded712",
      "owner": "ada",
      "state": "active",
      "createdAt": "2026-10-28T23:26:46.934336Z",
      "expiresAt": "2026-11-04T23:26:46.934336Z",
      "lastUsedAt": null,
      "revokedAt": null,
      "revokedBy": null,
      "rotatedFrom": null,
      "successor": null,
      "current": false
    },
    {
      "id": "f5553542-ffe2-419c-8472-9fe2c1215e4f",
      "name": "laptop-cli",
      "userId": "c9bef258-1dba-45cb-9d15-1a1231ded712",
      "owner": "ada",
      "state": "active",
      "createdAt": "2026-10-28T23:26:46.822168Z",
      "expiresAt": "2026-11-27T23:26:46.822168Z",
      "lastUsedAt": null,
      "revokedAt": null,
      "revokedBy": null,
      "rotatedFrom": "c28593f7-e0fb-4079-8e65-98192030ce0f",
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
| `429` | `rate_limited` |
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
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/personal-tokens/f34f848e-a96a-4de1-baec-af28e8bad5d6" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("revoke_personal_token", { params: { id: "f34f848e-a96a-4de1-baec-af28e8bad5d6" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | — |
| `429` | `rate_limited` |
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

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "b4e8c0ba-1d5b-4c24-b6c3-3274e8604500",
      "name": "approve-machine-removal",
      "kind": "approval",
      "parameters": {
        "actions": [
          "hardware.delete"
        ]
      },
      "enabled": true,
      "updatedBy": "token:docs-verifier",
      "updatedAt": "2026-10-28T23:26:48.766828Z"
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
| `503` | `database_not_configured` |

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
| `parameters` | object | yes | For `mfa`: `environments` (a list of `production`, `staging`, `development`, `other`) and/or `infrastructure` (`true` or `false`). For `approval`: `actions`, the permission ids that need an approval. |

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

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "b4e8c0ba-1d5b-4c24-b6c3-3274e8604500",
  "name": "approve-machine-removal",
  "kind": "approval",
  "parameters": {
    "actions": [
      "hardware.delete"
    ]
  },
  "enabled": true,
  "updatedBy": "token:docs-verifier",
  "updatedAt": "2026-10-28T23:26:48.766828Z"
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
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/policies/b4e8c0ba-1d5b-4c24-b6c3-3274e8604500" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("delete_policy", { params: { id: "b4e8c0ba-1d5b-4c24-b6c3-3274e8604500" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | — |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `GET /api/v1/identity/projects`

Projects the caller may see, optionally of one organisation. Needs `project.view`.

**Operation ID:** `projects`

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
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/projects?organization=14c169c3-7c7f-4898-9428-a78d1da537fe" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("projects", { query: { organization: "14c169c3-7c7f-4898-9428-a78d1da537fe" } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "deff5baa-28d1-4534-b980-108a88f9fa09",
      "organizationId": "14c169c3-7c7f-4898-9428-a78d1da537fe",
      "organizationSlug": "acme",
      "slug": "shop",
      "name": "Online shop",
      "createdAt": "2026-10-28T23:26:42.689663Z"
    },
    {
      "id": "00000000-0000-0000-0000-000000000002",
      "organizationId": "00000000-0000-0000-0000-000000000001",
      "organizationSlug": "default",
      "slug": "default",
      "name": "Default",
      "createdAt": "2026-10-28T23:26:41.633124Z"
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
| `503` | `database_not_configured` |

### `GET /api/v1/identity/projects/{projectId}/environments`

Environments of a project. Needs `project.view` on it.

**Operation ID:** `environments`

**Needs:** `project.view` on it.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `projectId` | path | string (uuid) | yes | — | Apelora project id |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/projects/deff5baa-28d1-4534-b980-108a88f9fa09/environments" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("environments", { params: { projectId: "deff5baa-28d1-4534-b980-108a88f9fa09" } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "897a4582-0cc0-4132-b2e6-523daef9858f",
      "projectId": "deff5baa-28d1-4534-b980-108a88f9fa09",
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
      "id": "203fa176-c365-4d3f-92c3-7ae48b5be87d",
      "projectId": "deff5baa-28d1-4534-b980-108a88f9fa09",
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
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `POST /api/v1/identity/projects/{projectId}/environments`

Creates an environment. The Incus project it maps to is derived from the names (tenants cannot choose it); platform administrators (`cluster.manage`) may map an existing one. When the derived project already exists and Apelora did not create it for this environment, nothing is created: 409 `incus_project_exists`. Needs `environment.manage`.

**Operation ID:** `create_environment`

**Needs:** `environment.manage`.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `projectId` | path | string (uuid) | yes | — | Apelora project id |

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `incusProject` | string or null | no | Platform administrators only: map an existing Incus project instead of the derived name. Only a project named here can be adopted; one that carries another environment's marker never is. |
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
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/projects/deff5baa-28d1-4534-b980-108a88f9fa09/environments" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"slug":"production","name":"Production","kind":"production","incusProject":"shop-prod"}'
```

**TypeScript:**

```ts
const result = await client.request("create_environment", { params: { projectId: "deff5baa-28d1-4534-b980-108a88f9fa09" }, body: { slug: "production", name: "Production", kind: "production", incusProject: "shop-prod" } });
```

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "897a4582-0cc0-4132-b2e6-523daef9858f",
  "projectId": "deff5baa-28d1-4534-b980-108a88f9fa09",
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
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `incus_project_exists`, `reserved_name` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/quotas/project/deff5baa-28d1-4534-b980-108a88f9fa09" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("quota", { params: { scope: "project", id: "deff5baa-28d1-4534-b980-108a88f9fa09" } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "kind": "project",
  "id": "deff5baa-28d1-4534-b980-108a88f9fa09",
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
  "updatedAt": "2026-10-28T23:26:43.087476Z",
  "canSet": true
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
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/identity/quotas/project/deff5baa-28d1-4534-b980-108a88f9fa09" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"cpu":16,"memoryGib":64,"diskGib":500,"instances":20}'
```

**TypeScript:**

```ts
const result = await client.request("set_quota", { params: { scope: "project", id: "deff5baa-28d1-4534-b980-108a88f9fa09" }, body: { cpu: 16, memoryGib: 64, diskGib: 500, instances: 20 } });
```

**Response `200`** — Done; the response holds the result..

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
      "environmentId": "897a4582-0cc0-4132-b2e6-523daef9858f",
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
      "environmentId": "203fa176-c365-4d3f-92c3-7ae48b5be87d",
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
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "items": [
    {
      "key": "builtin:platform-super-admin",
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
      "key": "builtin:fabric-administrator",
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
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "key": "custom:d668bdc7-b604-4e98-ab44-a7e0dcd17d10",
  "reference": {
    "type": "custom",
    "id": "d668bdc7-b604-4e98-ab44-a7e0dcd17d10"
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
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `would_escalate`, `forbidden`, `mfa_required` |
| `409` | — |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/roles/dde7a4f5-63b8-4c61-9ac1-f9afee9e6b62" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("delete_role", { params: { role: "dde7a4f5-63b8-4c61-9ac1-f9afee9e6b62" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | — |
| `409` | — |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "1192eb5c-f585-4771-b9b9-dfa0ccde86ce",
      "name": "ci-pipeline",
      "kind": "automation",
      "backend": "apelora",
      "operations": [],
      "credentialRef": null,
      "restrictions": {},
      "createdBy": "token:docs-verifier",
      "createdAt": "2026-10-28T23:26:48.639513Z",
      "expiresAt": "2027-01-26T23:26:48.635883Z",
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
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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
| `restrictions` | object | no | Limits recorded with the identity, such as `{"projects": ["acme-prod"]}`. Recorded and shown, not yet enforced. |

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

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "token": "<token, shown once>",
  "identity": {
    "id": "1192eb5c-f585-4771-b9b9-dfa0ccde86ce",
    "name": "ci-pipeline",
    "kind": "automation",
    "backend": "apelora",
    "operations": [],
    "credentialRef": null,
    "restrictions": {},
    "createdBy": "token:docs-verifier",
    "createdAt": "2026-10-28T23:26:48.639513Z",
    "expiresAt": "2027-01-26T23:26:48.635883Z",
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
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `409` | — |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/service-identities/1192eb5c-f585-4771-b9b9-dfa0ccde86ce/disable" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("disable_service_identity", { params: { id: "1192eb5c-f585-4771-b9b9-dfa0ccde86ce" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | — |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/service-identities/1192eb5c-f585-4771-b9b9-dfa0ccde86ce/enable" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("enable_service_identity", { params: { id: "1192eb5c-f585-4771-b9b9-dfa0ccde86ce" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | — |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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

**Response `200`** — Done; the response holds the result..

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
| `429` | `rate_limited` |

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

**Response `200`** — Done; the response holds the result..

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
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `409` | `approval_invalid`, `approval_required`, `locked_by_environment`, `would_lock_out` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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

**Response `200`** — Done; the response holds the result..

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
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |
| `502` | `provider_unreachable`, an `incus_…` code |

### `GET /api/v1/identity/sign-in/directories`

The directories people sign in with, each checked with a TLS connection now. Needs `platform.security.manage`.

**Operation ID:** `directories`

**Needs:** `platform.security.manage`.

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

```sh
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/sign-in/directories" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("directories", {});
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "f3c86ac0-74e6-4bcc-9cb6-9a530a47e0e6",
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
| `429` | `rate_limited` |

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

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "f3c86ac0-74e6-4bcc-9cb6-9a530a47e0e6",
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
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `approval_invalid`, `approval_required`, `conflict`, `directory_exists` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/identity/sign-in/directories/f3c86ac0-74e6-4bcc-9cb6-9a530a47e0e6" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"Head office directory","url":"ldaps://ldap.example.invalid","bindTemplate":"uid={username},ou=people,dc=acme,dc=example","baseDn":"dc=acme,dc=example","groupBaseDn":"ou=groups,dc=acme,dc=example","enabled":false,"startTls":false,"emailAttribute":"mail"}'
```

**TypeScript:**

```ts
const result = await client.request("update_directory", { params: { id: "f3c86ac0-74e6-4bcc-9cb6-9a530a47e0e6" }, body /* the request body above */ });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "f3c86ac0-74e6-4bcc-9cb6-9a530a47e0e6",
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
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `approval_invalid`, `approval_required`, `conflict`, `directory_exists` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `DELETE /api/v1/identity/sign-in/directories/{id}`

Removes a directory: its people can no longer sign in with it; their accounts and roles in Apelora stay. Its name must be typed again. Needs `platform.security.manage`; audited.

**Operation ID:** `delete_directory`

**Needs:** `platform.security.manage`; audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Directory id |
| `confirm` | query | string | yes | — | The directory's name again. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/sign-in/directories/f3c86ac0-74e6-4bcc-9cb6-9a530a47e0e6?confirm=Head+office+directory" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("delete_directory", { params: { id: "f3c86ac0-74e6-4bcc-9cb6-9a530a47e0e6" }, query: { confirm: "Head office directory" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `confirmation_mismatch`, `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `approval_invalid`, `approval_required` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `POST /api/v1/identity/sign-in/directories/check`

Connects with TLS, binds as a test person and reads their entry and groups, without saving anything. Reports what it found or the precise reason it failed. Needs `platform.security.manage`.

**Operation ID:** `check_directory`

**Needs:** `platform.security.manage`.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `directory` | string (uuid) or null | no | The saved directory these settings are for, if any: only its group mappings are shown. |
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

**Response `200`** — Done; the response holds the result..

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
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `429` | `rate_limited` |

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

**Response `200`** — Done; the response holds the result..

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
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `409` | `approval_invalid`, `approval_required`, `would_lock_out` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "fddfe9cb-3d9c-4059-9812-f6b31598ca00",
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
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `409` | `approval_invalid`, `approval_required`, `conflict`, `provider_exists` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/identity/sign-in/providers/fddfe9cb-3d9c-4059-9812-f6b31598ca00" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"name":"Company sign-in","issuer":"https://login.example.invalid/realms/acme","audiences":["apelora"],"clientId":"apelora-console","scopes":["openid","profile","email","groups"],"groupsClaim":"groups","enabled":false}'
```

**TypeScript:**

```ts
const result = await client.request("update_identity_provider", { params: { id: "fddfe9cb-3d9c-4059-9812-f6b31598ca00" }, body /* the request body above */ });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "id": "fddfe9cb-3d9c-4059-9812-f6b31598ca00",
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
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `approval_invalid`, `approval_required`, `conflict`, `provider_exists`, `would_lock_out` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `DELETE /api/v1/identity/sign-in/providers/{id}`

Removes a provider saved in the Console: people stop being able to sign in with it. Its name must be typed again. Needs `platform.security.manage`; audited.

**Operation ID:** `delete_identity_provider`

**Needs:** `platform.security.manage`; audited.

| Parameter | In | Type | Required | Default | Meaning |
|---|---|---|---|---|---|
| `id` | path | string (uuid) | yes | — | Provider id |
| `confirm` | query | string | yes | — | The provider's name again. |

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/sign-in/providers/fddfe9cb-3d9c-4059-9812-f6b31598ca00?confirm=Company+sign-in" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("delete_identity_provider", { params: { id: "fddfe9cb-3d9c-4059-9812-f6b31598ca00" }, query: { confirm: "Company sign-in" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `confirmation_mismatch`, `invalid_request` |
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `409` | `approval_invalid`, `approval_required`, `would_lock_out` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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
curl --fail-with-body -sS -X GET "$APELORA_URL/api/v1/identity/sign-ins?user=c9bef258-1dba-45cb-9d15-1a1231ded712" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json"
```

**TypeScript:**

```ts
const result = await client.request("sign_ins", { query: { user: "c9bef258-1dba-45cb-9d15-1a1231ded712" } });
```

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "items": [
    {
      "id": "1a4b5d3b-070a-4d3f-a61d-144f043026a4",
      "userId": "c9bef258-1dba-45cb-9d15-1a1231ded712",
      "person": "ada",
      "method": "password",
      "createdAt": "2026-10-28T23:26:44.052991Z",
      "lastUsedAt": "2026-10-28T23:26:46.42708Z",
      "expiresAt": "2026-10-29T07:26:44.052991Z",
      "endsAt": "2026-10-29T00:26:46.42708Z",
      "current": false
    },
    {
      "id": "8b9ccfe1-5b1f-4554-a2b3-31a701b826ef",
      "userId": "c9bef258-1dba-45cb-9d15-1a1231ded712",
      "person": "ada",
      "method": "password",
      "createdAt": "2026-10-28T23:26:46.399555Z",
      "lastUsedAt": "2026-10-28T23:26:46.399555Z",
      "expiresAt": "2026-10-29T07:26:46.399555Z",
      "endsAt": "2026-10-29T00:26:46.399555Z",
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
| `429` | `rate_limited` |
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
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/identity/sign-ins/2086b5df-ed1f-4bb8-875e-ef26c00bdbfa" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("end_sign_in", { params: { id: "2086b5df-ed1f-4bb8-875e-ef26c00bdbfa" } });
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

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "source": {
    "provider": "mock",
    "observedAt": "2026-10-28T23:26:43.236456Z"
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
      "id": "14c169c3-7c7f-4898-9428-a78d1da537fe",
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
          "id": "deff5baa-28d1-4534-b980-108a88f9fa09",
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
              "id": "897a4582-0cc0-4132-b2e6-523daef9858f",
              "slug": "production",
              "name": "Production",
              "kind": "production",
              "incusProject": "shop-prod",
              "incusState": "created",
              "incusDetail": "Incus project shop-prod created by Apelora with the baseline restrictions",
              "checkedAt": "2026-10-28T23:26:43.128894Z",
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
              "id": "203fa176-c365-4d3f-92c3-7ae48b5be87d",
              "slug": "staging",
              "name": "Staging",
              "kind": "staging",
              "incusProject": "acme-shop-staging",
              "incusState": "created",
              "incusDetail": "Incus project acme-shop-staging created by Apelora with the baseline restrictions",
              "checkedAt": "2026-10-28T23:26:43.15146Z",
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
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "items": [
    {
      "id": "c9bef258-1dba-45cb-9d15-1a1231ded712",
      "username": "ada",
      "email": "ada@example.org",
      "displayName": "Ada Lovelace",
      "issuer": "apelora:local",
      "createdAt": "2026-10-28T23:26:43.378816Z",
      "lastSeenAt": "2026-10-28T23:26:44.052991Z",
      "disabled": false
    },
    {
      "id": "e99e9737-dc0f-47bf-ae49-3c27edc0b26a",
      "username": "grace",
      "email": "grace@example.org",
      "displayName": "Grace Hopper",
      "issuer": "apelora:local",
      "createdAt": "2026-10-28T23:26:44.084163Z",
      "lastSeenAt": "2026-10-28T23:26:44.764453Z",
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
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/users/5a4c9822-5bf1-4981-b339-6acfca601b50/disable" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("disable_user", { params: { user: "5a4c9822-5bf1-4981-b339-6acfca601b50" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | — |
| `409` | `last_super_admin`, `self_lockout` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/identity/users/5a4c9822-5bf1-4981-b339-6acfca601b50/enable" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("enable_user", { params: { user: "5a4c9822-5bf1-4981-b339-6acfca601b50" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `forbidden`, `mfa_required` |
| `404` | — |
| `409` | `last_super_admin`, `self_lockout` |
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

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

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "c9bef258-1dba-45cb-9d15-1a1231ded712",
      "username": "ada",
      "email": "ada@example.org",
      "displayName": "Ada Lovelace",
      "issuer": "apelora:local",
      "createdAt": "2026-10-28T23:26:43.378816Z",
      "lastSeenAt": "2026-10-28T23:26:44.052991Z",
      "disabled": false
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
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

### `PUT /api/v1/me/password`

Changes the caller's own password (local accounts only). Every other session of theirs is revoked; the one making the request stays. Counts towards the account's lock like a sign-in.

**Operation ID:** `change_password`

**Needs:** a signed-in caller; the server decides what that caller may see.

**Request body** (JSON):

| Field | Type | Required | Meaning |
|---|---|---|---|
| `current` | string | yes | — |
| `new` | string | yes | — |

```json
{
  "current": "<current password>",
  "new": "<new password>"
}
```

**Example request.** Replace sample names, IDs and body values with resources and settings from your installation.

This request can change state. Check permissions, prerequisites and any required approval before running it.

```sh
curl --fail-with-body -sS -X PUT "$APELORA_URL/api/v1/me/password" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Content-Type: application/json" \
  --data-raw '{"current":"<current password>","new":"<new password>"}'
```

**TypeScript:**

```ts
await client.request("change_password", { body: { current: "<current password>", new: "<new password>" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `400` | `invalid_request`, `weak_password`, `wrong_password` |
| `401` | `unauthenticated`, `invalid_token` |
| `409` | `account_locked`, `not_a_local_account` |
| `429` | `rate_limited` |
| `500` | `internal` |
| `503` | `database_not_configured` |

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

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ. Long lists are cut to their first items.

```json
{
  "items": [
    {
      "id": "1a4b5d3b-070a-4d3f-a61d-144f043026a4",
      "userId": "c9bef258-1dba-45cb-9d15-1a1231ded712",
      "person": "ada",
      "method": "password",
      "createdAt": "2026-10-28T23:26:44.052991Z",
      "lastUsedAt": "2026-10-28T23:26:46.42708Z",
      "expiresAt": "2026-10-29T07:26:44.052991Z",
      "endsAt": "2026-10-29T00:26:46.42708Z",
      "current": true
    },
    {
      "id": "8b9ccfe1-5b1f-4554-a2b3-31a701b826ef",
      "userId": "c9bef258-1dba-45cb-9d15-1a1231ded712",
      "person": "ada",
      "method": "password",
      "createdAt": "2026-10-28T23:26:46.399555Z",
      "lastUsedAt": "2026-10-28T23:26:46.399555Z",
      "expiresAt": "2026-10-29T07:26:46.399555Z",
      "endsAt": "2026-10-29T00:26:46.399555Z",
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
| `429` | `rate_limited` |
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
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/me/sign-ins/8b9ccfe1-5b1f-4554-a2b3-31a701b826ef" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("end_my_sign_in", { params: { id: "8b9ccfe1-5b1f-4554-a2b3-31a701b826ef" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `people_only`, `forbidden`, `mfa_required` |
| `404` | `not_found` |
| `429` | `rate_limited` |
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

**Response `200`** — Done; the response holds the result..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "items": [
    {
      "id": "c28593f7-e0fb-4079-8e65-98192030ce0f",
      "name": "laptop-cli",
      "userId": "c9bef258-1dba-45cb-9d15-1a1231ded712",
      "owner": "ada",
      "state": "active",
      "createdAt": "2026-10-28T23:26:46.687784Z",
      "expiresAt": "2026-11-27T23:26:46.687784Z",
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
| `429` | `rate_limited` |
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

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "token": "<token, shown once>",
  "info": {
    "id": "c28593f7-e0fb-4079-8e65-98192030ce0f",
    "name": "laptop-cli",
    "userId": "c9bef258-1dba-45cb-9d15-1a1231ded712",
    "owner": "ada",
    "state": "active",
    "createdAt": "2026-10-28T23:26:46.687784Z",
    "expiresAt": "2026-11-27T23:26:46.687784Z",
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
| `429` | `rate_limited` |
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
curl --fail-with-body -sS -X DELETE "$APELORA_URL/api/v1/me/tokens/f5553542-ffe2-419c-8472-9fe2c1215e4f" \
  -H "Authorization: Bearer $APELORA_TOKEN"
```

**TypeScript:**

```ts
await client.request("revoke_my_token", { params: { id: "f5553542-ffe2-419c-8472-9fe2c1215e4f" } });
```

**Response `204`** — Done; nothing is returned., with no body.

**Errors.** The body is `{"error": {"code": …, "message": …}}`; see [error codes](/docs/api/overview/#error-codes) for the codes every operation shares.

| Status | Codes |
|---|---|
| `401` | `unauthenticated`, `invalid_token` |
| `403` | `people_only`, `forbidden`, `mfa_required` |
| `404` | — |
| `429` | `rate_limited` |
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
curl --fail-with-body -sS -X POST "$APELORA_URL/api/v1/me/tokens/c28593f7-e0fb-4079-8e65-98192030ce0f/rotate" \
  -H "Authorization: Bearer $APELORA_TOKEN" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{"expiresInDays":30,"overlapMinutes":60}'
```

**TypeScript:**

```ts
const result = await client.request("rotate_my_token", { params: { id: "c28593f7-e0fb-4079-8e65-98192030ce0f" }, body: { expiresInDays: 30, overlapMinutes: 60 } });
```

**Response `201`** — Created; the response describes what was created..

Content-Type: `application/json`.

**Example response** from a test installation; your IDs, names and times differ.

```json
{
  "token": "<token, shown once>",
  "info": {
    "id": "f5553542-ffe2-419c-8472-9fe2c1215e4f",
    "name": "laptop-cli",
    "userId": "c9bef258-1dba-45cb-9d15-1a1231ded712",
    "owner": "ada",
    "state": "active",
    "createdAt": "2026-10-28T23:26:46.822168Z",
    "expiresAt": "2026-11-27T23:26:46.822168Z",
    "lastUsedAt": null,
    "revokedAt": null,
    "revokedBy": null,
    "rotatedFrom": "c28593f7-e0fb-4079-8e65-98192030ce0f",
    "successor": null,
    "current": false
  },
  "previous": {
    "id": "c28593f7-e0fb-4079-8e65-98192030ce0f",
    "name": "laptop-cli",
    "userId": "c9bef258-1dba-45cb-9d15-1a1231ded712",
    "owner": "ada",
    "state": "rotating",
    "createdAt": "2026-10-28T23:26:46.687784Z",
    "expiresAt": "2026-10-29T00:26:46.822168Z",
    "lastUsedAt": null,
    "revokedAt": null,
    "revokedBy": null,
    "rotatedFrom": null,
    "successor": "f5553542-ffe2-419c-8472-9fe2c1215e4f",
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
| `429` | `rate_limited` |
| `503` | `database_not_configured` |

