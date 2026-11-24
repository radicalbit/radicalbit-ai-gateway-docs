# Python SDK

The Python SDK manages the gateway from code: create projects, credentials and groups, validate a configuration, save it, mark it ready to serve and publish it. It is built for CI/CD pipelines and scripts that need to do what the admin interface does, without a person clicking through it.

Everything the SDK creates is the same object you see in the admin interface: a project created from a pipeline shows up on the **Projects** page, a credential on the **Credentials** page.

---

## Installation

The SDK needs Python 3.11 or later.

```bash
pip install radicalbit-ai-gateway-sdk
```

:::info[Enterprise Feature]{className="enterprise-badge"}
With [Access Control](../access-control/index.md) enabled, use the Enterprise SDK instead: the same SDK, which also signs in to Keycloak for you. See **[Enterprise: Signing In](./enterprise.md)**.
:::

---

## A First Pipeline

The example below takes a configuration from a file to production, and gives a team a credential that can call its route.

```python
from radicalbit_gateway import Gateway

config = open('config.yaml').read()

with Gateway('https://gateway.example.com') as gw:
    project = gw.projects.create(name='support-bot')
    slot_a = project.configs[0]

    gw.configs.validate(config_file=config)                 # dry run: saves nothing
    gw.configs.save(project.uuid, slot_a.uuid, config_file=config)
    gw.configs.approve(project.uuid, slot_a.uuid)           # ready to serve
    gw.configs.serve(project.uuid, slot_a.uuid)             # routes are live

    credential = gw.credentials.create(name='support-bot-prod')
    # Save credential.api_key now: no later response returns it

    group = gw.groups.create(name='support')
    gw.groups.add_credentials(group.uuid, keys=[credential.uuid])
    gw.groups.add_routes(group.uuid, project.uuid, routes=['support-route'])
```

The gateway's address can also come from the environment, so the same pipeline runs against every environment:

```bash
export RADICALBIT_GATEWAY_BASE_URL=https://gateway.example.com
```

```python
with Gateway() as gw:
    ...
```

---

## How It Works

The SDK is a thin client of the gateway's management API, the same API the admin interface uses.

- **One method, one API call.** The SDK never chains calls behind your back, so what happened on the gateway is always what you called.
- **Typed answers.** Each method returns the API's response as a Python model, with editor completion.
- **Typed errors.** Every refused call raises an exception from `errors`, carrying the HTTP status and a stable `code`: a pipeline can tell "already exists" from "not ready to serve" without parsing messages.
- **Safe retries.** A call that failed because the gateway was briefly unreachable or overloaded is sent again automatically, but only when sending it twice cannot do the work twice.
- **Sync and async.** `Gateway` for scripts and pipelines, `AsyncGateway` for asyncio applications, with the same methods.

The `configs` methods follow the [configuration lifecycle](../configuration/projects.md#configuration-lifecycle) of a project: each project has two configuration slots, so one can be prepared while the other is served.

---

## Methods, Arguments and Errors

The SDK documents itself: every method has a docstring with its arguments, what it returns and the errors it raises, shown by your editor and by `help()`.

```python
from radicalbit_gateway import Gateway, errors

with Gateway() as gw:
    help(gw)              # the client and its options
    help(gw.configs)      # one group of methods; the same for gw.projects, gw.credentials, ...

help(errors)              # the errors and what they carry
```

---

## Next Steps

- **[Examples](./examples.md)** — Pipelines for common tasks
- **[Enterprise: Signing In](./enterprise.md)** — Service accounts and users with Keycloak
