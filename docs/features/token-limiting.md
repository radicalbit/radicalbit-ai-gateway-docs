# Token Limiting

This page covers token limiting configuration and features in the Radicalbit AI Gateway.

## Overview

Token limiting controls the number of tokens consumed by requests within a specific time window, helping to manage costs and prevent abuse.

## Token Limiting Scopes

Token limiting supports three scopes to control how limits are applied:

| Scope | Description | Use Case |
|-------|-------------|----------|
| `route` (default) | Limits shared across all users for a route | Global route limits, cost control per route |
| `user` | Limits per API key/user | Per-user quotas, individual user limits |
| `group` | Limits per group (multiple users share the same limit) | Team/organization limits, shared quotas |

### Route Scope (Default)

When `scope: route` is set (or omitted), all requests to the route share the same token limit pool:

```yaml
routes:
  production:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
    token_limiting:
      scope: route  # Optional, default value
      input:
        algorithm: fixed_window
        window_size: 1 hour
        max_token: 1000000
      output:
        algorithm: fixed_window
        window_size: 1 hour
        max_token: 1000000
```

### User Scope

Each API key has its own independent token limit:

```yaml
token_limiting:
  scope: user  # Each API key has its own limit
  input:
    algorithm: fixed_window
    window_size: 1 hour
    max_token: 100000
  output:
    algorithm: fixed_window
    window_size: 1 hour
    max_token: 500000
```

### Group Scope

All API keys belonging to the same group share a common token limit:

```yaml
token_limiting:
  scope: group  # All users in the same group share the limit
  input:
    algorithm: fixed_window
    window_size: 1 day
    max_token: 1000000
  output:
    algorithm: fixed_window
    window_size: 1 day
    max_token: 5000000
```

## Configuration

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
- `algorithm`: Rate limiting algorithm (currently only `fixed_window` is supported)
- `window_size`: Time window for the limit (e.g., `'10 seconds'`, `'1 minute'`, `'1 hour'`)
- `max_token`: Maximum number of tokens allowed within the window

## Storage Backend

Token limiting uses Redis (if configured) or in-memory storage:
- **Redis**: Recommended for production with multiple gateway instances. Limits are shared across all instances.
- **Memory**: Used when Redis is not configured. Limits are per-instance only.

## Error Handling

When a token limit is exceeded, the gateway returns an HTTP 429 (Too Many Requests) error.

## Next Steps

- **[Rate Limiting](./rate-limiting.md)** - Configure rate-based limits
- **[Budget Limiting](./budget-limiting.md)** - Set up cost controls
- **[Monitoring](../monitoring.md)** - Set up observability and metrics
- **[API Reference](../api-reference/endpoints.md)** - Complete API documentation
