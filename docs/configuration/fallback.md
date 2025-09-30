# Fallback Configuration

This page covers fallback configuration for the Radicalbit AI Gateway based on the actual implementation.

## Overview

Fallback in the Radicalbit AI Gateway provides automatic failover when primary models fail or become unavailable. The system supports both chat and embedding model fallbacks with configurable target and fallback model lists.

## Fallback Structure

### Basic Fallback Configuration

```yaml
routes:
  production:
    chat_models:
      - model_id: openai-4o
        model: openai/gpt-4o
      - model_id: llama3
        model: openai/llama3.2:3b
    fallback:
      - target: openai-4o
        fallbacks:
          - llama3
```

### Fallback Fields

#### Required Fields

- **`target`**: The primary model ID that will trigger fallback
- **`fallbacks`**: List of model IDs to use as fallbacks
- **`type`**: Type of models (CHAT or EMBEDDING, default: CHAT)

## Fallback Types

### Chat Model Fallback
Used for conversational AI and text generation:

```yaml
fallback:
  - target: gpt-4o
    fallbacks:
      - gpt-3.5-turbo
      - claude-3-sonnet
    type: CHAT
```

### Embedding Model Fallback
Used for text embeddings and vector operations:

```yaml
fallback:
  - target: openai-embedding
    fallbacks:
      - local-embedding
    type: EMBEDDING
```

## Configuration Examples

### Single Fallback
```yaml
routes:
  production:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
      - model_id: gpt-3.5-turbo
        model: openai/gpt-3.5-turbo
    fallback:
      - target: gpt-4o
        fallbacks:
          - gpt-3.5-turbo
```

### Multiple Fallbacks
```yaml
routes:
  production:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
      - model_id: gpt-3.5-turbo
        model: openai/gpt-3.5-turbo
      - model_id: claude-3-sonnet
        model: anthropic/claude-3-sonnet
    fallback:
      - target: gpt-4o
        fallbacks:
          - gpt-3.5-turbo
          - claude-3-sonnet
```

### Mixed Model Types
```yaml
routes:
  production:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
      - model_id: gpt-3.5-turbo
        model: openai/gpt-3.5-turbo
    embedding_models:
      - model_id: openai-embedding
        model: openai/text-embedding-3-small
      - model_id: local-embedding
        model: openai/nomic-embed-text
    fallback:
      - target: gpt-4o
        fallbacks:
          - gpt-3.5-turbo
        type: CHAT
      - target: openai-embedding
        fallbacks:
          - local-embedding
        type: EMBEDDING
```

## Fallback Behavior

### Automatic Failover
When a target model fails:
1. The system automatically switches to the first fallback model
2. If the first fallback fails, it tries the next one
3. This continues until a model succeeds or all fallbacks are exhausted

### Fallback Order
Fallbacks are tried in the order specified in the configuration:

```yaml
fallback:
  - target: gpt-4o
    fallbacks:
      - gpt-3.5-turbo    # First fallback
      - claude-3-sonnet  # Second fallback
      - local-model      # Third fallback
```

## Validation Rules

### Model Validation
- Target model must exist in the route's models
- All fallback models must exist in the route's models
- Fallback models must be of the same type as the target

### Type Validation
- Chat model fallbacks can only use chat models
- Embedding model fallbacks can only use embedding models
- Type must be explicitly specified for embedding fallbacks

## Configuration Examples

### Production Setup
```yaml
routes:
  production:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
        credentials:
          api_key: !secret OPENAI_API_KEY
      - model_id: gpt-3.5-turbo
        model: openai/gpt-3.5-turbo
        credentials:
          api_key: !secret OPENAI_API_KEY
      - model_id: claude-3-sonnet
        model: anthropic/claude-3-sonnet
        credentials:
          api_key: !secret ANTHROPIC_API_KEY
    fallback:
      - target: gpt-4o
        fallbacks:
          - gpt-3.5-turbo
          - claude-3-sonnet
```

### High Availability
```yaml
routes:
  high-availability:
    chat_models:
      - model_id: gpt-4o-primary
        model: openai/gpt-4o
      - model_id: gpt-4o-secondary
        model: openai/gpt-4o
      - model_id: gpt-3.5-turbo-backup
        model: openai/gpt-3.5-turbo
    fallback:
      - target: gpt-4o-primary
        fallbacks:
          - gpt-4o-secondary
          - gpt-3.5-turbo-backup
```

### Cost Optimization
```yaml
routes:
  cost-optimized:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
      - model_id: gpt-3.5-turbo
        model: openai/gpt-3.5-turbo
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
    fallback:
      - target: gpt-4o
        fallbacks:
          - gpt-3.5-turbo
          - gpt-4o-mini
```

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
- Group related models in the same route
- Test fallback scenarios regularly

## Troubleshooting

### Common Issues

1. **Target Model Not Found**: Ensure target model exists in route models
2. **Fallback Model Not Found**: Verify all fallback models exist in route models
3. **Type Mismatch**: Ensure fallback models match the target model type

### Debug Configuration
```yaml
fallback:
  - target: debug-model
    fallbacks:
      - debug-fallback
    type: CHAT
```

## Monitoring

### Fallback Metrics
- Track fallback activation frequency
- Monitor fallback model performance
- Measure fallback success rates

### Alerting
- Set up alerts for frequent fallback usage
- Monitor fallback model availability
- Track fallback response times

## Next Steps

- **[Model Configuration](./models.md)** - Detailed model setup guide
- **[Load Balancing](./load-balancing.md)** - Advanced load balancing strategies
- **[Advanced Configuration](./advanced-configuration.md)** - Enterprise configuration options
- **[Monitoring](../monitoring.md)** - Observability and metrics setup
