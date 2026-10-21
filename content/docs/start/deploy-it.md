---
title: Deploy it
section: start
slug: deploy-it
order: 5
label: Deploy it
summary: Connect the Studio to the control plane, review exactly what will change, deploy, and watch the application come up.
---
Deploying is a review, then a decision. Nothing changes on your servers until you press the last button.

## Before you deploy

- The control plane and the worker are running, and the Studio is **connected**: choose the header chip *This browser · not connected* and [sign in](/docs/start/sign-in/). The chip then names the control plane.
- You hold the **deploy** permission, and the Incus project you want is on the allow-list (`APELORA_DEPLOY_PROJECTS`).
- The **capacity chip** reads *fits*. Choosing it shows what the design asks for next to what is free on each server:

<figure class="shot"><div class="shot-bar" aria-hidden="true"><i></i><i></i><i></i><span>Apelora Studio · capacity check</span></div><img src="/assets/docs/img/30-studio-capacity-1440x900.webp" width="900" height="560" loading="lazy" alt="Studio's capacity check: the design fits on one server, with the vCPU, memory and volume space it asks for next to what is free, and the servers listed, one of them offline."><figcaption>What the design asks for, next to what is free. An offline server takes nothing. Sample data.</figcaption></figure>

## 1. Open Deploy

Choose **Deploy…** in the header. The dialog names the application and the Incus project, and lists which modules will deploy and which are **design only**.

<figure class="shot"><div class="shot-bar" aria-hidden="true"><i></i><i></i><i></i><span>Apelora Studio · Deploy to the cluster</span></div><img src="/assets/docs/img/40-studio-deploy-plan-1440x900.webp" width="1440" height="900" loading="lazy" alt="The Deploy to the cluster dialog: a table with two NGINX modules, their instance names and the change Create for each, a collapsed list of connections in this design, and the button Deploy 2 changes."><figcaption>The plan. Nothing has changed yet. Sample data.</figcaption></figure>

## 2. Read the plan

**Preview** asks the control plane what deploying would do against what exists now. Each row is a module, the instance it becomes, and a change: *create*, *keep*, or *conflict*. Read three things:

- **Conflicts block the deploy.** For instance, an instance with that name exists and Apelora did not create it. Nothing is sent until you fix it.
- **Warnings** such as *nginx-02 runs as one instance* point at single points of failure.
- **Connections in this design** lists the network rules your cables become: each connection becomes an allow rule, and everything else between the application's instances is rejected. Modules are told their providers' addresses.

## 3. Deploy

**Deploy N changes** saves the design as an immutable revision and queues one job per change. Repeating the request never creates duplicates. The dialog follows the jobs until they finish.

## 4. Watch it come up

Close the dialog. Each module on the canvas now shows live state from Incus, and the header says *Live · 2 running in Incus*:

<figure class="shot"><div class="shot-bar" aria-hidden="true"><i></i><i></i><i></i><span>Apelora Studio · live state</span></div><img src="/assets/docs/img/41-studio-live-status-1440x900.webp" width="1440" height="900" loading="lazy" alt="The Studio canvas after a deployment: the two NGINX modules show a green status dot, the modules that did not deploy a grey one, and the header says Live, 2 running in Incus."><figcaption>Green: running. Grey: design only. The live overlay never changes your design. Sample data.</figcaption></figure>

A module shows *Running*, *Degraded* (some replicas down), *Unhealthy* (running but failing its port check) or nothing yet. Hover or focus a module's dot for each replica, the server it runs on and its service address.

## If it does not work

| You see | Likely cause | Where to look |
|---|---|---|
| *Design only* for every module | None of them has a runtime yet | [Module catalog](/docs/reference/module-catalog/) |
| A conflict row | The name is taken by something Apelora did not create | Rename, or remove it in Incus |
| The Deploy dialog says the control plane is unreachable | The Studio is not connected, or the API is down | [The control plane or the worker is down](/docs/runbooks/api-outage/) |
| Jobs stay waiting | The worker is not running | Console → Operations |
| The deploy identity cannot see its project | The project or the certificate's restriction is wrong | [Deploy identity](/docs/runbooks/deploy-identity/) |
| *Not enough memory…* on a create job | The cluster is full | Capacity chip; add a server |

Next: [manage it](/docs/start/manage-it/).
