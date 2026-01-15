# Best Practices

This guide provides best practices for configuring, deploying, and maintaining the Radicalbit AI Gateway in production environments.

## Configuration Best Practices

### 1. Model Configuration

#### Use Descriptive Model IDs
```yaml
# Good: Descriptive and clear
chat_models:
  - model_id: gpt-3.5-turbo-production
    model: openai/gpt-3.5-turbo
  - model_id: gpt-4o-mini-production
    model: openai/gpt-4o-mini

# Avoid: Generic or unclear names
chat_models:
  - model_id: model1
    model: openai/gpt-3.5-turbo
  - model_id: model2
    model: openai/gpt-4o-mini
```

#### Set Appropriate Prompts (Prompt + Role)
Use `prompt` with an explicit `role`:

```yaml
# Good: Specific and clear instructions
chat_models:
  - model_id: customer-service
    model: openai/gpt-3.5-turbo
    prompt: "You are a helpful customer service assistant. Be polite, professional, and focus on resolving customer issues efficiently."
    role: system

# Avoid: Generic or unclear prompts
chat_models:
  - model_id: assistant
    model: openai/gpt-3.5-turbo
    prompt: "You are helpful."
    role: system
```

#### Keep Routes Thin (Reference Models by ID)
Define models once, reuse them across routes:

```yaml
chat_models:
  - model_id: customer-service
    model: openai/gpt-4o-mini
    credentials:
      api_key: !secret OPENAI_API_KEY
    params:
      temperature: 0.7
    prompt: "You are a helpful customer service assistant."
    role: system

routes:
  customer-service-route:
    chat_models:
      - customer-service
```

---

### 2. Fallback Configuration

#### Comprehensive Fallback Chains
```yaml
routes:
  production:
    chat_models:
      - gpt-4o-mini
      - gpt-3.5-turbo
      - claude-3-sonnet
    fallback:
      # Good: Multiple fallback options
      - target: gpt-4o-mini
        fallbacks:
          - gpt-3.5-turbo
          - claude-3-sonnet
      - target: gpt-3.5-turbo
        fallbacks:
          - claude-3-sonnet
          - gpt-4o-mini
```

```yaml
routes:
  production:
    chat_models:
      - gpt-4o-mini
      - gpt-3.5-turbo
    fallback:
      # Avoid: Single point of failure
      - target: gpt-4o-mini
        fallbacks:
          - gpt-3.5-turbo
```

---

### 3. Guardrails Configuration

#### Layer Defense Strategy
```yaml
# Good: Multiple layers of protection (fast checks first)
guardrails:
  - basic_content_filter  # Fast, simple filtering
  - pii_analyzer          # Privacy protection
  - toxicity_judge        # AI-powered analysis

# Avoid: Single guardrail type
guardrails:
  - toxicity_judge  # Only AI-powered
```

#### Performance-Optimized Guardrails
```yaml
# Good: Fast guardrails first, AI-powered last
guardrails:
  - name: basic_filter
    type: contains
    where: input
    behavior: block
    parameters:
      values: ["spam", "scam"]

  - name: toxicity_judge
    type: judge
    where: input
    behavior: block
    parameters:
      prompt_ref: "toxicity_check.md"
      model_id: gpt-3.5-turbo  # Use faster model
      temperature: 0.0
      max_tokens: 50
```

---

### 4. Rate Limiting Strategy

#### Appropriate Limits
```yaml
# Good: Balanced limits based on use case
rate_limiting:
  algorithm: fixed_window
  window_size: 1 minute
  max_requests: 50  # Reasonable for most applications
```

```yaml
# Avoid: Too restrictive
rate_limiting:
  algorithm: fixed_window
  window_size: 1 minute
  max_requests: 5
```

#### Token Management
```yaml
# Good: Separate input/output limits
token_limiting:
  input:
    algorithm: fixed_window
    window_size: 1 minute
    max_token: 5000
  output:
    algorithm: fixed_window
    window_size: 1 minute
    max_token: 10000
```

---

## Security Best Practices

### 1. API Key Management

#### Use Secrets / Environment Variables
```yaml
# Good: Use secrets or environment variables for sensitive data
credentials:
  api_key: !secret OPENAI_API_KEY
  base_url: "https://api.openai.com/v1"
```

```yaml
# Avoid: Hardcoded API keys
credentials:
  api_key: "sk-1234567890abcdef"
  base_url: "https://api.openai.com/v1"
```

#### Rotate API Keys Regularly
```bash
# Example: key rotation workflow (conceptual)
# - issue new provider key
# - update secrets.yaml / secret manager
# - restart gateway rollout
```

### 2. Network Security

#### Use TLS/SSL
```nginx
# Good: HTTPS with proper SSL configuration
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
}
```

#### Implement Firewall Rules
```bash
# Good: Restrictive firewall rules
ufw allow 443/tcp  # HTTPS only
ufw allow 22/tcp   # SSH for administration
ufw deny 8000/tcp  # Block direct gateway access
```

### 3. Access Control

Use the Gateway UI to create groups and API keys, then associate them with specific routes:

- **Groups**: Organize API keys by team or application
- **API Keys**: Generate keys through the UI and associate them with routes
- **Route Association**: Link groups/keys to specific routes for access control

This allows you to track which groups and keys are using specific applications and control access at the route level.

---

## Performance Best Practices

### 1. Caching Strategy

#### Appropriate TTL Values (Exact Cache)
```yaml
routes:
  static-content:
    caching:
      type: exact
      ttl: 3600  # 1 hour for static content

  dynamic-content:
    caching:
      type: exact
      ttl: 300   # 5 minutes for dynamic content
```

> If you need similarity-based caching, use `type: semantic` with an embedding model and `embedding_model_id`.

#### Cache Invalidation
Cache invalidation is typically handled through TTL and (optionally) redeploy/config changes depending on your environment. Prefer short TTLs for volatile data.

### 2. Resource Management

#### Set Resource Limits (Kubernetes example)
```yaml
# Good: Appropriate resource limits
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

#### Monitor Resource Usage
```bash
# Good: Regular resource monitoring
docker stats --no-stream gateway
```

### 3. Connection Pooling
If your deployment exposes connection pool settings, tune them for your traffic profile:

```yaml
connection_pool:
  max_connections: 100
  max_keepalive: 30
  timeout: 30
```

---

## Monitoring Best Practices

### 1. Comprehensive Metrics

#### Key Metrics to Monitor
- request rate, latency, error rate
- token usage
- cache hit rate
- guardrail triggers
- fallback usage

#### Set Up Alerting (conceptual)
- high error rate
- high p95 latency
- frequent fallback usage
- cache hit-rate drops

### 2. Logging Strategy

#### Structured Logging (conceptual)
- include `route_name`, `model_id`, `request_id`, `group`, `api_key_id` (if applicable)
- avoid logging sensitive inputs/outputs unless strictly needed and compliant

---

## Deployment Best Practices

### 1. Environment Separation

Use different configurations or overlays per environment (dev/staging/prod). With the new structure, keep model definitions top-level and reference them in routes:

```yaml
# config.dev.yaml
chat_models:
  - model_id: gpt-3.5-turbo
    model: openai/gpt-3.5-turbo
    credentials:
      api_key: !secret DEV_OPENAI_API_KEY

routes:
  dev-route:
    chat_models:
      - gpt-3.5-turbo
```

```yaml
# config.prod.yaml
chat_models:
  - model_id: gpt-3.5-turbo
    model: openai/gpt-3.5-turbo
    credentials:
      api_key: !secret PROD_OPENAI_API_KEY

routes:
  prod-route:
    chat_models:
      - gpt-3.5-turbo
```

### 2. Blue-Green Deployment

```bash
# Example: blue-green deployment strategy (conceptual)
docker compose -f docker-compose.blue.yml up -d
# wait for health check
docker compose -f docker-compose.green.yml down
```

### 3. Health Checks

```yaml
# Good: Multiple health check endpoints (conceptual)
health_checks:
  - endpoint: /health
    interval: 30s
    timeout: 10s
  - endpoint: /metrics
    interval: 60s
    timeout: 5s
```

---

## Maintenance Best Practices

### 1. Regular Updates

- Keep gateway and dependencies updated
- Test updates in staging before production
- Use version pinning and controlled rollouts

### 2. Backup Strategy

#### Regular Configuration Backups
```bash
DATE=$(date +%Y%m%d_%H%M%S)
cp config.yaml backups/config_$DATE.yaml
cp secrets.yaml backups/secrets_$DATE.yaml
```

#### Test Recovery Procedures
- restore from backup
- verify configuration loads
- run smoke tests

---

## Troubleshooting Best Practices

### 1. Proactive Monitoring
Set up dashboards for:
- request rate, error rate, latency
- model usage & fallback usage
- cache hit rate
- guardrail triggers

### 2. Incident Response
Maintain runbooks for common incidents:
- high latency
- high error rate
- provider outage
- Redis outage (if used)

---

## Next Steps

- **[Configuration Examples](./configuration/examples.md)** - Practical configuration examples
- **[Production Deployment](./deployment/production.md)** - Production deployment guide
- **[Monitoring](./monitoring.md)** - Comprehensive monitoring setup
