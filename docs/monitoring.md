# Monitoring & Metrics

The Radicalbit AI Gateway exposes a wealth of metrics via a Prometheus endpoint, typically available on port `8001`. These metrics provide deep insights into the gateway's performance, traffic, costs, and behavior.

## Prometheus Metrics

### Key Metrics Exposed

| Metric Name                               | Description                                         | Labels                                   |
| ----------------------------------------- | --------------------------------------------------- | ---------------------------------------- |
| `gateway_requests_total`                  | Total number of requests processed.                 | `http_method`, `http_status_code`, `route_name` |
| `gateway_request_duration_milliseconds`   | Histogram of end-to-end request latency.            | `route_name`                             |
| `gateway_model_invocations_total`         | Number of times a specific model was invoked.       | `route_name`, `model_name`               |
| `gateway_invocation_duration_milliseconds`| Histogram of latency for individual model calls.    | `route_name`, `model_name`               |
| `gateway_fallbacks_triggered_total`       | Number of times a fallback was triggered.           | `route_name`, `target`, `fallback`       |
| `gateway_guardrails_triggered_total`      | Number of times a guardrail was triggered.          | `route_name`, `name`, `type`, `behavior` |
| `gateway_tokens_total_input_tokens_total` | Total number of input tokens processed.             | `route_name`, `model_name`               |
| `gateway_tokens_total_output_tokens_total`| Total number of output tokens processed.            | `route_name`, `model_name`               |
| `gateway_cache_hit_total`                 | Total number of cache hits.                         | `route_name`                             |
| `gateway_rate_limiting_total`             | Total number of times rate limiting was triggered.  | `route_name`                             |
| `gateway_token_input_limiting_total`      | Total number of times input token limit was hit.    | `route_name`, `model_name`               |
| `gateway_token_output_limiting_total`     | Total number of times output token limit was hit.   | `route_name`, `model_name`               |

## Accessing Metrics

### Prometheus Endpoint

The metrics are available at:
```
http://localhost:8001/metrics
```

### Example Metrics Output

```
# HELP gateway_requests_total Total number of requests processed
# TYPE gateway_requests_total counter
gateway_requests_total{http_method="POST",http_status_code="200",route_name="customer-service"} 150

# HELP gateway_request_duration_milliseconds Histogram of end-to-end request latency
# TYPE gateway_request_duration_milliseconds histogram
gateway_request_duration_milliseconds_bucket{route_name="customer-service",le="100"} 10
gateway_request_duration_milliseconds_bucket{route_name="customer-service",le="500"} 50
gateway_request_duration_milliseconds_bucket{route_name="customer-service",le="1000"} 100
gateway_request_duration_milliseconds_bucket{route_name="customer-service",le="+Inf"} 150

# HELP gateway_model_invocations_total Number of times a specific model was invoked
# TYPE gateway_model_invocations_total counter
gateway_model_invocations_total{route_name="customer-service",model_name="gpt-3.5-turbo"} 75
gateway_model_invocations_total{route_name="customer-service",model_name="gpt-4o-mini"} 75

# HELP gateway_tokens_total_input_tokens_total Total number of input tokens processed
# TYPE gateway_tokens_total_input_tokens_total counter
gateway_tokens_total_input_tokens_total{route_name="customer-service",model_name="gpt-3.5-turbo"} 15000
gateway_tokens_total_input_tokens_total{route_name="customer-service",model_name="gpt-4o-mini"} 12000
```

## Grafana Dashboards

### Pre-built Dashboard

The gateway includes a pre-built Grafana dashboard that visualizes all key metrics:

- **Request Volume**: Total requests per route over time
- **Response Times**: P50, P95, P99 latency percentiles
- **Model Usage**: Distribution of requests across models
- **Token Consumption**: Input/output token usage by model
- **Error Rates**: HTTP status code distribution
- **Guardrail Activity**: Triggered guardrails by type
- **Fallback Usage**: Fallback triggers and success rates
- **Cache Performance**: Cache hit rates and performance

### Dashboard Configuration

```yaml
# grafana-dashboard.json
{
  "dashboard": {
    "title": "Radicalbit AI Gateway",
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
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(gateway_request_duration_milliseconds_bucket[5m]))",
            "legendFormat": "P95 - {{route_name}}"
          }
        ]
      }
    ]
  }
}
```

## Monitoring Setup

### Docker Compose with Monitoring

```yaml
version: '3.8'
services:
  gateway:
    image: radicalbit/ai-gateway:latest
    ports:
      - "8000:8000"
      - "8001:8001"  # Metrics endpoint
    volumes:
      - ./config.yaml:/app/config.yaml
      - ./secrets.yaml:/app/secrets.yaml

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana

volumes:
  grafana-storage:
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
    metrics_path: '/metrics'
```

## Key Performance Indicators (KPIs)

### Request Metrics
- **Request Rate**: Requests per second by route
- **Response Time**: P50, P95, P99 latency
- **Error Rate**: Percentage of failed requests
- **Throughput**: Total requests processed

### Model Metrics
- **Model Distribution**: Usage across different models
- **Model Performance**: Response times per model
- **Fallback Rate**: Percentage of requests using fallbacks
- **Token Usage**: Input/output tokens per model

### Business Metrics
- **Cost Tracking**: Token consumption for cost analysis
- **Cache Efficiency**: Cache hit rates
- **Guardrail Effectiveness**: Trigger rates and types
- **Rate Limiting**: Throttled requests

## Alerting Rules

### Example Prometheus Alert Rules

```yaml
# alerts.yml
groups:
  - name: ai-gateway
    rules:
      - alert: HighErrorRate
        expr: rate(gateway_requests_total{http_status_code=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(gateway_request_duration_milliseconds_bucket[5m])) > 5000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "P95 latency is {{ $value }}ms"

      - alert: ModelFailure
        expr: rate(gateway_fallbacks_triggered_total[5m]) > 0.5
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High fallback rate detected"
          description: "Fallback rate is {{ $value }} per second"
```

## Cost Monitoring

### Token Usage Tracking

Monitor token consumption to track costs:

```promql
# Total tokens per hour
sum(rate(gateway_tokens_total_input_tokens_total[1h])) + sum(rate(gateway_tokens_total_output_tokens_total[1h]))

# Tokens by model
sum by (model_name) (rate(gateway_tokens_total_input_tokens_total[1h]) + rate(gateway_tokens_total_output_tokens_total[1h]))

# Cost estimation (example rates)
sum(rate(gateway_tokens_total_input_tokens_total[1h])) * 0.0005 + sum(rate(gateway_tokens_total_output_tokens_total[1h])) * 0.0015
```

### Usage Patterns

Track usage patterns to optimize costs:

```promql
# Peak usage hours
hour(timestamp(gateway_requests_total))

# Requests by route
sum by (route_name) (rate(gateway_requests_total[1h]))

# Model efficiency (tokens per request)
sum(rate(gateway_tokens_total_input_tokens_total[1h])) / sum(rate(gateway_requests_total[1h]))
```

## UI Monitoring

The Radicalbit AI Gateway provides a web-based UI for monitoring and managing your gateway:

### Features

- **Routes Management**: View all configured routes and their features
- **Groups and Keys**: Create and manage API key groups and associate them with routes
- **Cost Tracking**: Monitor costs by groups and keys
- **Event Tracking**: View events that occurred on specific routes with time filters
- **Route Details**: View configuration, test with curl commands, and see associations
- **Alerts**: View summaries of the last 10 events related to specific features

### Visual Indicators

Each route in the UI displays configured features with visual indicators:
- **Gray icon**: Feature not configured
- **White icon with blue outline**: Feature configured, but no events in selected time window
- **Solid blue icon**: Feature configured with events in the selected time window

### Access

The UI is typically available at the same host as the gateway, on a separate port or path configured in your deployment.

## Troubleshooting

### Common Issues

1. **Metrics Not Appearing**: Check if the metrics endpoint is accessible
2. **High Latency**: Monitor model-specific response times
3. **High Error Rate**: Check fallback triggers and model availability
4. **Cache Misses**: Verify cache configuration and TTL settings

### Debug Queries

```promql
# Check if metrics are being collected
up{job="ai-gateway"}

# Recent request rate
rate(gateway_requests_total[5m])

# Error rate by status code
rate(gateway_requests_total{http_status_code=~"4..|5.."}[5m])

# Model performance comparison
histogram_quantile(0.95, rate(gateway_invocation_duration_milliseconds_bucket[5m]))
```

## Next Steps

- **[Configuration Guide](./configuration/advanced-configuration.md)** - Complete configuration reference
- **[API Reference](./api-reference/endpoints.md)** - Complete API documentation
