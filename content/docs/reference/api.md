---
title: API reference
section: reference
slug: api
order: 3
label: API reference
source: packages/api-client/openapi.json
summary: Every operation of the control plane's REST API, by area. Generated from its OpenAPI document.
---
The control plane's REST API, version `v1`: 181 operations. Calls are made with a bearer token (an API token or an identity provider's access token) and checked against the caller's permissions; a few, such as health and sign-in, are public. The complete machine-readable description, with request and response shapes, is the OpenAPI document `packages/api-client/openapi.json` in the repository; `apelora-control-plane openapi` prints it. This page is generated from it.

## System

| Method | Path | What it does |
|---|---|---|
| `GET` | `/api/v1/database-backups` | Whether Apelora's database is being backed up and a restore has been proven, from the records the scripts leave in `APELORA_DB_BACKUP_DIR`. |
| `GET` | `/api/v1/health` | Public: no sign-in needed. |
| `GET` | `/api/v1/health/components` | The state of each part of this installation: control plane, database, deployment workers, job queue, Incus, networks, storage pools and identity providers. |
| `GET` | `/api/v1/health/servers` | Each server's status, CPU, memory, storage and the instances on it, with warnings. |
| `GET` | `/api/v1/image-mirrors` | Image mirrors: the configuration this control plane runs with (upstream → mirror pairs and whether only mirrors may be used; URLs, not secrets), whether each mirror answers (probed at most once a minute), and the image servers each deployable catalog class needs with whether it is covered. |
| `PUT` | `/api/v1/me/password` | Changes the caller's own password (local accounts only). |
| `GET` | `/api/v1/monitoring` | Where each metrics endpoint is, whether the caller may scrape, and the region, site and sector labels. |
| `GET` | `/api/v1/settings` | The settings this control plane runs with: every setting the control plane and the worker read, the value when it may be shown (never a secret, a key or a certificate path), whether it is the default and where it came from; sign-in settings saved in the Console; the workers seen recently. |
| `GET` | `/api/v1/sign-in` | Public: no sign-in needed. |
| `POST` | `/api/v1/sign-in/password` | Public: no sign-in needed. |
| `POST` | `/api/v1/sign-in/setup` | Public: no sign-in needed. |
| `POST` | `/api/v1/sign-out` | Ends the Apelora session the request was made with. |
| `GET` | `/api/v1/support-bundle` | Downloads a support bundle (a tar file, streamed): manifest, versions, effective settings (secrets never included), health, preflight, jobs that failed in the last 24 hours with their attempts, a metrics snapshot and where to find logs. |
| `GET` | `/api/v1/system` | Versions of this control plane and the Incus release it is pinned to, and when the certificates Apelora uses to reach Incus expire, and Incus as observed now (running version, or the error that keeps it unreachable). |
| `GET` | `/api/v1/whoami` | Who is calling, with the role assignments and permissions in force. |
| `GET` | `/metrics` | Metrics of this control plane in the text exposition format (OpenMetrics when the `Accept` header asks for `application/openmetrics-text`). |

## Inventory

| Method | Path | What it does |
|---|---|---|
| `GET` | `/api/v1/capacity` | How much CPU, memory and volume space the cluster has free, per server and in total, for comparing with a design. |
| `GET` | `/api/v1/cluster` | The Incus server and its cluster members. |
| `GET` | `/api/v1/instances` | Instances in all projects. |
| `GET` | `/api/v1/instances/{project}/{name}` | The instance with the application it belongs to, its recent jobs, and what the caller may do (Start, Stop, Restart, Move and Delete go through the existing instance routes and jobs). |
| `GET` | `/api/v1/instances/{project}/{name}/console-log` | The end of the instance's console log (`tailKib`, default 64, at most 1024). |
| `GET` | `/api/v1/instances/{project}/{name}/logs` | The instance's log files as Incus lists them (names only). |
| `GET` | `/api/v1/instances/{project}/{name}/logs/{file}` | The end of one of the instance's log files (`tailKib`, default 64, at most 1024). |
| `GET` | `/api/v1/networks` | Networks in all projects. |
| `GET` | `/api/v1/networks/settings` | The network settings in effect: Apelora's uplink and service range, each deploy project's network limits, and the uplink as Incus reports it (with the administrator identity, when configured), with what does not fit together. |
| `GET` | `/api/v1/preflight` | Read-only readiness checks of the Incus server or cluster, of the projects Apelora deploys into, and of the image mirrors (whether each image server the catalog uses is mirrored and whether the mirrors answer). |
| `GET` | `/api/v1/projects` | Incus projects. |
| `GET` | `/api/v1/storage-pools` | Storage pools. |
| `GET` | `/api/v1/storage/orphans` | Custom volumes in Apelora's projects that no application volume or backup record refers to, in every pool, with their size. |
| `GET` | `/api/v1/storage/pools` | Storage pools with how full each is, per member and in total (read from each member's state, like the Health page). |

## Deployment

| Method | Path | What it does |
|---|---|---|
| `POST` | `/api/v1/instances` | Queues creation of an instance. |
| `DELETE` | `/api/v1/instances/{project}/{name}` | Queues deletion of an Apelora instance (stopped first if running). |
| `GET` | `/api/v1/instances/{project}/{name}/move` | Dry run of moving an instance to another member: whether it keeps running, what it copies, what blocks it. |
| `POST` | `/api/v1/instances/{project}/{name}/move` | Moves an Apelora instance to another member, after the check runs again and its name is typed: live when it can, otherwise only with `allowStop`, copying its volumes there. |
| `POST` | `/api/v1/instances/{project}/{name}/state` | Queues starting or stopping an Apelora instance. |
| `GET` | `/api/v1/jobs` | Jobs newest first, filtered by status, kind and application and paged with `after`. |
| `GET` | `/api/v1/jobs/{id}` | A queued job and its progress. |
| `POST` | `/api/v1/jobs/{id}/cancel` | Cancels a job. |
| `GET` | `/api/v1/jobs/{id}/detail` | A job with its attempts (worker, timings, outcome, error and the Incus operations each started), who queued it, its request id, and the jobs linked to it (retries, and other jobs the same request queued). |
| `POST` | `/api/v1/jobs/{id}/retry` | Queues a new job that repeats a failed one, linked to it (`retryOf`); the failed job is kept unchanged as evidence. |

## Applications

| Method | Path | What it does |
|---|---|---|
| `GET` | `/api/v1/applications` | Applications the caller may see, each with design status, derived runtime status, replica health, and the actions they may take now. |
| `POST` | `/api/v1/applications` | Creates an application in an environment, optionally with its first draft. |
| `GET` | `/api/v1/applications/{name}` | One application with its modules (desired and observed), versions and recent operations. |
| `PATCH` | `/api/v1/applications/{name}` | Changes an application's description or icon (its name cannot change). |
| `POST` | `/api/v1/applications/{name}/archive` | Archives an application that is not running; it leaves the default list and keeps its data. |
| `POST` | `/api/v1/applications/{name}/deployments` | Deploys the design: saves it as a new revision and queues the planned changes. |
| `GET` | `/api/v1/applications/{name}/draft` | The application's working document. |
| `PUT` | `/api/v1/applications/{name}/draft` | Saves the draft as the next version. |
| `GET` | `/api/v1/applications/{name}/events` | What happened to the application: creation, saves, versions, deployments, operations, refusals. |
| `GET` | `/api/v1/applications/{name}/migration` | Dry run of migrating the application to another server: for each instance whether it keeps running, what is copied and what blocks it. |
| `GET` | `/api/v1/applications/{name}/operations` | Recent operations of the application, newest first. |
| `POST` | `/api/v1/applications/{name}/operations` | Starts, shuts down (graceful), stops (immediate), restarts or migrates the application's instances, in dependency order where that matters, as an asynchronous operation. |
| `GET` | `/api/v1/applications/{name}/operations/{id}` | One operation with the progress of each phase and instance. |
| `POST` | `/api/v1/applications/{name}/plan` | What deploying the design would change, without changing anything. |
| `POST` | `/api/v1/applications/{name}/restore` | Brings an archived application back. |
| `GET` | `/api/v1/applications/{name}/status` | The application's instances as Incus reports them, by module. |
| `GET` | `/api/v1/applications/{name}/versions` | Versions of the application, newest first. |
| `POST` | `/api/v1/applications/{name}/versions` | Releases the current draft as the next immutable published version. |
| `GET` | `/api/v1/applications/{name}/versions/{revision}` | The document of one version. |
| `GET` | `/api/v1/applications/{name}/volumes` | The application's volumes, with what Incus says about each now. |
| `DELETE` | `/api/v1/applications/{name}/volumes/{volume}` | Deletes one of the application's volumes and its snapshots, for good. |
| `PATCH` | `/api/v1/applications/{name}/volumes/{volume}` | Grows one of the application's volumes, also while its instance runs. |
| `GET` | `/api/v1/applications/{name}/volumes/{volume}/backups` | The volume's backups, oldest first, whether each still exists, and its schedules. |
| `POST` | `/api/v1/applications/{name}/volumes/{volume}/backups` | Backs the volume up now: a copy, through a short-lived snapshot, into the backup pool on another member. |
| `GET` | `/api/v1/applications/{name}/volumes/{volume}/backups/{backup}/restore` | Dry run of restoring the volume from one of its backups: what is replaced (data written since the backup, the volume's snapshots), which instances must be stopped, where the safety backup goes, and the steps. |
| `POST` | `/api/v1/applications/{name}/volumes/{volume}/backups/{backup}/restore` | Restores the volume from one of its backups, after the dry run passes again and the volume's name is typed: a safety backup of the current data first (unless declined), then the backup is copied over the volume. |
| `PUT` | `/api/v1/applications/{name}/volumes/{volume}/schedules` | Sets or turns off the volume's snapshot and backup schedules. |
| `GET` | `/api/v1/applications/{name}/volumes/{volume}/snapshots` | The volume's snapshots, oldest first. |
| `POST` | `/api/v1/applications/{name}/volumes/{volume}/snapshots` | Takes a snapshot of the volume, named after the time (`snap-YYYYMMDD-HHMMSS`). |
| `DELETE` | `/api/v1/applications/{name}/volumes/{volume}/snapshots/{snapshot}` | Deletes one snapshot of the volume. |
| `POST` | `/api/v1/applications/{name}/volumes/{volume}/snapshots/{snapshot}/restore` | Puts the volume back to a snapshot: everything written since is lost. |
| `GET` | `/api/v1/networks/applications` | Each application the caller may view that has a recorded deployment: its network, the rules compiled from its design, its service and published addresses, and what Incus holds for each, with the differences. |
| `GET` | `/api/v1/storage/volumes` | Every application volume the caller may see, with what Incus reports, its schedules and how many backups it has. |

## Cluster

| Method | Path | What it does |
|---|---|---|
| `GET` | `/api/v1/cluster/groups` | Cluster groups and their members (empty on a standalone server). |
| `GET` | `/api/v1/cluster/join-tokens` | Join tokens waiting to be used (no secrets). |
| `POST` | `/api/v1/cluster/join-tokens` | Approves a new cluster member: asks Incus for a single-use join token. |
| `DELETE` | `/api/v1/cluster/join-tokens/{member}` | Withdraws a new member's approval: revokes its unused join token. |
| `GET` | `/api/v1/cluster/members` | Members with their database role (voter, stand-by, spare), the leader, other roles, failure domain, groups and Incus release; the database majority (how many voters answer, how many are needed, how many more can be lost); and version skew against the pinned Incus release with what blocks an upgrade. |
| `POST` | `/api/v1/cluster/members/{member}/evacuate` | Evacuates a cluster member through Incus after re-running the dry run: refused while anything blocks it. |
| `GET` | `/api/v1/cluster/members/{member}/evacuation` | Dry run of evacuating a cluster member: per instance, what Incus will do and what it means for the application; what blocks it; what to accept. |
| `POST` | `/api/v1/cluster/members/{member}/fencing` | Confirms that a failed server is powered off (or cut off from the shared storage). |
| `GET` | `/api/v1/cluster/members/{member}/removal` | Dry run of removing a cluster member for good: what is still on it, what blocks it and what to accept. |
| `POST` | `/api/v1/cluster/members/{member}/remove` | Removes an evacuated, empty member from the cluster for good, after the check runs again: refused while anything blocks it. |
| `POST` | `/api/v1/cluster/members/{member}/restore` | Restores an evacuated member: Incus moves its instances back and starts them. |
| `GET` | `/api/v1/cluster/recovery` | Failed members: whether each is fenced (and the evidence), or why Apelora waits; and per instance whether it restarts on another server (and where) or waits (and why). |
| `GET` | `/api/v1/cluster/settings` | Cluster-wide settings (offline and healing thresholds, database voters and stand-bys, join-token lifetime, image replication and updates): the value set, Incus's default and whether the default applies. |
| `PATCH` | `/api/v1/cluster/settings` | Changes cluster settings through Incus with the admin identity. |
| `GET` | `/api/v1/machines` | Machines being enrolled, with their state derived from Incus. |
| `POST` | `/api/v1/machines` | Registers a machine. |
| `DELETE` | `/api/v1/machines/{name}` | Forgets a machine that is not a cluster member (revoking an unused join token). |
| `GET` | `/api/v1/machines/{name}/admission` | The admission checks for a joined machine (dry run; changes nothing). |
| `POST` | `/api/v1/machines/{name}/admit` | Admits a joined machine: re-runs the admission checks and, when none fails, lets Incus place instances on it. |
| `DELETE` | `/api/v1/machines/{name}/approval` | Withdraws an approval: revokes the machine's unused join token. |
| `POST` | `/api/v1/machines/{name}/approve` | Approves a machine: asks Incus for its single-use join token, returned only in this response with the command to run on the server. |
| `GET` | `/api/v1/provisioners/maas/machines` | The machines MAAS manages, with the Apelora machine and Incus member each became. |

## Administration

| Method | Path | What it does |
|---|---|---|
| `GET` | `/api/v1/tokens` | API tokens, active and revoked (never the tokens themselves). |
| `POST` | `/api/v1/tokens` | Creates an API token, shown only in this response. |
| `DELETE` | `/api/v1/tokens/{id}` | Revokes an API token; it stops working at once. |

## Audit

| Method | Path | What it does |
|---|---|---|
| `GET` | `/api/v1/audit` | Audit events the caller may read, newest first, filtered by actor, target, action prefix, outcome and time, and paged with `before`. |
| `GET` | `/api/v1/audit/export` | Exports the audit events the caller may read, with the same filters as the list (`limit` does not apply), newest first, as CSV or JSON lines. |

## Identity

| Method | Path | What it does |
|---|---|---|
| `GET` | `/api/v1/approvals` | Requests and approvals: your own, plus every open one if you may approve. |
| `POST` | `/api/v1/approvals` | Asks for approval of one risky action on one target. |
| `POST` | `/api/v1/approvals/{id}/approve` | Approves a request made by someone else. |
| `POST` | `/api/v1/approvals/{id}/cancel` | Withdraws your own pending request. |
| `POST` | `/api/v1/approvals/{id}/reject` | Rejects a request. |
| `GET` | `/api/v1/identity/assignments` | Role assignments in the caller's scopes. |
| `POST` | `/api/v1/identity/assignments` | Grants a role to a person, group or automation identity at a scope. |
| `DELETE` | `/api/v1/identity/assignments/{assignment}` | Revokes an assignment; the person loses it on their next request. |
| `POST` | `/api/v1/identity/assignments/preview` | Shows what an assignment would give before it is saved: what the person can already do at the scope, what they could do afterwards, which permissions would be inert, and whether you may save it. |
| `GET` | `/api/v1/identity/audit` | Audit history the caller may read: the same filters and paging as `GET /api/v1/audit`. |
| `POST` | `/api/v1/identity/emergency-access` | Grants a person a platform role for a short time, with a recorded reason (break-glass). |
| `POST` | `/api/v1/identity/environments/{id}/incus-project` | Creates or adopts the environment's Incus project now (idempotent): the restricted project with its default profile, granted to the deploy identity, then the quotas mirrored. |
| `GET` | `/api/v1/identity/groups` | Groups the caller may see. |
| `POST` | `/api/v1/identity/groups` | Creates a group: an organisation's (needs `group.manage` there) or a platform group (platform `group.manage`). |
| `GET` | `/api/v1/identity/groups/{group}/members` | Members of a group. |
| `DELETE` | `/api/v1/identity/groups/{group}/members/{user}` | Removes a person from a group; their access through it ends on their next request. |
| `PUT` | `/api/v1/identity/groups/{group}/members/{user}` | Adds a person to a group. |
| `POST` | `/api/v1/identity/local-accounts` | Creates a local account and returns its one-time setup link, valid for 24 hours. |
| `POST` | `/api/v1/identity/local-accounts/{id}/reset` | Takes a local account's password away, revokes every session of theirs and returns a new one-time setup link (24 hours). |
| `GET` | `/api/v1/identity/organizations` | Organisations the caller may see. |
| `POST` | `/api/v1/identity/organizations` | Creates an organisation. |
| `POST` | `/api/v1/identity/organizations/{org}/projects` | Creates a project in an organisation. |
| `GET` | `/api/v1/identity/permissions` | Every permission, its class and the narrowest scope at which a grant takes effect. |
| `GET` | `/api/v1/identity/personal-tokens` | Everyone's personal tokens (or one person's), live ones and those that ended in the last 30 days. |
| `DELETE` | `/api/v1/identity/personal-tokens/{id}` | Revokes anyone's live personal token. |
| `GET` | `/api/v1/identity/policies` | Access policies (MFA and approval rules). |
| `PUT` | `/api/v1/identity/policies` | Creates or updates a policy by name. |
| `DELETE` | `/api/v1/identity/policies/{id}` | Deletes a policy. |
| `GET` | `/api/v1/identity/projects` | Projects the caller may see, optionally of one organisation. |
| `GET` | `/api/v1/identity/projects/{project}/environments` | Environments of a project. |
| `POST` | `/api/v1/identity/projects/{project}/environments` | Creates an environment. |
| `GET` | `/api/v1/identity/quotas/{scope}/{id}` | A scope's quota and use. |
| `PUT` | `/api/v1/identity/quotas/{scope}/{id}` | Sets a scope's quota (all limits empty removes it), then mirrors the tightest applicable quota onto every environment beneath it. |
| `GET` | `/api/v1/identity/roles` | The predefined and custom roles with their permissions. |
| `POST` | `/api/v1/identity/roles` | Defines a custom role from explicit permissions. |
| `DELETE` | `/api/v1/identity/roles/{role}` | Deletes a custom role that no assignment uses. |
| `GET` | `/api/v1/identity/service-identities` | Registered service identities (the credentials Apelora uses for Incus and MAAS, and automation identities that call this API). |
| `POST` | `/api/v1/identity/service-identities` | Registers a service identity. |
| `POST` | `/api/v1/identity/service-identities/{id}/disable` | Disables a service identity at once. |
| `POST` | `/api/v1/identity/service-identities/{id}/enable` | Re-enables a service identity. |
| `GET` | `/api/v1/identity/sign-in` | Sign-in settings: identity providers (saved and from the environment), whether API tokens are accepted, and local accounts. |
| `PUT` | `/api/v1/identity/sign-in/api-tokens` | Turns API tokens on or off. |
| `POST` | `/api/v1/identity/sign-in/check` | Reads a provider's discovery document and key set, without saving anything: what an administrator checks before saving. |
| `GET` | `/api/v1/identity/sign-in/directories` | The directories people sign in with, each checked with a TLS connection now. |
| `POST` | `/api/v1/identity/sign-in/directories` | Adds a directory; it is offered on the sign-in page at once when enabled. |
| `DELETE` | `/api/v1/identity/sign-in/directories/{id}` | Removes a directory: its people can no longer sign in with it; their accounts and roles in Apelora stay. |
| `PUT` | `/api/v1/identity/sign-in/directories/{id}` | Changes a directory (including turning it off). |
| `POST` | `/api/v1/identity/sign-in/directories/check` | Connects with TLS, binds as a test person and reads their entry and groups, without saving anything. |
| `PUT` | `/api/v1/identity/sign-in/local-accounts` | Turns sign-in with local accounts on or off. |
| `POST` | `/api/v1/identity/sign-in/providers` | Adds an identity provider; it is checked and applied at once. |
| `DELETE` | `/api/v1/identity/sign-in/providers/{id}` | Removes a provider saved in the Console: people stop being able to sign in with it. |
| `PUT` | `/api/v1/identity/sign-in/providers/{id}` | Changes a provider saved in the Console. |
| `GET` | `/api/v1/identity/sign-ins` | Everyone's Apelora sessions open now (or one person's). |
| `DELETE` | `/api/v1/identity/sign-ins/{id}` | Ends anyone's session. |
| `GET` | `/api/v1/identity/tenancy` | Organisations, projects and environments the caller can see, with quotas, use and each environment's Incus project as Incus reports it. |
| `GET` | `/api/v1/identity/users` | People who have signed in, as far as the caller may see them: everyone for a platform administrator, otherwise those with a role in the caller's scopes. |
| `POST` | `/api/v1/identity/users/{user}/disable` | Disables a person: their tokens and Apelora sessions stop working at once. |
| `POST` | `/api/v1/identity/users/{user}/enable` | Re-enables a person. |
| `GET` | `/api/v1/identity/users/lookup` | Finds one person by exact user name or e-mail so a role can be given to them. |
| `GET` | `/api/v1/me/sign-ins` | Your Apelora sessions open now (password and directory sign-ins), most recently used first. |
| `DELETE` | `/api/v1/me/sign-ins/{id}` | Ends one of your sessions (signs that browser out). |
| `GET` | `/api/v1/me/tokens` | Your personal tokens (live ones, and those that ended in the last 30 days), newest first. |
| `POST` | `/api/v1/me/tokens` | Creates a personal token, shown only in this response. |
| `DELETE` | `/api/v1/me/tokens/{id}` | Revokes one of your live tokens; it stops working at once. |
| `POST` | `/api/v1/me/tokens/{id}/rotate` | Rotates one of your live tokens: a successor with the same name (shown only in this response), and the old token keeps working for the overlap (0–1440 minutes, 60 by default), then expires. |

## Sessions

| Method | Path | What it does |
|---|---|---|
| `GET` | `/api/v1/applications/{name}/access` | What the caller may open on each instance of the application now, with the reason when not. |
| `POST` | `/api/v1/applications/{name}/instances/{instance}/sessions` | Opens a session: checks the caller, the instance and the approval rule, and answers with a single-use ticket for the websocket. |
| `GET` | `/api/v1/sessions` | Open sessions the caller started, and those on applications they may operate. |
| `DELETE` | `/api/v1/sessions/{id}` | Ends a session now. |

## Alerts

| Method | Path | What it does |
|---|---|---|
| `GET` | `/api/v1/alerts` | Firing alerts (most severe and oldest first) with acknowledgement and silence, the silences in force, counts by severity and whether the evaluator runs. |
| `POST` | `/api/v1/alerts/{id}/acknowledge` | Acknowledges a firing alert: who, when and an optional note. |
| `GET` | `/api/v1/alerts/channels` | Webhook channels with their delivery state. |
| `POST` | `/api/v1/alerts/channels` | Adds a webhook channel. |
| `DELETE` | `/api/v1/alerts/channels/{id}` | Deletes a webhook channel; messages still waiting for it are dropped by the relay. |
| `PUT` | `/api/v1/alerts/channels/{id}` | Changes a webhook channel. |
| `POST` | `/api/v1/alerts/channels/{id}/test` | Queues a test notification for one channel through the same outbox path as real alerts; the channel's delivery state shows the outcome within seconds. |
| `GET` | `/api/v1/alerts/history` | Resolved alerts, newest first, paged by `before`. |
| `GET` | `/api/v1/alerts/rules` | The built-in rules with their parameters in force, their defaults and what the evaluator's last pass said about each source. |
| `PUT` | `/api/v1/alerts/rules/{rule}` | Changes a rule's parameters (on or off, threshold within the rule's bounds, duration up to a day, severity). |
| `POST` | `/api/v1/alerts/silences` | Silences a rule (every subject, or one) for `minutes` from now: no notification is sent for its alerts that fire or resolve meanwhile. |
| `DELETE` | `/api/v1/alerts/silences/{id}` | Ends a silence now. |

