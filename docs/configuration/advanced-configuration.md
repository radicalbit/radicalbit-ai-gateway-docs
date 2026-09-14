import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Advanced Configuration

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

- **Reusable model definitions** at top-level (`chat_models`, `embedding_models`, `transcription_models`)
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

Set the environment variable and mount the prompts directory into the container:

- **Environment variable:** `PROMPTS_DIR=/radicalbit_ai_gateway/radicalbit_ai_gateway/prompts`
- **Mount:** your local prompts folder → `/radicalbit_ai_gateway/radicalbit_ai_gateway/prompts` (read-only)

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

Guardrails are defined at the **top level** and **referenced by name** inside routes, so the same guardrail can be reused across multiple routes.

```yaml
guardrails:
  - name: my_guardrail
    type: contains          # starts_with | ends_with | contains | regex | presidio_analyzer | presidio_anonymizer | judge
    where: input            # input | output | io
    behavior: block         # block | soft_block | warn  (not needed for presidio_anonymizer)
    response_message: "..." # optional — returned to the user when triggered
    parameters: ...         # type-specific

routes:
  your-route:
    chat_models:
      - your-model
    guardrails:
      - my_guardrail        # reference by name
```

→ See **[Guardrails](../features/guardrails.md)** for all types, behaviors, PII detection, LLM-as-a-Judge, and custom prompt templates.

---

## Fallback

Defines a chain of backup models tried in order when the primary fails.

```yaml
routes:
  route-name:
    chat_models:
      - openai-4o
      - llama3.2
    fallback:
      - target: openai-4o      # primary model_id
        fallbacks:
          - llama3.2           # tried in order
      - target: embed-primary  # embedding fallback
        fallbacks:
          - embed-backup
        type: embedding        # omit for chat (default)
```

→ See **[Fallback](../features/fallback.md)** for validation rules, mixed model types, and production examples.

---

## Caching

Requires a top-level `cache` block when any route enables caching.

```yaml
# Exact cache — serves identical requests from memory
routes:
  route-name:
    chat_models:
      - openai-4o
    caching:
      type: exact
      ttl: 300            # seconds

# Semantic cache — matches similar requests via embeddings
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
      distance_metric: cosine   # cosine | euclidean | dot
      dim: 1536

cache:
  redis_host: "valkey"
  redis_port: 6379
```

→ See **[Caching](../features/caching.md)** and **[Semantic Caching](../features/semantic-caching.md)** for full details.

---

## Rate Limiting

```yaml
routes:
  route-name:
    chat_models:
      - openai-4o
    rate_limiting:
      algorithm: fixed_window      # fixed_window | aligned_fixed_window
      window_size: 1 minute
      max_requests: 20
```

→ See **[Rate Limiting](../features/rate-limiting.md)** for algorithm details and best practices.

---

## Token Limiting

```yaml
routes:
  route-name:
    chat_models:
      - openai-4o
    token_limiting:
      input:
        algorithm: fixed_window
        window_size: 10 seconds
        max_token: 1000
      output:
        algorithm: fixed_window
        window_size: 10 minutes
        max_token: 500
```

→ See **[Token Limiting](../features/token-limiting.md)** and **[Budget Limiting](../features/budget-limiting.md)** for cost control strategies.

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

If a user message contains "urgent" or "complex", the request is routed to `gpt-4o`. Otherwise `default_model_id` is used.

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

When more than 80% of the $150 budget is consumed, requests switch to `gpt-4o-mini` automatically.

→ See **[Intelligent Routing](../features/advanced-routing.md)** for all rule types: keyword, token length, context length, time, budget, text classification, and semantic routing.

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
