# Semantic Caching

This page covers semantic caching configuration and features in the Radicalbit AI Gateway.

## Overview

Semantic caching in the Radicalbit AI Gateway uses embedding models to identify semantically similar requests, even when they use different wording. This advanced caching strategy improves performance and reduces costs by recognizing that questions like "What is the capital of France?" and "Tell me the capital city of France" are essentially the same query.

## How Semantic Caching Works

Unlike exact caching that requires identical request matching, semantic caching:
- Converts requests into embeddings using a specified embedding model
- Compares new requests against cached embeddings using similarity metrics
- Returns cached responses when similarity exceeds the configured threshold

## Cache Types

### Redis Caching

Persistent caching using Redis for distributed deployments:

```yaml
cache:
  redis_host: localhost
  redis_port: 6379
```

## Route-Level Semantic Caching

### Basic Semantic Caching Configuration

```yaml
routes:
  rb-gateway:
    chat_models:
      - model_id: llama3
        model: openai/llama3.2:3b
        credentials:
          base_url: 'http://localhost:11434/v1'
        params:
          temperature: 0.7
          top_p: 0.9
        prompt: "You are a helpful assistant."
    embedding_models:
      - model_id: text-embedding-3-small
        model: openai/text-embedding-3-small
        credentials:
          api_key: !secret OPENAI_API_KEY
    caching:
      type: semantic
      embedding_model_id: text-embedding-3-small
```

### Advanced Semantic Caching Configuration

```yaml
routes:
  production:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
        caching:
          type: semantic
          ttl: 7200  # Cache for 2 hours
          embedding_model_id: text-embedding-3-small
          similarity_threshold: 0.85
          distance_metric: cosine
          dim: 1536
```

## Configuration Parameters

### Required Parameters

- **enabled**: Enable or disable semantic caching (default: True)
- **type**: Must be set to `semantic` for semantic caching
- **embedding_model_id**: The embedding model used to generate request embeddings (e.g., `text-embedding-3-small`)

### Optional Parameters

- **ttl**: Cache expiration time in seconds. Set to `null` for infinite caching (default: None)
- **similarity_threshold**: Minimum similarity score (0-1) required for a cache hit (default: 0.8)
- **distance_metric**: Method for measuring embedding similarity (default: `cosine`)
  - `cosine`: Cosine similarity
  - `euclidean`: Euclidean distance
  - `inner_product`: Inner product similarity
- **dim**: Dimensionality of the embeddings (default: 1536)

## Cache Configuration

### Global Cache Settings

```yaml
cache:
  redis_host: localhost
  redis_port: 6379
```

### Semantic Cache Keys

Semantic cache keys are automatically generated based on:
- Route name
- Prompt hash
- Hashed api key

## Best Practices

### Similarity Threshold Configuration

- **High Threshold (0.9)**: For precise matching, reduces false positives
- **Medium Threshold (0.8)**: Balanced approach for most use cases
- **Low Threshold (0.7)**: For broader matching, may increase false positives

### TTL Configuration

- **Short TTL (300-1800s)**: For dynamic or frequently changing content
- **Medium TTL (1800-7200s)**: For semi-static content
- **Long TTL (7200-86400s)**: For static content
- **Infinite TTL (null)**: For permanent content that rarely changes

### Embedding Model Selection

- Choose embedding models that match your use case and language
- Consider model dimensionality vs. performance trade-offs
- Ensure the `dim` parameter matches your embedding model's output

### Distance Metric Selection

- **Cosine**: Best for most text similarity tasks (recommended)
- **Euclidean**: Useful when magnitude matters
- **Inner Product**: Effective for normalized embeddings

### Performance Optimization

- Enable semantic caching for frequently used models with repetitive queries
- Monitor cache hit rates and adjust similarity thresholds accordingly
- Balance similarity threshold with cache hit rate for optimal performance

## Monitoring

### Cache Metrics

- **Cache Hit Counter**: Number of times the gateway hits the semantic cache
- **Cache Hit Rate**: Percentage of requests served from cache
- **Average Similarity Score**: Monitor to tune similarity threshold

## Troubleshooting

### Common Issues

1. **Semantic Cache Not Working**: 
   - Verify `type: semantic` is set in configuration
   - Ensure embedding model ID is valid and accessible
   - Check Redis is accessible

2. **Low Cache Hit Rate**: 
   - Lower similarity threshold to increase matches
   - Verify embedding model is appropriate for your content
   - Check that similar requests are actually being made

3. **High False Positive Rate**: 
   - Increase similarity threshold for more precise matching
   - Review distance metric selection
   - Consider using exact caching for critical applications

4. **Redis Connection Issues**: 
   - Check Redis server status and credentials
   - Verify network connectivity to Redis host

5. **Embedding Model Errors**:
   - Confirm embedding model ID is correct
   - Verify API credentials for embedding model provider
   - Ensure `dim` parameter matches model output dimensions

## Comparing Semantic vs. Exact Caching

| Feature | Exact Caching | Semantic Caching |
|---------|---------------|------------------|
| **Matching** | Identical requests only | Semantically similar requests |
| **Hit Rate** | Lower | Higher |
| **Precision** | 100% | Depends on threshold |
| **Overhead** | Minimal | Embedding computation |
| **Use Case** | Repeated identical queries | Similar questions with different wording |

## Next Steps

- **[Caching](./caching.md)** - Learn about exact caching strategies
- **[Load Balancing](../configuration/load-balancing.md)** - Configure load balancing across models
- **[Fallback](../configuration/fallback.md)** - Set up automatic failover
- **[Monitoring](../monitoring.md)** - Set up observability and metrics
- **[API Reference](../api-reference/endpoints.md)** - Complete API documentation