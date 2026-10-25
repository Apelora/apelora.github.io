---
title: Try it on your workstation
section: start
slug: try-it-on-your-workstation
order: 1
label: Try it on your workstation
summary: See the designer in a minute, or run the whole stack against a throwaway Incus cluster in virtual machines. No hardware needed.
---
Two levels. Each says what it proves.

> **Get the code.** The source is in the [Apelora/apelora-fabric repository on GitHub](https://github.com/Apelora/apelora-fabric). Clone it, then run the commands below from its top folder.

## 1. The designer only

```sh
npm install
npm run dev          # Studio at http://127.0.0.1:5173
```

Open the address. You get Apelora Studio with the sample application on the canvas. Everything runs in the browser against mock data. Nothing is sent anywhere and nothing is deployed: the header says **Mock · Design only**. Good for learning the canvas.

## 2. The whole stack, against a test cluster

This starts PostgreSQL, a disposable {{fact:labServersWord}}-server Incus cluster (virtual machines standing in for physical servers), the control plane, the worker and both screens.

```sh
docker compose -f infra/dev/compose.yaml up -d       # PostgreSQL on 127.0.0.1:15432
bash scripts/test-cluster/up.sh                      # the test cluster (needs Lima: brew install lima)
source ~/.config/apelora/test-cluster/env            # its address and client certificates
cargo run -p apelora-control-plane                   # API at http://127.0.0.1:8080
cargo run -p apelora-deployment-worker               # carries out the jobs (second terminal)
npm run dev                                          # Studio at http://127.0.0.1:5173
npm run dev:console                                  # Fabric Console at http://127.0.0.1:5174
```

Run each long-lived command in its own terminal. Inside the repository, `cargo` finds the development database by itself.

Create your first API token (shown once):

```sh
cargo run -p apelora-control-plane -- token create --name me --role fabric-admin
```

Paste it into the Console's sign-in page. Details in [sign in](/docs/install/sign-in/).

> **No database, no sign-in.** `DATABASE_URL= cargo run -p apelora-control-plane` starts the API with mock data and no authentication. It only listens on the loopback address. Use it for a quick look, never on a shared machine.

## What a test cluster can show you

Everything Apelora does with Incus: deployments, networking, volumes, and recovery when a server dies. It cannot show what depends on real hardware: disk and network speed, a management controller (BMC), or network boot. Try those on your own servers.

When you are done: `bash scripts/test-cluster/down.sh` removes the test cluster.
