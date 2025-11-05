# Budget Limiting

This page covers budget limiting configuration and features in the Radicalbit AI Gateway.

## Overview

Budget limiting in the Radicalbit AI Gateway controls costs by setting limits on input and output tokens consumed across all models in a route, helping to manage AI usage expenses.

## Budget Limiting Configuration

### Basic Budget Limiting
Set cost limits on input and output tokens:

```yaml
routes:
  production:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
    budget_limiting:
      input:
        algorithm: fixed_window
        window_size: 1 hour
        max_budget: 50.0  # $50 per hour maximum cost
      output:
        algorithm: fixed_window
        window_size: 1 hour
        max_budget: 100.0  # $100 per hour maximum cost
```

### Advanced Budget Configuration
```yaml
routes:
  enterprise:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
      - model_id: gpt-3.5-turbo
        model: openai/gpt-3.5-turbo
    budget_limiting:
      input:
        algorithm: fixed_window
        window_size: 1 minute
        max_budget: 100
      output:
        algorithm: fixed_window
        window_size: 1 minute
        max_budget: 100
```

## Budget Limiting Types

### Cost-Based Budget Limiting
Control costs by setting maximum budget (in dollars) per time window:

```yaml
    budget_limiting:
      input:
        algorithm: fixed_window
        window_size: 1 hour
        max_budget: 50.0  # $50 per hour for input tokens
      output:
        algorithm: fixed_window
        window_size: 1 hour
        max_budget: 100.0  # $100 per hour for output tokens
```

Note: Budget limiting uses cost calculations based on model pricing. You can set either `max_token` (for token-based limits) or `max_budget` (for cost-based limits), but not both in the same configuration.

## Budget Limiting Behavior

### When Limits Are Exceeded
- **HTTP 429**: Too Many Requests status code
- **Budget Exceeded**: Clear error message
- **Retry Information**: When budget resets

### Response Headers (Roadmap 2025)
```
HTTP/1.1 429 Too Many Requests
X-Budget-Limit-Input: 1000000
X-Budget-Remaining-Input: 0
X-Budget-Limit-Output: 500000
X-Budget-Remaining-Output: 250000
X-Budget-Reset: 1640995200
```

## Best Practices

### Budget Planning
- Start with conservative limits
- Monitor actual usage patterns
- Adjust based on business needs
- Consider peak usage times

### Cost Management
- Use different limits for different models
- Implement cost alerts
- Regular budget reviews
- Cost optimization strategies

### Error Handling
- Implement proper retry logic
- Handle budget exceeded gracefully
- Provide user feedback
- Fallback to cheaper models

## Troubleshooting

### Common Issues

1. **Budget Too Low**: Increase limits based on actual usage
2. **Unexpected Costs**: Check model pricing and usage
3. **Reset Issues**: Verify reset time configuration


## Next Steps

- **[Rate Limiting](./rate-limiting.md)** - Configure request limits
- **[Token Limiting](./token-limiting.md)** - Set up token-based limits
- **[Monitoring](../monitoring.md)** - Set up observability and metrics
- **[API Reference](../api-reference/endpoints.md)** - Complete API documentation
