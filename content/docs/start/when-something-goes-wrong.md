---
title: When something goes wrong
section: start
slug: when-something-goes-wrong
order: 7
label: When something goes wrong
summary: Where to look first, and which runbook to open for a failed server, lost quorum, a failing replica, storage, certificates or a security incident.
---
Start with **Health** in the Console, then open **Operations** for failed jobs and **Audit** for what changed. Running instances are not affected by Apelora being down: Incus runs them and Apelora is not in the data path.

## Which runbook

| Symptom | Runbook |
|---|---|
| A server is down | [A server fails](/docs/runbooks/member-failure/) |
| The cluster cannot reach a majority | [The cluster loses quorum](/docs/runbooks/quorum-loss/) |
| A replica fails its health check | [A replica fails its health check](/docs/runbooks/replica-unhealthy/) |
| The Console or Studio cannot reach the API | [The control plane or the worker is down](/docs/runbooks/api-outage/) |
| A pool is filling up, or backups stopped | [A storage problem](/docs/runbooks/storage-incident/) |
| Applications cannot talk to each other | [Network incidents](/docs/runbooks/network-incident/) |
| A deploy fails, or a job keeps failing | [Troubleshooting with logs and the audit trail](/docs/runbooks/troubleshooting/) |
| A certificate is about to expire | [Rotate Apelora's Incus certificates](/docs/runbooks/certificates/) |
| A stolen token or misused account | [A security incident](/docs/runbooks/security-incident/) |
| You need to service a server | [Maintenance on a server](/docs/runbooks/member-maintenance/) |

## When a server fails

Incus marks it offline after about 20 seconds. Stateless replicas are replaced on other servers after a delay. A module with data on shared storage restarts elsewhere only once the failed server is **fenced**: proven stopped, so two servers never write the same disk. In the lab a container with data ran again 144 to 155 seconds after a forced stop. [A server fails](/docs/runbooks/member-failure/) has the timeline, what is automatic and what is not, and what has not been tested. Every runbook states which of its steps were.

## Looking after Apelora itself

Back up and restore its database: [Back up and restore Apelora's own database](/docs/runbooks/apelora-database-backup/). Upgrade Incus without downtime: [a rolling Incus upgrade](/docs/runbooks/incus-rolling-upgrade/). Update without internet access: [offline update](/docs/runbooks/offline-update/). All runbooks: [Runbooks](/docs/runbooks/).
