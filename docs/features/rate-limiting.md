# Rate Limiting

This page covers rate limiting configuration and features in the Radicalbit AI Gateway.

## Overview

Rate limiting in the Radicalbit AI Gateway controls the number of requests that can be made within a specific time window, helping to manage costs and prevent abuse.

## Rate Limiting Types

### Request Rate Limiting
Limit the number of requests per time window:

```yaml
routes:
  production:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
    rate_limiting:
      algorithm: fixed_window
      window_size: 1 minute
      max_requests: 100
```

## Rate Limiting Algorithms

### Fixed Window

The gateway currently uses the fixed window algorithm for rate limiting. This counts requests/tokens within fixed time windows:

```yaml
rate_limiting:
  algorithm: fixed_window
  window_size: 1 minute
  max_requests: 100
```

**Note**: Other algorithms (`sliding_window`, `sliding_window_counter`) are defined in the configuration schema but are not yet implemented in the code. The gateway will always use fixed window limiting regardless of the `algorithm` value specified in the configuration.

## Configuration Examples

### Basic Rate Limiting
```yaml
routes:
  api:
    chat_models:
      - model_id: gpt-3.5-turbo
        model: openai/gpt-3.5-turbo
    rate_limiting:
      algorithm: fixed_window
      window_size: 1 minute
      max_requests: 60  # 1 request per second
```

### Combined Limiting
```yaml
routes:
  enterprise:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
    rate_limiting:
      algorithm: fixed_window
      window_size: 1 minute
      max_requests: 1000
    token_limiting:
      algorithm: fixed_window
      window_size: 1 hour
      max_tokens: 2000000
```

## Advanced Configuration

### Custom Window Sizes
```yaml
rate_limiting:
  algorithm: fixed_window
  window_size: 5 minutes
  max_requests: 500
```

### Algorithm Configuration
```yaml
# Fixed window (currently implemented)
rate_limiting:
  algorithm: fixed_window
  window_size: 1 minute
  max_requests: 100
```

**Note**: While you can specify `sliding_window` or `sliding_window_counter` in the configuration, the gateway currently only implements fixed window algorithm and will use fixed window regardless of the specified algorithm.

## Rate Limiting Behavior

### When Limits Are Exceeded
- **HTTP 429**: Too Many Requests status code
- **Retry-After**: Header indicating when to retry
- **Error Message**: Descriptive error message

### Response Headers
```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640995200
```

## Monitoring

### Rate Limiting Metrics
- **Requests Blocked**: Number of requests blocked by rate limiting
- **Rate Limit Utilization**: Percentage of rate limit used
- **Window Resets**: Number of rate limit window resets

## Best Practices

### Window Size Selection
- **Short Windows (1-5 minutes)**: For burst protection
- **Medium Windows (1 hour)**: For daily limits
- **Long Windows (24 hours)**: For monthly limits

### Limit Configuration
- Start with conservative limits
- Monitor usage patterns
- Adjust based on actual usage

### Error Handling
- Implement proper retry logic
- Handle 429 responses gracefully
- Provide user feedback

## Troubleshooting

### Common Issues

1. **Too Restrictive**: Increase limits or window sizes
2. **Not Working**: Verify rate limiting is enabled
3. **Inconsistent Behavior**: Check algorithm selection

## Next Steps

- **[Token Limiting](./token-limiting.md)** - Configure token-based limits
- **[Budget Limiting](./budget-limiting.md)** - Set up cost controls
- **[Monitoring](../monitoring.md)** - Set up observability and metrics
- **[API Reference](../api-reference/endpoints.md)** - Complete API documentation
