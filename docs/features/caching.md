# Caching

Without caching, every request reaches the model, even repeated ones. Caching stores responses so repeated or similar requests are served faster and at a lower cost.

## Overview

Caching in the Radicalbit AI Gateway stores model responses and serves them again when the same request, or one with the same meaning, comes back.

The gateway supports two caching strategies:

- **Exact Cache**: serves a cached response only for an identical request
- **Semantic Cache**: serves a cached response for a request that means the same thing, even when worded differently, by comparing embeddings

Questions like "What is the capital of France?" and "Tell me the capital city of France" miss an exact cache but hit a semantic one.

---

## Cache Backend

Caching stores responses in Redis (or a compatible server). Declare it at top level with the `cache` section:

```yaml
cache:
  redis_host: localhost
  redis_port: 6379
```

Exact caching works with any Redis-compatible server. Semantic caching also needs vector search, such as Redis Stack or `valkey/valkey-bundle`.

All gateway replicas pointing to the same server share the same cache.

---

## Exact Cache

Exact cache serves a cached response only when the request is identical: same messages, same tools, same `tool_choice` and same request parameters.

For exact caching you must configure:

- `caching.type: exact` on the route
- a top-level `cache` section pointing to a Redis server

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

cache:
  redis_host: localhost
  redis_port: 6379
```

### Exact Cache Fields

- **`type`**: must be `exact`
- **`ttl`**: time-to-live in seconds. If omitted, entries never expire

---

## Semantic Cache

Semantic cache converts each request into an embedding with the configured embedding model, looks up the closest cached request, and returns its response when the similarity reaches `similarity_threshold`.

For semantic caching you must configure:

- at least one `chat_model` in the route
- at least one `embedding_model` in the route
- `caching.type: semantic`
- `caching.embedding_model_id` pointing to one of the route embedding model IDs
- a top-level `cache` section pointing to a Redis server with vector search

### Semantic Cache Example

```yaml
chat_models:
  - model_id: assistant
    model: openai/gpt-4o

embedding_models:
  - model_id: text-embedding-3-small
    model: openai/text-embedding-3-small
    credentials:
      api_key: !secret OPENAI_API_KEY

routes:
  semantic-cache-demo:
    chat_models:
      - assistant
    embedding_models:
      - text-embedding-3-small
    caching:
      type: semantic
      ttl: 7200  # Cache for 2 hours
      embedding_model_id: text-embedding-3-small
      similarity_threshold: 0.85
      distance_metric: cosine
      dim: 1536

cache:
  redis_host: localhost
  redis_port: 6379
```

### Semantic Cache Fields

Required:

- **`type`**: must be `semantic`
- **`embedding_model_id`**: embedding model ID used to build and compare vectors. It must be listed in the route `embedding_models`

Optional:

- **`ttl`**: time-to-live in seconds. If omitted, entries never expire
- **`similarity_threshold`**: minimum similarity, between 0 and 1, to accept a cached match (default `0.8`)
- **`distance_metric`**: how embeddings are compared (default `cosine`)
  - `cosine`: cosine similarity (recommended)
  - `euclidean`: Euclidean distance
  - `inner_product`: inner (dot) product
- **`dim`**: embedding vector dimensionality. It must match the embedding model output (default `1536`)

---

## Exact vs. Semantic Cache

| Feature | Exact Cache | Semantic Cache |
|---------|-------------|----------------|
| **Matching** | Identical requests only | Requests with the same meaning |
| **Hit Rate** | Lower | Higher |
| **Precision** | 100% | Depends on `similarity_threshold` |
| **Overhead** | Minimal | One embedding call per request |
| **Backend** | Redis | Redis with vector search |
| **Use Case** | Repeated identical queries | Similar questions with different wording |

---

## Cache Scope

Cached responses are scoped to:

- Project
- Route name
- API key

Two different API keys never share a cached response, even on the same route with the same request. Account for this when estimating hit rates for routes used by many keys.

---

## Best Practices

### TTL Configuration

- **Short TTL (300-1800s)**: dynamic or frequently changing content
- **Medium TTL (1800-7200s)**: semi-static content
- **Long TTL (7200-86400s)**: static content

### Similarity Threshold Configuration

- **High Threshold (0.9)**: precise matching, fewer false positives
- **Medium Threshold (0.8)**: balanced approach for most use cases
- **Low Threshold (0.7)**: broader matching, may increase false positives

### Embedding Model Selection

- Choose an embedding model that fits your language and use case
- Set `dim` to the model output dimensionality
- Consider accuracy vs. latency: every request on a semantic route pays for one embedding call

### Choosing a Strategy

- Use exact cache for highly repetitive, identical requests
- Use semantic cache for "same intent, different wording" queries
- Prefer exact cache on critical or high-risk routes, where a near match is not good enough

---

## Monitoring

### Cache Metrics

- **`gateway_cache_hit_total`**: number of cache hits, by route
- **`gateway.cache.semantic.similarity`**: histogram of the similarity score of semantic cache lookups, with a `cache_hit` attribute. Use it to tune `similarity_threshold`

See **[Monitoring](../operations/monitoring.md)** for the full metrics list.

---

## Troubleshooting

### Common Issues

1. **Cache Not Working**
   - Verify `caching` is set on the route and a top-level `cache` section is configured
   - Check Redis connectivity
   - Remember that two different API keys never share cached responses

2. **Semantic Cache Always Misses**
   - Ensure the Redis server supports vector search (Redis Stack, `valkey/valkey-bundle`)
   - Ensure `dim` matches the embedding model output
   - Lower `similarity_threshold`

3. **High False Positive Rate**
   - Increase `similarity_threshold`
   - Re-check `distance_metric`
   - Use exact cache for critical or high-risk routes

4. **Configuration Errors**
   - Define `embedding_model_id` in top-level `embedding_models` and list it in the route `embedding_models`
   - Set `distance_metric` to `cosine`, `euclidean` or `inner_product`

5. **Embedding Model Errors**
   - Confirm the embedding `model_id` is correct
   - Verify API credentials for the embedding provider

---

## Next Steps

- **[Fallback](./fallback.md)** - Set up automatic failover
- **[Advanced Routing](./advanced-routing.md)** - Another embedding-based feature, for routing requests by meaning
- **[Monitoring](../operations/monitoring.md)** - Set up observability and metrics
- **[API Reference](../api-reference/endpoints.md)** - Complete API documentation
