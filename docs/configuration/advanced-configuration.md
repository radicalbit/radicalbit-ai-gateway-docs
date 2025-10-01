# Configuration Guide

The gateway's entire behavior is controlled by a single YAML configuration file. This file defines all routes, models, and the features applied to them.

## Configuration Structure

### Routes

The top-level key is `routes`. Each key under `routes` defines a separate API endpoint with its own independent configuration. For example, `customer-service`, `business-development`, and `finance` could all be distinct routes you can call.

**Example:**
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

### Chat Models

Within each route, the `chat_models` list defines the pool of LLMs available for that route.

- **`model_id`**: A unique name you assign to this model configuration within the route. This ID is used in `balancing`, `fallback`, etc.
- **`model`**: The actual model identifier, formatted as `provider/model_name`.
  - **OpenAI:** Use `openai/model_name`.
  - **OpenAI-Compatible (Ollama, vLLM, OpenRouter):** Prepend with `openai/`. For example, `openai/llama3`. A dummy `api_key` is required even if the model doesn't use one.
  - **Anthropic:** Use `anthropic/claude-3-5-sonnet-latest`.
- **`credentials`**: An object containing the authentication details. The available fields match those in `langchain-core` for maximum compatibility.
  - `api_key`: The API key for the service.
  - `base_url`: Crucial for self-hosted and compatible models (e.g., `http://localhost:11434/v1`). Always finish with `/v1` for OpenAI compatible models.
  - `api_version`, `azure_ad_token`: Specific to Azure deployments.
- **`params`**: A dictionary of parameters to pass to the model with every request, such as `temperature`, `max_tokens`, `top_p`, etc.
- **`system_prompt`**: A default system prompt to be prepended to the message list if one is not already present.

### Embedding Models

Within each route, the `embedding_models` list defines the pool of embedding models available for that route.

- **`model_id`**: A unique name you assign to this model configuration within the route.
- **`model`**: The actual model identifier, formatted as `provider/model_name`.
  - **OpenAI:** Use `openai/model_name`.
- **`credentials`**: An object containing the authentication details.
- **`params`**: A dictionary of parameters to pass to the model with every request.

## Load Balancing

This section controls how requests are distributed among the models defined in the route.

- **`algorithm`**: The strategy to use.
  - `ROUND_ROBIN`: Cycles through the models in order.
  - `WEIGHTED_ROUND_ROBIN`: Distributes requests based on assigned weights. A model with weight `2` will receive twice as many requests as a model with weight `1`.
- **`weights`**: A list of objects, required only for `WEIGHTED_ROUND_ROBIN`.
  - `model_id`: The ID of the model to assign a weight to.
  - `weight`: An integer representing the model's weight in the rotation.

**Example:**
```yaml
balancing:
  algorithm: weighted_round_robin
  weights:
    - model_id: openai-4o # Gets 1 out of every 6 requests
      weight: 1
    - model_id: llama3.2  # Gets 3 out of every 6 requests
      weight: 3
    - model_id: qwen       # Gets 2 out of every 6 requests
      weight: 2
```

## Fallback Mechanisms

Defines a chain of backup models to use if the primary model fails (e.g., due to an API error or downtime). The gateway will automatically try the fallbacks in the order they are listed.

- **`target`**: The `model_id` of the primary model.
- **`fallbacks`**: A list of `model_id`s to try in sequence if the `target` fails.

**Example:**
```yaml
fallback:
  - target: openai-4o
    fallbacks:
      - llama3.2
      - qwen
```

If a request is routed to `openai-4o` and it fails, the gateway will automatically retry the same request with `llama3.2`. If `llama3.2` also fails, it will try `qwen`.

## Rate Limiting

Controls the number of requests allowed over a time window for a given route.

- **`algorithm`**: The limiting algorithm. Currently, only `fixed_window` is supported.
- **`window_size`**: The duration of the time window (e.g., `1 minute`, `120 seconds`).
- **`max_requests`**: The maximum number of requests allowed in that window.

**Example:**
```yaml
rate_limiting:
  algorithm: fixed_window
  window_size: 1 minute
  max_requests: 20
```

## Token Limiting

Controls the *cumulative number of tokens* processed for a route's inputs and outputs over a time window. This is excellent for managing costs.

It has two sections: `input` and `output`.

- **`algorithm`**: The limiting algorithm (e.g., `fixed_window`).
- **`window_size`**: The duration of the time window.
- **`max_token`**: The total number of tokens that can be processed in that window.

**Example:**
```yaml
token_limiting:
  input:
    window_size: 10 seconds
    max_token: 1000
  output:
    window_size: 10 minutes
    max_token: 500
```

## Caching

Enables caching for a route to serve identical requests from memory instead of calling the LLM again.

- **`enabled`**: `true` or `false`.
- **`ttl`**: Time-to-live in seconds. The cached response will be stored for this duration.

At the top level of the `config.yaml`, a `cache` object must be defined if any route has caching enabled.

**Example:**
```yaml
# In a route
caching:
  enabled: true
  ttl: 300

# At the top level
cache:
  redis_host: 'valkey'
  redis_port: 6379
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
    balancing:
      algorithm: weighted_round_robin
      weights:
        - model_id: llama3.2
          weight: 3
        - model_id: qwen
          weight: 2
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

## Next Steps

- **[Guardrails](../features/guardrails.md)** - Implement content safety and filtering
- **[API Reference](../api-reference/endpoints.md)** - Complete API documentation
- **[Monitoring](../monitoring.md)** - Set up observability and metrics
