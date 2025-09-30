# Load Balancing

This page covers load balancing configuration for the Radicalbit AI Gateway based on the actual implementation.

## Overview

Load balancing in the Radicalbit AI Gateway distributes requests across multiple models within a route. The system supports various algorithms to optimize performance and resource utilization.

## Balancing Configuration

### Basic Configuration

```yaml
routes:
  production:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
      - model_id: gpt-3.5-turbo
        model: openai/gpt-3.5-turbo
    balancing:
      algorithm: ROUND_ROBIN
```

### Default Behavior

If no balancing configuration is provided, the system automatically:
- Uses all chat models in the route
- Applies `ROUND_ROBIN` algorithm
- Distributes requests evenly across models

## Supported Algorithms

### Round Robin
Distributes requests evenly across all models:

```yaml
balancing:
  algorithm: ROUND_ROBIN
  models: ["gpt-4o", "gpt-3.5-turbo"]
```

### Weighted Round Robin
Distributes requests based on assigned weights:

```yaml
balancing:
  algorithm: WEIGHTED_ROUND_ROBIN
  models: ["gpt-4o", "gpt-3.5-turbo"]
  weights:
    - model_id: gpt-4o
      weight: 2
    - model_id: gpt-3.5-turbo
      weight: 1
```

### IP Hash
Routes requests based on client IP hash for session affinity:

```yaml
balancing:
  algorithm: IP_HASH
  models: ["gpt-4o", "gpt-3.5-turbo"]
```

### Least Connections
Routes requests to the model with the fewest active connections:

```yaml
balancing:
  algorithm: LEAST_CONNECTIONS
  models: ["gpt-4o", "gpt-3.5-turbo"]
```

### Least Response Time
Routes requests to the model with the fastest response time:

```yaml
balancing:
  algorithm: LEAST_RESPONSE_TIME
  models: ["gpt-4o", "gpt-3.5-turbo"]
```

## Configuration Options

### Model Selection
Specify which models to include in load balancing:

```yaml
balancing:
  algorithm: ROUND_ROBIN
  models: ["gpt-4o", "gpt-3.5-turbo"]  # Only these models will be balanced
```

### Weight Configuration
For weighted round robin, specify weights for each model:

```yaml
balancing:
  algorithm: WEIGHTED_ROUND_ROBIN
  weights:
    - model_id: gpt-4o
      weight: 3  # Gets 3 out of every 4 requests
    - model_id: gpt-3.5-turbo
      weight: 1  # Gets 1 out of every 4 requests
```

## Validation Rules

### Model Validation
- All models specified in `balancing.models` must exist in the route's `chat_models`
- Model IDs must be unique within the route
- Weights are only valid for `WEIGHTED_ROUND_ROBIN` algorithm

### Weight Validation
- Weights must be integers ≥ 1
- Weights can only be used with `WEIGHTED_ROUND_ROBIN` algorithm
- All weighted models must exist in the route

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
    balancing:
      algorithm: WEIGHTED_ROUND_ROBIN
      weights:
        - model_id: gpt-4o
          weight: 70
        - model_id: gpt-3.5-turbo
          weight: 30
```

### Cost Optimization
```yaml
routes:
  cost-optimized:
    chat_models:
      - model_id: gpt-3.5-turbo
        model: openai/gpt-3.5-turbo
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
    balancing:
      algorithm: WEIGHTED_ROUND_ROBIN
      weights:
        - model_id: gpt-3.5-turbo
          weight: 80
        - model_id: gpt-4o-mini
          weight: 20
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
    balancing:
      algorithm: LEAST_RESPONSE_TIME
      models: ["gpt-4o-primary", "gpt-4o-secondary", "gpt-3.5-turbo-backup"]
```

## Best Practices

### Algorithm Selection
- **Round Robin**: Simple, even distribution
- **Weighted Round Robin**: When you need specific model ratios
- **IP Hash**: For session affinity requirements
- **Least Connections**: For models with different capacities
- **Least Response Time**: For optimal performance

### Model Configuration
- Use descriptive model IDs
- Configure appropriate weights based on model capabilities
- Monitor performance and adjust weights accordingly

### Monitoring
- Track request distribution across models
- Monitor response times and error rates
- Adjust balancing strategy based on metrics

## Troubleshooting

### Common Issues

1. **Model Not Found**: Ensure all models in `balancing.models` exist in `chat_models`
2. **Invalid Weights**: Weights can only be used with `WEIGHTED_ROUND_ROBIN`
3. **Algorithm Mismatch**: Verify algorithm supports your configuration

### Debug Configuration
```yaml
balancing:
  algorithm: ROUND_ROBIN
  models: ["debug-model"]  # Use single model for debugging
```

## Next Steps

- **[Model Configuration](./models.md)** - Detailed model setup guide
- **[Fallback Configuration](./fallback.md)** - Automatic failover strategies
- **[Advanced Configuration](./advanced-configuration.md)** - Enterprise configuration options
- **[Monitoring](../monitoring.md)** - Observability and metrics setup
