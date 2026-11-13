# SDK Reference

Every method of the [Python SDK](./index.md), how arguments and answers work, the errors it raises, when it retries, and the client options. The signatures and docstrings in your editor are the detailed reference: `help(gw.configs)` lists each method's arguments, return value and errors.

---

## Methods

| Method | What it does |
|---|---|
| **Projects** | |
| `gw.projects.create(name=, description=)` | Create a project, with two draft configuration slots (`A` and `B`) |
| `gw.projects.list(filter=, include_limits=)` | List projects; `filter=` one of `'prod'`, `'dev'` (by [status](../configuration/projects.md#project-status)), `'active'`, `'with_usage'` |
| `gw.projects.get(project_uuid, include_limits=)` | One project, with its configuration slots |
| **Configurations** | |
| `gw.configs.validate(config_file=)` | Check a YAML configuration against the schema, saving nothing |
| `gw.configs.save(project_uuid, config_uuid, config_file=)` | Save YAML text into a draft slot |
| `gw.configs.upload(project_uuid, config_uuid, file=)` | Save a `.yaml` / `.yml` file into a draft slot |
| `gw.configs.approve(project_uuid, config_uuid)` | Mark a draft as ready to serve |
| `gw.configs.cancel_approval(project_uuid, config_uuid)` | Send a ready-to-serve slot back to draft |
| `gw.configs.serve(project_uuid, config_uuid)` | Publish a ready-to-serve slot: its routes go live |
| `gw.configs.unserve(project_uuid, config_uuid)` | Take the served slot out of service |
| **Credentials** | |
| `gw.credentials.create(name=, expires_on=)` | Create a [credential](../credentials.md); the response is the only one with its value (`api_key`) |
| `gw.credentials.list(include_groups=, only_unassigned=, include_limits=)` | List credentials |
| `gw.credentials.get(key_uuid, include_groups=, include_limits=)` | One credential |
| `gw.credentials.delete(key_uuid)` | Delete a credential |
| `gw.credentials.rotate(key_uuid, grace_period=)` | Give a credential a new value ([rotation](../credentials.md#rotation)) |
| `gw.credentials.end_grace_period(key_uuid)` | Stop the previous value now ([ending a grace period early](../credentials.md#ending-a-grace-period-early)) |
| **Groups** | |
| `gw.groups.create(name=)` | Create a group |
| `gw.groups.list(include_routes=, include_keys=)` | List groups |
| `gw.groups.get(group_uuid, include_routes=, include_keys=)` | One group |
| `gw.groups.add_credentials(group_uuid, keys=)` | Add credentials to a group |
| `gw.groups.remove_credential(group_uuid, key_uuid)` | Remove a credential from a group |
| `gw.groups.add_routes(group_uuid, project_uuid, routes=)` | Let the group's credentials call routes of a project's served configuration |
| `gw.groups.remove_route(group_uuid, project_uuid, route_name)` | Remove a route from the group |

The management API calls credentials *keys* in its paths and fields; the SDK calls them credentials, except where it mirrors an API field (`key_uuid`, `add_credentials(..., keys=[...])`).

---

## Arguments and Answers

- **Identifiers are positional**, in the order of the API path: `gw.configs.serve(project_uuid, config_uuid)`. An identifier takes a `UUID` or its string.
- **Everything else is a keyword argument**, in snake_case: `gw.credentials.create(name='ci', expires_on=date(2027, 1, 1))`.
- **Optional arguments you don't pass are not sent**, so the gateway applies its own default. `None` is sent as an explicit `null`: `gw.credentials.rotate(key_uuid, grace_period=None)` means *no grace period*, and the argument is required so that cutting callers off is always a choice.
- **Fixed sets of values are plain strings**, checked by your type checker and completed by your editor: `gw.projects.list(filter='prod')`, `project.project_status == 'PROD'`.
- **Answers are Python models** with snake_case attributes: `project.configs[0].config_status`, `credential.api_key`. `model_dump(by_alias=True)` gives the API's own JSON.

### Uploading a file

`configs.upload` takes an open binary file, or a `(filename, content)` pair. The gateway accepts only a `.yaml` or `.yml` filename. For YAML already in memory, `configs.save` is simpler.

```python
with open('config.yaml', 'rb') as file:
    gw.configs.upload(project.uuid, slot.uuid, file=file)

gw.configs.upload(project.uuid, slot.uuid, file=('config.yaml', yaml_bytes))
gw.configs.save(project.uuid, slot.uuid, config_file=yaml_text)
```

### Newer gateways

An SDK older than the gateway keeps working: a field it doesn't know is kept in `model_extra`, and a value it doesn't know (a new state, a new status) comes through as sent instead of failing.

---

## Errors

Every refused call raises a subclass of `errors.GatewayError`, carrying the HTTP `status`, a stable `code`, a readable `message` and the full `body` of the answer.

| Status | Exception | Typical `code` |
|---|---|---|
| 400, 422 | `ValidationError` (`.details`: one entry per problem, with `loc`, `msg`, `type`) | `project_config_validation_error` |
| 401 | `AuthenticationError` | |
| 403 | `AuthorizationError` | |
| 404 | `NotFoundError` | `project_not_found`, `key_not_found` |
| 409 | `ConflictError` | `project_already_exists`, `config_not_approved`, `config_served_not_editable`, `key_rotation_conflict` |
| other | `GatewayError` | |
| no answer | `APIConnectionError`, or `APITimeoutError` when the time ran out (`status` is `None`) | |

`except errors.GatewayError` catches every failure of a call. Branch on `code`, not on `message`: codes are stable, messages are meant for people.

```python
from radicalbit_gateway import errors

try:
    gw.configs.save(project.uuid, slot.uuid, config_file=yaml_text)
except errors.ValidationError as error:
    for detail in error.details:
        print(detail['loc'], detail['msg'])        # where, and what is wrong
    raise
except errors.ConflictError as error:
    if error.code == 'config_served_not_editable':
        slot = other_slot                          # edit the slot that is not live
```

An invalid configuration answers one detail per problem, so a pipeline can report them all at once, each with its position in the YAML:

```text
['routes', 'support-route', 'temprature']   Extra inputs are not permitted
```

---

## Retries

A failed call is sent again up to `max_retries` times (2 by default), only when sending it twice cannot do the work twice:

| What happened | Reads (`list`, `get`) | Writes (`create`, `save`, `serve`, `delete`, ...) |
|---|:---:|:---:|
| The request never reached the gateway (connection refused, connect timeout) | Retried | Retried |
| The gateway refused it without processing it (429, 503) | Retried | Retried |
| The answer was lost or the call failed midway (read timeout, 500, 502, 504) | Retried | **Not retried** |

A write whose answer was lost may have happened: repeating it would answer "already exists" or "not found" for work already done, so the SDK raises instead and leaves the decision to you.

The wait between attempts doubles from 0.5 s up to 8 s, with jitter, or follows the gateway's `Retry-After` (up to 60 s). An upload from an open file is not retried, since the file can't be read twice; pass `('config.yaml', content_bytes)` to make it retryable.

---

## Client Options

```python
Gateway(
    base_url=None,      # default: RADICALBIT_GATEWAY_BASE_URL
    *,
    auth=None,          # any httpx2.Auth: how calls are authenticated
    timeout=30.0,       # seconds, or an httpx2.Timeout
    max_retries=2,
    transport=None,     # any httpx2 transport, e.g. httpx2.MockTransport in tests
    headers=None,       # sent with every request
)
```

Use the client as a context manager, or call `close()` when done. `with_options` gives a copy with different options for some calls, sharing the same connections:

```python
gw.with_options(timeout=120).configs.validate(config_file=big_config)
gw.with_options(max_retries=0, headers={'X-Run': run_id}).credentials.list()
```

### Async

`AsyncGateway` takes the same options and has the same methods, awaited:

```python
import asyncio
from radicalbit_gateway import AsyncGateway

async def main():
    async with AsyncGateway() as gw:
        prod, dev = await asyncio.gather(
            gw.projects.list(filter='prod'),
            gw.projects.list(filter='dev'),
        )

asyncio.run(main())
```

### Testing your pipeline

Pass an `httpx2.MockTransport` to test pipeline code without a gateway:

```python
import httpx2
from radicalbit_gateway import Gateway

def handler(request: httpx2.Request) -> httpx2.Response:
    assert request.url.path == '/public/api/v1/projects'
    return httpx2.Response(200, json=[])

gw = Gateway('http://gateway.test', transport=httpx2.MockTransport(handler))
assert gw.projects.list() == []
```

---

## Next Steps

- **[Enterprise: Signing In](./enterprise.md)** — Service accounts, users, roles
- **[Examples](./examples.md)** — Pipelines for common tasks
