# Intelligent Routing

This page covers load balancing configuration for the Radicalbit AI Gateway based on the actual implementation.

## Overview

Load balancing in the Radicalbit AI Gateway distributes requests across multiple models within a route. The system currently supports two algorithms: Round Robin and Weighted Round Robin.

## Balancing Configuration

### Basic Configuration

```yaml
routes:
  production:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
    balancing:
      algorithm: ROUND_ROBIN
      models: ["gpt-4o", "gpt-4o-mini"]
```

### Default Behavior

If no balancing configuration is provided, the system automatically:
- Creates a default `Balancing` object with `ROUND_ROBIN` algorithm
- Uses all chat models in the route when `models` is not specified
- Distributes requests evenly across all models

## Supported Algorithms

### Round Robin

Distributes requests evenly across all specified models:

```yaml
balancing:
  algorithm: ROUND_ROBIN
  models: ["gpt-4o", "gpt-4o-mini"]
```

**Requirements:**
- `models` field is **required** and cannot be `None`
- All models in `models` must exist in the route's `chat_models`

### Weighted Round Robin

Distributes requests based on assigned weights. A model with weight `2` will receive twice as many requests as a model with weight `1`:

```yaml
balancing:
  algorithm: WEIGHTED_ROUND_ROBIN
  weights:
    - model_id: gpt-4o
      weight: 2
    - model_id: gpt-4o-mini
      weight: 1
```

**Requirements:**
- `weights` field is **required** and cannot be `None`
- `models` field is **not used** for weighted round robin (only `weights` are used)
- All model IDs in `weights` must exist in the route's `chat_models`
- Weights must be integers ≥ 1

## Configuration Options

### Model Selection (Round Robin Only)

For `ROUND_ROBIN`, specify which models to include in load balancing:

```yaml
balancing:
  algorithm: ROUND_ROBIN
  models: ["gpt-4o", "gpt-4o-mini"]  # Only these models will be balanced
```

If `models` is not specified or is empty, all chat models in the route will be used automatically.

### Weight Configuration (Weighted Round Robin Only)

For `WEIGHTED_ROUND_ROBIN`, specify weights for each model:

```yaml
balancing:
  algorithm: WEIGHTED_ROUND_ROBIN
  weights:
    - model_id: gpt-4o
      weight: 3  # Gets 3 out of every 4 requests (75%)
    - model_id: gpt-4o-mini
      weight: 1  # Gets 1 out of every 4 requests (25%)
```

The gateway creates a sequence based on weights and cycles through it. For example, with weights `[3, 1]`, the sequence will be: `[gpt-4o, gpt-4o, gpt-4o, gpt-4o-mini]` repeated.

## Validation Rules

### Model Validation
- All models specified in `balancing.models` (for Round Robin) must exist in the route's `chat_models`
- All model IDs in `balancing.weights` (for Weighted Round Robin) must exist in the route's `chat_models`
- Model IDs must be unique within the route

### Weight Validation
- Weights must be integers ≥ 1
- Weights can only be used with `WEIGHTED_ROUND_ROBIN` algorithm
- If weights are specified with `ROUND_ROBIN`, a validation error will be raised

## Configuration Examples

### Basic Round Robin
```yaml
routes:
  production:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
    balancing:
      algorithm: ROUND_ROBIN
      models: ["gpt-4o", "gpt-4o-mini"]
```

### Round Robin with Default Models
```yaml
routes:
  production:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
    balancing:
      algorithm: ROUND_ROBIN
      # models not specified - will use all chat_models automatically
```

### Weighted Round Robin for Cost Optimization
```yaml
routes:
  cost-optimized:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
        credentials:
          api_key: !secret OPENAI_API_KEY
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
    balancing:
      algorithm: WEIGHTED_ROUND_ROBIN
      weights:
        - model_id: gpt-4o-mini
          weight: 4  # Cheaper model gets 80% of requests
        - model_id: gpt-4o
          weight: 1  # Expensive model gets 20% of requests
```

### Weighted Round Robin with Multiple Models
```yaml
routes:
  multi-model:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
      - model_id: gpt-3.5-turbo
        model: openai/gpt-3.5-turbo
    balancing:
      algorithm: WEIGHTED_ROUND_ROBIN
      weights:
        - model_id: gpt-4o
          weight: 1
        - model_id: gpt-4o-mini
          weight: 3
        - model_id: gpt-3.5-turbo
          weight: 2
```

## Best Practices

### Algorithm Selection

- **Round Robin**: Use when you want simple, even distribution across models. Best for models with similar capabilities and costs.
- **Weighted Round Robin**: Use when you need specific model ratios. Ideal for:
  - Cost optimization (favor cheaper models)
  - Performance optimization (favor faster models)
  - A/B testing scenarios

### Model Configuration

- Use descriptive model IDs to make your configuration clear
- For weighted round robin, configure weights based on your requirements:
  - Cost-based: Higher weights for cheaper models
  - Performance-based: Higher weights for faster models
  - Quality-based: Higher weights for higher-quality models

### Monitoring

- Track request distribution across models using the UI or metrics
- Monitor response times and error rates per model
- Adjust weights based on actual usage patterns and performance

## Troubleshooting

### Common Issues

1. **Model Not Found**
   - Ensure all models in `balancing.models` (Round Robin) exist in `chat_models`
   - Ensure all model IDs in `balancing.weights` (Weighted Round Robin) exist in `chat_models`

2. **Invalid Weights**
   - Weights can only be used with `WEIGHTED_ROUND_ROBIN`
   - If you specify weights with `ROUND_ROBIN`, you'll get a validation error
   - Weights must be integers ≥ 1

3. **Models Not Specified for Round Robin**
   - `ROUND_ROBIN` requires the `models` field
   - If not specified, the gateway will automatically use all chat models
   - To restrict to specific models, explicitly list them in `models`

### Debug Configuration

```yaml
# Use single model for debugging
balancing:
  algorithm: ROUND_ROBIN
  models: ["debug-model"]
```

## Next Steps

- **[Model Configuration](./models.md)** - Detailed model setup guide
- **[Fallback Configuration](./fallback.md)** - Automatic failover strategies
- **[Advanced Configuration](./advanced-configuration.md)** - Enterprise configuration options
- **[Monitoring](../monitoring.md)** - Observability and metrics setup
