# Caching

This page covers caching configuration and features in the Radicalbit AI Gateway.

## Overview

Caching in the Radicalbit AI Gateway improves performance and reduces costs by storing responses for frequently repeated requests. The gateway supports both Redis and in-memory caching.

## Cache Types

### Redis Caching
Persistent caching using Redis for distributed deployments:

```yaml
cache:
  redis_host: localhost
  redis_port: 6379
```

### In-Memory Caching
Fast caching using local memory for single-instance deployments:

```yaml
cache:
  type: in_memory
```

## Route-Level Caching

### Basic Caching Configuration

```yaml
routes:
  production:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
    caching:
      enabled: true
      ttl: 3600  # Cache for 1 hour
```

### Advanced Caching Options

```yaml
routes:
  production:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
    caching:
      enabled: true
      ttl: 7200  # Cache for 2 hours
      key_prefix: "prod_chat"
      exclude_params: ["temperature", "top_p"]  # Don't cache based on these params
```

## Cache Configuration

### Global Cache Settings

```yaml
cache:
  redis_host: redis-server
  redis_port: 6379
```

### Cache Keys

Cache keys are automatically generated based on:
- Route name
- Model ID
- Request parameters
- Message content

## Best Practices

### TTL Configuration
- **Short TTL (300-1800s)**: For dynamic content
- **Medium TTL (1800-7200s)**: For semi-static content
- **Long TTL (7200-86400s)**: For static content

### Memory Management
- Monitor Redis memory usage
- Set appropriate TTL values
- Use cache prefixes for organization

### Performance Optimization
- Enable caching for frequently used models
- Use Redis for distributed deployments
- Monitor cache hit rates

## Monitoring

### Cache Metrics
- **Cache Hit Rate**: Percentage of requests served from cache
- **Cache Miss Rate**: Percentage of requests requiring model calls
- **Cache Size**: Current cache size in memory/Redis
- **Cache Evictions**: Number of items evicted from cache

## Troubleshooting

### Common Issues

1. **Cache Not Working**: Verify cache is enabled and Redis is accessible
2. **High Memory Usage**: Adjust TTL values and monitor cache size
3. **Redis Connection Issues**: Check Redis server status and credentials

## Next Steps

- **[Load Balancing](./load-balancing.md)** - Configure load balancing across models
- **[Fallback](./fallback.md)** - Set up automatic failover
- **[Monitoring](../monitoring.md)** - Set up observability and metrics
- **[API Reference](../api-reference/endpoints.md)** - Complete API documentation
