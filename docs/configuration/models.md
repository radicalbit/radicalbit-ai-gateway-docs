# Model Configuration

This section provides comprehensive guidance on configuring AI models in the Radicalbit AI Gateway based on the actual codebase structure.

## Overview

The Radicalbit AI Gateway supports multiple AI providers and models through a flexible configuration system.

With the **new configuration structure**:

- Models are defined at **top-level** under:
  - `chat_models` (for chat/completions)
  - `embedding_models` (for embeddings)
- Routes **do not contain full model objects** anymore.
  - Routes reference models by **model ID** (string lists)

---

## Model Structure

### Basic Model Configuration (Chat)

```yaml
chat_models:
  - model_id: openai-4o
    model: openai/gpt-4o
    credentials:
      api_key: !secret OPENAI_API_KEY
    params:
      temperature: 1
      max_tokens: 20

routes:
  production:
    chat_models:
      - openai-4o
```

### Model Fields

#### Required Fields

- **`model_id`**: Unique identifier for the model (used by routes and fallbacks)
- **`model`**: Model identifier in format `provider/model_name` (e.g., `openai/gpt-4o`)

#### Optional Fields

- **`credentials`**: API credentials for accessing the model
- **`params`**: Model parameters (temperature, max_tokens, etc.)
- **`retry_attempts`**: Number of retry attempts (default: 3)
- **`prompt`**: Optional inline system/developer prompt (mutually exclusive with `prompt_ref`)
- **`prompt_ref`**: Optional reference to a Markdown file containing the prompt
- **`role`**: Role used when injecting `prompt`/`prompt_ref` (allowed: `system` or `developer` when `prompt` is set)
- **`input_cost_per_million_tokens`**: Cost per million input tokens
- **`output_cost_per_million_tokens`**: Cost per million output tokens

---

## Supported Providers

The gateway has native support for the following providers. The `model` field always follows the `provider/model-name` format.

### OpenAI

```yaml
chat_models:
  - model_id: gpt-4o
    model: openai/gpt-4o
    credentials:
      api_key: !secret OPENAI_API_KEY
```

Common models: `openai/gpt-4o`, `openai/gpt-4o-mini`, `openai/o1`, `openai/o3-mini`

### Anthropic

```yaml
chat_models:
  - model_id: claude
    model: anthropic/claude-3-5-sonnet-latest
    credentials:
      api_key: !secret ANTHROPIC_API_KEY
```

Common models: `anthropic/claude-3-5-sonnet-latest`, `anthropic/claude-3-haiku-20240307`

:::note
The gateway automatically handles Anthropic-specific streaming behavior and prompt caching.
:::

### Google Gemini

```yaml
chat_models:
  - model_id: gemini
    model: google-genai/gemini-2.5-flash
    credentials:
      api_key: !secret GOOGLE_API_KEY   # required — no env fallback
```

Common models: `google-genai/gemini-2.5-flash`, `google-genai/gemini-2.5-pro`

Embedding models use a `models/` prefix:
```yaml
embedding_models:
  - model_id: gemini-embedding
    model: google-genai/models/gemini-embedding-001
    credentials:
      api_key: !secret GOOGLE_API_KEY
    params:
      task_type: RETRIEVAL_QUERY  # RETRIEVAL_DOCUMENT | SEMANTIC_SIMILARITY | CLASSIFICATION | CLUSTERING
```

### DeepSeek

```yaml
chat_models:
  - model_id: deepseek
    model: deepseek/deepseek-chat
    credentials:
      api_key: !secret DEEPSEEK_API_KEY
```

Common models: `deepseek/deepseek-chat`, `deepseek/deepseek-reasoner`

:::note
DeepSeek uses its own tokenizer for accurate token counting — this is handled automatically.
:::

### Mistral

```yaml
chat_models:
  - model_id: mistral
    model: mistralai/mistral-large-latest
    credentials:
      api_key: !secret MISTRAL_API_KEY
```

Common models: `mistralai/mistral-large-latest`, `mistralai/mistral-nemo-latest`

### Azure OpenAI

```yaml
chat_models:
  - model_id: azure-gpt4o
    model: azure/my-deployment-name
    credentials:
      api_key: !secret AZURE_OPENAI_KEY
      api_version: "2024-02-01"
      # azure_ad_token: !secret AZURE_AD_TOKEN  # alternative to api_key
```

### OpenAI-compatible endpoints

Any provider that exposes an OpenAI-compatible API — Ollama, vLLM, OpenRouter, or any on-premises deployment — works by using the `openai/` prefix with a `base_url`:

```yaml
chat_models:
  # Ollama (local)
  - model_id: llama3
    model: openai/llama3.2:3b
    credentials:
      base_url: "http://host.docker.internal:11434/v1"

  # vLLM (on-premises)
  - model_id: vllm-model
    model: openai/your-deployed-model
    credentials:
      base_url: "http://vllm-server:8000/v1"
      api_key: !secret VLLM_API_KEY  # if required

  # OpenRouter
  - model_id: openrouter-model
    model: openai/meta-llama/llama-3.1-8b-instruct
    credentials:
      base_url: "https://openrouter.ai/api/v1"
      api_key: !secret OPENROUTER_API_KEY
```

:::tip
Need a provider not listed here? Additional integrations can be developed on request — [contact us](../reference/contacts.md).
:::

### Mock Models (Testing)
```yaml
chat_models:
  - model_id: mock-chat
    model: mock/gateway
    params:
      latency_ms: 150
      response_text: "mocked response"

embedding_models:
  - model_id: mock-embed
    model: mock/embeddings
    params:
      latency_ms: 100
      vector_size: 8
```

---

## Model Types

### Chat Models
Used for conversational AI and text generation.

Definition:
```yaml
chat_models:
  - model_id: assistant
    model: openai/gpt-4o
    credentials:
      api_key: !secret OPENAI_API_KEY
    params:
      temperature: 0.7
      max_tokens: 1000
```

Usage in routes:
```yaml
routes:
  customer-service:
    chat_models:
      - assistant
```

### Embedding Models
Used for embeddings and vector operations.

Definition:
```yaml
embedding_models:
  - model_id: emb-small
    model: openai/text-embedding-3-small
    credentials:
      api_key: !secret OPENAI_API_KEY
```

Usage in routes:
```yaml
routes:
  semantic-cache-demo:
    chat_models:
      - assistant
    embedding_models:
      - emb-small
```

---

## Credentials Configuration

### API Key Authentication
```yaml
credentials:
  api_key: !secret OPENAI_API_KEY
```

### Custom Base URL
```yaml
credentials:
  base_url: "http://localhost:11434/v1"
  api_key: "dummy-api-key"  # May be required by some OpenAI-compatible servers/clients
```

---

## Model Parameters

### Common Parameters
- **`temperature`**: Controls randomness (0.0-2.0)
- **`max_tokens`**: Maximum tokens to generate
- **`top_p`**: Nucleus sampling parameter
- **`frequency_penalty`**: Penalty for frequent tokens
- **`presence_penalty`**: Penalty for new tokens

### Provider-Specific Parameters
Each provider may support additional parameters. Refer to the provider's documentation for complete details.

---

## Cost Configuration

### Automatic Cost Assignment
The gateway can assign costs from a price list (e.g. `model_prices.json`) if not explicitly configured:

```yaml
chat_models:
  - model_id: gpt-4o
    model: openai/gpt-4o
    # Costs can be automatically assigned if supported
```

### Manual Cost Configuration
```yaml
chat_models:
  - model_id: custom-model
    model: openai/gpt-4o
    input_cost_per_million_tokens: 5.0
    output_cost_per_million_tokens: 15.0
```

---

## Retry Configuration

### Default Retry Policy
```yaml
chat_models:
  - model_id: gpt-4o
    model: openai/gpt-4o
    retry_attempts: 3  # Default value
```

### Custom Retry Policy
```yaml
chat_models:
  - model_id: unreliable-model
    model: openai/gpt-4o-mini
    retry_attempts: 5
```

---

## Prompts

### Basic Prompt
```yaml
chat_models:
  - model_id: assistant
    model: openai/gpt-4o
    prompt: "You are a helpful assistant."
    role: system
```

### File-based Prompt (`prompt_ref`)
You can load the default prompt from a Markdown file mounted at runtime.

```yaml
chat_models:
  - model_id: assistant
    model: openai/gpt-4o
    # Use either `prompt` OR `prompt_ref` (mutually exclusive)
    prompt_ref: "assistant.md"
    role: system
```

### Role-Based Prompt
```yaml
chat_models:
  - model_id: developer-assistant
    model: openai/gpt-4o
    prompt: "You are a senior software developer."
    role: developer
```

---

## Model Validation

### Unique Model IDs
Model IDs should be unique **within each top-level section**.

```yaml
chat_models:
  - model_id: gpt-4o        # ✅ Unique
    model: openai/gpt-4o
  - model_id: gpt-4o-mini # ✅ Unique
    model: openai/gpt-4o-mini
```

### Route References
- Every ID listed in `routes.<route>.chat_models` must match a `chat_models[].model_id`
- Every ID listed in `routes.<route>.embedding_models` must match an `embedding_models[].model_id`

### Credential Validation
- Many hosted providers require API keys
- OpenAI-compatible servers may require a dummy `api_key` depending on the client/adapter

---

## Best Practices

### Model Organization
- Use descriptive `model_id` names
- Separate production and testing models
- Keep prompts short and consistent across environments
- Prefer `prompt_ref` for environment-specific prompts (mount different prompt folders per environment without changing `config.yaml`).

### Cost Management
- Configure cost information for accurate billing
- Use automatic cost assignment when possible
- Monitor token usage through metrics

### Error Handling
- Configure appropriate retry attempts
- Use fallback models for critical routes
- Monitor model availability

---

## Troubleshooting

### Common Issues

1. **Model Not Found**: Verify the `model_id` exists in `chat_models` / `embedding_models` and is correctly referenced by routes/fallbacks
2. **Authentication Errors**: Check API keys and `credentials` configuration
3. **Prompt File Not Found**: If using `prompt_ref`, ensure the Markdown file exists in the mounted `PROMPTS_DIR` inside the container and the filename matches the configured value.
4. **Cost Assignment**: Ensure model names match those in the price list file (if used)

### Debug Configuration
```yaml
chat_models:
  - model_id: debug-model
    model: openai/gpt-4o-mini
    retry_attempts: 1  # Reduce retries for faster debugging

routes:
  debug:
    chat_models:
      - debug-model
```

---

## Next Steps

- **[Fallback](../features/fallback.md)** - Set up automatic failover
- **[Advanced Configuration](../configuration/advanced-configuration.md)** - Enterprise configuration options
- **[API Reference](../api-reference/endpoints.md)** - Complete API documentation
