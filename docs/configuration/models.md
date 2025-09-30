# Model Configuration

This page provides comprehensive guidance on configuring AI models in the Radicalbit AI Gateway based on the actual codebase structure.

## Overview

The Radicalbit AI Gateway supports multiple AI providers and models through a flexible configuration system. Models are defined within routes and can be configured with various parameters including credentials, retry policies, and cost information.

## Model Structure

### Basic Model Configuration

```yaml
routes:
  production:
    chat_models:
      - model_id: openai-4o
        model: openai/gpt-4o
        credentials:
          api_key: !secret OPENAI_API_KEY
        params:
          temperature: 1
          max_tokens: 20
```

### Model Fields

#### Required Fields

- **`model_id`**: Unique identifier for the model within the route
- **`model`**: Model identifier in format `provider/model_name` (e.g., `openai/gpt-4o`)

#### Optional Fields

- **`credentials`**: API credentials for accessing the model
- **`params`**: Model parameters (temperature, max_tokens, etc.)
- **`retry_attempts`**: Number of retry attempts (default: 3)
- **`prompt`**: System prompt for the model
- **`role`**: Role for the prompt (developer, user, system, assistant)
- **`input_cost_per_million_tokens`**: Cost per million input tokens
- **`output_cost_per_million_tokens`**: Cost per million output tokens

## Supported Providers

### OpenAI
```yaml
- model_id: gpt-4o
  model: openai/gpt-4o
  credentials:
    api_key: !secret OPENAI_API_KEY
  params:
    temperature: 0.7
    max_tokens: 1000
```

### Ollama (Local Models)
```yaml
- model_id: llama3
  model: openai/llama3.2:3b
  credentials:
    base_url: 'http://host.docker.internal:11434/v1'
  params:
    temperature: 0.7
    top_p: 0.9
  prompt: 'Do what the user asks without thinking.'
```

### Mock Models (Testing)
```yaml
- model_id: mock-chat
  model: mock/gateway
  params:
    latency_ms: 150
    response_text: "risposta dal mock"
```

## Model Types

### Chat Models
Used for conversational AI and text generation:

```yaml
chat_models:
  - model_id: gpt-4o
    model: openai/gpt-4o
    credentials:
      api_key: !secret OPENAI_API_KEY
    params:
      temperature: 0.7
      max_tokens: 1000
```

### Embedding Models
Used for text embeddings and vector operations:

```yaml
embedding_models:
  - model_id: mock-embed
    model: mock/embeddings
    params:
      latency_ms: 100
      vector_size: 8
```

## Credentials Configuration

### API Key Authentication
```yaml
credentials:
  api_key: !secret OPENAI_API_KEY
```

### Custom Base URL
```yaml
credentials:
  base_url: 'http://localhost:11434/v1'
  api_key: 'dummy-api-key'  # Required for OpenAI-compatible APIs
```

## Model Parameters

### Common Parameters
- **`temperature`**: Controls randomness (0.0-2.0)
- **`max_tokens`**: Maximum tokens to generate
- **`top_p`**: Nucleus sampling parameter
- **`frequency_penalty`**: Penalty for frequent tokens
- **`presence_penalty`**: Penalty for new tokens

### Provider-Specific Parameters
Each provider may support additional parameters. Refer to the provider's documentation for complete details.

## Cost Configuration

### Automatic Cost Assignment
The gateway automatically assigns costs from `model_prices.json` if not explicitly configured:

```yaml
- model_id: gpt-4o
  model: openai/gpt-4o
  # Costs will be automatically assigned from model_prices.json
```

### Manual Cost Configuration
```yaml
- model_id: custom-model
  model: openai/gpt-4o
  input_cost_per_million_tokens: 5.0
  output_cost_per_million_tokens: 15.0
```

## Retry Configuration

### Default Retry Policy
```yaml
- model_id: gpt-4o
  model: openai/gpt-4o
  retry_attempts: 3  # Default value
```

### Custom Retry Policy
```yaml
- model_id: unreliable-model
  model: openai/gpt-3.5-turbo
  retry_attempts: 5
```

## System Prompts

### Basic System Prompt
```yaml
- model_id: assistant
  model: openai/gpt-4o
  prompt: "You are a helpful assistant."
  role: "system"
```

### Role-Based Prompts
```yaml
- model_id: developer-assistant
  model: openai/gpt-4o
  prompt: "You are a senior software developer."
  role: "developer"
```

## Model Validation

### Unique Model IDs
All models within a route must have unique `model_id` values:

```yaml
chat_models:
  - model_id: gpt-4o        # ✅ Unique
    model: openai/gpt-4o
  - model_id: gpt-3.5-turbo # ✅ Unique
    model: openai/gpt-3.5-turbo
```

### Credential Validation
- OpenAI models require API keys when using standard endpoints
- Custom base URLs can use dummy API keys for OpenAI-compatible services

## Best Practices

### Model Organization
- Use descriptive `model_id` names
- Group related models in the same route
- Separate production and testing models

### Cost Management
- Configure cost information for accurate billing
- Use automatic cost assignment when possible
- Monitor token usage through metrics

### Error Handling
- Configure appropriate retry attempts
- Use fallback models for critical routes
- Monitor model availability

## Troubleshooting

### Common Issues

1. **Model Not Found**: Verify `model_id` is unique and correctly referenced
2. **Authentication Errors**: Check API keys and credentials configuration
3. **Cost Assignment**: Ensure model names match those in `model_prices.json`

### Debug Configuration
```yaml
- model_id: debug-model
  model: openai/gpt-3.5-turbo
  retry_attempts: 1  # Reduce retries for faster debugging
```

## Next Steps

- **[Load Balancing](../configuration/load-balancing.md)** - Configure load balancing across models
- **[Fallback Configuration](../configuration/fallback.md)** - Set up automatic failover
- **[Advanced Configuration](../configuration/advanced-configuration.md)** - Enterprise configuration options
- **[API Reference](../api-reference/endpoints.md)** - Complete API documentation
