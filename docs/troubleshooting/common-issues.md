# Troubleshooting

This guide helps you diagnose and resolve common issues with the Radicalbit AI Gateway.

## Common Issues

### 1. Gateway Won't Start

**Symptoms:**
- Container fails to start
- Error messages during startup
- Port conflicts

**Solutions:**

#### Port Conflicts
```bash
# Check if port 8000 is already in use
lsof -i :8000

# Kill process using the port
kill -9 <PID>

# Or use a different port
docker run -p 8001:8000 radicalbit/ai-gateway:latest
```

#### Configuration Errors
```bash
# Check configuration syntax
docker run --rm -v $(pwd)/config.yaml:/app/config.yaml radicalbit/ai-gateway:latest --validate-config

# Common YAML syntax errors:
# - Incorrect indentation
# - Missing quotes around strings
# - Invalid boolean values (use true/false, not True/False)
```

#### Missing Dependencies
```bash
# Check container logs
docker logs <container-name>

# Common issues:
# - Missing Redis/Valkey for caching
# - Invalid API keys
# - Network connectivity issues
```

### 2. API Requests Failing

**Symptoms:**
- 404 errors
- 500 internal server errors
- Timeout errors

**Solutions:**

#### Route Not Found (404)
```yaml
# Check your config.yaml has the route defined
routes:
  my-route:  # This must match the 'model' field in your request
    chat_models:
      - model_id: gpt-3.5-turbo
        model: openai/gpt-3.5-turbo
        credentials:
          api_key: "your-api-key"
```

#### Invalid Model Configuration (500)
```yaml
# Ensure model_id exists in the route
routes:
  my-route:
    chat_models:
      - model_id: gpt-3.5-turbo  # Must be referenced in balancing/fallback
        model: openai/gpt-3.5-turbo
        credentials:
          api_key: "your-api-key"
    balancing:
      algorithm: round_robin
    fallback:
      - target: gpt-3.5-turbo  # Must match model_id above
        fallbacks: []
```

#### Authentication Issues
```bash
# Check API key format
curl -H "Authorization: Bearer your-api-key" \
     -H "Content-Type: application/json" \
     http://localhost:8000/v1/chat/completions

# For OpenAI-compatible models, ensure base_url ends with /v1
credentials:
  api_key: "dummy-key"  # Required even if not used
  base_url: "http://localhost:11434/v1"  # Must end with /v1
```

### 3. Guardrails Not Working

**Symptoms:**
- Content not being filtered
- Unexpected blocking behavior
- Performance issues

**Solutions:**

#### Guardrail Not Triggering
```yaml
# Check guardrail configuration
guardrails:
  - name: profanity_filter
    type: contains
    where: input  # input, output, or io
    behavior: block
    parameters:
      values: ["spam", "scam"]
    response_message: "Content blocked"

# Ensure guardrail is referenced in route
routes:
  my-route:
    guardrails:
      - profanity_filter  # Must match name above
```

#### Performance Issues with LLM Judge
```yaml
# Optimize LLM judge configuration
guardrails:
  - name: toxicity_judge
    type: judge
    where: input
    behavior: block
    parameters:
      judge_config:
        model_id: gpt-3.5-turbo  # Use faster model
        temperature: 0.0  # Lower temperature for consistency
        max_tokens: 50  # Limit response length
        threshold: 0.01  # Adjust threshold
```

### 4. Load Balancing Issues

**Symptoms:**
- Uneven distribution
- Models not being used
- Fallback not working

**Solutions:**

#### Weighted Round Robin Not Working
```yaml
# Ensure weights are properly configured
balancing:
  algorithm: weighted_round_robin
  weights:
    - model_id: gpt-3.5-turbo  # Must match model_id in chat_models
      weight: 1
    - model_id: gpt-4o-mini
      weight: 3  # This model gets 3x more requests
```

#### Fallback Chain Issues
```yaml
# Check fallback configuration
fallback:
  - target: gpt-3.5-turbo  # Must match model_id
    fallbacks:
      - gpt-4o-mini  # Must match model_id
      - claude-3-sonnet  # Must match model_id
```

### 5. Caching Problems

**Symptoms:**
- Cache not working
- Redis connection errors
- Inconsistent responses

**Solutions:**

#### Redis Connection Issues
```bash
# Check Redis/Valkey is running
docker ps | grep redis
docker ps | grep valkey

# Test connection
redis-cli -h localhost -p 6379 ping
```

#### Cache Configuration
```yaml
# Ensure cache is properly configured
cache:
  redis_host: 'valkey'  # Use service name in Docker Compose
  redis_port: 6379

# In route configuration
routes:
  my-route:
    caching:
      enabled: true
      ttl: 300  # 5 minutes
```

### 6. Rate Limiting Issues

**Symptoms:**
- Requests being blocked unexpectedly
- Rate limits not working
- Performance degradation

**Solutions:**

#### Rate Limiting Too Aggressive
```yaml
# Adjust rate limiting configuration
rate_limiting:
  algorithm: fixed_window
  window_size: 1 minute  # Increase window size
  max_requests: 100  # Increase limit
```

#### Token Limiting Issues
```yaml
# Check token limiting configuration
token_limiting:
  input:
    window_size: 10 seconds
    max_token: 1000  # Adjust based on your needs
  output:
    window_size: 10 minutes
    max_token: 5000
```

## Debugging Tools

### 1. Enable Debug Logging

```yaml
# Add to your config.yaml
logging:
  level: DEBUG
  format: json
```

### 2. Check Container Logs

```bash
# View real-time logs
docker logs -f <container-name>

# View logs with timestamps
docker logs -t <container-name>

# View last 100 lines
docker logs --tail 100 <container-name>
```

### 3. Test Configuration

```bash
# Validate configuration
docker run --rm -v $(pwd)/config.yaml:/app/config.yaml radicalbit/ai-gateway:latest --validate-config

# Test specific route
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "test-route",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### 4. Monitor Metrics

```bash
# Check Prometheus metrics
curl http://localhost:8001/metrics

# Key metrics to monitor:
# - gateway_requests_total
# - gateway_request_duration_milliseconds
# - gateway_guardrails_triggered_total
# - gateway_fallbacks_triggered_total
```

## Performance Optimization

### 1. Reduce Latency

```yaml
# Use faster models for guardrails
guardrails:
  - name: content_check
    type: judge
    parameters:
      judge_config:
        model_id: gpt-3.5-turbo  # Use faster model
        temperature: 0.0
        max_tokens: 50
```

### 2. Optimize Caching

```yaml
# Adjust cache TTL based on use case
routes:
  my-route:
    caching:
      enabled: true
      ttl: 300  # 5 minutes for dynamic content
      # ttl: 3600  # 1 hour for static content
```

### 3. Load Balancing

```yaml
# Use round-robin for simple cases
balancing:
  algorithm: round_robin

# Use weighted round-robin for cost optimization
balancing:
  algorithm: weighted_round_robin
  weights:
    - model_id: gpt-3.5-turbo
      weight: 3  # Cheaper model gets more requests
    - model_id: gpt-4o-mini
      weight: 1  # Expensive model gets fewer requests
```

## Getting Help

### 1. Check Documentation

- **[Configuration Guide](./configuration/advanced-configuration.md)** - Complete configuration reference
- **[Guardrails Reference](./features/guardrails-reference.md)** - Guardrail configuration
- **[Monitoring](./monitoring.md)** - Metrics and observability

### 2. Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Route 'X' not found` | Route not defined in config | Add route to config.yaml |
| `Model 'Y' not found` | Model not defined in route | Add model to route's chat_models |
| `Guardrail 'Z' not found` | Guardrail not defined | Add guardrail to global guardrails section |
| `Redis connection failed` | Cache service not running | Start Redis/Valkey service |
| `API key invalid` | Wrong API key format | Check API key format and permissions |

### 3. Support Resources

- Check the [Performance Benchmarking](./performance-benchmarking.md) guide for optimization tips
- Use the [Monitoring](./monitoring.md) setup for observability

## Next Steps

- **[Configuration Guide](./configuration/advanced-configuration.md)** - Complete configuration reference
- **[Monitoring](./monitoring.md)** - Set up observability and metrics
- **[Performance Benchmarking](./performance-benchmarking.md)** - Optimize your gateway performance
