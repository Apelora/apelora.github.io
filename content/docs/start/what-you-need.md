---
title: Before you start
section: start
slug: what-you-need
order: 0
label: Before you start
summary: What Apelora Fabric is made of, what it needs, and which way in suits you.
---
Apelora Fabric lets you draw an application, then runs it on your own Linux servers. These pages take you from nothing to a running, managed application, one step at a time. Each step links to the page with the details.

> **Early release.** Apelora Fabric is new. Try it on a test cluster or a few spare servers before you rely on it. {{fact:deployableWord|cap}} of the {{fact:modules}} catalog modules deploy today; the others can be designed but not yet deployed.

## The parts

<figure class="shot paper"><a href="/assets/docs/svg/platform-layers.svg"><img src="/assets/docs/svg/platform-layers.svg" width="1200" height="600" loading="lazy" alt="Apelora's layers: people, Studio and Fabric Console, the control plane, the Incus cluster with OCI containers, system containers and VMs, the storage pools, OVN, and the physical servers."></a><figcaption>Illustration: who talks to whom. Select it to open it full size.</figcaption></figure>

| Part | What it is | Where it runs |
|---|---|---|
| **Apelora Studio** | The designer, in your browser | Static files, served by any web server |
| **Fabric Console** | Administration: servers, applications, operations, audit | Static files, served the same way |
| **Control plane** | The API: plans, roles, audit. Rust, backed by PostgreSQL | One process, next to the database |
| **Deployment worker** | Carries out jobs, enforces the network, replaces lost replicas | One or more processes |
| **PostgreSQL** | Apelora's own records. Not your applications' data | Anywhere the control plane and worker can reach |
| **Incus cluster** | Runs your modules as containers and virtual machines | Your servers: three or more |

Apelora owns the application: its design, its connections, its replicas and their health. Incus owns the servers: membership, placement and the instances. Apelora talks to Incus only through its documented REST API.

## What you need

- **To try it:** a Mac or Linux workstation, Node.js 22 or newer, and for the full test cluster Rust (the repository pins the toolchain), Docker and [Lima](https://lima-vm.io). No hardware to buy.
- **To run it on your servers:** three or more Linux servers (kernel 6.12 or newer) with Incus {{fact:incusSeries}} LTS clustered; PostgreSQL; a machine for the control plane and worker; and a way to serve two sets of static files over HTTPS.
- **To deploy something:** an Incus project for Apelora to deploy into, and an identity Apelora may use there.

## Choose your way in

1. **See the designer in a minute.** [Try it on your workstation](/docs/start/try-it-on-your-workstation/), first step. Mock data, nothing deployed.
2. **Run the whole thing on one machine.** The same page, second step: a throwaway Incus cluster in virtual machines.
3. **Set it up on your own servers.** Plan the [servers and network](/docs/install/servers-and-network/), [install Incus](/docs/install/install-incus/), then [install Apelora Fabric](/docs/install/install-on-your-servers/).

Then, in order: [sign in](/docs/install/sign-in/), [design your first application](/docs/start/design-your-first-application/), [deploy it](/docs/start/deploy-it/), [manage it](/docs/start/manage-it/), and keep [when something goes wrong](/docs/start/when-something-goes-wrong/) at hand.
