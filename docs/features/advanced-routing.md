# Intelligent Routing

This page covers intelligent routing configuration for the Radicalbit AI Gateway, enabling dynamic model selection based on configurable rules.

## Overview

Intelligent routing in the Radicalbit AI Gateway allows you to automatically select which model handles a request based on rule-based logic. Instead of always routing to a fixed model, routing evaluates incoming requests against configurable rules — such as keywords in the user message, input token count, time of day, or budget consumption — and directs each request to the most appropriate model.

With the **new configuration structure**:

- **Routing configs are defined at top-level** (`routing`) as a list of named configurations
- **Routes reference routing configs by name** (strings)
- Models are defined at top-level (`chat_models`, `embedding_models`) and referenced by ID

There are two routing categories:

| Category | `type` value | Decision basis | Added latency |
|---|---|---|---|
| [Deterministic](#deterministic-routing) | `deterministic` | Rule evaluated locally | Negligible |
| [Text Classification](#text-classification-routing) | `text_classification` | External ML classifier over HTTP | HTTP call latency |

---

## Deterministic Routing

The **deterministic** strategy uses rule-based logic to select a model for each request. Each routing config defines a single rule type and a list of `output_mapping` entries that map conditions to specific models. When a request arrives, the rule is evaluated against the mapping entries, and the first match determines the model. If no condition matches, the `default_model_id` is used.

### Configuration Structure

Routing is defined as a top-level key in the gateway configuration:

```yaml
routing:
  - name: my-routing-rule
    type: deterministic
    default_model_id: gpt-4o-mini
    rule: keyword
    output_mapping:
      - model_id: gpt-4o
        conditions:
          - "urgent"
          - "complex"
```

A route references a routing config by its `name`:

```yaml
routes:
  customer-service:
    chat_models:
      - gpt-4o
      - gpt-4o-mini
    routing: my-routing-rule
```

### Routing Config Fields

#### Required Fields

- **`name`**: Unique identifier for the routing config (used by routes to reference it)
- **`default_model_id`**: Model ID to use when no rule condition matches
- **`rule`**: The rule type to apply. One of: `keyword`, `token_length`, `time`, `budget`
- **`output_mapping`**: List of entries mapping conditions to model IDs

#### Optional Fields

- **`type`**: The routing strategy. Defaults to `deterministic`

### Output Mapping Fields

Each entry in `output_mapping` defines a model and the conditions under which it is selected:

- **`model_id`**: The model ID to select if the conditions match (must reference a top-level `chat_models` entry)
- **`conditions`**: Rule-specific conditions (format varies by rule type — see sections below)

---

## Keyword Rule

The **keyword** rule matches keywords against user messages and selects a model based on the first match.

**How it works**: The gateway concatenates the content of all user messages (lowercased), then checks each `output_mapping` entry in order. If any keyword from an entry's `conditions` is found as a substring in the combined text, that entry's `model_id` is selected. First match wins.

**Conditions type**: `list[str]` — a list of keyword strings

```yaml
chat_models:
  - model_id: gpt-4o
    model: openai/gpt-4o
    credentials:
      api_key: !secret OPENAI_API_KEY

  - model_id: gpt-4o-mini
    model: openai/gpt-4o-mini
    credentials:
      api_key: !secret OPENAI_API_KEY

routing:
  - name: keyword-routing
    type: deterministic
    default_model_id: gpt-4o-mini
    rule: keyword
    output_mapping:
      - model_id: gpt-4o
        conditions:
          - "urgent"
          - "complex"
      - model_id: gpt-4o-mini
        conditions:
          - "simple"

routes:
  customer-service:
    chat_models:
      - gpt-4o
      - gpt-4o-mini
    routing: keyword-routing
```

:::tip
Keyword matching is **case-insensitive** and uses **substring matching**. A keyword `"urgent"` will match messages containing "urgent", "URGENT", or "urgently".
:::

**Behavior**:
- Entries are evaluated **in order** — first keyword match across all entries wins
- If no keyword matches any entry, `default_model_id` is used

---

## Token Length Rule

The **token length** rule routes requests based on the number of input tokens, allowing you to send longer or more complex prompts to more capable models.

**How it works**: The gateway counts the tokens in the user's input using the default model's tokenizer. It then sorts the `output_mapping` entries by `threshold` in descending order and selects the first entry whose threshold is less than or equal to the token count.

**Conditions type**: `TokenLengthConditions` — an object with a `threshold` field (integer)

```yaml
chat_models:
  - model_id: gpt-4o
    model: openai/gpt-4o
    credentials:
      api_key: !secret OPENAI_API_KEY

  - model_id: gpt-4o-mini
    model: openai/gpt-4o-mini
    credentials:
      api_key: !secret OPENAI_API_KEY

routing:
  - name: token-length-routing
    type: deterministic
    default_model_id: gpt-4o-mini
    rule: token_length
    output_mapping:
      - model_id: gpt-4o
        conditions:
          threshold: 1000
      - model_id: gpt-4o-mini
        conditions:
          threshold: 100

routes:
  production:
    chat_models:
      - gpt-4o
      - gpt-4o-mini
    routing: token-length-routing
```

**Behavior**:
- Entries are sorted by `threshold` **descending** (highest first) — the highest threshold that the token count meets or exceeds wins
- For the example above: a message with 1500 tokens routes to `gpt-4o`, a message with 200 tokens routes to `gpt-4o-mini`
- If the token count is below all thresholds, `default_model_id` is used

---

## Time Rule

The **time** rule routes requests based on the current time using cron expressions, enabling different models for different time windows (e.g., business hours vs. off-hours).

**How it works**: The gateway evaluates the current UTC time against the cron expressions in each `output_mapping` entry. The first entry with a matching cron expression is selected.

**Conditions type**: `list[str]` — a list of cron expression strings

```yaml
chat_models:
  - model_id: gpt-4o
    model: openai/gpt-4o
    credentials:
      api_key: !secret OPENAI_API_KEY

  - model_id: gpt-4o-mini
    model: openai/gpt-4o-mini
    credentials:
      api_key: !secret OPENAI_API_KEY

routing:
  - name: time-routing
    type: deterministic
    default_model_id: gpt-4o-mini
    rule: time
    output_mapping:
      - model_id: gpt-4o
        conditions:
          - "0 9-17 * * 1-5"      # Business hours: Mon-Fri, 9 AM - 5 PM UTC
      - model_id: gpt-4o-mini
        conditions:
          - "0 0-8,18-23 * * *"   # Off-hours

routes:
  production:
    chat_models:
      - gpt-4o
      - gpt-4o-mini
    routing: time-routing
```

:::warning
All cron expressions are evaluated in **UTC**. Make sure to adjust your schedules accordingly if your users are in different time zones.
:::

**Behavior**:
- Entries are evaluated **in order** — the first matching cron expression wins
- If no cron expression matches the current time, `default_model_id` is used

---

## Budget Rule

The **budget** rule routes requests based on the current budget consumption ratio, allowing you to switch to cheaper models as spending approaches the budget limit.

**How it works**: The gateway computes a **combined** usage ratio across both input and output budgets. It sums the two configured limits (`max_budget` = input `max_budget` + output `max_budget`) and sums the remaining budgets for both, then calculates `usage_ratio = 1 - (total_remaining / total_max_budget)`. It then sorts `output_mapping` entries by `threshold` descending and selects the first entry whose threshold is less than or equal to the usage ratio.

**Conditions type**: `BudgetConditions` — an object with a `threshold` field (float, 0.0 to 1.0)

:::warning
The budget rule **requires** `budget_limiting` to be configured on the route. Without it, the rule will fall back to `default_model_id`.
:::

```yaml
chat_models:
  - model_id: gpt-4o
    model: openai/gpt-4o
    credentials:
      api_key: !secret OPENAI_API_KEY
    input_cost_per_million_tokens: 5.0
    output_cost_per_million_tokens: 15.0

  - model_id: gpt-4o-mini
    model: openai/gpt-4o-mini
    credentials:
      api_key: !secret OPENAI_API_KEY
    input_cost_per_million_tokens: 0.15
    output_cost_per_million_tokens: 0.6

routing:
  - name: budget-routing
    type: deterministic
    default_model_id: gpt-4o
    rule: budget
    output_mapping:
      - model_id: gpt-4o-mini
        conditions:
          threshold: 0.8   # When > 80% of combined (input + output) budget used, switch to cheaper model

routes:
  production:
    chat_models:
      - gpt-4o
      - gpt-4o-mini
    routing: budget-routing
    budget_limiting:
      algorithm: fixed_window
      window_size: 1 hour
      max_budget: 150.0
```

**Behavior**:
- Entries are sorted by `threshold` **descending** (highest first) — the highest threshold that the usage ratio meets or exceeds wins
- The usage ratio is computed over the **combined input + output budget**. In the example above, `max_budget` = $50 (input) + $100 (output) = $150 total. A `threshold` of `0.8` triggers when $120 or more has been consumed across both
- If no threshold is met, or if no budget limiter is configured, `default_model_id` is used

---

## Text Classification Routing

Text classification routing delegates the routing decision to an **external ML model** (e.g., a classifier deployed via MLflow). The gateway sends the last user message to a configurable HTTP endpoint and maps the returned class label to a model.

**How it works**: For each incoming request, the gateway extracts the last human message and POSTs it to the configured `url`. The classifier responds with a predicted class. The gateway looks up the class in `output_mapping.conditions` and routes to the matching model. If the class is not found, or if the HTTP call fails (timeout or error response), the gateway falls back silently to `default_model_id`.

### Configuration Structure

```yaml
routing:
  - name: semantic-routing
    type: text_classification
    url: http://text-classifier:8888    # HTTP endpoint of the classifier
    timeout: 5.0                        # Request timeout in seconds (default: 5.0)
    default_model_id: fallback-model
    output_mapping:
      - model_id: model-a
        conditions:
          - CLASS_A
      - model_id: model-b
        conditions:
          - CLASS_B
          - CLASS_C

routes:
  my-route:
    chat_models:
      - model-a
      - model-b
      - fallback-model
    routing: semantic-routing
```

### HTTP Contract

The gateway sends a `POST` request to the configured `url` using MLflow's `dataframe_records` format:

**Request body:**

```json
{
  "dataframe_records": [{ "inputs": "<last user message>" }]
}
```

**Expected response body:**

```json
{
  "predictions": [
    {
      "class": "CLASS_A",
      "score": 0.95
    }
  ]
}
```

The gateway extracts the `class` field from the first element of `predictions` and looks it up in the `output_mapping` conditions.

:::warning
If the classifier times out, returns an HTTP error, or returns a class not present in any `output_mapping` entry, the gateway **falls back silently** to `default_model_id`. No error is returned to the client.
:::

### Routing Config Fields

#### Required Fields

- **`name`**: Unique identifier for the routing config
- **`type`**: Must be `text_classification`
- **`url`**: Full HTTP URL of the classifier endpoint
- **`default_model_id`**: Model ID to use when no class matches or on error
- **`output_mapping`**: List of entries mapping class labels to model IDs

#### Optional Fields

- **`timeout`**: HTTP request timeout in seconds (default: `5.0`)

### Full Example

```yaml
chat_models:
  - model_id: sentiment-positive-model
    model: openai/gpt-4o
    credentials:
      api_key: !secret OPENAI_API_KEY

  - model_id: sentiment-negative-model
    model: openai/gpt-4o-mini
    credentials:
      api_key: !secret OPENAI_API_KEY

  - model_id: fallback-model
    model: openai/gpt-4o-mini
    credentials:
      api_key: !secret OPENAI_API_KEY

routing:
  - name: sentiment-routing
    type: text_classification
    url: http://sentiment-classifier:8888
    timeout: 3.0
    default_model_id: fallback-model
    output_mapping:
      - model_id: sentiment-positive-model
        conditions:
          - SAT
      - model_id: sentiment-negative-model
        conditions:
          - WRONG_ANSWER
          - NEED_CLARIFICATION

routes:
  feedback:
    chat_models:
      - sentiment-positive-model
      - sentiment-negative-model
      - fallback-model
    routing: sentiment-routing
```

:::tip
Text classification routing is ideal for intent detection or sentiment-based routing using a custom ML model trained on your domain data (e.g., classifying user feedback as `SAT`, `NEED_CLARIFICATION`, or `WRONG_ANSWER`).
:::

**Behavior**:
- The gateway evaluates the **last user message** only
- The `conditions` list for each `output_mapping` entry contains the class labels that should map to that model — multiple labels can share a model
- Entry order does not matter for class lookup (unlike keyword/time rules)
- On any failure (timeout, HTTP error, unknown class), `default_model_id` is used

---

## Configuration Reference

### Routing Config

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Unique name for the routing config |
| `type` | `string` | Yes | Routing strategy: `deterministic` or `text_classification` |
| `default_model_id` | `string` | Yes | Fallback model ID when no rule matches or on error |
| `rule` | `string` | Deterministic only | Rule type: `keyword`, `token_length`, `time`, or `budget` |
| `url` | `string` | Text classification only | HTTP endpoint of the external classifier |
| `timeout` | `float` | No | Classifier request timeout in seconds (default: `5.0`) |
| `output_mapping` | `list` | Yes | List of condition-to-model mappings |

### Output Mapping Entry

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `model_id` | `string` | Yes | Model ID to select when conditions match |
| `conditions` | varies | Yes | Rule-specific conditions (see below) |

### Conditions by Rule / Type

| Routing type / Rule | Conditions Type | Format |
|---------------------|----------------|--------|
| `deterministic` / `keyword` | `list[str]` | List of keyword strings |
| `deterministic` / `token_length` | `TokenLengthConditions` | Object with `threshold: int` |
| `deterministic` / `time` | `list[str]` | List of cron expressions |
| `deterministic` / `budget` | `BudgetConditions` | Object with `threshold: float` (0.0–1.0) |
| `text_classification` | `list[str]` | List of class label strings returned by the classifier |

---

## Best Practices

### Rule Selection
- Use **keyword** routing when request intent is clearly expressed in the message content
- Use **token length** routing to send complex, long prompts to more capable models
- Use **time** routing to optimize costs during off-peak hours
- Use **budget** routing to gracefully degrade to cheaper models as spending increases
- Use **text classification** routing when intent detection requires an ML model — e.g., sentiment analysis, topic classification, or domain-specific labelling

### Model Configuration
- Ensure all models referenced in `output_mapping` and `default_model_id` are defined in `chat_models`
- All models used in routing must also be listed in the route's `chat_models`
- Configure cost information on models when using budget routing

### General Tips
- Keep `output_mapping` entries ordered intentionally — entry order matters for keyword and time rules
- Test routing rules in non-production environments before deploying
- Use descriptive `name` values for routing configs (e.g., `keyword-routing`, `budget-aware-routing`)

---

## Troubleshooting

### Common Issues

1. **Model Not Found**: Ensure all `model_id` values in `output_mapping` and `default_model_id` exist in the top-level `chat_models` and are referenced in the route's `chat_models` list
2. **Budget Rule Not Working**: Verify that `budget_limiting` is configured on the route. Without it, the budget rule always falls back to `default_model_id`
3. **Time Rule Not Matching**: Cron expressions are evaluated in UTC. Double-check your expressions account for the correct time zone offset
4. **Unexpected Model Selection**: For keyword and time rules, the first match wins. Review the order of your `output_mapping` entries
5. **Text Classification Always Using Fallback**: Check that the classifier is reachable from the gateway (correct `url`, network connectivity). Verify the response contains a `predictions[0].class` field and that its value matches a label defined in `output_mapping.conditions`. Increase `timeout` if the classifier is slow to respond

---

## Next Steps

- **[Fallback Configuration](../configuration/fallback.md)** - Set up automatic failover when models fail
- **[Budget Limiting](./budget-limiting.md)** - Configure budget limits (required for budget routing)
- **[Advanced Configuration](../configuration/advanced-configuration.md)** - Enterprise configuration options
