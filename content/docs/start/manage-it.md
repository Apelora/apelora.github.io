---
title: Manage it
section: start
slug: manage-it
order: 6
label: Manage it
summary: A tour of Fabric Console: health, servers, applications, operations, audit, and adding servers.
---
Fabric Console is the administrator's screen. The menu on the left is the whole map; what you see depends on your role.

| Menu | What it is for |
|---|---|
| **Overview** | Connection, version and sign-in mode at a glance |
| **Health** | Is Apelora working, and if not, which part and why |
| **Servers** | Members, machines and join tokens, cluster settings, certificates, upgrades, preflight |
| **Applications** | Your applications, with Start, Restart and Stop |
| **Instances** | Every container and virtual machine, with logs and terminals |
| **Operations** | What the worker is doing and has done |
| **Networks**, **Storage** | Application networks; volumes, snapshots and backups |
| **Alerts** | What needs attention, and where it is sent |
| **Audit** | Who did what |
| **Identity & Access** | People, groups, roles, sign-in, tokens, approvals |
| **Administration** | API tokens, and backups of Apelora's own database |

## Health

Start here when something looks wrong. It reads again every few seconds and shows each server and each part of Apelora (database, worker, Incus) with its status and the reason.

<figure class="shot"><div class="shot-bar" aria-hidden="true"><i></i><i></i><i></i><span>Fabric Console · Health</span></div><img src="/assets/docs/img/28-console-health-degraded-1440x900.webp" width="1440" height="900" loading="lazy" alt="Fabric Console, Health: a degraded fabric with one server offline and a part of the platform not answering, each with the reason in words."><figcaption>A degraded fabric: each problem says what and why. Sample data.</figcaption></figure>

Reading it: [the Health page](/docs/runbooks/health-page/).

## Servers

<figure class="shot"><div class="shot-bar" aria-hidden="true"><i></i><i></i><i></i><span>Fabric Console · Servers</span></div><img src="/assets/docs/img/31-console-servers-members-1440x900.webp" width="1440" height="900" loading="lazy" alt="Fabric Console, Servers, Members: the cluster database with three of three voters answering and the majority safe, then four members with status, role, failure domain, Incus version and capacity, each with an Evacuate button."><figcaption>Members, with the cluster database's quorum above them. Sample data.</figcaption></figure>

- **Members:** quorum, each server's state and capacity. **Evacuate…** moves a server's instances away before maintenance; restore brings them back. [Maintenance](/docs/runbooks/member-maintenance/).
- **Machines and join tokens:** add a server: register, approve, enrol, admit. [Add a server](/docs/runbooks/member-join/). With MAAS configured, the machines it manages are listed too.
- **Cluster settings, Certificates, Upgrades, Preflight:** reviewed changes, certificate rotation, a rolling-upgrade guide, and checks that tell you what is not yet right.

<figure class="shot"><div class="shot-bar" aria-hidden="true"><i></i><i></i><i></i><span>Fabric Console · Machines</span></div><img src="/assets/docs/img/38-console-machines-1440x900.webp" width="1440" height="900" loading="lazy" alt="Fabric Console, Servers, Machines and join tokens: a form to add a machine, and a list of the machines MAAS manages with status, power state and hardware, with a Register button."><figcaption>Machines and join tokens, with machines from MAAS. Sample data.</figcaption></figure>

## Applications: start, restart, stop

**Applications** lists each application with how many instances run. Only the actions the server allows are offered, and when none is, it says why. Stop and Restart ask first; when clients of a single-instance or stateful module would lose service, the same dialog says so and asks again. Instances are stopped in dependency order and data is kept.

<figure class="shot"><div class="shot-bar" aria-hidden="true"><i></i><i></i><i></i><span>Fabric Console · Applications</span></div><img src="/assets/docs/img/36-console-application-stop-1440x900.webp" width="1440" height="900" loading="lazy" alt="Fabric Console, Applications: a dialog asking Stop shop? and explaining that instances are stopped in dependency order and data and volumes are kept."><figcaption>Stopping asks first. Sample data.</figcaption></figure>

## Operations

Every change is a job. **Operations** lists them newest first, with filters for state, kind and application. A failed job can be retried and a waiting or running one cancelled, each only if you may; each attempt is recorded. Open a row for its attempts and the Incus operations behind it.

<figure class="shot"><div class="shot-bar" aria-hidden="true"><i></i><i></i><i></i><span>Fabric Console · Operations</span></div><img src="/assets/docs/img/35-console-operations-1440x900.webp" width="1440" height="900" loading="lazy" alt="Fabric Console, Operations: filters for state, kind of change and application, and a list of jobs with their target, status and attempts; a failed create shows its error and a Retry button, a running stop shows Cancel."><figcaption>A failed job shows why, and offers Retry. Sample data.</figcaption></figure>

Logs, retries and the audit trail together: [troubleshooting](/docs/runbooks/troubleshooting/).

## Instances, networks, storage, alerts

- **Instances:** each instance's detail, its log files and console log, and a **terminal** into a running module (approval may be needed in production). [Terminal sessions](/docs/guides/terminal-sessions/).
- **Networks, Storage:** what Apelora created; volumes that outlive their instance, with snapshots and backups. [Volumes](/docs/runbooks/volumes/).
- **Alerts:** fifteen built-in rules with signed webhooks. [Alerts](/docs/runbooks/alerts/).

## Audit

Every change is recorded with who, what and the outcome, including refusals. Filter by person, action, target, outcome and time; the filters stay in the address, so a link shares a view. Export as CSV or JSON lines.

<figure class="shot"><div class="shot-bar" aria-hidden="true"><i></i><i></i><i></i><span>Fabric Console · Audit</span></div><img src="/assets/docs/img/37-console-audit-1440x900.webp" width="1440" height="900" loading="lazy" alt="Fabric Console, Audit: filters and a list of events with who, the action, the outcome and, for a refusal, the reason."><figcaption>A refusal is recorded with its reason. Sample data.</figcaption></figure>

## Roles and sign-in

Roles apply at organisation, project and application scope, and a token can never grant more than its creator holds. [Access, roles and security](/docs/concepts/access-and-roles/), [identity and authorization](/docs/concepts/identity-and-authorization/).

Next: [when something goes wrong](/docs/start/when-something-goes-wrong/).
