# SDK Examples

Pipelines for common tasks with the [Python SDK](./index.md). Each one runs as is against a gateway; with [Access Control](../access-control/index.md) enabled, use the Enterprise package as in the [last example](#enterprise-the-same-pipeline-with-a-service-account).

---

## Check a Configuration on Every Pull Request

Fail the pull request when the configuration is invalid, before anything reaches the gateway. `configs.validate` saves nothing and reports every problem at once.

```python title="scripts/check_config.py"
import sys

from radicalbit_gateway import Gateway, errors

config = open(sys.argv[1]).read()

with Gateway() as gw:
    try:
        gw.configs.validate(config_file=config)
    except errors.ValidationError as error:
        for detail in error.details:
            path = '.'.join(str(part) for part in detail['loc'])
            print(f'::error file={sys.argv[1]}::{path}: {detail["msg"]}')
        sys.exit(1)

print('Configuration is valid')
```

```yaml title=".github/workflows/gateway-config.yaml"
on:
  pull_request:
    paths: ['gateway/config.yaml']

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: pip install radicalbit-ai-gateway-sdk
      - run: python scripts/check_config.py gateway/config.yaml
        env:
          RADICALBIT_GATEWAY_BASE_URL: ${{ vars.GATEWAY_URL }}
```

---

## Publish a Configuration Without Downtime

Every project has two slots. Write the new configuration into the slot that is **not** served, approve it and serve it: the gateway switches to it in one step, and the slot that was live keeps the previous configuration for a rollback.

```python title="scripts/deploy_config.py"
import sys

from radicalbit_gateway import Gateway

project_name, config_path = sys.argv[1], sys.argv[2]
config = open(config_path).read()

with Gateway() as gw:
    project = next(p for p in gw.projects.list() if p.name == project_name)
    target = next(c for c in project.configs if c.uuid != project.served_config_uuid)

    gw.configs.save(project.uuid, target.uuid, config_file=config)  # back to DRAFT
    gw.configs.approve(project.uuid, target.uuid)                   # READY_TO_SERVE
    gw.configs.serve(project.uuid, target.uuid)                     # live

    print(f'{project_name}: slot {target.slot} is served')
```

Saving into a slot always puts it back in `DRAFT`, even if it was ready to serve, so a reviewed configuration can't be changed after its approval without a new one.

### Roll back

The previously served slot went back to `DRAFT` with its configuration intact. Approve it and serve it again:

```python
project = gw.projects.get(project_uuid)
previous = next(c for c in project.configs if c.uuid != project.served_config_uuid)

gw.configs.approve(project.uuid, previous.uuid)
gw.configs.serve(project.uuid, previous.uuid)
```

---

## Give a Team Access to a Route

Create a credential that expires, put it in a group, and let the group call one route. The credential's value is returned only by `create`: store it right away.

```python
from datetime import date

from radicalbit_gateway import Gateway

with Gateway() as gw:
    project = next(p for p in gw.projects.list() if p.name == 'support-bot')

    credential = gw.credentials.create(name='support-team', expires_on=date(2027, 6, 30))
    # Save credential.api_key now: no later response returns it

    group = gw.groups.create(name='support-team')
    gw.groups.add_credentials(group.uuid, keys=[credential.uuid])
    gw.groups.add_routes(group.uuid, project.uuid, routes=['support-route'])
```

The team then calls the route with the credential, as in [Quick Start](../quick-start.md):

```bash
curl https://gateway.example.com/v1/chat/completions \
  -H "Authorization: Bearer $SUPPORT_TEAM_GATEWAY_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "support-bot/support-route", "messages": [{"role": "user", "content": "Hello"}]}'
```

---

## Make Setup Repeatable

Running a setup script twice should not fail. "Already exists" is a `ConflictError` with its own `code`, so a script can reuse what is there:

```python
from radicalbit_gateway import Gateway, errors

def ensure_group(gw: Gateway, name: str):
    try:
        return gw.groups.create(name=name)
    except errors.ConflictError as error:
        if error.code != 'group_already_exists':
            raise
        return next(g for g in gw.groups.list() if g.name == name)
```

---

## Rotate a Credential

Give a credential a new value. During the [grace period](../credentials.md#grace-period) both values work, so callers can switch without downtime.

```python
from radicalbit_gateway import Gateway, errors

with Gateway() as gw:
    try:
        credential = gw.credentials.rotate(key_uuid, grace_period='7 days')
    except errors.ConflictError as error:
        if error.code == 'key_rotation_conflict':
            print('A grace period is already running: end it first.')
        raise
    # Save the new credential.api_key now: no later response returns it
```

When a value has leaked, rotate with no grace period: the leaked value stops working at once.

```python
gw.credentials.rotate(key_uuid, grace_period=None)
```

---

## Enterprise: the Same Pipeline with a Service Account

:::info[Enterprise Feature]{className="enterprise-badge"}
This example needs the **Enterprise edition** of the Radicalbit AI Gateway, with the [Keycloak IDP plugin](../access-control/keycloak-idp.md).
:::

With Access Control enabled, the pipeline signs in as a [service account](./enterprise.md#a-pipeline-service-account). The code only changes its import; the sign-in comes from the environment.

```python title="scripts/deploy_config.py"
from radicalbit_gateway_enterprise import Gateway, errors   # instead of radicalbit_gateway
```

```yaml title=".github/workflows/gateway-deploy.yaml"
on:
  push:
    branches: [main]
    paths: ['gateway/config.yaml']

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: pip install radicalbit-ai-gateway-enterprise-sdk
      - run: python scripts/deploy_config.py support-bot gateway/config.yaml
        env:
          RADICALBIT_GATEWAY_BASE_URL: ${{ vars.GATEWAY_URL }}
          RADICALBIT_GATEWAY_KEYCLOAK_URL: ${{ vars.KEYCLOAK_URL }}
          RADICALBIT_GATEWAY_KEYCLOAK_REALM: ${{ vars.KEYCLOAK_REALM }}
          RADICALBIT_GATEWAY_CLIENT_ID: ci-pipeline
          RADICALBIT_GATEWAY_CLIENT_SECRET: ${{ secrets.GATEWAY_CLIENT_SECRET }}
```

Serving is reserved to ADMINs. To keep a person in the loop, give the pipeline the BUILDER role: it saves and approves, and an ADMIN serves from the admin interface.

```python
try:
    gw.configs.serve(project.uuid, target.uuid)
except errors.AuthorizationError as error:
    if error.code != 'role_not_allowed':
        raise
    print(f'Slot {target.slot} is ready to serve: an ADMIN can publish it.')
```

---

## Next Steps

- **[Reference](./reference.md)** — Every method, errors, retries and client options
- **[Enterprise: Signing In](./enterprise.md)** — Service accounts, users, roles
