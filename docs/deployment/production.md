# Production Deployment

This guide covers deploying the Radicalbit AI Gateway in production environments with security and monitoring.

## Production Considerations

### Security
- Use strong API keys and rotate them regularly
- Implement proper network security (firewalls, VPNs)
- Enable TLS/SSL encryption
- Use secrets management systems
- Implement proper access controls

### Monitoring
- Set up comprehensive monitoring and alerting
- Use centralized logging
- Implement health checks
- Monitor performance metrics

### Backup and Recovery
- Regular configuration backups
- Database backups (if using persistent storage)
- Disaster recovery procedures
- Testing recovery procedures

## Docker Compose Production Setup

### Complete Production Stack

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  gateway:
    image: radicalbit/ai-gateway:latest
    ports:
      - "8000:8000"
      - "8001:8001"  # Metrics endpoint
    volumes:
      - ./config.yaml:/app/config.yaml:ro
      - ./secrets.yaml:/app/secrets.yaml:ro
    environment:
      - CONFIG_PATH=/app/config.yaml
      - SECRETS_PATH=/app/secrets.yaml
      - LOG_LEVEL=INFO
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    depends_on:
      - redis
    networks:
      - gateway-network

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - gateway-network

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=30d'
    restart: unless-stopped
    networks:
      - gateway-network

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_SECURITY_ADMIN_USER=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources
    restart: unless-stopped
    networks:
      - gateway-network

volumes:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  gateway-network:
    driver: bridge
```

### Environment Variables

Create a `.env` file:

```bash
# .env
REDIS_PASSWORD=your-secure-redis-password
GRAFANA_PASSWORD=your-secure-grafana-password
```

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ai-gateway'
    static_configs:
      - targets: ['gateway:8001']
    scrape_interval: 5s
    metrics_path: /metrics
```

## Production Configuration

### Gateway Configuration

```yaml
# config.yaml
routes:
  production:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
        credentials:
          api_key: !secret OPENAI_API_KEY
        params:
          temperature: 0.7
          max_tokens: 1000
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
        params:
          temperature: 0.7
          max_tokens: 1000
    fallback:
      - target: gpt-4o
        fallbacks:
          - gpt-3.5-turbo
    balancing:
      algorithm: WEIGHTED_ROUND_ROBIN
      weights:
        - model_id: gpt-4o
          weight: 70
        - model_id: gpt-4o-mini
          weight: 30
    rate_limiting:
      algorithm: fixed_window
      window_size: 1 minute
      max_requests: 1000
    token_limiting:
      algorithm: fixed_window
      window_size: 1 hour
      max_tokens: 1000000
    caching:
      enabled: true
      ttl: 3600
    guardrails:
      - content_filter
      - pii_protection

guardrails:
  - name: content_filter
    type: contains
    where: input
    behavior: block
    parameters:
      values: ["spam", "scam", "malware"]
  
  - name: pii_protection
    type: presidio_analyzer
    where: input
    behavior: warn
    parameters:
      language: en
      entities: ["EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD"]

cache:
  redis_host: redis
  redis_port: 6379
  redis_password: !secret REDIS_PASSWORD
```

### Secrets File

```yaml
# secrets.yaml
OPENAI_API_KEY: "your-openai-api-key"
ANTHROPIC_API_KEY: "your-anthropic-api-key"
REDIS_PASSWORD: "your-redis-password"
```

## Deployment Commands

### Start Production Stack

```bash
# Start all services
docker compose -f docker-compose.prod.yml up -d

# Check service status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f gateway
```

### Health Checks

```bash
# Check gateway health
curl http://localhost:8000/health

# Check metrics endpoint
curl http://localhost:8001/metrics

# Check Prometheus
curl http://localhost:9090/targets

# Check Grafana
curl http://localhost:3000/api/health
```

### Monitoring

```bash
# View gateway metrics
curl http://localhost:8001/metrics | grep gateway_

# Check Redis connection
docker exec -it redis redis-cli ping

# Check container resources
docker stats gateway

# Check system resources
top
df -h
```

## Next Steps

- **[Monitoring](../monitoring.md)** - Set up comprehensive monitoring
- **[API Reference](../api-reference/endpoints.md)** - Complete API documentation
