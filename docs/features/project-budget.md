# Project Budget

A [route budget](./budget-limiting.md) caps what one route spends. A project budget caps what a whole project spends: every request on any route of the project counts against it, whoever calls it.

## Overview

A project budget is set from the UI or the management API, not in the project configuration. A project can have several budgets: all of them apply, so the first one reached blocks further requests until its window resets. A project without a budget behaves as before, and only route and [credential](./credential-limits.md) limits apply.

A project budget and route budgets exclude each other: while the project has a budget, its routes can't declare `budget_limiting`, and while the published configuration has routes with `budget_limiting`, the project can't get a budget. See [Project Budget and Route Budgets](#project-budget-and-route-budgets).

---

## Window Type and Window

Every budget counts the cost of input and output tokens together, in USD, within a window that runs in one of two ways:

- **Fixed** (`FIXED_WINDOW`): the window starts at the first request and lasts its full length.
- **Aligned** (`ALIGNED_FIXED_WINDOW`): the window follows the UTC clock. A 1 day aligned window runs from midnight to midnight UTC.

The window comes from a fixed list:

| Window type | Allowed windows |
|-------------|-----------------|
| Aligned | `1 minute`, `5 minutes`, `10 minutes`, `15 minutes`, `30 minutes`, `1 hour`, `2 hours`, `3 hours`, `4 hours`, `6 hours`, `8 hours`, `12 hours`, `1 day` |
| Fixed | The same, plus `1 week` and `1 month` |

A month is always 30 days. The gateway stores a window in its largest exact unit: `24 hours` is saved as `1 day`.

Two budgets with the same window type and window are the same budget: adding it a second time is refused: edit the existing one instead.

---

## Project Budget and Route Budgets

A project spends either under one budget for the whole project, or under budgets declared route by route. Both at once would make two caps count the same spending with different rules, so the gateway refuses the combination in both directions:

- **Adding a project budget** is refused while the **published** configuration has routes with `budget_limiting`. The error names those routes.
- **Saving, publishing or importing a configuration** with routes that declare `budget_limiting` is refused while the project has a budget. The error names those routes.

### Drafts

Only the published configuration blocks a project budget. If only a draft has routes with `budget_limiting`, the budget can be added: the draft then can't be published until those routes drop `budget_limiting`. The UI warns about it when you add the budget.

### Budget Routing

A route that uses the [budget rule](./advanced-routing.md#budget-rule) picks its model from the consumption of its own `budget_limiting`, so it needs a budget on the route. While such a route is published, the project can't get a budget: change the route's routing first, then remove its `budget_limiting`.

### Removing a Conflict

To add a project budget to a project whose published routes have their own budget:

1. Open the project configuration and remove `budget_limiting` from the routes named in the error (and change the routing of any route that routes by budget).
2. Save and publish the configuration.
3. Add the project budget.

To go back to route budgets, delete every project budget first: once the project has no budget, routes can declare `budget_limiting` again.

---

## Alerts

Alert rules with the **Project** scope watch the project's budgets, with limit and threshold events for each window. While a project has a budget, its routes no longer offer route budget events. See [Alerts](./alerts.md).

---

## Managing the Budget from the UI

1. Open **Projects**. The **Budget** column shows how many budgets each project has (hover it to see them), or **Per route** when the published configuration sets budgets on routes.
2. Open the row menu (⋮) and choose **Limits → Budget limits**.
3. Choose **Add budgets**, fill one row per budget (window type, window, max spend), add more rows with **Add another budget**, then save.

If the published configuration has routes with `budget_limiting`, the modal lists them, **Add budgets** is disabled, and **Open configuration** takes you to the configuration to fix. If only a draft has them, a warning lists them and adding stays allowed.

To edit a budget, open its menu (⋮) and choose **Edit**. The window type, window and max can change:

- **Only the max changes**: the counter is kept. What the project already spent in the current window still counts against the new max.
- **The window type or window changes**: it is a different budget, so it replaces the old one and its counter restarts from zero. Before saving, a confirmation says so and, if alert rules watch the old budget and no other budget keeps the same window, how many will become stale.

To delete a budget, open its menu (⋮) and choose **Delete**. If alert rules watch it, the confirmation says how many will become stale; on the last budget, it reminds you that routes can declare `budget_limiting` again.

While a project has a budget, the configuration editor shows a banner: routes can't declare `budget_limiting`.

:::info[Enterprise Feature]{className="enterprise-badge"}
In the **Enterprise edition**, the project page also shows a **Budget limits** section under **Associated users**, with the same menu (⋮) on each budget: **Edit** and **Delete** open the budget modal on that budget. With access control enabled, every role can see a project's budgets; only an **ADMIN** can add, edit or delete them.
:::

---

## Managing the Budget with the API

The management API is served by the gateway under `/public/api/v1`. In the Enterprise edition, with access control enabled, adding, editing and deleting budgets is reserved to the ADMIN role; reading them is open to the project's members.

### Add Budgets

`POST /public/api/v1/projects/{project_uuid}/budget-limits` adds one or more budgets in a single call: either all of them are saved, or none.

```bash
curl -X POST http://localhost:9000/public/api/v1/projects/<project_uuid>/budget-limits \
  -H "Content-Type: application/json" \
  -d '{
    "limits": [
      { "algorithm": "ALIGNED_FIXED_WINDOW", "windowSize": "1 day", "value": 40 },
      { "algorithm": "FIXED_WINDOW", "windowSize": "1 month", "value": 500 }
    ]
  }'
```

| Field | Required | Description |
|-------|----------|-------------|
| `algorithm` | No | `FIXED_WINDOW` (default) or `ALIGNED_FIXED_WINDOW` |
| `windowSize` | No | A window from the list above, as text (`"1 day"`) or in seconds (`86400`). Default `1 minute` |
| `value` | Yes | The max spend in USD, greater than 0 |

The response is the list of budgets added.

### List Budgets

```bash
curl http://localhost:9000/public/api/v1/projects/<project_uuid>/budget-limits
```

```json
[
  {
    "uuid": "2b7e…",
    "algorithm": "ALIGNED_FIXED_WINDOW",
    "windowSize": "1 day",
    "value": 40.0,
    "createdAt": "2026-10-27 10:00:00+00:00",
    "updatedAt": "2026-10-27 10:00:00+00:00"
  }
]
```

### Change a Budget's Max

`PATCH /public/api/v1/projects/{project_uuid}/budget-limits/{limit_uuid}` changes the max spend and nothing else. The counter is kept: what the project already spent in the current window still counts.

```bash
curl -X PATCH http://localhost:9000/public/api/v1/projects/<project_uuid>/budget-limits/<limit_uuid> \
  -H "Content-Type: application/json" \
  -d '{ "value": 60 }'
```

The body takes only `value`, greater than 0; any other field is refused. The response is the budget, with the max it had before:

```json
{
  "uuid": "2b7e…",
  "algorithm": "ALIGNED_FIXED_WINDOW",
  "windowSize": "1 day",
  "value": 60.0,
  "previousValue": 40.0,
  "createdAt": "2026-10-27 10:00:00+00:00",
  "updatedAt": "2026-10-29 09:30:00+00:00"
}
```

To change the window type or the window, add the new budget and delete the old one: its counter starts from zero.

### Delete a Budget

```bash
curl -X DELETE http://localhost:9000/public/api/v1/projects/<project_uuid>/budget-limits/<limit_uuid>
```

The response is the deleted budget.

### Check for Conflicts

`GET /public/api/v1/projects/{project_uuid}/budget-limits/conflicts` lists the routes with `budget_limiting`, so you know what to fix before adding a budget:

```json
{
  "published": ["support-route"],
  "draft": ["support-route", "sales-route"],
  "budgetRouting": ["support-route"]
}
```

| Field | Description |
|-------|-------------|
| `published` | Routes of the published configuration with `budget_limiting`: they block a project budget |
| `draft` | Routes of the configurations not published with `budget_limiting`: they can't be published while the project has a budget |
| `budgetRouting` | Routes that use the budget rule, in the published or in a draft configuration |

The same object is returned as `routeBudgets` by `GET /projects` and `GET /projects/{project_uuid}` with `include_limits=true`.

### Errors

Errors on these endpoints, and on the configuration endpoints refused because of a project budget, carry the routes to fix in `error.routes`:

```json
{
  "error": {
    "message": "Project \"support\" has published routes with budget_limiting configured (support-route); remove them before assigning a project-level budget limit",
    "type": "auth_registry_error",
    "param": null,
    "code": "project_budget_limit_conflict_bad_request",
    "routes": ["support-route"]
  }
}
```

| Status | Code | When |
|--------|------|------|
| `400` | `project_budget_limit_conflict_bad_request` | Adding a budget while the published configuration has routes with `budget_limiting` |
| `400` | `project_config_validation_error` | Saving, publishing or importing a configuration with routes that declare `budget_limiting` while the project has a budget |
| `400` | `project_budget_limit_already_exists_bad_request` | The project already has a budget with the same window type and window |
| `404` | | The project or the budget does not exist, or the budget belongs to another project |
| `422` | | The request is invalid, for example a window outside the list. `loc` points at the field, e.g. `["body", "limits", 0, "windowSize"]`. When changing a max: a max of 0 or less, or a field other than `value` |

---

## Next Steps

- **[Budget Limiting](./budget-limiting.md)**: budget limits on a route
- **[Credential Limits](./credential-limits.md)**: limits on what one credential consumes
- **[Alerts](./alerts.md)**: notifications on budget events
