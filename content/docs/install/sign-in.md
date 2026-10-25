---
title: Sign in
section: install
slug: sign-in
order: 4
label: Sign in
summary: Three ways in: an API token to begin with, your identity provider for people, local accounts where you have none.
---
Both screens ask who you are, unless the control plane runs in development mode without a database.

| You have | Sign in with | Good for |
|---|---|---|
| Nothing set up yet | An **API token** made on the server | The first administrator, automation |
| An identity provider (OpenID Connect) | **Continue with** your provider | People, once an administrator has added it |
| No provider | A **username and password** (local account) | Small installations |

## The first time: an API token

On the server:

```sh
DATABASE_URL=… apelora-control-plane token create --name me --role fabric-admin
```

The token is shown once. Roles are `fabric-admin`, `operator`, `studio-designer` and `auditor`; every token expires (90 days unless you choose 1 to 365). In the Console, paste it into **API token** and choose **Sign in**. In the Studio, choose the chip that says **This browser · not connected**, then connect with the token. It is kept only for that browser tab.

<figure class="shot"><div class="shot-bar" aria-hidden="true"><i></i><i></i><i></i><span>Fabric Console · Sign-in</span></div><img src="/assets/docs/img/22-console-sign-in-1440x900.webp" width="1440" height="900" loading="lazy" alt="The Fabric Console sign-in page: an illustration of connected servers, and a card with a Continue with button for the organisation's identity provider and a link to use an API token instead."><figcaption>The sign-in page once an identity provider is set up. Sample data.</figcaption></figure>

## Then: your organisation's identity provider

An administrator adds the provider in the Console under **Identity & Access → Sign-in**. People then choose **Continue with …**; their account is created at the first sign-in *without any role*, and an administrator gives them one. Apelora never sees their password.

<figure class="shot"><div class="shot-bar" aria-hidden="true"><i></i><i></i><i></i><span>Fabric Console · Sign-in settings</span></div><img src="/assets/docs/img/24-console-sign-in-settings-1440x900.webp" width="1440" height="900" loading="lazy" alt="Fabric Console, Sign-in settings: identity providers with their status, a local accounts switch, a directory section and an API tokens section."><figcaption>Identity providers, local accounts, directories and tokens. Sample data.</figcaption></figure>

Everything else, including messages you may see and how local accounts and directories work, is in the [signing-in guide](/docs/install/signing-in/). Roles and what each may do: [access, roles and security](/docs/concepts/access-and-roles/).
