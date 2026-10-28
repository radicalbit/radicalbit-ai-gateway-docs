# Guardrails

Guardrails are rules applied to either the user's `input`, the model's `output`, or both (`io`) to enforce content policies, protect privacy, and ensure your AI applications behave safely and appropriately.

---

## Execution Flow

Guardrails run in a defined order around the model call:

1. **Input Phase**: `input` and `io` guardrails inspect user messages before they reach the model.
2. **Model Invocation**: The AI model processes the (filtered) request.
3. **Output Phase**: `output` and `io` guardrails inspect the model's response before it reaches the user.

```mermaid
graph LR
    A[User Input] --> B[INPUT Guardrails]
    B --> C[IO Guardrails - Input]
    C --> D[Model Processing]
    D --> E[Model Response]
    E --> F[OUTPUT Guardrails]
    F --> G[IO Guardrails - Output]
    G --> H[Final Response]

    style B color:#000, fill:#e3f2fd
    style C color:#000, fill:#e8f5e8
    style F color:#000, fill:#fff3e0
    style G color:#000, fill:#e8f5e8
```

---

## Guardrail Classes

Guardrails belong to one of two classes:

- **Check Guardrails** — inspect content and, if triggered, can `block`, `soft_block`, or `warn`.
- **Redact Guardrails** — modify content by masking or removing sensitive information. They always redact and do not require a `behavior`.

---

## Configuration Fields

| Field | Description |
|-------|-------------|
| `name` | A unique, descriptive identifier for the guardrail |
| `type` | The type of check to perform (see types below) |
| `where` | Where to apply the guardrail: `input`, `output`, or `io` (both) |
| `behavior` | Action to take if triggered: `block`, `soft_block`, or `warn`. Not required for Redact types. |
| `response_message` | Optional message returned to the user when the guardrail triggers |
| `parameters` | A dictionary of settings specific to the guardrail type |

### Guardrail Types at a Glance

| Type | Class | Description | `parameters` example |
|------|-------|-------------|----------------------|
| `starts_with` | Check | Text starts with specific string | `values: ["Hello", "Hi"]` |
| `ends_with` | Check | Text ends with specific string | `values: ["?", "!"]` |
| `contains` | Check | Text contains specific substring | `values: ["forbidden_word"]` |
| `regex` | Check | Text matches a regular expression | `values: ['\b[A-Z]{2,}\b']` |
| `presidio_analyzer` | Check | Detects PII using Microsoft Presidio | `language: en`, `entities: ["EMAIL_ADDRESS"]` |
| `presidio_anonymizer` | Redact | Masks PII using Microsoft Presidio | `language: en`, `entities: ["EMAIL_ADDRESS"]` |
| `judge` | Check | Semantic evaluation via an LLM-as-a-Judge | `prompt_ref: "toxicity_check.md"`, `model_id: "gpt-4o-mini"` |
| `decision_judge` | Check | One yes/no question answered by a decision model | `model_id: "jev"`, `instructions: "Is the user asking for legal advice?"` |

---

## Traditional Guardrails

Fast, rule-based filtering using pattern matching. These should be your first line of defence due to their low latency.

### Starts With

```yaml
guardrails:
  - name: greeting_check
    type: starts_with
    where: input
    behavior: warn
    parameters:
      values: ["Hello", "Hi", "Good morning"]
```

### Ends With

```yaml
guardrails:
  - name: question_check
    type: ends_with
    where: input
    behavior: soft_block
    parameters:
      values: ["?", "??", "???"]
```

### Contains

```yaml
guardrails:
  - name: profanity_filter
    type: contains
    where: input
    behavior: block
    parameters:
      values: ["inappropriate", "offensive", "spam"]
    response_message: "Content blocked due to inappropriate language"
```

### Regex

```yaml
guardrails:
  - name: email_detector
    type: regex
    where: input
    behavior: block
    parameters:
      values: ['\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b']
    response_message: "Email addresses are not allowed"
```

---

## Presidio Guardrails

PII detection and anonymization powered by [Microsoft Presidio](https://microsoft.github.io/presidio/).

### Presidio Analyzer (Check)

Detects PII entities and blocks or warns depending on `behavior`.

```yaml
guardrails:
  - name: pii_detector
    type: presidio_analyzer
    where: input
    behavior: block
    parameters:
      language: en
      entities: ["EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD"]
    response_message: "Personal information detected and blocked"
```

### Presidio Anonymizer (Redact)

Masks detected PII with placeholders (e.g., replaces an email with `<EMAIL_ADDRESS>`). No `behavior` needed — it always redacts.

```yaml
guardrails:
  - name: pii_anonymizer
    type: presidio_anonymizer
    where: io
    parameters:
      language: en
      entities: ["EMAIL_ADDRESS", "PHONE_NUMBER", "IBAN_CODE", "IT_IDENTITY_CARD"]
```

---

## LLM Judge Guardrails

Semantic evaluation using a language model as a "judge". The `JudgeEngine` passes the user input or model output through a prompt template, invokes the configured LLM, and parses the result into a structured verdict (`is_triggered`, optional `reasoning`).

### How It Works

1. The input or output text is extracted and normalized.
2. The text is inserted into a **prompt template** (`prompt_ref`).
3. The LLM defined in `model_id` is invoked through its provider, asking for structured output (a JSON schema or a forced tool call, depending on the provider).
4. The response is parsed into a `JudgeResult` object.
5. The `is_triggered` flag determines whether the guardrail fires.
6. If the primary model fails, an optional `fallback_model_id` is tried automatically.

### Engine Components

| Component | Description |
|-----------|-------------|
| **JudgePromptManager** | Loads built-in and user-defined prompt templates |
| **PromptTemplate** | Defines structured LLM prompts with formatting and output schema |
| **Structured output** | Validates the model's reply against the `JudgeResult` schema |
| **Model Cache** | Optimizes repeated model usage by caching initialized instances |
| **Fallback Logic** | Retries with a fallback model if the primary fails |

### Built-in Prompt Templates

| Prompt | Purpose |
|--------|---------|
| `toxicity_check.md` | Detects offensive, abusive, or harmful content |
| `business_context_check.md` | Validates if the request aligns with your business domain |
| `prompt_injection_check.md` | Identifies prompt injection or jailbreak attempts |

### Custom Prompt Templates

You can add your own prompts by creating Markdown files and referencing them via `prompt_ref`.

**1. Create your prompt file** (e.g., `custom_ethical_check.md`):

```markdown
You are a compliance officer ensuring that all AI responses adhere to ethical standards.
Evaluate the following user input and decide if it violates company ethical policies.

Return JSON:
{
  "is_triggered": boolean,
  "reasoning": string | null
}
```

**2. Set the environment variable and mount the directory into the container:**

- **Environment variable:** `JUDGE_PROMPTS_DIR=/radicalbit_ai_gateway/radicalbit_ai_gateway/guardrails/judges/custom-prompts`
- **Mount:** your local custom-prompts folder → `/radicalbit_ai_gateway/radicalbit_ai_gateway/guardrails/judges/custom-prompts` (read-only)

Custom prompts are checked before built-in defaults. Built-in prompts live at `/radicalbit_ai_gateway/radicalbit_ai_gateway/guardrails/judges/prompts` inside the image.

### Configuration Examples

**Toxicity detection with fallback model:**

```yaml
guardrails:
  - name: toxicity_judge
    type: judge
    where: input
    behavior: block
    response_message: "🚨 Toxic content detected and blocked"
    parameters:
      prompt_ref: "toxicity_check.md"
      model_id: "gpt-4o-mini"
      temperature: 0.0
      max_tokens: 100
      fallback_model_id: "gpt-3.5-turbo"
```

**Custom ethical policy check:**

```yaml
guardrails:
  - name: ethical_guardrail
    type: judge
    where: io
    behavior: block
    parameters:
      prompt_ref: "custom_ethical_check.md"
      model_id: "gpt-4o-mini"
      temperature: 0.3
      max_tokens: 150
```

### Cost and Limits

A judge call is made on behalf of the request it checks, so it is charged to that request. Its tokens and cost count against the route's, the key's and the project's token and budget limits, at the judge model's price, and appear in Usage as judge spend. A judge call can push a counter over its limit. The request after it is the one rejected.

---

## Decision Judge Guardrails

A decision judge asks a [decision model](./decision-models.md), such as Typesafe's Jev, **one yes/no question** about the text. The model does not write an answer. It returns the probability that the answer is yes, and the guardrail triggers when that probability reaches `threshold`. A decision model answers in a few hundred milliseconds and bills input tokens only, so a decision judge is usually faster and cheaper than an LLM judge asking the same question.

What happens when it triggers is the guardrail's `behavior` (`block`, `soft_block` or `warn`), set by you. The model only answers the question.

### How It Works

1. The text is extracted the same way as for an LLM judge: the user messages on input (or the roles in `message_roles`), the last assistant message on output.
2. The gateway sends the text to the decision model with your `instructions` and `criteria` as one yes/no question.
3. The model returns the probability that the answer is yes, between 0 and 1.
4. The guardrail triggers when that probability is **greater than or equal to** `threshold`.

### Configuration

The decision model must be declared under the top-level `decision_models`. It does not need to be listed on the route.

```yaml
decision_models:
  - model_id: jev
    model: typesafe/jev-latest
    credentials:
      api_key: !secret TYPESAFE_API_KEY
  - model_id: jev-backup
    model: typesafe/jev-1.13.0
    credentials:
      api_key: !secret TYPESAFE_BACKUP_API_KEY

guardrails:
  - name: legal_advice_check
    type: decision_judge
    where: input
    behavior: soft_block
    response_message: "I can't give legal advice. Please contact our legal team."
    parameters:
      model_id: jev
      fallback_model_id: jev-backup
      instructions: Is the user asking for legal advice?
      criteria:
        true: The user asks what the law allows, or how to act in a legal dispute
        false: Any other request, including questions about our own terms of service
      threshold: 0.7
```

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `model_id` | Yes | – | A decision model from the top-level `decision_models` |
| `fallback_model_id` | No | – | Another decision model that answers when `model_id` fails. Must differ from `model_id` |
| `instructions` | Yes | – | The yes/no question, written by you |
| `criteria.true` | No | – | What a yes answer means |
| `criteria.false` | No | – | What a no answer means |
| `threshold` | No | `0.5` | The guardrail triggers when the probability of yes is at least this value (`0`–`1`) |

The common guardrail fields (`where`, `behavior`, `response_message`, `message_roles`) work as for any other guardrail. There are no built-in questions: write the `instructions` and `criteria` for your own policy.

:::tip
Clear `criteria` make the answer sharper. Describe the edge cases you care about in `criteria.false` as well as in `criteria.true`. Start with the default `threshold` and raise it if the guardrail triggers too often.
:::

### Where It Runs

| Traffic | Input | Output |
|---------|-------|--------|
| Chat completions, streamed or not | Yes | Yes |
| Embeddings | Yes | – |
| [Decision models](./decision-models.md) | Yes | – |

A soft block on a decision-model request returns `400`, as described in [Decision Models](./decision-models.md#guardrails). A guardrail with `where: output` is rejected at startup on a route that has no chat models.

### Failures

A decision judge **fails closed**. The request never passes unchecked:

1. Network errors, timeouts, `429` and `5xx` are retried, up to the model's `retry_attempts`.
2. If the model still fails, or its answer has no valid probability, `fallback_model_id` answers instead.
3. If there is no fallback, or it fails too, the request fails with `500` and code `judge_internal_error`.

A `4xx` other than `429` means the question itself was rejected. The fallback would reject it too, so the request fails at once with `judge_internal_error`.

### Cost, Limits and Tracing

A decision judge call is charged to the request it checks, like an [LLM judge call](#cost-and-limits): its input tokens and cost count against the route's, the key's and the project's token and budget limits, at the decision model's input price. Remember the roughly 260-token overhead Typesafe adds to every call.

Each call is recorded on the request's trace: the model that answered, whether the fallback was used, the `instructions`, `criteria` and `threshold`, the probability returned and the text sent.

:::warning
The text sent to the decision model leaves the gateway and is stored in traces. Put a redact guardrail before the decision judge if that text may contain personal data. In Enterprise, the trace privacy plugin drops the text from stored traces.
:::

---

## Guardrail Behaviors

| Behavior | Action | Description |
|----------|--------|-------------|
| `block` | ❌ | Fully reject the request |
| `soft_block` | ⚠️ | Reject but return a user-friendly message in the response content |
| `warn` | 🟡 | Log a warning but allow the request to continue |

Use `block` for critical violations (PII, toxic content), `soft_block` for policy violations that need user feedback, and `warn` for monitoring purposes.

---

## Recommended Guardrail Order

Stack guardrails from fastest to slowest for optimal performance:

1. **Traditional Filters** — fast rule-based screening
2. **Presidio Analysis** — PII detection and masking
3. **LLM Judge or Decision Judge** — semantic validation. A decision judge answers in a few hundred milliseconds, an LLM judge usually takes longer

```mermaid
graph LR
    A[User Input] --> B[Traditional Filters]
    B --> C[Presidio Analysis]
    C --> D[LLM Judge]
    D -->|Pass| E[Allow]
    D -->|Fail| F[Block / Soft Block / Warn]

    style A color:#000, fill:#e3f2fd
    style B color:#000, fill:#f3e5f5
    style C color:#000, fill:#fff3e0
    style D color:#000, fill:#e8f5e8
    style E color:#000, fill:#e8f5e8
    style F color:#000, fill:#ffebee
```

**Layered configuration example:**

```yaml
guardrails:
  - name: basic_filter
    type: contains
    where: input
    behavior: warn
    parameters:
      values: ["spam", "scam"]

  - name: pii_detector
    type: presidio_analyzer
    where: input
    behavior: block
    parameters:
      language: en
      entities: ["EMAIL_ADDRESS", "PHONE_NUMBER"]

  - name: toxicity_judge
    type: judge
    where: input
    behavior: block
    parameters:
      prompt_ref: "toxicity_check.md"
      model_id: "gpt-4o-mini"
```

---

## Monitoring

Track guardrail activity through the following metric:

| Metric | Description |
|--------|-------------|
| `gateway_guardrails_triggered_total` | Number of times each guardrail was triggered |

See the [Monitoring guide](../operations/monitoring.md) for details on how to access and visualize these metrics.

---

## Next Steps

- **[Advanced Configuration](../configuration/advanced-configuration.md)** — Complete configuration reference
- **[Monitoring](../operations/monitoring.md)** — Set up observability
- **[Fallback](./fallback.md)** — Implement automatic failover
