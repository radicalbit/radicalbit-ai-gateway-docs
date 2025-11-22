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


## Next Steps

- **[Configuration Guide](./configuration/advanced-configuration.md)** - Complete configuration reference
- **[API Reference](./api-reference/endpoints.md)** - Complete API documentation
