# Budget Limiting

Without a budget limit, spending on a route can grow without any cap. Budget limiting stops requests once the combined input and output cost crosses a threshold you set.

## Overview

Budget limiting in the Radicalbit AI Gateway controls costs by setting a limit on the **combined budget** (input + output) consumed across all models in a route, helping to manage AI usage expenses.

A single time window tracks total spending — when the combined cost of input and output tokens crosses the configured threshold within the window, further requests are rejected until the window resets.

:::info
A route budget and a [project budget](./project-budget.md) exclude each other: while the project has a budget, its routes can't declare `budget_limiting`, and while the published configuration has routes with `budget_limiting`, the project can't get a budget.
:::

---

## Budget Limiting Configuration

### Basic Budget Limiting
Set a combined cost limit for input and output tokens:

```yaml
chat_models:
  - model_id: gpt-4o
    model: openai/gpt-4o
    input_cost_per_million_tokens: 5.0
    output_cost_per_million_tokens: 15.0

routes:
  production:
    chat_models:
      - gpt-4o
    budget_limiting:
      algorithm: fixed_window
      window_size: 1 hour
      max_budget: 50.0   # $50 per hour maximum combined cost
```

### Advanced Budget Configuration
```yaml
chat_models:
  - model_id: gpt-4o
    model: openai/gpt-4o
  - model_id: gpt-3.5-turbo
    model: openai/gpt-3.5-turbo

routes:
  enterprise:
    chat_models:
      - gpt-4o
      - gpt-3.5-turbo
    budget_limiting:
      algorithm: fixed_window
      window_size: 1 minute
      max_budget: 100
```

---

## Budget Limiting Types

### Cost-Based Budget Limiting
Control costs by setting a maximum budget (in dollars) per time window:

```yaml
budget_limiting:
  algorithm: fixed_window
  window_size: 1 hour
  max_budget: 50.0   # $50 per hour for combined input + output tokens
```

**Note:** Budget limiting uses cost calculations based on model pricing. You can set either `max_token` (token-based limits) or `max_budget` (cost-based limits), but not both in the same configuration.

---

## What Counts

A request's own model call counts, and so do the calls the gateway makes on its behalf: [LLM and decision judges](./guardrails.md#cost-and-limits), and [semantic and decision routing](./advanced-routing.md#cost-of-routing-calls). Each is counted at the price of the model it calls. Adding a judge or a model-based router to a route makes its limits fill faster.

---

## Budget Limiting Behavior

### When Limits Are Exceeded
- **HTTP 429**: Too Many Requests status code
- **Budget Exceeded**: Clear error message
- **Retry Information**: When budget resets

### Response Headers (if exposed by the gateway)
```
HTTP/1.1 429 Too Many Requests
X-Budget-Limit: 100
X-Budget-Remaining: 0
X-Budget-Reset: 1640995200
```

> Header names/availability may vary depending on the deployment and gateway version.

---

## Best Practices

### Budget Planning
- Start with conservative limits
- Monitor actual usage patterns
- Adjust based on business needs
- Consider peak usage times

### Cost Management
- Use different limits for different routes (and therefore workloads)
- Ensure model costs are configured (manual or automatic price assignment)
- Regular budget reviews
- Cost optimization strategies

### Error Handling
- Implement proper retry logic
- Handle budget exceeded gracefully
- Provide user feedback
- Consider fallback to cheaper models (with fallback configuration)

---

## Troubleshooting

### Common Issues

1. **Budget Too Low**: Increase limits based on actual usage
2. **Unexpected Costs**: Check model pricing and usage
3. **Reset Issues**: Verify `window_size` configuration

---

## Next Steps

- **[Rate Limiting](./rate-limiting.md)** - Configure request limits
- **[Token Limiting](./token-limiting.md)** - Set up token-based limits
- **[Monitoring](../operations/monitoring.md)** - Set up observability and metrics
- **[API Reference](../api-reference/endpoints.md)** - Complete API documentation
