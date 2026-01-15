# Caching

This page covers caching configuration and features in the Radicalbit AI Gateway.

## Overview

Caching in the Radicalbit AI Gateway improves performance and reduces costs by storing responses for frequently repeated requests.

The gateway supports two caching strategies:

- **Semantic Cache**: similarity-based caching using embeddings
- **Exact Cache**: exact-match caching for identical requests

The gateway supports Redis (recommended for distributed deployments) and can also work without Redis configuration depending on the deployment (e.g. single-instance/in-memory setups).

---

## Cache Backends

### Redis Caching
Persistent caching using Redis:

```yaml
cache:
  redis_host: localhost
  redis_port: 6379
```

### In-Memory Caching
For single-instance deployments, caching may work without a Redis `cache` section.

> If you deploy multiple gateway replicas, Redis (or a shared backend) is strongly recommended to keep cache consistent across instances.

---

## Route-Level Caching

Caching is configured per-route via the `caching` section.

With the **new config structure**:

- Models are defined at top-level (`chat_models`, `embedding_models`)
- Routes reference models by **model ID** (strings)

### Exact Cache (Basic)

```yaml
chat_models:
  - model_id: gpt-4o
    model: openai/gpt-4o

routes:
  production:
    chat_models:
      - gpt-4o
    caching:
      type: exact
      ttl: 3600  # Cache for 1 hour
```

### Exact Cache (Advanced)

```yaml
routes:
  production:
    chat_models:
      - gpt-4o
    caching:
      type: exact
      ttl: 7200  # Cache for 2 hours
```

---

## Semantic Cache

Semantic cache retrieves responses based on similarity instead of exact textual matching. For semantic caching you must configure:

- at least one `chat_model` in the route
- at least one `embedding_model` in the route
- `caching.type: semantic`
- `caching.embedding_model_id` pointing to one of the route embedding model IDs

### Semantic Cache Example

```yaml
chat_models:
  - model_id: assistant
    model: openai/gpt-4o

embedding_models:
  - model_id: text-embedding-3-small
    model: openai/text-embedding-3-small

routes:
  semantic-cache-demo:
    chat_models:
      - assistant
    embedding_models:
      - text-embedding-3-small
    caching:
      type: semantic
      ttl: 120
      embedding_model_id: text-embedding-3-small
      similarity_threshold: 0.85
      distance_metric: cosine
      dim: 1536
```

### Semantic Cache Fields

- **`type`**: must be `semantic`
- **`ttl`**: time-to-live in seconds
- **`embedding_model_id`**: embedding model ID used to build/compare vectors
- **`similarity_threshold`**: minimum similarity score to accept a cached match
- **`distance_metric`**: `cosine`, `euclidean`, or `dot`
- **`dim`**: embedding vector dimensionality (must match the model output)

---

## Global Cache Settings

If you use Redis, declare it at top-level:

```yaml
cache:
  redis_host: redis-server
  redis_port: 6379
```

---

## Cache Keys

Cache keys are automatically generated based on:
- Route name
- Request content (and relevant configuration) hashed

For semantic cache, the gateway also stores/queries the embedding vectors for similarity search.

---

## Best Practices

### TTL Configuration
- **Short TTL (300-1800s)**: dynamic content
- **Medium TTL (1800-7200s)**: semi-static content
- **Long TTL (7200-86400s)**: static content

### Memory Management
- Use appropriate TTL values
- Prefer Redis for distributed deployments

### Performance Optimization
- Enable exact cache for highly repetitive requests
- Use semantic cache for “similar but not identical” questions
- Monitor cache hit rates and adjust `similarity_threshold`

---

## Monitoring

### Cache Metrics
- **Cache Hit Counter**: number of times the gateway hits the cache
- (optional) cache miss counters / latency distribution depending on your metrics setup

---

## Troubleshooting

### Common Issues

1. **Cache Not Working**: verify `caching.type` is set on the route and Redis is reachable (if configured)
2. **High Memory Usage**: reduce TTL and monitor cache size
3. **Redis Connection Issues**: check Redis server status and network configuration
4. **Semantic Cache Always Misses**: validate `embedding_model_id`, `dim`, and tune `similarity_threshold`

---

## Next Steps

- **[Fallback](../configuration/fallback.md)** - Set up automatic failover
- **[Monitoring](../monitoring.md)** - Set up observability and metrics
- **[API Reference](../api-reference/endpoints.md)** - Complete API documentation
