# Budget Limiting

This page covers budget limiting configuration and features in the Radicalbit AI Gateway.

## Overview

Budget limiting in the Radicalbit AI Gateway controls costs by setting limits on input and output tokens consumed across all models in a route, helping to manage AI usage expenses.

## Budget Limiting Configuration

### Basic Budget Limiting
Set limits on input and output tokens:

```yaml
routes:
  production:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
    budget_limiting:
      input_tokens_per_hour: 1000000
      output_tokens_per_hour: 500000
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
      input_tokens_per_hour: 2000000
      output_tokens_per_hour: 1000000
      window_size: 1 hour
      reset_time: "00:00"  # Reset at midnight
```

## Budget Limiting Types

### Input Token Limiting
Control the number of input tokens consumed:

```yaml
budget_limiting:
  input_tokens_per_hour: 1000000
  input_tokens_per_day: 10000000
```

### Output Token Limiting
Control the number of output tokens generated:

```yaml
budget_limiting:
  output_tokens_per_hour: 500000
  output_tokens_per_day: 5000000
```

### Combined Limiting
Set limits on both input and output tokens:

```yaml
budget_limiting:
  input_tokens_per_hour: 1000000
  output_tokens_per_hour: 500000
  total_tokens_per_hour: 1500000
```

## Configuration Examples

### Hourly Budget Limits
```yaml
routes:
  api:
    chat_models:
      - model_id: gpt-3.5-turbo
        model: openai/gpt-3.5-turbo
    budget_limiting:
      input_tokens_per_hour: 500000
      output_tokens_per_hour: 250000
```

### Daily Budget Limits
```yaml
routes:
  production:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
    budget_limiting:
      input_tokens_per_day: 10000000
      output_tokens_per_day: 5000000
```

### Monthly Budget Limits
```yaml
routes:
  enterprise:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
    budget_limiting:
      input_tokens_per_month: 100000000
      output_tokens_per_month: 50000000
```

## Advanced Configuration

### Custom Window Sizes
```yaml
budget_limiting:
  window_size: 2 hours
  input_tokens_per_window: 2000000
  output_tokens_per_window: 1000000
```

### Reset Scheduling
```yaml
budget_limiting:
  reset_time: "09:00"  # Reset at 9 AM daily
  timezone: "UTC"
```

### Cost-Based Limiting
```yaml
budget_limiting:
  max_cost_per_hour: 50.00  # $50 per hour
  max_cost_per_day: 1000.00  # $1000 per day
```

## Budget Limiting Behavior

### When Limits Are Exceeded
- **HTTP 429**: Too Many Requests status code
- **Budget Exceeded**: Clear error message
- **Retry Information**: When budget resets

### Response Headers
```
HTTP/1.1 429 Too Many Requests
X-Budget-Limit-Input: 1000000
X-Budget-Remaining-Input: 0
X-Budget-Limit-Output: 500000
X-Budget-Remaining-Output: 250000
X-Budget-Reset: 1640995200
```

## Monitoring

### Budget Metrics
- **Tokens Consumed**: Input and output tokens used
- **Budget Utilization**: Percentage of budget used
- **Cost Tracking**: Actual costs vs. limits
- **Budget Resets**: Number of budget resets

### Monitoring Setup
```yaml
budget_limiting:
  metrics_enabled: true
  cost_tracking: true
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

### Debug Configuration
```yaml
budget_limiting:
  debug: true
  log_level: debug
  detailed_logging: true
```

## Next Steps

- **[Rate Limiting](./rate-limiting.md)** - Configure request limits
- **[Token Limiting](./token-limiting.md)** - Set up token-based limits
- **[Monitoring](../monitoring.md)** - Set up observability and metrics
- **[API Reference](../api-reference/endpoints.md)** - Complete API documentation
