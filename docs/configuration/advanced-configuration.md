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


The gateway's entire behavior is controlled by a single YAML configuration file. This file defines all routes, models, and the features applied to them.


## Routes
The top-level key is `routes`. Each key under `routes` defines a separate API endpoint with its own independent configuration. For example, `customer-service`, `business-development`, and `finance` could all be distinct routes you can call.

Example of `config.yaml`:
```yaml
routes:
  customer-service:
    chat_models:
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
        system_prompt: "You are a helpful customer service assistant."
    
  business-development:
    chat_models:
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
        system_prompt: "You are a business development expert."
    
  finance:
    chat_models:
      - model_id: claude-3-sonnet
        model: anthropic/claude-3-5-sonnet-latest
        credentials:
          api_key: !secret ANTHROPIC_API_KEY
        system_prompt: "You are a financial advisor."
    
  search-and-analytics:
    chat_models:
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
        system_prompt: "You are a search and analytics assistant."
    embedding_models:
      - model_id: text-embedding-3-small
        model: openai/text-embedding-3-small
        credentials:
          api_key: !secret OPENAI_API_KEY
      - model_id: text-embedding-ada-002
        model: openai/text-embedding-ada-002
        credentials:
          api_key: !secret OPENAI_API_KEY
```


## Models

The Radicalbit AI Gateway supports all OpenAI-compatible models. This means that the gateway integrates with the vast majority of models on the market, both proprietary and open-source.

The Gateway supports the following types of models:

* **Chat Completion**

* **Embeddings**

Regardless of the model type (both those currently available and those that will be supported in the future), models are defined within the route and can be configured with various parameters.

### Chat Completion

<Tabs>
  <TabItem value="openai" label="OpenAI" default>
  ```yaml
  routes:
    your-route:
      chat_models:
        - model_id: openai-4o
          model: openai/gpt-4o
          credentials:
            api_key: !secret OPENAI_API_KEY
          params:
            temperature: 1
            max_tokens: 200
  ```
  - **`model_id`**: Unique identifier for the model within the route (Required)
  - **`model`**: Model identifier in format `openai/model_name` (e.g., `openai/gpt-4o`) (Required)
  - **`credentials`**: API credentials for accessing the model
  - **`params`**: Model parameters (temperature, max_tokens, etc.)
  - **`retry_attempts`**: Number of retry attempts (default: 3)
  - **`prompt`**: System prompt for the model
  - **`role`**: Role for the prompt (developer, user, system, assistant)
  - **`input_cost_per_million_tokens`**: Cost per million input tokens
  - **`output_cost_per_million_tokens`**: Cost per million output tokens
  ---
  </TabItem>
  <TabItem value="openai-like" label="OpenAI-like LLMs">
  ```yaml
  route:
    your-route:
      chat_models:
        - model_id: llama3
          model: openai/llama3.2:3b
          credentials:
          base_url: 'http://host.docker.internal:11434/v1'
          params:
            temperature: 0.7
            top_p: 0.9
          prompt: 'You are an assistant!'
  ```
  ---
  </TabItem>
  <TabItem value="gemini" label="Gemini">
  ```yaml
  routes:
    your-route:
      chat_models:
        - model_id: gemini-pro
          model: google-genai/gemini-1.5-pro
          credentials:
          api_key: !secret GOOGLE_API_KEY
          params:
          temperature: 0.7
            max_output_tokens: 1024
  ```
  ---
  </TabItem>
</Tabs>


### Embeddings

<Tabs>
  <TabItem value="openai" label="OpenAI" default>
  ```yaml
  routes:
    your-route:
      embedding_models:
        - model_id: emb_model_for_caching
          model: openai/text-embedding-3-small
          credentials:
            api_key: !secret OPENAI_API_KEY
  ```
  - **`model_id`**: Unique identifier for the model within the route (Required)
  - **`model`**: Model identifier in format `openai/model_name` (e.g., `openai/gpt-4o`) (Required)
  - **`credentials`**: API credentials for accessing the model
  ---
  </TabItem>
  <TabItem value="openai-like" label="OpenAI-like LLMs">
  ```yaml
  routes:
    your-route:
      embedding_models:
        - model_id: emb_model_for_caching
          model: openai/text-embedding-3-small
          credentials:
            api_key: !secret OPENAI_API_KEY
  ```
  - **`model_id`**: Unique identifier for the model within the route (Required)
  - **`model`**: Model identifier in format `openai/model_name` (e.g., `openai/gpt-4o`) (Required)
  - **`credentials`**: API credentials for accessing the model
  ---
  </TabItem>
  <TabItem value="gemini" label="Gemini">
  ```yaml
  routes:
    your-route:
      embedding_models:
        - model_id: gemini-embedding
          model: google-genai/models/gemini-embedding-001
          credentials:
            api_key: !secret GOOGLE_API_KEY
          params:
            task_type: RETRIEVAL_QUERY  # Optional: RETRIEVAL_DOCUMENT, SEMANTIC_SIMILARITY, CLASSIFICATION, CLUSTERING
  ```
  - **`model_id`**: Unique identifier for the model within the route (Required)
  - **`model`**: Model identifier in format `openai/model_name` (e.g., `openai/gpt-4o`) (Required)
  - **`credentials`**: API credentials for accessing the model
  ---
  </TabItem>
</Tabs>


## Guardrails

### Text Control

### PII detection and masking

### LLM-as-a-Judge

## Fallback
Defines a chain of backup models to use if the primary model fails (e.g., due to an API error or downtime). The gateway will automatically try the fallbacks in the order they are listed.

- **`target`**: The `model_id` of the primary model.
- **`fallbacks`**: A list of `model_id`s to try in sequence if the `target` fails.

**Example:**
```yaml
routes:
  route-name:
    chat_models:
      # some model configurations
      # ...
  fallback:
    - target: openai-4o
      fallbacks:
        - llama3.2
        - qwen
```

If a request is routed to `openai-4o` and it fails, the gateway will automatically retry the same request with `llama3.2`. If `llama3.2` also fails, it will try `qwen`.

If a request is routed to openai-4o and it fails, the gateway will automatically retry the same request with llama3.2. If llama3.2 also fails, it will try qwen.

## Caching

### Exact Chache
Enables caching for a route to serve identical requests from memory instead of calling the LLM again.

- **`enabled`**: `true` or `false`.
- **`ttl`**: Time-to-live in seconds. The cached response will be stored for this duration.

At the top level of the `config.yaml`, a `cache` object must be defined if any route has caching enabled.

**Example:**
```yaml
routes:
  route-name:
    chat_models:
      # some model configurations
      # ...
  caching:
    enabled: true
    ttl: 300


cache:
  redis_host: 'valkey'
  redis_port: 6379
```

### Semantic Cache

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
      # some model configurations
      # ...
  rate_limiting:
    algorithm: fixed_window
    window_size: 1 minute
    max_requests: 20
```


## Token Limiting

Controls the cumulative number of tokens processed for a route's inputs and outputs over a time window. This is excellent for managing costs.

It has two sections: input and output.

* **`algorithm`:** The limiting algorithm (e.g., fixed_window).
* **`window_size`:** The duration of the time window.
* **`max_token`:** The total number of tokens that can be processed in that window.

Example:

```yaml
routes:
  route-name:
    chat_models:
      # some model configurations
      # ...
  token_limiting:
    input:
      window_size: 10 seconds
      max_token: 1000
    output:
      window_size: 10 minutes
      max_token: 500
```




## Complete Configuration Example

This example showcases multiple routes and features:

```yaml
routes:
  customer-service:
    chat_models:
      - model_id: qwen
        model: openai/qwen2.5:3b
        credentials:
          api_key: 'your-api-key'
          base_url: 'http://host.docker.internal:11434/v1'
        system_prompt: 'You are a helpful assistant and you are nice to the customer that you are facing. Do not take initiatives'
      - model_id: llama3.2
        model: openai/llama3.2
        credentials:
          api_key: 'your-api-key'
          base_url: 'http://host.docker.internal:11434/v1'
    embedding_models:
      - model_id: text-embedding-3-small
        model: openai/text-embedding-3-small
        credentials:
          api_key: 'your-api-key'
      - model_id: text-embedding-ada-002
        model: openai/text-embedding-ada-002
        credentials:
          api_key: 'your-api-key'
    guardrails:
      - presidio_analyzer
      - presidio_anonymizer
    fallback:
      - target: qwen
        fallbacks:
          - llama3.2
      - target: llama3.2
        fallbacks:
          - qwen
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
      - model_id: qwen
        model: openai/qwen2.5:3b
        credentials:
          api_key: 'your-api-key'
          base_url: 'http://host.docker.internal:11434/v1'
    rate_limiting:
      window_size: 20 seconds
      max_requests: 2
    token_limiting:
      input:
        window_size: 10 seconds
        max_token: 5
  
  finance:
    chat_models:
      - model_id: llama3
        model: openai/llama3.2:3b
        credentials:
          api_key: 'your-api-key'
          base_url: 'http://host.docker.internal:11434/v1'
        system_prompt: 'Try to always use Wikipedia tool if some knowledge question is involved'
    caching:
      ttl: 300
      
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

cache:
  redis_host: 'valkey'
  redis_port: 6379
```

