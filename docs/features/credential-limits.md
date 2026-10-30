# Credential Limits

Route limits cap what a route accepts, whoever calls it. A credential limit caps what one credential consumes, whatever route it calls: every request authenticated by that credential counts against its limits, on every route of every project.

## Overview

Credential limits count separately from the [rate](./rate-limiting.md), [token](./token-limiting.md) and [budget](./budget-limiting.md) limits declared on a route, and all of them apply: a request passes only if it reaches none of them. A credential without limits behaves as before, and only route limits apply to it.

Limits are set on a credential from the UI or the management API. They are not part of a project configuration.

---

## Categories

| Category | Value in the API | What it counts | Max |
|----------|------------------|----------------|-----|
| Requests | `request_rate` | Requests | A whole number, at least 1 |
| Input tokens | `token_input` | Input tokens | A whole number, at least 1 |
| Output tokens | `token_output` | Output tokens | A whole number, at least 1 |
| Budget | `budget` | Cost, input and output together, in USD | Greater than 0 |

---

## Window Type and Window

Every limit counts within a window, which runs in one of two ways:

- **Fixed** (`FIXED_WINDOW`): the window starts at the first request and lasts its full length.
- **Aligned** (`ALIGNED_FIXED_WINDOW`): the window follows the UTC clock, so every credential resets at the same moment. A 1 day aligned window runs from midnight to midnight UTC.

The window comes from a fixed list:

| Window type | Allowed windows |
|-------------|-----------------|
| Aligned | `1 minute`, `5 minutes`, `10 minutes`, `15 minutes`, `30 minutes`, `1 hour`, `2 hours`, `3 hours`, `4 hours`, `6 hours`, `8 hours`, `12 hours`, `1 day` |
| Fixed | The same, plus `1 week` and `1 month` |

A month is always 30 days.

The gateway stores a window in its largest exact unit: `60 seconds`, `60` and `1 minute` are the same window, saved as `1 minute`; `24 hours` is saved as `1 day`. A window of 0 or less, or one outside the list, is refused.

---

## Several Limits on One Credential

A credential can hold several limits of the same category, as long as the window type or the window differ. All of them apply, so the tightest one binds first. For example, 100 requests per hour and 1,000 requests per day.

Two limits with the same category, window type and window are the same limit: adding it a second time is refused. Edit the existing one instead.

---

## Limits Looser Than a Route

A credential reaches the routes its group is associated with. When a credential limit allows more than one of those routes does, in the same category, the route limit is reached first and the credential limit never binds there. The gateway saves the limit anyway and returns a warning naming the route and both values:

> acme/chat-prod: route allows 50 requests / 1 min, this credential 100 requests / 1 min. The route limit is reached first.

Limits on different windows are compared by rate: 50 requests per minute is the same as 3,000 per hour. Input and output tokens are compared with the route's input and output token limits, a budget with the route's budget. Only routes of the published configurations count.

The warning appears after adding limits, after changing a max, and after applying limits to a group, for each credential that received a limit. A conflict left on **Skip** keeps the credential's own max, so it gives no warning.

A limit can also become looser than a route without being touched: when a stricter route is published, when its group is associated with a route, or when the credential joins a group. So the saved limits are checked every time they are read. The **Limits** column of **Credentials** says how many are never reached, and the **Limits** dialog names the route under each of them. In the API, `GET /public/api/v1/keys` and `GET /public/api/v1/keys/{key_uuid}` with `include_limits=true` return them as `limitWarnings`, in the same shape as `warnings` below.

---

## Expired Credentials

The limits of an expired credential can no longer be added, edited or deleted. They stay listed, read-only.

---

## Externally Managed Credentials

:::info[Enterprise Feature]{className="enterprise-badge"}
Externally managed credentials are available exclusively in the **Enterprise edition** of the Radicalbit AI Gateway, with the [Keycloak IDP plugin](../access-control/keycloak-idp.md).
:::

Credentials created by the identity provider sync can have limits too, like gateway-managed ones. Only an **ADMIN** can manage limits, as for every other credential operation.

The sync keeps the limits: when a user moves to another group and their credential is recreated during the same sync run, the limits are copied to the new credential. If a user leaves every synced group, their credential is deleted together with its limits.

---

## Managing Limits from the UI

1. Open **Credentials**. The **Limits** column shows how many limits each credential has; hover it to see them.
2. Open the row menu (⋮) and choose **Manage limits**.
3. Choose **Add limits**, fill one row per limit (category, window type, window, max), add more rows with **Add another limit**, then save.

To edit a limit, open its menu (⋮) in the list and choose **Edit**. The category can't change; the window type, window and max can:

- **Only the max changes**: the counter is kept. What the credential already consumed in the current window still counts against the new max.
- **The window type or window changes**: it is a different limit, so it replaces the old one and its counter restarts from zero. Before saving, a confirmation says so and, if alert rules watch the old limit and no other limit keeps the same category and window, how many will become stale.

To delete a limit, open its menu (⋮) in the list and choose **Delete**. If alert rules watch that limit, the confirmation says how many will become stale. The rules are not changed.

---

## Applying Limits from a Group

A group holds no limits. From a group you can copy a set of limits onto every credential in it, in one step:

- each credential receives its own copy, with its own counter: the credentials don't share a quota;
- only the credentials in the group at that moment receive them. A credential added to the group later gets nothing;
- removing a credential from the group does not touch the limits it already has;
- after the copy, the limits belong to each credential: change or delete them from **Credentials**.

A group with no credentials has nobody to copy the limits to, so applying is refused.

### Conflicts

A credential that already has a limit with the same category, window type and window is a conflict. You decide each conflict:

- **Skip** (the default) leaves that credential's limit as it is;
- **Overwrite** replaces its max with the new one. The counter is kept: what the credential already consumed in the current window still counts.

Nothing is overwritten unless you choose to.

### Expired and Externally Managed Credentials

Expired credentials in the group receive the limits too, even though they can't make requests. Groups and credentials synced from the identity provider can receive limits like gateway-managed ones.

### From the UI

1. Open **Groups**, then the row menu (⋮), or the menu of the group page, and choose **Apply limits to credentials**.
2. Fill one row per limit, as when adding limits to a credential. Add more rows with **Add another limit**.
3. The **Preview** lists every credential in the group with what it receives: **New** for a limit it doesn't have yet, the old and new max for a conflict. Choose **Skip** or **Overwrite** for each conflict, or all at once with **Skip all** / **Overwrite all**. Expired credentials are marked.
4. Choose **Apply to N credentials**. The result says how many limits were added, overwritten and skipped, and lists the [routes with a stricter limit](#limits-looser-than-a-route).

### With the API

`POST /public/api/v1/groups/{group_uuid}/limits` copies the limits onto the credentials in the group, in a single transaction. `limits` takes the same fields as [adding limits to a credential](#add-limits). `skip` lists the conflicts to leave as they are: **a conflict not listed in `skip` is overwritten**.

```bash
curl -X POST http://localhost:9000/public/api/v1/groups/<group_uuid>/limits \
  -H "Content-Type: application/json" \
  -d '{
    "limits": [
      { "category": "request_rate", "algorithm": "FIXED_WINDOW", "windowSize": "1 minute", "value": 50 },
      { "category": "budget", "algorithm": "ALIGNED_FIXED_WINDOW", "windowSize": "1 day", "value": 20 }
    ],
    "skip": [
      { "keyUuid": "<key_uuid>", "category": "request_rate", "algorithm": "FIXED_WINDOW", "windowSize": "1 minute" }
    ]
  }'
```

| Field of `skip` | Required | Description |
|-----------------|----------|-------------|
| `keyUuid` | Yes | The credential whose limit stays as it is |
| `category` | Yes | The category of the limit |
| `algorithm` | No | `FIXED_WINDOW` (default) or `ALIGNED_FIXED_WINDOW` |
| `windowSize` | Yes | The window, in any unit: `60` and `1 minute` are the same window |

The response says, for each credential and each limit, what happened: `added`, `overwritten` or `skipped`. On a conflict it also gives the max the credential had before (`previousValue`). `warnings` lists the [routes with a stricter limit](#limits-looser-than-a-route) than the limits the credential received.

```json
{
  "members": [
    {
      "keyUuid": "3b9e…",
      "keyName": "billing-service",
      "expired": false,
      "limits": [
        { "category": "request_rate", "algorithm": "FIXED_WINDOW", "windowSize": "1 minute", "outcome": "skipped", "previousValue": 100.0, "newValue": 50.0 },
        { "category": "budget", "algorithm": "ALIGNED_FIXED_WINDOW", "windowSize": "1 day", "outcome": "added", "previousValue": null, "newValue": 20.0 }
      ],
      "warnings": []
    }
  ]
}
```

| Status | When |
|--------|------|
| `400` | The group has no credentials (`group_has_no_credentials_bad_request`) |
| `404` | The group does not exist |
| `422` | The request is invalid, for example a window outside the list. `loc` points at the field, e.g. `["body", "limits", 0, "windowSize"]` |

---

## Managing Limits with the API

The management API is served by the gateway under `/public/api/v1`. In the Enterprise edition, with access control enabled, these endpoints are reserved to the ADMIN role.

### Add Limits

`POST /public/api/v1/keys/{key_uuid}/limits` adds one or more limits in a single call: either all of them are saved, or none.

```bash
curl -X POST http://localhost:9000/public/api/v1/keys/<key_uuid>/limits \
  -H "Content-Type: application/json" \
  -d '{
    "limits": [
      { "category": "request_rate", "algorithm": "FIXED_WINDOW", "windowSize": "1 hour", "value": 100 },
      { "category": "request_rate", "algorithm": "ALIGNED_FIXED_WINDOW", "windowSize": "1 day", "value": 1000 },
      { "category": "budget", "algorithm": "FIXED_WINDOW", "windowSize": "1 month", "value": 50 }
    ]
  }'
```

| Field | Required | Description |
|-------|----------|-------------|
| `category` | Yes | `request_rate`, `token_input`, `token_output` or `budget` |
| `algorithm` | No | `FIXED_WINDOW` (default) or `ALIGNED_FIXED_WINDOW` |
| `windowSize` | No | A window from the list above, as text (`"1 hour"`) or in seconds (`3600`). Default `1 minute` |
| `value` | Yes | The max: requests, tokens, or USD for a budget |

The response is the credential with its limits (`key`), and the [routes with a stricter limit](#limits-looser-than-a-route) (`warnings`):

```json
{
  "key": { "uuid": "3b9e…", "name": "billing-service", "limits": [ … ] },
  "warnings": [
    {
      "category": "request_rate",
      "algorithm": "FIXED_WINDOW",
      "routeName": "acme/chat-prod",
      "credentialValue": 5000.0,
      "credentialWindowSize": "1 hour",
      "routeValue": 50.0,
      "routeWindowSize": "1 minute"
    }
  ]
}
```

`routeName` is the project and the route. `warnings` is empty when no route the credential reaches is stricter.

### List Limits

```bash
curl http://localhost:9000/public/api/v1/keys/<key_uuid>/limits
```

```json
[
  {
    "uuid": "6f1c…",
    "category": "request_rate",
    "algorithm": "FIXED_WINDOW",
    "windowSize": "1 hour",
    "value": 100.0,
    "createdAt": "2026-10-26 10:00:00+00:00",
    "updatedAt": "2026-10-26 10:00:00+00:00"
  }
]
```

### Change a Limit's Max

`PATCH /public/api/v1/keys/{key_uuid}/limits/{limit_uuid}` changes the max and nothing else. The counter is kept: what the credential already consumed in the current window still counts.

```bash
curl -X PATCH http://localhost:9000/public/api/v1/keys/<key_uuid>/limits/<limit_uuid> \
  -H "Content-Type: application/json" \
  -d '{ "value": 200 }'
```

The body takes only `value`; any other field is refused. For `request_rate`, `token_input` and `token_output` the max must be a whole number. The response is the limit, with the max it had before and the [routes with a stricter limit](#limits-looser-than-a-route) than the new max:

```json
{
  "uuid": "6f1c…",
  "category": "request_rate",
  "algorithm": "FIXED_WINDOW",
  "windowSize": "1 hour",
  "value": 200.0,
  "previousValue": 100.0,
  "warnings": [],
  "createdAt": "2026-10-26 10:00:00+00:00",
  "updatedAt": "2026-10-29 09:30:00+00:00"
}
```

To change the window type or the window, add the new limit and delete the old one: its counter starts from zero.

### Delete a Limit

```bash
curl -X DELETE http://localhost:9000/public/api/v1/keys/<key_uuid>/limits/<limit_uuid>
```

The response is the deleted limit.

### Errors

| Status | When |
|--------|------|
| `400` | The credential already has a limit with the same category, window type and window (`credential_limit_already_exists_bad_request`) |
| `404` | The credential or the limit does not exist, or the limit belongs to another credential |
| `405` | The credential has expired (`key_operation_method_not_allowed`) |
| `422` | The request is invalid, for example a window outside the list. `loc` points at the field, e.g. `["body", "limits", 0, "windowSize"]`. When changing a max: a max of 0 or less, a fractional max for requests or tokens (`["body", "value"]`), or a field other than `value` |

---

## Next Steps

- **[Rate Limiting](./rate-limiting.md)**: request limits on a route
- **[Token Limiting](./token-limiting.md)**: token limits on a route
- **[Budget Limiting](./budget-limiting.md)**: budget limits on a route
