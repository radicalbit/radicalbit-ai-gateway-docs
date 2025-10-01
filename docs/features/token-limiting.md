# Token Limiting

This page covers token limiting configuration and features in the Radicalbit AI Gateway.

## Overview

Token limiting in the Radicalbit AI Gateway controls the number of token consumed by requests that can be made within a specific time window, helping to manage costs and prevent abuse.

### Token Rate Limiting
Limit the number of tokens consumed per time window:

```yaml
routes:
  production:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
    token_limiting:
      input:
        algorithm: fixed_window
        window_size: 1 hour
        max_tokens: 1000000
      output:
        algorithm: fixed_window
        window_size: 1 hour
        max_tokens: 1000000
```

## Next Steps

- **[Rate Limiting](./rate-limiting.md)** - Configure rate-based limits
- **[Budget Limiting](./budget-limiting.md)** - Set up cost controls
- **[Monitoring](../monitoring.md)** - Set up observability and metrics
- **[API Reference](../api-reference/endpoints.md)** - Complete API documentation
