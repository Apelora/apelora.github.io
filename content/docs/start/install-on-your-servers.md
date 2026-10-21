---
title: Install on your servers
section: start
slug: install-on-your-servers
order: 2
label: Install on your servers
summary: The path from bare servers to a control plane you can sign in to: an Incus cluster, PostgreSQL, the control plane and worker, and the two web screens.
---
There is no installer or packaged release yet: you build from source and run the pieces yourself. This page is the map; each step names the page with the detail.

> **Heads-up.** The pieces below are tested together on the lab cluster. The example web-server configuration has not been run. Treat a first installation as an evaluation, not production.

## 1. Prepare the Incus cluster

- Three or more servers running a Linux kernel 6.12 or newer and **Incus 7.0 LTS**, the same release on each, joined into one cluster. Three servers keep quorum when one fails.
- A storage pool for root disks and volumes. Optionally a backup pool, and a shared pool if modules with data should restart on another server after a failure.
- An OVN network for application traffic; Apelora creates one network per application on it.
- A **restricted Incus project** for Apelora to deploy into, for example `apelora`.
- **Two client certificates** trusted by Incus: a *deploy* identity restricted to that project (used by the control plane and the worker) and an *admin* identity that is unrestricted (used only by the control plane, for join tokens). Why two: [ADR 0003](/docs/decisions/0003-incus-identities-and-cluster-join/).

`scripts/test-cluster/up.sh` in the repository builds exactly this in virtual machines and is the best worked example. [The test cluster](/docs/contribute/test-cluster/) explains each choice.

## 2. Prepare PostgreSQL

Any PostgreSQL the control plane and worker can reach (development uses 18). Create a database and a user for Apelora. The schema is created and upgraded automatically when the control plane or the worker connects.

## 3. Build

```sh
cargo build --release -p apelora-control-plane -p apelora-deployment-worker
npm ci && npm run build        # apps/studio/dist and apps/fabric-console/dist
```

## 4. Configure and run

Both services read environment variables; secrets come from the environment or your secret store, never from the repository.

| Variable | For | Meaning |
|---|---|---|
| `DATABASE_URL` | both | The PostgreSQL connection. Without it the control plane runs unauthenticated on loopback only. |
| `APELORA_INCUS_URL` | both | An Incus cluster member's address, `https://<server>:8443`. |
| `APELORA_INCUS_CLIENT_CERT`, `APELORA_INCUS_CLIENT_KEY` | both | The deploy identity (PEM files). |
| `APELORA_INCUS_SERVER_CERT` | both | The cluster's server certificate, which Apelora pins. |
| `APELORA_INCUS_TLS_SERVER_NAME` | both, optional | The name to verify it against, when not the URL's host. |
| `APELORA_INCUS_ADMIN_CLIENT_CERT`, `APELORA_INCUS_ADMIN_CLIENT_KEY` | control plane only | The admin identity. Never give it to the worker. |
| `APELORA_DEPLOY_PROJECTS` | control plane | The Incus projects Apelora may deploy into. |
| `APELORA_API_ADDR` | control plane | Where the API listens (default `127.0.0.1:8080`). |
| `APELORA_TLS_CERT`, `APELORA_TLS_KEY` | control plane | TLS of its own; or `APELORA_BEHIND_PROXY=1` behind a proxy that terminates TLS. |

The control plane refuses to listen on a non-loopback address without TLS or a declared proxy, and without a database. Run `apelora-control-plane` and `apelora-deployment-worker` under your service manager so they restart; metrics and health endpoints are described in [monitoring](/docs/concepts/monitoring/). Settings for a feature are described on that feature's page, for example [alerts](/docs/runbooks/alerts/) and [terminal sessions](/docs/guides/terminal-sessions/).

## 5. Serve Studio and Console

Serve the two `dist` folders as static files over HTTPS, each on its own host name, and pass `/api/` to the control plane. The repository's example, `infra/serve/apelora.conf` (NGINX syntax), also sets the security headers. The browser then talks to one origin only.

## 6. Create the first administrator

```sh
DATABASE_URL=… apelora-control-plane token create --name me --role fabric-admin
```

Sign in to the Console with the token. Then open **Servers → Preflight** and **Health**: they tell you what is not yet right (a missing project, an unreachable member). Set up your organisation's identity provider afterwards: [signing in](/docs/guides/signing-in/).

## 7. Add servers later

In the Console, **Servers → Machines and join tokens** registers a machine, approves it and shows a single-use join token; `scripts/enrol/enrol-member.sh` on the new server joins it to the cluster. The new server is held out of placement until you admit it after its checks. The steps: [add a server to the cluster](/docs/runbooks/member-join/).

## Keep going

[Sign in](/docs/start/sign-in/), then [design your first application](/docs/start/design-your-first-application/). Without internet access: [running without internet access](/docs/concepts/disconnected/).
