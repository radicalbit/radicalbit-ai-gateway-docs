# Alerts

Alerts notify people by email when something worth knowing happens in the gateway: a guardrail blocks a request, a fallback kicks in, a limit is about to run out or has already blocked traffic. You decide what to watch with **alert rules**, and the gateway sends the alerts.

---

## Overview

| Term | Meaning |
|---|---|
| **Alert rule** | An instruction to email one or more recipients when an alertable event occurs on a target. |
| **Alert** | One email sent because an alert rule matched. |
| **Scope** | The kind of thing a rule watches: a **route**, a **project** or a **credential**. |
| **Target** | The specific route, project or credential within that scope. |
| **Alertable event** | A gateway event a rule can match, such as a guardrail block or a rate limit being exceeded. |
| **Time aggregation** | How matching events become alerts: one email per event, or at most one per time window. |

A rule only watches events that are actually configured on its target. A route without guardrails offers no guardrail events, and a credential without limits offers no limit events.

Rules belong to you. Publishing a new configuration, removing a limit or deleting a credential never enables, disables or deletes a rule. If a rule's target or event no longer exists, the rule is marked [stale](#stale-rules) instead.

:::tip
In the Enterprise edition with [access control](../access-control/index.md) enabled, only users with the **Admin** role can create, edit and view alert rules.
:::

---

## Prerequisites

Alerts are sent by the gateway itself through an SMTP server. Configure it with environment variables on the gateway:

| Variable | Default | Description |
|---|---|---|
| `SMTP_HOST` | `localhost` | SMTP server host |
| `SMTP_PORT` | `25` | SMTP server port |
| `SMTP_USER` | — | SMTP username |
| `SMTP_PASSWORD` | — | SMTP password |
| `SMTP_FROM_EMAIL` | `alerts@radicalbit.ai` | Sender address of alert emails |
| `SMTP_MAX_WORKERS` | `4` | Number of threads that send alerts in the background |
| `ALERT_THRESHOLD_PERCENTAGES` | `[75, 98]` | Consumption percentages that raise [threshold events](#limit-and-threshold-events), as a JSON list of integers between 1 and 99 |
| `ALERT_WINDOW_TICK_SECONDS` | `30` | How often the gateway closes [time windows](#time-aggregation). A window's alert goes out at most this long after the window ends. |

When both `SMTP_USER` and `SMTP_PASSWORD` are set, the gateway upgrades the connection with STARTTLS and logs in. Otherwise it sends without authentication.

:::warning
Run more than one gateway replica only with Redis configured (`REDIS_URL`, or `REDIS_HOST` and `REDIS_PORT`). Redis holds the window counters and makes sure each alert is sent once across replicas. Without it, each replica keeps its own state, which is correct for a single replica only.
:::

### Testing Locally with Mailpit

The `docker-compose.yaml` stack sends alerts to `host.docker.internal:1025`. Start [Mailpit](https://mailpit.axllent.org/) to catch them:

```bash
docker run -d --name mailpit -p 1025:1025 -p 8025:8025 axllent/mailpit
```

Alert emails then appear at **http://localhost:8025**.

---

## Scopes and Alertable Events

Each scope offers its own events. Project and credential scopes offer only limit events, because projects and credentials are what own those limits.

| Scope | Target | Alertable events |
|---|---|---|
| **Route** | A route of a project | Guardrail, fallback, and limit and threshold events for the route's own rate, token, audio duration and budget limits |
| **Project** | A project | Limit and threshold events for the project's budget limits |
| **Credential** | A credential (API key) | Limit and threshold events for the credential's limits, set on it directly or inherited from its group |

When a project has its own budget limit, its routes no longer offer route budget events: the project budget is the one that applies.

Cache hits are not alertable.

### Event Names

Every event has a name, which is what a rule stores, and a readable label shown in the UI.

| Event | Name format | Example | Label |
|---|---|---|---|
| Guardrail | `guardrail-{phase}-{guardrail name}` | `guardrail-input-pii_check` | Guardrail: PII_CHECK (input) |
| Fallback | `fallback-triggered` | `fallback-triggered` | Fallback: triggered |
| Limit exceeded | `{category}-exceeded-{window}` | `rate_limit-exceeded-1m` | Rate limit: exceeded (1m) |
| Threshold | `{category}-{percentage}pct-{window}` | `rate_limit-75pct-1m` | Rate limit: 75% (1m) |

- **phase** is `input` or `output`. A guardrail that runs on both offers two events.
- **category** is one of `rate_limit`, `token_input_limit`, `token_output_limit`, `budget_limit` or `audio_duration_limit`.
- **window** is the limit's window in the largest whole unit: `s`, `m`, `h`, `d`, `w` or `mo` (30 days). For example a 24-hour budget is `1d`.

A limit event names one limit exactly. A credential with a per-minute and a per-day rate limit offers two separate events: `rate_limit-exceeded-1m` and `rate_limit-exceeded-1d`.

### Limit and Threshold Events

A **limit event** (`…-exceeded-…`) is raised when the limit blocks a request.

A **threshold event** (`…-75pct-…`) is raised earlier, when consumption crosses a percentage of the limit, before anything is blocked. The percentages come from `ALERT_THRESHOLD_PERCENTAGES` and apply to every limit: they are global, not per rule.

---

## Time Aggregation

Time aggregation decides how many emails a burst of events produces.

| Aggregation | Applies to | Behaviour |
|---|---|---|
| **Instant** | Guardrail and fallback events | One email per event. |
| **Window** | Guardrail and fallback events | At most one email per window, sent after the window closes and only if at least one event occurred. The email carries the number of events. |
| **Limit window** | Limit and threshold events (always) | One email when the limit or threshold is crossed, at most one per window of that limit. |

Window durations are **5 minutes**, **15 minutes**, **1 hour**, **6 hours** and **24 hours**. Windows are aligned to the UTC clock, not to the first event: a 1-hour window runs from 10:00 to 11:00 UTC, and a 24-hour window from midnight to midnight UTC.

A window's email is not sent if, by the time the window closes, the rule has been deleted, disabled, or switched to another aggregation or duration.

---

## Creating an Alert Rule

Open **Alert** in the left menu, then click **Create Rule**. The wizard has three steps:

1. **Name rule**: a name and an optional description.
2. **Rule setup**: pick the **Scope**, then the target (project, route or credential) and the **Event**. The list only offers events configured on that target. Under **Time aggregation**, choose the **Notification frequency**: **Instant** or **Window** (with its **Duration**) for guardrail and fallback events. Limit and threshold events always use **Limit window**.
3. **Channel and activation**: the channel is **Email**. Add one or more recipients.

Finish with **Create rule and enable** to start receiving alerts right away, or **Create rule** to save it disabled.

### Managing Rules

The **Alert Notification** page lists every rule with its scope, target, event, aggregation and recipients.

- **Active** turns a rule on or off. Disabled rules send nothing.
- Click a rule to open its detail panel, where you can edit any field and see its [alert history](#alert-history).
- The bin icon deletes a rule.

---

## Alert Emails

The subject reads `[Alert] {rule name}: {event} on {target}`. The event is its name, such as `guardrail-input-pii_check`, and the target is `{project} / {route}` for a route, the project name, or the credential name.

The body always contains the rule, the scope, the target, the event and the time in UTC, plus the rule's description when it has one. It then adds details that depend on the event:

| Event | Details |
|---|---|
| Guardrail (instant) | Credential, group, guardrail type and behaviour |
| Fallback (instant) | Credential, group, and the `target → fallback` models |
| Guardrail or fallback (window) | Number of events and the window's start and end |
| Limit or threshold | Consumption, maximum, threshold percentage and reset time |

:::tip
Alert emails never include request or response content. A guardrail alert tells you that a prompt was blocked, not what the prompt said.
:::

---

## Stale Rules

A rule is **stale** when its target or event no longer exists, for example:

- the route is no longer in the published configuration
- the guardrail was renamed, removed, or no longer runs on that phase
- the route no longer has a fallback
- the limit was removed, or its window changed
- a threshold percentage was removed from `ALERT_THRESHOLD_PERCENTAGES`
- the project or the credential was deleted

Stale rules are shown with a warning icon and the reason. Staleness is checked every time rules are listed, so republishing a configuration that brings the route or guardrail back makes the rule valid again with no action from you. A change that keeps the event, such as a new limit value or a different LLM Judge prompt, does not make a rule stale.

A stale rule is never disabled or deleted automatically. Fix the target, edit the rule, or delete it.

---

## Alert History

Every alert send attempt is recorded, whether the email went out or not. In the UI:

- The rules table shows **Sent (Last 48h)** and **Failed (Last 48h)** for each rule. Both columns are sortable, so the noisiest rule is one click away.
- A rule's detail panel opens with **Alert history, last 48h**: totals, the time of the last alert, an hourly chart of sent and failed alerts, and the latest hours with alerts.

An alert is **failed** when the email could not be sent, for example because the SMTP server was unreachable. Failed alerts are not retried.

The gateway hands each record to the task queue (Valkey), and the **metrics worker** writes it to ClickHouse. All three must be running for history to be recorded: alerts are still emailed without them, but they won't appear in the history.

---

## Management API

Alert rules are also available through the management API, under `/public/api/v1`:

| Method | Path | Description |
|---|---|---|
| `GET` | `/rule` | List rules, with `stale` and `staleReason` |
| `POST` | `/rule` | Create a rule |
| `GET` | `/rule/{uuid}` | Get a rule |
| `PATCH` | `/rule/{uuid}` | Update the fields you send |
| `PATCH` | `/rule/{uuid}/enabled` | Enable or disable: `{"enabled": true}` |
| `DELETE` | `/rule/{uuid}` | Delete a rule |
| `GET` | `/rule/history` | Hourly sent and failed counts for every rule |
| `GET` | `/rule/{uuid}/history` | Hourly sent and failed counts for one rule |
| `GET` | `/projects/{project_uuid}/routes/{route_name}/alertable-events` | Events a route offers |
| `GET` | `/projects/{project_uuid}/alertable-events` | Events a project offers |
| `GET` | `/keys/{key_uuid}/alertable-events` | Events a credential offers |

A rule that emails the team when a route's guardrail blocks input, at most once every 15 minutes:

```json
{
  "name": "PII blocks on support",
  "scope": "route",
  "project": "6f1c2a9e-4b7d-4e2a-9c1f-2d3e4f5a6b7c",
  "route": "support",
  "event": "guardrail-input-pii_check",
  "timeAggregation": "window",
  "windowSize": "15m",
  "recipients": ["security@example.com"],
  "enabled": true
}
```

- **`scope`** is `route`, `project` or `credential`. A route rule needs **`project`** and **`route`**; a project rule needs **`project`** only; a credential rule needs **`credential`** (the credential's UUID) only.
- **`timeAggregation`** is `instant`, `window` or `limit_window`. **`windowSize`** (`5m`, `15m`, `1h`, `6h` or `24h`) is required with `window` and not allowed otherwise.
- **`enabled`** defaults to `false`.

The history endpoints take an optional range as `_from` and `_to`, in Unix seconds. Without it they cover the last 48 whole hours, current hour included. Each item is one rule in one hour: `{ruleUuid, ruleName, bucketStart, sent, failed}`. Hours without alerts are omitted.

A rule that breaks these rules is rejected with `400` and a message explaining why, such as `Limit and threshold events take only the limit_window aggregation`. A malformed request, such as an invalid recipient address or an unknown scope, is rejected with `422`.

---

## Best Practices

- **Use a window for noisy events.** A guardrail that blocks fifty requests in an hour sends one email with a count of 50, instead of fifty emails.
- **Watch thresholds, not only limits.** A threshold alert at 75% leaves time to act before the limit starts blocking traffic.
- **Create rules on the owner of the limit.** Alert on the project for a project budget, and on the credential for a credential's rate limit.
- **Send alerts to a shared mailbox**, so they don't depend on one person being available.
- **Review stale rules after a configuration change**, and delete the ones that no longer apply.

---

## Troubleshooting

| Symptom | Check |
|---|---|
| No emails arrive | The rule is enabled, the event is configured on its target, and `SMTP_HOST` / `SMTP_PORT` reach your SMTP server. Failed alerts show up in the **Failed** column. |
| A window email arrives late | It is sent after the window closes, within `ALERT_WINDOW_TICK_SECONDS`. |
| Duplicate emails with several replicas | Configure Redis on every replica. |
| The event you want is not offered | It must be configured on the target. For example, add the guardrail to the route, or the limit to the credential, then publish. |
| History is empty but emails arrive | Check that the task queue (Valkey), the metrics worker and ClickHouse are running. |

---

## Next Steps

- **[Guardrails](./guardrails.md)** — Configure the checks that raise guardrail events
- **[Fallback](./fallback.md)** — Configure the failover that raises fallback events
- **[Rate Limiting](./rate-limiting.md)**, **[Token Limiting](./token-limiting.md)** and **[Budget Limiting](./budget-limiting.md)** — Configure the limits behind limit and threshold events
- **[Monitoring](../operations/monitoring.md)** — Metrics and dashboards for everything else
