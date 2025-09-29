# Frequently Asked Questions

This page answers common questions about the Radicalbit AI Gateway.

## General Questions

### What is the Radicalbit AI Gateway?

The Radicalbit AI Gateway is a unified interface that provides seamless access to multiple AI models with advanced features like comprehensive guardrails, robust fallback mechanisms, weighted round-robin load balancing, and enterprise-grade security.

### How does it differ from calling AI APIs directly?

The gateway provides several advantages over direct API calls:

- **Unified Interface**: Single API endpoint for all AI models
- **Guardrails**: Content filtering and safety measures
- **Fallback Mechanisms**: Automatic failover if a model fails
- **High Availability**: 
  - Weighted Load Balancing: Distribute requests across multiple models with configurable weights
  - Health monitoring and metrics
- **Rate Limiting**: Control costs and prevent abuse
- **Caching**: Reduce latency and costs
- **Monitoring**: Comprehensive metrics and observability

### Is it compatible with existing OpenAI libraries?

Yes! The gateway implements the OpenAI Chat Completions API specification, making it compatible with existing OpenAI libraries and tools. You can use it as a drop-in replacement for OpenAI endpoints.

## Configuration Questions

### How do I configure multiple models in a route?

You can configure multiple models in a route's `chat_models` list:

```yaml
routes:
  my-route:
    chat_models:
      - model_id: gpt-3.5-turbo
        model: openai/gpt-3.5-turbo
        credentials:
          api_key: !secret OPENAI_API_KEY
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
```

### How do fallbacks work?

Fallbacks provide automatic failover when a model fails:

```yaml
fallback:
  - target: gpt-4o-mini
    fallbacks:
      - gpt-3.5-turbo
      - claude-3-sonnet
```

If `gpt-4o-mini` fails, the gateway will automatically retry with `gpt-3.5-turbo`, then `claude-3-sonnet` if needed.

## High Availability Questions

### How does weighted round-robin load balancing work?

The gateway supports weighted round-robin load balancing to distribute requests across multiple models:

```yaml
balancing:
  algorithm: weighted_round_robin
  weights:
    - model_id: gpt-3.5-turbo
      weight: 3  # Gets 3 out of every 4 requests
    - model_id: gpt-4o-mini
      weight: 1  # Gets 1 out of every 4 requests
```

This ensures optimal resource utilization and cost management.

## Guardrails Questions

### What types of guardrails are available?

The gateway supports several guardrail types:

- **Traditional Guardrails**: Fast pattern matching (`contains`, `regex`, `starts_with`, `ends_with`)
- **Presidio Guardrails**: Privacy and PII protection (`presidio_analyzer`, `presidio_anonymizer`)
- **LLM Judge Guardrails**: AI-powered content evaluation (`judge`, `classifier`)

### How do I implement content filtering?

You can implement content filtering using traditional guardrails:

```yaml
guardrails:
  - name: profanity_filter
    type: contains
    where: input
    behavior: block
    parameters:
      values: ["spam", "scam", "inappropriate"]
    response_message: "Content blocked due to inappropriate language"
```

### What's the difference between `judge` and `classifier` guardrails?

- **`judge`**: In-depth evaluation for critical decisions, returns a score
- **`classifier`**: Lightweight classification with confidence threshold

```yaml
# Judge example
- name: toxicity_judge
  type: judge
  parameters:
    judge_config:
      threshold: 0.01  # Lower threshold for stricter filtering

# Classifier example
- name: content_classifier
  type: classifier
  parameters:
    threshold: 0.7  # Higher threshold for classification
```

## Performance Questions

### What's the overhead of using the gateway?

The gateway typically adds 10-30% overhead compared to direct API calls. This includes:

- Request processing and validation
- Route resolution and model selection
- Guardrail processing
- Response formatting
- Metrics collection

### How can I reduce latency?

Several strategies can help reduce latency:

1. **Use faster models for guardrails**:
   ```yaml
   guardrails:
     - name: content_check
       type: judge
       parameters:
         judge_config:
           model_id: gpt-3.5-turbo  # Use faster model
   ```

2. **Optimize caching**:
   ```yaml
   caching:
     enabled: true
     ttl: 300  # Appropriate TTL for your use case
   ```

3. **Use traditional guardrails first**:
   ```yaml
   guardrails:
     - basic_filter    # Fast, simple filtering
     - toxicity_judge  # AI-powered analysis
   ```

### How do I monitor performance?

The gateway exposes comprehensive metrics via Prometheus:

- `gateway_requests_total`: Total requests processed
- `gateway_request_duration_milliseconds`: Request latency
- `gateway_model_invocations_total`: Model usage
- `gateway_guardrails_triggered_total`: Guardrail activity

## Security Questions

### How do I secure API keys?

Use environment variables for sensitive data (the default secrets file should be named `secrets.yaml`):

```yaml
credentials:
  api_key: "${OPENAI_API_KEY}"  # Environment variable
```

Never hardcode API keys in configuration files.

### How do I implement rate limiting?

Configure rate limiting per route:

```yaml
rate_limiting:
  algorithm: fixed_window
  window_size: 1 minute
  max_requests: 100
```

### How do I protect against PII?

Use Presidio guardrails for PII protection:

```yaml
guardrails:
  - name: pii_analyzer
    type: presidio_analyzer
    where: input
    behavior: block
    parameters:
      language: en
      entities: ["EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD"]
```

## Deployment Questions

### Can I deploy with Docker?

Yes! The gateway is distributed as a Docker container:

```bash
docker run -p 8000:8000 \
  -v $(pwd)/config.yaml:/app/config.yaml \
  -v $(pwd)/secrets.yaml:/app/secrets.yaml \
  radicalbit/ai-gateway:latest
```

### How do I scale horizontally?

Use load balancers and multiple gateway instances:

```yaml
# docker-compose.yml
services:
  gateway1:
    image: radicalbit/ai-gateway:latest
    ports:
      - "8001:8000"
  gateway2:
    image: radicalbit/ai-gateway:latest
    ports:
      - "8002:8000"
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    # Configure load balancing
```

### How do I set up monitoring?

Use the included Prometheus and Grafana setup:

```yaml
services:
  gateway:
    image: radicalbit/ai-gateway:latest
    ports:
      - "8000:8000"
      - "8001:8001"  # Metrics endpoint
  
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
```

## Troubleshooting Questions

### Why am I getting 404 errors?

Check that your route name matches the `model` field in your request:

```yaml
# config.yaml
routes:
  my-route:  # This must match the 'model' field
    chat_models: [...]
```

```bash
# Request
curl -X POST http://localhost:8000/v1/chat/completions \
  -d '{"model": "my-route", "messages": [...]}'
```

### Why are guardrails not working?

Ensure guardrails are properly configured and referenced:

```yaml
# Global guardrails definition
guardrails:
  - name: profanity_filter
    type: contains
    where: input
    behavior: block
    parameters:
      values: ["spam", "scam"]

# Route reference
routes:
  my-route:
    guardrails:
      - profanity_filter  # Must match name above
```

### Why is load balancing not working?

Check that model IDs match between `chat_models` and `balancing`:

```yaml
routes:
  my-route:
    chat_models:
      - model_id: gpt-3.5-turbo  # Must match below
        model: openai/gpt-3.5-turbo
    balancing:
      algorithm: weighted_round_robin
      weights:
        - model_id: gpt-3.5-turbo  # Must match above
          weight: 1
```

### How do I debug performance issues?

1. **Check metrics**:
   ```bash
   curl http://localhost:8001/metrics | grep gateway_request_duration
   ```

2. **Review logs**:
   ```bash
   docker logs gateway --tail 100
   ```

3. **Monitor resource usage**:
   ```bash
   docker stats gateway
   ```

## Cost Management Questions

### How do I control costs?

Several strategies help control costs:

1. **Use cheaper models for most requests**:
   ```yaml
   balancing:
     algorithm: weighted_round_robin
     weights:
       - model_id: gpt-3.5-turbo
         weight: 3  # Cheaper model gets more requests
       - model_id: gpt-4o-mini
         weight: 1  # Expensive model gets fewer requests
   ```

2. **Implement token limiting**:
   ```yaml
   token_limiting:
     input:
       window_size: 1 minute
       max_token: 5000
     output:
       window_size: 1 minute
       max_token: 10000
   ```

3. **Use caching**:
   ```yaml
   caching:
     enabled: true
     ttl: 300  # Cache responses for 5 minutes
   ```

### How do I track token usage?

Monitor token metrics:

```bash
# Total tokens per hour
curl http://localhost:8001/metrics | grep gateway_tokens_total

# Tokens by model
curl http://localhost:8001/metrics | grep gateway_tokens_total | grep model_name
```

## Integration Questions

### How do I integrate with existing applications?

The gateway is compatible with existing OpenAI libraries:

```python
# Python
import openai

client = openai.OpenAI(
    api_key="your-api-key",
    base_url="http://localhost:8000/v1"  # Gateway endpoint
)

response = client.chat.completions.create(
    model="my-route",  # Route name
    messages=[{"role": "user", "content": "Hello!"}]
)
```

```javascript
// JavaScript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'your-api-key',
  baseURL: 'http://localhost:8000/v1',  // Gateway endpoint
});

const response = await openai.chat.completions.create({
  model: 'my-route',  // Route name
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

### Can I use it with LangChain?

Yes! The gateway is compatible with LangChain:

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="my-route",  # Route name
    openai_api_base="http://localhost:8000/v1",
    openai_api_key="your-api-key"
)
```

## Next Steps

- **[Configuration Examples](./configuration/examples.md)** - Practical configuration examples
- **[Best Practices](./best-practices.md)** - Production best practices
- **[API Reference](./api-reference/endpoints.md)** - Complete API documentation
