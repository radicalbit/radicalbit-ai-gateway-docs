# Token Limiting

Without a token limit, requests can consume an unlimited number of tokens in a given time window. Token limiting caps that consumption, helping to manage costs and prevent abuse.

## Overview

Token limiting controls the number of tokens consumed by requests within a specific time window, helping to manage costs and prevent abuse.

---

## Configuration

Minimal route-level example:

```yaml
routes:
  production:
    token_limiting:
      input:
        algorithm: fixed_window
        window_size: 1 hour
        max_token: 1000
      output:
        algorithm: fixed_window
        window_size: 10 minutes
        max_token: 500
```

**Parameters:**
- `algorithm`: limiting algorithm (`fixed_window` or `aligned_fixed_window`)
- `window_size`: time window for the limit (e.g., `10 seconds`, `1 minute`, `1 hour`)
- `max_token`: maximum number of tokens allowed within the window

---

## Storage Backend

Token limiting uses Redis (if configured) or in-memory storage:

- **Redis**: recommended for production with multiple gateway instances. Limits are shared across all instances.
- **Memory**: used when Redis is not configured. Limits are per-instance only.

Redis configuration example:

```yaml
cache:
  redis_host: "valkey"
  redis_port: 6379
```

> Even if the section is called `cache`, Redis is typically reused as a shared storage backend for multiple gateway features (e.g., caching and limiting), depending on your gateway setup.

---

## What Counts

A request's own model call counts, and so do the calls the gateway makes on its behalf: [LLM and decision judges](./guardrails.md#cost-and-limits), and [semantic and decision routing](./advanced-routing.md#cost-of-routing-calls). Each is counted at the price of the model it calls. Adding a judge or a model-based router to a route makes its limits fill faster.

---

## Error Handling

When a token limit is exceeded, the gateway returns an HTTP **429 (Too Many Requests)** error.

---

## Next Steps

- **[Rate Limiting](./rate-limiting.md)** - Configure rate-based limits
- **[Budget Limiting](./budget-limiting.md)** - Set up cost controls
- **[Monitoring](../operations/monitoring.md)** - Set up observability and metrics
- **[API Reference](../api-reference/endpoints.md)** - Complete API documentation
