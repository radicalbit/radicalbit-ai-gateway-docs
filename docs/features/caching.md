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
Fast caching using local memory for single-instance deployments can be enabled without the Redis setting host.


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
- Route name + Message content hash

## Best Practices

### TTL Configuration
- **Short TTL (300-1800s)**: For dynamic content
- **Medium TTL (1800-7200s)**: For semi-static content
- **Long TTL (7200-86400s)**: For static content

### Memory Management
- Set appropriate TTL values

### Performance Optimization
- Enable caching for frequently used models
- Use Redis for distributed deployments
- Monitor cache hit rates

## Monitoring

### Cache Metrics
- **Cache Hit Counter**: Number of times the gateway hits the cache

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
