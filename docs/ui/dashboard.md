# Dashboard

The Dashboard provides a complete overview of gateway status, configured routes, and real-time metrics.

## Overview

The main dashboard displays all routes defined in `config.yaml` as rows in a table.

## Route Table

Each route shows:
- **Route Name**: Name as defined in `config.yaml`
- **Feature Indicators**: Icons representing configured features
- **Metrics**: Counters and statistics for the selected time period

## Visual Feature Indicators

Each route displays colored icons indicating feature status:
- **Gray icon**: Feature not configured
- **White icon with blue border**: Feature configured, no events in selected time window
- **Solid blue icon**: Feature configured with events in selected time window

Features represented:
- **Caching**: Exact or semantic cache
- **Guardrails**: Protection and filtering systems
- **Fallback**: Automatic fallback mechanisms
- **Rate Limiting**: Request rate limiting
- **Token Limiting**: Token limiting
- **Budget Limiting**: Budget limiting

## Time Filters

A time range selector at the top allows:
- Viewing metrics for a specific period
- Analyzing usage trends
- Filtering events and statistics

Available intervals: last hour, last 24 hours, last 7 days, last 30 days, custom range.

## Route Details

Clicking a route row opens a detail panel with:

### Configuration Section

Shows the complete YAML configuration for the selected route, including:
- Configured models (chat and embedding)
- Model parameters
- Credentials (masked for security)
- Guardrails, caching, limiting, and fallback configuration

### cURL Section

Provides ready-to-use cURL commands to test the route:

```bash
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "route-name",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Associations Section

Shows all groups and API keys associated with the route:
- **Associated Groups**: Groups with access to this route (name, UUID, association date)
- **API Keys**: Keys that can access the route (name, UUID, group, creation date)

### Alerts Section

Shows a summary of the last 10 events for specific route features:
- **Guardrail Triggers**: When a guardrail is activated (type, behavior, timestamp)
- **Rate Limiting Events**: When rate limiting is applied
- **Token Limiting Events**: When token limits are reached
- **Fallback Triggers**: When a fallback is activated
- **Cache Events**: Cache-related events

## Metrics

### Per Route

Each route displays:
- **Total Input/Output Tokens**: Token consumption
- **Input/Output Cost**: Estimated costs
- **Cache Triggered**: Number of cache hits
- **Cache Saved Tokens**: Tokens saved by caching
- **Rate Limit Triggered**: Number of rate limit events
- **Token Limits Triggered**: Number of token limit events
- **Fallbacks**: Number of fallback triggers
- **Guardrails**: Number of guardrail triggers

### Aggregate

Top-level metrics across all routes:
- Total routes configured
- Total requests
- Total cost
- Total tokens processed

## Troubleshooting

### Metrics Not Displayed

1. Verify the gateway is running
2. Check the selected time period
3. Verify requests have been made to the route

### Route Not Visible

1. Verify it's correctly configured in `config.yaml`
2. Check the gateway was restarted after changes
3. Check gateway logs for configuration errors

### Events Missing

1. Verify ClickHouse database configuration
2. Check events were actually generated
3. Verify applied time filters

## Next Steps

- **[Groups](./groups.md)** - How to create and manage groups
- **[API Keys](./keys.md)** - How to create and manage API keys
- **[Monitoring](./../monitoring.md)** - Advanced monitoring with Prometheus
