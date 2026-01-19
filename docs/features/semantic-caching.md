# Semantic Caching

This page covers semantic caching configuration and features in the Radicalbit AI Gateway.

## Overview

Semantic caching in the Radicalbit AI Gateway uses embedding models to identify semantically similar requests, even when they use different wording. This advanced caching strategy improves performance and reduces costs by recognizing that questions like "What is the capital of France?" and "Tell me the capital city of France" are essentially the same query.

With the **new configuration structure**:

- Models are defined at top-level (`chat_models`, `embedding_models`)
- Routes reference models by **model ID** (strings)
- Semantic caching is configured **at route level** via `routes.<name>.caching`

---

## How Semantic Caching Works

Unlike exact caching that requires identical request matching, semantic caching:

- Converts requests into embeddings using a specified embedding model
- Compares new requests against cached embeddings using similarity metrics
- Returns cached responses when similarity exceeds the configured threshold

---

## Cache Backend

### Redis Caching

Persistent caching using Redis for distributed deployments:

```yaml
cache:
  redis_host: localhost
  redis_port: 6379
```

---

## Route-Level Semantic Caching

### Basic Semantic Caching Configuration

```yaml
chat_models:
  - model_id: llama3
    model: openai/llama3.2:3b
    credentials:
      base_url: "http://localhost:11434/v1"
    params:
      temperature: 0.7
      top_p: 0.9
    prompt: "You are a helpful assistant."
    role: system

embedding_models:
  - model_id: text-embedding-3-small
    model: openai/text-embedding-3-small
    credentials:
      api_key: !secret OPENAI_API_KEY

routes:
  rb-gateway:
    chat_models:
      - llama3
    embedding_models:
      - text-embedding-3-small
    caching:
      type: semantic
      ttl: 120
      embedding_model_id: text-embedding-3-small
      similarity_threshold: 0.85
      distance_metric: cosine
      dim: 1536

cache:
  redis_host: localhost
  redis_port: 6379
```

### Advanced Semantic Caching Configuration

```yaml
chat_models:
  - model_id: gpt-4o
    model: openai/gpt-4o

embedding_models:
  - model_id: text-embedding-3-small
    model: openai/text-embedding-3-small

routes:
  production:
    chat_models:
      - gpt-4o
    embedding_models:
      - text-embedding-3-small
    caching:
      type: semantic
      ttl: 7200  # Cache for 2 hours
      embedding_model_id: text-embedding-3-small
      similarity_threshold: 0.85
      distance_metric: cosine
      dim: 1536
```

---

## Configuration Parameters

### Required Parameters

- **`type`**: Must be set to `semantic` for semantic caching
- **`embedding_model_id`**: The embedding model used to generate request embeddings (e.g., `text-embedding-3-small`)

### Optional Parameters

- **`ttl`**: Cache expiration time in seconds
- **`similarity_threshold`**: Minimum similarity score (0-1) required for a cache hit (default typically ~0.8)
- **`distance_metric`**: Method for measuring embedding similarity
  - `cosine`: Cosine similarity (recommended)
  - `euclidean`: Euclidean distance
  - `dot`: Dot product similarity
- **`dim`**: Dimensionality of the embeddings (must match your embedding model)

---

## Semantic Cache Keys

Semantic cache keys are typically derived from:
- Route name
- Normalized request payload (e.g., messages content)
- Authentication context (e.g., API key / tenant / group), depending on your gateway setup

---

## Best Practices

### Similarity Threshold Configuration

- **High Threshold (0.9)**: Precise matching, fewer false positives
- **Medium Threshold (0.8)**: Balanced approach for most use cases
- **Low Threshold (0.7)**: Broader matching, may increase false positives

### TTL Configuration

- **Short TTL (300-1800s)**: Dynamic or frequently changing content
- **Medium TTL (1800-7200s)**: Semi-static content
- **Long TTL (7200-86400s)**: Static content

### Embedding Model Selection

- Choose embedding models that match your language/use case
- Ensure `dim` matches the model output dimensionality
- Consider accuracy vs. latency trade-offs

### Distance Metric Selection

- **Cosine**: Best for most text similarity tasks (recommended)
- **Euclidean**: Useful when magnitude matters
- **Dot**: Effective for certain normalized embedding spaces

### Performance Optimization

- Enable semantic caching for repetitive “same intent” queries
- Monitor cache hit rates and tune `similarity_threshold`
- Use Redis for distributed deployments

---

## Monitoring

### Cache Metrics

- **Cache Hit Counter**: Number of times the gateway hits the semantic cache
- **Cache Hit Rate**: Percentage of requests served from cache
- **Average Similarity Score**: Useful to tune the similarity threshold

---

## Troubleshooting

### Common Issues

1. **Semantic Cache Not Working**
   - Verify `caching.type: semantic` is set on the route
   - Ensure `embedding_model_id` exists and is included in the route `embedding_models`
   - Check Redis connectivity (if used)

2. **Low Cache Hit Rate**
   - Lower `similarity_threshold` to increase matches
   - Ensure the embedding model is appropriate for your content/language
   - Verify that semantically similar requests are actually being repeated

3. **High False Positive Rate**
   - Increase `similarity_threshold`
   - Re-check `distance_metric`
   - Consider using exact caching for critical or high-risk routes

4. **Redis Connection Issues**
   - Check Redis server status and network connectivity
   - Validate host/port configuration

5. **Embedding Model Errors**
   - Confirm embedding `model_id` is correct
   - Verify API credentials for the embedding provider
   - Ensure `dim` matches the embedding model output

---

## Comparing Semantic vs. Exact Caching

| Feature | Exact Caching | Semantic Caching |
|---------|---------------|------------------|
| **Matching** | Identical requests only | Semantically similar requests |
| **Hit Rate** | Lower | Higher |
| **Precision** | 100% | Depends on threshold |
| **Overhead** | Minimal | Embedding computation |
| **Use Case** | Repeated identical queries | Similar questions with different wording |

---

## Next Steps

- **[Caching](./caching.md)** - Learn about exact caching strategies
- **[Fallback](../configuration/fallback.md)** - Set up automatic failover
- **[Monitoring](../monitoring.md)** - Set up observability and metrics
- **[API Reference](../api-reference/endpoints.md)** - Complete API documentation
