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

Two limits with the same category, window type and window are the same limit: adding it a second time is refused. Delete the existing one first to replace it.

---

## Expired Credentials

The limits of an expired credential can no longer be added or deleted. They stay listed, read-only.

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
3. Choose **Add limits**, fill one row per limit (category, window type, window, max), add more rows with **Add limit**, then save.

To delete a limit, open its menu (⋮) in the list and choose **Delete**. If alert rules watch that limit, the confirmation says how many will become stale. The rules are not changed.

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

The response is the credential with its limits.

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

### Delete a Limit

```bash
curl -X DELETE http://localhost:9000/public/api/v1/keys/<key_uuid>/limits/<limit_uuid>
```

The response is the deleted limit.

### Errors

| Status | When |
|--------|------|
| `400` | The credential already has a limit with the same category, window type and window (`credential_limit_already_exists_bad_request`) |
| `404` | The credential or the limit does not exist |
| `405` | The credential has expired (`key_operation_method_not_allowed`) |
| `422` | The request is invalid, for example a window outside the list. `loc` points at the field, e.g. `["body", "limits", 0, "windowSize"]` |

---

## Next Steps

- **[Rate Limiting](./rate-limiting.md)**: request limits on a route
- **[Token Limiting](./token-limiting.md)**: token limits on a route
- **[Budget Limiting](./budget-limiting.md)**: budget limits on a route
