# Technical Overview

The Radicalbit AI Gateway is a powerful, flexible, and feature-rich service designed to act as a standardized, centralized, intelligent entry point for all your interactions with Large Language Models (LLMs).

## What is the Radicalbit AI Gateway?

The Radicalbit AI Gateway provides a unified interface (standard OpenAI specification) to multiple AI models, abstracting away the complexity of dealing with different providers and adding a layer of control, security, and resilience to your AI applications.

### A Non-Technical Overview

Think of the AI Gateway as a smart traffic controller for AI requests. When your application needs to talk to an AI model (like `gpt-4o` or `claude-sonnet-4`), instead of connecting directly, it goes through the gateway. The gateway then:

- **Filters content** to prevent sensitive information from being processed
- **Provides backup options** if one model fails
- **Routes requests** across multiple AI models using weighted round-robin
- **Protects against abuse** by limiting how many requests can be made
- **Caches responses** to improve performance and reduce costs
- **Monitors everything** to provide insights into usage patterns

## Key Features

### **OpenAI Compliant**
Completions endpoint is OpenAI compliant which means that the gateway is compatible with OpenAI specification (and libraries) so no additional libraries or custom configurations are needed.

### **Multiple Route Definition**
Create different "routes" or endpoints within the same gateway, each with its unique configuration for models, security, and traffic management.

### **Multiple Model Support**
Connect to a variety of AI models, including those from OpenAI, Anthropic, and any OpenAI-compatible services like Ollama, vLLM, or OpenRouter.

### **Guardrails**
Apply powerful content filters and safety measures. Check for and block/warn about specific content, or redact sensitive information (like PII) before it's processed by a model or returned to a user.

### **Fallback Mechanisms**
Ensure high availability by automatically retrying failed requests with a series of predefined backup models.

### **High Availability**
- Weighted Round-Robin Load Balancing: Distribute incoming requests across multiple models using weighted round-robin algorithm to manage load and optimize cost
- Health monitoring and metrics
- Automatic failover and recovery

### **Rate & Token Limiting**
Manage costs and prevent abuse by setting limits on the number of requests or tokens consumed over a specific time window.

### **Caching**
Reduce latency and costs by caching responses for frequently repeated requests.

### **Observability**
Exposes detailed metrics via a Prometheus endpoint for easy integration with monitoring tools like Grafana.

## Components

The Radicalbit AI Gateway is composed of several integrated components that work together to manage, secure, and monitor AI applications. Each component has a specific role, and together they form a flexible and observable architecture designed for management and control.

### The config.yaml File

The gateway's entire behavior is controlled by a single YAML configuration file. This file defines all routes, models, and the features applied to them.

### High-Level Structure

```yaml
# Definition of all routes
routes:
  # The name of your first route
  customer-service: 
    chat_models:
      - model_id: ...
        # chat model configuration...
      - model_id: ...
        # chat model configuration...
    embedding_models:
      - model_id: ...
        # embedding model configuration...
      - model_id: ...
        # embedding model configuration...
    balancing: { ... } # How to distribute requests among the models
    fallback: { ... } # What to do if a model fails
    guardrails: { ... } # Guardrails list for the route
    rate_limiting: { ... } # Limits on requests over time
    token_limiting: { ... } # Limits on tokens over time
    caching: { ... } # Caching rules for this specific route
  
  # The name of your second route
  another-route:
    # ... configuration for this route

guardrails: { ... } # Content safety and filtering rules

# Cache configuration
cache:
  redis_host: '...'
  redis_port: ...
```

### UI (User Interface)

The Gateway's UI provides administrative and monitoring features:

- **Groups and API Keys**: Create groups and API keys, and associate them with routes
- **Route Information**: View detailed information for each route
- **Event Tracking**: Track events that occurred on a specific route and when they happened
- **Time Filters**: Apply time filters to focus on specific time windows
- **Cost Analysis**: Analyze cost trends across routes

Each route in the UI displays configured features (caching, fallback, guardrails, limiters) with visual indicators:
- Gray icon → Feature not configured
- White icon with blue outline → Feature configured, but no events in selected time window
- Solid blue icon → Feature configured with events in the selected time window

### Authentication, Groups and Keys

To ensure security, the Gateway provides route-level authentication. Each API Key must be associated with a Group, which in turn is linked to one or more routes. This setup allows you to track which groups and keys are using specific applications.

The Gateway can also integrate with your Identity Provider (IDP), allowing it to import existing users and groups managed within your organization.

### Routes

A Route represents the set of models used within your application, along with the logic and controls managed by the gateway. Each route can include all models (both chat and embedding) used in your application, or it can be segmented according to your specific needs.

### Cost Management

The Gateway provides tools to monitor and control costs:
- **Rate Limiting**: Restrict the number of requests per time interval
- **Token Limits**: Cap the number of tokens processed by a model
- **Caching**: Use semantic or exact cache to reduce redundant model calls

Cost monitoring is available through a dedicated section in the UI, where you can track consumption metrics and identify optimization areas.

### Logs and Metrics

All events managed by the Gateway generate logs and metrics:

- **Logs**: Can be captured and aggregated by external Log Management systems (Loki, Splunk) for centralization, search, and correlation with other system components
- **Metrics**: Provide real-time insights in the UI and in-depth analysis through Prometheus integration

Prometheus enables querying key performance indicators (request rates, latency, cache hit ratio, token consumption) and building detailed dashboards in tools like Grafana for advanced observability.

## How It Works

### Making API Requests

Once the gateway server is running, you can send requests to it as if it were an OpenAI server. The gateway uses the OpenAI Chat Completions API specification.

The most important concept to understand is that **you specify the target `route` from your configuration file in the `model` field of your API request.**

### API Endpoint

- **Endpoint:** `/v1/chat/completions`
- **Method:** `POST`

### Example Request

Given a `config.yaml` with a route named `customer-service`, you would make the following request:

```bash
curl http://127.0.0.1:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "customer-service",
    "messages": [
      {
        "role": "user",
        "content": "Hello, can you help me with my order?"
      }
    ]
  }'
```

The gateway receives this request, looks up the `customer-service` configuration, and processes the request according to the rules defined for that route.

## Next Steps

- **[Installation](./getting-started/installation.md)** - Set up your gateway instance
- **[Configuration Guide](./configuration/basic-setup.md)** - Learn how to configure routes and models
- **[Guardrails](./features/guardrails.md)** - Implement content safety and filtering
- **[API Reference](./api-reference/endpoints.md)** - Complete API documentation
