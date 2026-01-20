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

### File-based prompts (`prompt_ref`)

When using `prompt_ref`, the referenced Markdown file must be available inside the gateway container.
Mount a host folder containing prompt files and configure the directories via environment variables:

- `PROMPTS_DIR`: directory for chat model prompts (`prompt_ref`)
- `JUDGE_PROMPTS_DIR` (optional): directory for custom judge prompts

Example (docker compose snippet):
```yaml
environment:
  PROMPTS_DIR: "/radicalbit_ai_gateway/radicalbit_ai_gateway/prompts"
volumes:
  - ${PROMPTS_HOST_DIR:-./prompts}:/radicalbit_ai_gateway/radicalbit_ai_gateway/prompts:ro


## Guardrails

### Text Control

### PII detection and masking

### LLM-as-a-Judge

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
