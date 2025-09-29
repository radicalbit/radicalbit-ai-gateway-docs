# Production Deployment

This guide covers deploying the Radicalbit AI Gateway in production environments with high availability, security, and monitoring.

## Production Considerations

### Security
- Use strong API keys and rotate them regularly
- Implement proper network security (firewalls, VPNs)
- Enable TLS/SSL encryption
- Use secrets management systems
- Implement proper access controls

### Scalability
- Use load balancers for multiple gateway instances
- Implement horizontal scaling
- Use container orchestration (Kubernetes, Docker Swarm)
- Monitor resource usage and scale accordingly

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
      - postgres
      - redis
    networks:
      - gateway-network

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=gateway
      - POSTGRES_USER=gateway
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
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

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    restart: unless-stopped
    depends_on:
      - gateway
    networks:
      - gateway-network

volumes:
  postgres_data:
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
POSTGRES_PASSWORD=your-secure-postgres-password
REDIS_PASSWORD=your-secure-redis-password
GRAFANA_PASSWORD=your-secure-grafana-password
```

### Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream gateway {
        server gateway:8000;
    }

    upstream metrics {
        server gateway:8001;
    }

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://gateway;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        location /metrics {
            proxy_pass http://metrics;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## Kubernetes Deployment

### Namespace
```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ai-gateway
```

### ConfigMap
```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: gateway-config
  namespace: ai-gateway
data:
  config.yaml: |
    routes:
      production:
        chat_models:
          - model_id: gpt-3.5-turbo
            model: openai/gpt-3.5-turbo
            credentials:
              api_key: !secret OPENAI_API_KEY
        rate_limiting:
          algorithm: fixed_window
          window_size: 1 minute
          max_requests: 100
        guardrails:
          - content_filter
    guardrails:
      - name: content_filter
        type: contains
        where: input
        behavior: block
        parameters:
          values: ["spam", "scam"]
```

### Secret
```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: gateway-secrets
  namespace: ai-gateway
type: Opaque
data:
  secrets.yaml: |
    OPENAI_API_KEY: "your-base64-encoded-api-key"
    REDIS_PASSWORD: "your-base64-encoded-redis-password"
```

### Deployment
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gateway
  namespace: ai-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gateway
  template:
    metadata:
      labels:
        app: gateway
    spec:
      containers:
      - name: gateway
        image: radicalbit/ai-gateway:latest
        ports:
        - containerPort: 8000
        - containerPort: 8001
        env:
        - name: CONFIG_PATH
          value: "/app/config.yaml"
        - name: SECRETS_PATH
          value: "/app/secrets.yaml"
        volumeMounts:
        - name: config
          mountPath: /app/config.yaml
          subPath: config.yaml
        - name: secrets
          mountPath: /app/secrets.yaml
          subPath: secrets.yaml
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
      volumes:
      - name: config
        configMap:
          name: gateway-config
      - name: secrets
        secret:
          secretName: gateway-secrets
```

### Service
```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: gateway-service
  namespace: ai-gateway
spec:
  selector:
    app: gateway
  ports:
  - name: http
    port: 8000
    targetPort: 8000
  - name: metrics
    port: 8001
    targetPort: 8001
  type: ClusterIP
```

### Ingress
```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: gateway-ingress
  namespace: ai-gateway
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: gateway-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: gateway-service
            port:
              number: 8000
```

## Security Best Practices

### 1. API Key Management
```yaml
# Use environment variables for sensitive data (default secrets file: secrets.yaml)
secrets:
  OPENAI_API_KEY: "${OPENAI_API_KEY}"
  ANTHROPIC_API_KEY: "${ANTHROPIC_API_KEY}"
  REDIS_PASSWORD: "${REDIS_PASSWORD}"
```

### 2. Network Security
```yaml
# Restrict network access
networks:
  gateway-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### 3. Resource Limits
```yaml
# Set resource limits
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### 4. Health Checks
```yaml
# Implement health checks
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## Monitoring Setup

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
    metrics_path: '/metrics'
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "AI Gateway Production",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(gateway_requests_total[5m])",
            "legendFormat": "{{route_name}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(gateway_requests_total{http_status_code=~\"5..\"}[5m])",
            "legendFormat": "{{route_name}}"
          }
        ]
      }
    ]
  }
}
```

## Backup and Recovery

### Configuration Backup
```bash
#!/bin/bash
# backup-config.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/gateway"

mkdir -p $BACKUP_DIR

# Backup configuration
cp config.yaml $BACKUP_DIR/config_$DATE.yaml
cp secrets.yaml $BACKUP_DIR/secrets_$DATE.yaml

# Backup database
docker exec postgres pg_dump -U gateway gateway > $BACKUP_DIR/database_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.yaml" -mtime +7 -delete
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

### Recovery Procedure
```bash
#!/bin/bash
# restore-config.sh

BACKUP_FILE=$1
BACKUP_DIR="/backups/gateway"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

# Restore configuration
cp $BACKUP_DIR/$BACKUP_FILE config.yaml

# Restart services
docker compose restart gateway
```

## Performance Optimization

### 1. Caching Strategy
```yaml
# Optimize cache configuration
routes:
  production:
    caching:
      enabled: true
      ttl: 300  # 5 minutes for dynamic content
      # ttl: 3600  # 1 hour for static content
```

### 2. Load Balancing
```yaml
# Use efficient load balancing
balancing:
  algorithm: weighted_round_robin
  weights:
    - model_id: gpt-3.5-turbo
      weight: 3  # Cheaper model gets more requests
    - model_id: gpt-4o-mini
      weight: 1  # Expensive model gets fewer requests
```

### 3. Rate Limiting
```yaml
# Set appropriate rate limits
rate_limiting:
  algorithm: fixed_window
  window_size: 1 minute
  max_requests: 100  # Adjust based on your needs
```

## Troubleshooting Production Issues

### 1. High Latency
```bash
# Check metrics
curl http://localhost:8001/metrics | grep gateway_request_duration

# Check logs
docker logs gateway --tail 100
```

### 2. High Error Rate
```bash
# Check error metrics
curl http://localhost:8001/metrics | grep gateway_requests_total

# Check specific errors
docker logs gateway | grep ERROR
```

### 3. Resource Usage
```bash
# Check container resources
docker stats gateway

# Check system resources
top
df -h
```

## Next Steps

- **[Monitoring](./monitoring.md)** - Set up comprehensive monitoring
- **[Performance Benchmarking](./performance-benchmarking.md)** - Optimize performance
- **[API Reference](./api-reference/endpoints.md)** - Complete API documentation
