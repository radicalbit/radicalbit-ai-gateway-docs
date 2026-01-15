# Fallback Configuration

This page covers fallback configuration for the Radicalbit AI Gateway based on the actual implementation.

## Overview

Fallback in the Radicalbit AI Gateway provides automatic failover when primary models fail or become unavailable. The system supports both chat and embedding model fallbacks with configurable `target` and `fallbacks` lists.

With the **new configuration structure**:

- **Models are defined at top-level** (`chat_models`, `embedding_models`)
- **Routes reference models by ID** (strings)
- Fallback chains always reference **model IDs**

---

## Fallback Structure

### Basic Fallback Configuration (Chat)

```yaml
chat_models:
  - model_id: openai-4o
    model: openai/gpt-4o

  - model_id: llama3
    model: openai/llama3.2:3b

routes:
  production:
    chat_models:
      - openai-4o
      - llama3
    fallback:
      - target: openai-4o
        fallbacks:
          - llama3
```

### Fallback Fields

#### Required Fields

- **`target`**: The primary model ID that will trigger fallback
- **`fallbacks`**: List of model IDs to use as fallbacks

#### Optional Fields

- **`type`**: The fallback type. Use `embedding` for embedding fallbacks.  
  If omitted, the fallback is treated as **chat**.

> In other words: **chat fallback chains do not need `type`**, while **embedding fallback chains should set `type: embedding`**.

---

## Fallback Types

### Chat Model Fallback
Used for conversational AI and text generation:

```yaml
routes:
  production:
    chat_models:
      - gpt-4o
      - gpt-4o-mini
      - claude-3-sonnet
    fallback:
      - target: gpt-4o
        fallbacks:
          - gpt-4o-mini
          - claude-3-sonnet
```

### Embedding Model Fallback
Used for text embeddings and vector operations:

```yaml
routes:
  production:
    embedding_models:
      - openai-embedding
      - local-embedding
    fallback:
      - target: openai-embedding
        fallbacks:
          - local-embedding
        type: embedding
```

---

## Configuration Examples

### Single Fallback
```yaml
chat_models:
  - model_id: gpt-4o
    model: openai/gpt-4o
  - model_id: gpt-4o-mini
    model: openai/gpt-4o-mini

routes:
  production:
    chat_models:
      - gpt-4o
      - gpt-4o-mini
    fallback:
      - target: gpt-4o
        fallbacks:
          - gpt-4o-mini
```

### Multiple Fallbacks
```yaml
chat_models:
  - model_id: gpt-4o
    model: openai/gpt-4o
  - model_id: gpt-4o-mini
    model: openai/gpt-4o-mini
  - model_id: claude-3-sonnet
    model: anthropic/claude-3-sonnet

routes:
  production:
    chat_models:
      - gpt-4o
      - gpt-4o-mini
      - claude-3-sonnet
    fallback:
      - target: gpt-4o
        fallbacks:
          - gpt-4o-mini
          - claude-3-sonnet
```

### Mixed Model Types (Chat + Embedding)
```yaml
chat_models:
  - model_id: gpt-4o
    model: openai/gpt-4o
  - model_id: gpt-4o-mini
    model: openai/gpt-4o-mini

embedding_models:
  - model_id: openai-embedding
    model: openai/text-embedding-3-small
  - model_id: local-embedding
    model: openai/nomic-embed-text

routes:
  production:
    chat_models:
      - gpt-4o
      - gpt-4o-mini
    embedding_models:
      - openai-embedding
      - local-embedding
    fallback:
      - target: gpt-4o
        fallbacks:
          - gpt-4o-mini
      - target: openai-embedding
        fallbacks:
          - local-embedding
        type: embedding
```

---

## Fallback Behavior

### Automatic Failover
When a target model fails:

1. The system automatically switches to the first fallback model
2. If the first fallback fails, it tries the next one
3. This continues until a model succeeds or all fallbacks are exhausted

### Fallback Order
Fallbacks are tried in the order specified:

```yaml
fallback:
  - target: gpt-4o
    fallbacks:
      - gpt-4o-mini       # First fallback
      - claude-3-sonnet   # Second fallback
      - local-model       # Third fallback
```

---

## Validation Rules

### Model Validation
- The `target` model ID must exist in the route model lists (`chat_models` or `embedding_models`)
- All `fallbacks` model IDs must exist in the same route model list
- Fallback models must be of the same type as the target (chat vs embedding)

### Type Validation
- Chat model fallbacks can only use chat models
- Embedding model fallbacks can only use embedding models
- `type: embedding` should be specified for embedding fallbacks

---

## Production Setup Example

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

  - model_id: claude-3-sonnet
    model: anthropic/claude-3-sonnet
    credentials:
      api_key: !secret ANTHROPIC_API_KEY

routes:
  production:
    chat_models:
      - gpt-4o
      - gpt-4o-mini
      - claude-3-sonnet
    fallback:
      - target: gpt-4o
        fallbacks:
          - gpt-4o-mini
          - claude-3-sonnet
```

---

## Best Practices

### Fallback Strategy
- Use models with similar capabilities as fallbacks
- Consider cost implications of fallback models
- Test fallback behavior in non-production environments

### Model Selection
- Choose reliable fallback models
- Ensure fallback models have appropriate capacity
- Monitor fallback usage and performance

### Configuration
- Use descriptive model IDs for clarity
- Keep fallback chains short and intentional
- Test fallback scenarios regularly

---

## Troubleshooting

### Common Issues

1. **Target Model Not Found**: Ensure `target` exists in the route model list
2. **Fallback Model Not Found**: Verify all fallback IDs exist in the route model list
3. **Type Mismatch**: Ensure fallback IDs match the `target` type (chat vs embedding)

### Debug Configuration
```yaml
routes:
  debug:
    chat_models:
      - debug-model
    fallback:
      - target: debug-model
        fallbacks:
          - debug-fallback
```

---

## Monitoring

### Fallback Metrics
- Track fallback activation frequency
- Monitor fallback model performance
- Measure fallback success rates

### Alerting
- Set up alerts for frequent fallback usage
- Monitor fallback model availability
- Track fallback response times

---

## Next Steps

- **[Model Configuration](./models.md)** - Detailed model setup guide
- **[Advanced Configuration](./advanced-configuration.md)** - Enterprise configuration options
- **[Monitoring](../monitoring.md)** - Observability and metrics setup
