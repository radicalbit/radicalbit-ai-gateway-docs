import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Advanced Configuration

:::info
*This page is under development.*
:::

In this page we are going to explain how to configure the Gateway routes in all its component and features.

- **[Routes](#routes)**
- **[Models](#models)**
- **[Guardrails](#guardrails)**
- **[Fallback](#fallback)**
- **[Caching](#caching)**
- **[Rate Limiting](#rate-limiting)**
- **[Token Limiting](#token-limiting)**
- **[Routing](#routing)**

The gateway's entire behavior is controlled by a single YAML configuration file. This file defines:

- **Reusable model definitions** at top-level (`chat_models`, `embedding_models`)
- **Routes** that reference models by **model ID**
- **Optional features** applied per-route (guardrails, fallback, caching, limits, etc.)

---

## Routes

The top-level key is `routes`. Each key under `routes` defines a separate API endpoint with its own independent configuration (e.g. `customer-service`, `business-development`, `finance`).

With the new structure:

- `chat_models` inside a route is **a list of model IDs** (strings), not full model objects.
- `embedding_models` inside a route (optional) is **a list of embedding model IDs** (strings).
- Actual model configurations live at the top level under `chat_models` and `embedding_models`.

Example of `config.yaml`:

```yaml
chat_models:
  - model_id: gpt-4o-mini
    model: openai/gpt-4o-mini
    credentials:
      api_key: !secret OPENAI_API_KEY
    params:
      temperature: 0.7
      max_tokens: 300
    # Use either `prompt` OR `prompt_ref` (mutually exclusive)
    prompt_ref: "helpful_assistant.md"
    role: system

  - model_id: claude-3-sonnet
    model: anthropic/claude-3-5-sonnet-latest
    credentials:
      api_key: !secret ANTHROPIC_API_KEY
    params:
      temperature: 0.7
      max_tokens: 300
    prompt: "You are a financial advisor."
    role: system

embedding_models:
  - model_id: text-embedding-3-small
    model: openai/text-embedding-3-small
    credentials:
      api_key: !secret OPENAI_API_KEY

  - model_id: text-embedding-ada-002
    model: openai/text-embedding-ada-002
    credentials:
      api_key: !secret OPENAI_API_KEY

routes:
  customer-service:
    chat_models:
      - gpt-4o-mini

  business-development:
    chat_models:
      - gpt-4o-mini

  finance:
    chat_models:
      - claude-3-sonnet

  search-and-analytics:
    chat_models:
      - gpt-4o-mini
    embedding_models:
      - text-embedding-3-small
      - text-embedding-ada-002
```

---

## Models

The Radicalbit AI Gateway supports all OpenAI-compatible models. This means that the gateway integrates with the vast majority of models on the market, both proprietary and open-source.

The Gateway supports the following types of models:

* **Chat Completion**
* **Embeddings**

With the new configuration layout, **models are defined once at top-level** and then **referenced by ID** inside routes.

### Chat Completion

<Tabs>
  <TabItem value="openai" label="OpenAI" default>
  ```yaml
  chat_models:
    - model_id: openai-4o
      model: openai/gpt-4o
      credentials:
        api_key: !secret OPENAI_API_KEY
      params:
        temperature: 1
        max_tokens: 200
      # Use either `prompt` OR `prompt_ref` (mutually exclusive)
      prompt_ref: "helpful_assistant.md"
      role: system

  routes:
    your-route:
      chat_models:
        - openai-4o
  ```

  - **`model_id`**: Unique identifier for the model (Required)
  - **`model`**: Model identifier in format `provider/model_name` (e.g., `openai/gpt-4o`) (Required)
  - **`credentials`**: API credentials for accessing the model
  - **`params`**: Model parameters (temperature, max_tokens, etc.)
  - **`retry_attempts`**: Number of retry attempts (default: 3)
  - **`prompt`**: Optional inline system/developer prompt (mutually exclusive with `prompt_ref`)
  - **`prompt_ref`**: Optional reference to a Markdown file containing the prompt
  - **`role`**: Role used when injecting `prompt`/`prompt_ref` (allowed: system or developer when prompt is set)
  - **`input_cost_per_million_tokens`**: Cost per million input tokens
  - **`output_cost_per_million_tokens`**: Cost per million output tokens
  ---
  </TabItem>

  <TabItem value="openai-like" label="OpenAI-like">
  ```yaml
  chat_models:
    - model_id: llama3
      model: openai/llama3.2:3b
      credentials:
        base_url: "http://host.docker.internal:11434/v1"
      params:
        temperature: 0.7
        top_p: 0.9
      prompt_ref: "assistant.md"
      role: system

  routes:
    your-route:
      chat_models:
        - llama3
  ```
  ---
  </TabItem>

  <TabItem value="gemini" label="Gemini">
  ```yaml
  chat_models:
    - model_id: gemini-pro
      model: google-genai/gemini-2.5-flash
      credentials:
        api_key: !secret GOOGLE_API_KEY
      params:
        temperature: 0.7
        max_output_tokens: 1024
      prompt: "You are a helpful assistant powered by Google Gemini."
      role: system

  routes:
    your-route:
      chat_models:
        - gemini-pro
  ```
  ---
  </TabItem>
</Tabs>

### File-based prompts (`prompt_ref`)

When using `prompt_ref`, the referenced Markdown file must be available inside the gateway container.
Mount a host folder containing prompt files and configure the directories via environment variable:

- `PROMPTS_DIR`: directory for chat model prompts (`prompt_ref`)

Example (docker compose snippet):
```yaml
environment:
  PROMPTS_DIR: "/radicalbit_ai_gateway/radicalbit_ai_gateway/prompts"
volumes:
  - ${PROMPTS_HOST_DIR:-./prompts}:/radicalbit_ai_gateway/radicalbit_ai_gateway/prompts:ro
```

### Embeddings

<Tabs>
  <TabItem value="openai" label="OpenAI" default>
  ```yaml
  embedding_models:
    - model_id: emb_model_for_caching
      model: openai/text-embedding-3-small
      credentials:
        api_key: !secret OPENAI_API_KEY

  routes:
    your-route:
      embedding_models:
        - emb_model_for_caching
  ```

  - **`model_id`**: Unique identifier for the model (Required)
  - **`model`**: Model identifier in format `provider/model_name` (Required)
  - **`credentials`**: API credentials for accessing the model
  ---
  </TabItem>

  <TabItem value="openai-like" label="OpenAI-like">
  ```yaml
  embedding_models:
    - model_id: emb_model_for_caching
      model: openai/text-embedding-3-small
      credentials:
        base_url: "http://host.docker.internal:11434/v1"

  routes:
    your-route:
      embedding_models:
        - emb_model_for_caching
  ```
  ---
  </TabItem>

  <TabItem value="gemini" label="Gemini">
  ```yaml
  embedding_models:
    - model_id: gemini-embedding
      model: google-genai/models/gemini-embedding-001
      credentials:
        api_key: !secret GOOGLE_API_KEY
      params:
        task_type: RETRIEVAL_QUERY  # Optional: RETRIEVAL_DOCUMENT, SEMANTIC_SIMILARITY, CLASSIFICATION, CLUSTERING

  routes:
    your-route:
      embedding_models:
        - gemini-embedding
  ```
  ---
  </TabItem>
</Tabs>

---

## Guardrails

Guardrails are defined at the **top level** of `config.yaml` and then **referenced by name** inside a route. This allows the same guardrail to be reused across multiple routes.

```yaml
guardrails:
  - name: my_guardrail       # unique identifier
    type: ...                # guardrail type
    where: input             # input | output | io
    behavior: block          # block | soft_block | warn (not needed for redact types)
    response_message: "..."  # optional message returned to the user when triggered
    parameters: ...          # type-specific settings

routes:
  your-route:
    chat_models:
      - your-model
    guardrails:
      - my_guardrail         # reference by name
```

- **`name`**: Unique identifier, used to reference the guardrail from a route.
- **`type`**: The guardrail type (see subsections below).
- **`where`**: Where to apply it — `input` (user message), `output` (model response), or `io` (both).
- **`behavior`**: Action when triggered — `block` (reject), `soft_block` (reject with friendly message), `warn` (log and continue). Not required for redact types.
- **`response_message`**: Optional message returned to the user when the guardrail fires.
- **`parameters`**: Type-specific configuration.

### Text Control

Fast, rule-based filters using pattern matching. These run with minimal latency and should be your first line of defence.

| Type | Description |
|------|-------------|
| `starts_with` | Triggers if the text starts with any of the specified strings |
| `ends_with` | Triggers if the text ends with any of the specified strings |
| `contains` | Triggers if the text contains any of the specified substrings |
| `regex` | Triggers if the text matches any of the specified regular expressions |

All four types use the same `parameters` key: **`values`** — a list of strings or patterns to match against.

**Example:**
```yaml
guardrails:
  - name: profanity_filter
    type: contains
    where: input
    behavior: block
    parameters:
      values: ["inappropriate", "offensive", "spam"]
    response_message: "Content blocked due to inappropriate language"

  - name: email_detector
    type: regex
    where: io
    behavior: block
    parameters:
      values: ['\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b']
    response_message: "Email addresses are not allowed"

routes:
  your-route:
    chat_models:
      - your-model
    guardrails:
      - profanity_filter
      - email_detector
```

### PII Detection and Masking

PII guardrails are powered by [Microsoft Presidio](https://microsoft.github.io/presidio/) and support two types:

- **`presidio_analyzer`** — a *Check* guardrail that detects PII and blocks or warns depending on `behavior`.
- **`presidio_anonymizer`** — a *Redact* guardrail that masks detected PII with placeholders (e.g., `<EMAIL_ADDRESS>`). Always redacts; no `behavior` required.

Both types accept the same `parameters`:

- **`language`**: Language of the text (e.g., `en`, `it`).
- **`entities`**: List of PII entity types to detect (e.g., `EMAIL_ADDRESS`, `PHONE_NUMBER`, `IBAN_CODE`, `IT_IDENTITY_CARD`).

**Example:**
```yaml
guardrails:
  - name: pii_block
    type: presidio_analyzer
    where: input
    behavior: block
    parameters:
      language: en
      entities: ["EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD"]
    response_message: "Personal information detected and blocked"

  - name: pii_mask
    type: presidio_anonymizer
    where: io
    parameters:
      language: it
      entities: ["EMAIL_ADDRESS", "IBAN_CODE", "IT_IDENTITY_CARD"]

routes:
  your-route:
    chat_models:
      - your-model
    guardrails:
      - pii_block
      - pii_mask
```

### LLM-as-a-Judge

The `judge` type uses a language model to semantically evaluate content against a policy defined in a prompt template. It is slower than rule-based filters but can handle complex, context-dependent decisions.

- **`prompt_ref`**: Filename of the prompt template to use (built-in or custom).
- **`model_id`**: The model used as the judge.
- **`temperature`**: Sampling temperature for the judge model.
- **`max_tokens`**: Maximum tokens for the judge's response.
- **`fallback_model_id`** *(optional)*: A backup model to use if the primary judge fails.

**Built-in prompt templates:**

| Prompt | Purpose |
|--------|---------|
| `toxicity_check.md` | Detects offensive, abusive, or harmful content |
| `business_context_check.md` | Validates if the request aligns with your business domain |
| `prompt_injection_check.md` | Identifies prompt injection or jailbreak attempts |

Custom prompts can be added by mounting a directory and setting `JUDGE_PROMPTS_DIR`. See the [Guardrails](../features/guardrails.md#custom-prompt-templates) page for details.

**Example:**
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

routes:
  your-route:
    chat_models:
      - your-model
    guardrails:
      - toxicity_judge
```

For the full guardrails reference including all parameters and behaviors, see the **[Guardrails](../features/guardrails.md)** page.

---

## Fallback

Defines a chain of backup models to use if the primary model fails (e.g., due to an API error or downtime). The gateway will automatically try the fallbacks in the order they are listed.

- **`target`**: The `model_id` of the primary model.
- **`fallbacks`**: A list of `model_id`s to try in sequence if the `target` fails.
- **`type`** *(optional)*: Use `embedding` for embedding fallbacks.

**Example (chat fallback):**
```yaml
routes:
  route-name:
    chat_models:
      - openai-4o
      - llama3.2
      - qwen
    fallback:
      - target: openai-4o
        fallbacks:
          - llama3.2
          - qwen
```

If a request is routed to `openai-4o` and it fails, the gateway will retry the same request with `llama3.2`. If `llama3.2` also fails, it will try `qwen`.

**Example (embedding fallback):**
```yaml
routes:
  route-name:
    embedding_models:
      - text-embedding-3-small
      - text-embedding-ada-002
    fallback:
      - target: text-embedding-3-small
        fallbacks:
          - text-embedding-ada-002
        type: embedding
```

---

## Caching

### Exact Cache

Exact caching serves identical requests from memory instead of calling the LLM again.

- **`type`**: `exact`
- **`ttl`**: Time-to-live in seconds

At the top level of the `config.yaml`, a `cache` object must be defined if any route has caching enabled.

**Example:**
```yaml
routes:
  route-name:
    chat_models:
      - openai-4o
    caching:
      type: exact
      ttl: 300

cache:
  redis_host: "valkey"
  redis_port: 6379
```

### Semantic Cache

Semantic cache retrieves responses based on similarity. The route must declare:

- at least one `chat_model`
- one `embedding_model` used to generate embeddings for cache lookup/storage

For each new request, the embedding model is invoked, and a similarity score is computed against stored vectors. If a cached entry exceeds `similarity_threshold`, the cached response is returned.

```yaml
routes:
  your-route:
    chat_models:
      - openai-4o
    embedding_models:
      - text-embedding-3-small
    caching:
      type: semantic
      ttl: 60
      embedding_model_id: text-embedding-3-small
      similarity_threshold: 0.80
      distance_metric: cosine
      dim: 1536

cache:
  redis_host: "valkey"
  redis_port: 6379
```

* **`ttl`**: The time-to-live (in seconds) for a cached entry.
* **`type`**: The caching strategy (`semantic` enables vector-based caching).
* **`embedding_model_id`**: The embedding model ID used to generate/compare embeddings.
* **`similarity_threshold`**: Minimum similarity score to accept a cached match.
* **`distance_metric`**: Similarity metric (`cosine`, `euclidean`, `dot`).
* **`dim`**: Dimensionality of produced embeddings (must match the model output).

---

## Rate Limiting

Controls the number of requests allowed over a time window for a given route.

- **`algorithm`**: The limiting algorithm. Currently, only `fixed_window` is supported.
- **`window_size`**: The duration of the time window (e.g., `1 minute`, `120 seconds`).
- **`max_requests`**: The maximum number of requests allowed in that window.

**Example:**
```yaml
routes:
  route-name:
    chat_models:
      - openai-4o
    rate_limiting:
      algorithm: fixed_window
      window_size: 1 minute
      max_requests: 20
```

---

## Token Limiting

Controls the cumulative number of tokens processed for a route's inputs and outputs over a time window. This is excellent for managing costs.

It has two sections: `input` and `output`.

* **`algorithm`**: The limiting algorithm (e.g., `fixed_window`).
* **`window_size`**: The duration of the time window.
* **`max_token`**: The total number of tokens that can be processed in that window.

Example:

```yaml
routes:
  route-name:
    chat_models:
      - openai-4o
    token_limiting:
      input:
        window_size: 10 seconds
        max_token: 1000
      output:
        window_size: 10 minutes
        max_token: 500
```

---

## Routing

Intelligent routing allows the gateway to dynamically select which model handles a request based on configurable rules. Routing configs are defined at top-level under `routing` and referenced by name from routes.

- **`name`**: Unique identifier for the routing config.
- **`type`** *(optional)*: The routing strategy. Defaults to `deterministic`.
- **`default_model_id`**: Model ID to use when no rule condition matches.
- **`rule`**: The rule type to apply. One of: `keyword`, `token_length`, `time`, `budget`.
- **`output_mapping`**: List of entries mapping conditions to model IDs.

**Example (keyword routing):**
```yaml
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

If a user message contains "urgent" or "complex", the request is routed to `gpt-4o`. If it contains "simple", it goes to `gpt-4o-mini`. Otherwise, the `default_model_id` (`gpt-4o-mini`) is used.

**Example (budget routing):**
```yaml
routing:
  - name: budget-routing
    type: deterministic
    default_model_id: gpt-4o
    rule: budget
    output_mapping:
      - model_id: gpt-4o-mini
        conditions:
          threshold: 0.8

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

The threshold is evaluated against the **combined input + output budget**, in this example $150 total. When more than 80% of that combined budget ($120+) has been consumed, requests are automatically routed to the cheaper `gpt-4o-mini` model.

For full details on all rule types (keyword, token length, time, budget), see the **[Intelligent Routing](../features/advanced-routing.md)** page.

---

## Complete Configuration Example

This example showcases multiple routes and features using the **new top-level model definitions**:

```yaml
guardrails:
  - name: presidio_anonymizer
    type: presidio_anonymizer
    description: Anonymize IBAN and emails codes
    where: io
    parameters:
      language: it
      entities:
        - EMAIL_ADDRESS
        - IBAN_CODE

  - name: presidio_analyzer
    type: presidio_analyzer
    description: Block italian Identity card
    where: input
    behavior: block
    parameters:
      language: it
      entities:
        - IT_IDENTITY_CARD

chat_models:
  - model_id: qwen
    model: openai/qwen2.5:3b
    credentials:
      base_url: "http://host.docker.internal:11434/v1"
    params:
      temperature: 0.7
      top_p: 0.9
    # Use either `prompt` OR `prompt_ref` (mutually exclusive)
    prompt_ref: "customer_service.md"
    role: system

  - model_id: llama3.2
    model: openai/llama3.2
    credentials:
      base_url: "http://host.docker.internal:11434/v1"
    prompt: "You are a helpful assistant and you are nice to the customer that you are facing. Do not take initiatives"
    role: system
    params:
      temperature: 0.7
      top_p: 0.9

embedding_models:
  - model_id: text-embedding-3-small
    model: openai/text-embedding-3-small
    credentials:
      api_key: "your-api-key"

  - model_id: text-embedding-ada-002
    model: openai/text-embedding-ada-002
    credentials:
      api_key: "your-api-key"

routing:
  - name: keyword-routing
    type: deterministic
    default_model_id: qwen
    rule: keyword
    output_mapping:
      - model_id: llama3.2
        conditions:
          - "finance"
          - "budget"
      - model_id: qwen
        conditions:
          - "support"
          - "help"

routes:
  customer-service:
    chat_models:
      - qwen
      - llama3.2
    embedding_models:
      - text-embedding-3-small
      - text-embedding-ada-002
    guardrails:
      - presidio_analyzer
      - presidio_anonymizer
    fallback:
      - target: qwen
        fallbacks:
          - llama3.2
      - target: text-embedding-3-small
        fallbacks:
          - text-embedding-ada-002
        type: embedding
    rate_limiting:
      algorithm: fixed_window
      window_size: 30 seconds
      max_requests: 20

  business-development:
    chat_models:
      - qwen
      - llama3.2
    routing: keyword-routing
    rate_limiting:
      algorithm: fixed_window
      window_size: 20 seconds
      max_requests: 2
    token_limiting:
      input:
        window_size: 10 seconds
        max_token: 5

  finance:
    chat_models:
      - llama3.2
    caching:
      type: exact
      ttl: 300

cache:
  redis_host: "valkey"
  redis_port: 6379
```
