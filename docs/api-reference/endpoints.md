# API Reference

The Radicalbit AI Gateway implements the OpenAI Chat Completions API specification, making it compatible with existing OpenAI libraries and tools.

## Base URL

```
http://localhost:8000
```

## Authentication

The gateway supports multiple authentication methods:

### API Key Authentication
```bash
curl -H "Authorization: Bearer your-api-key" \
     -H "Content-Type: application/json" \
     http://localhost:8000/v1/chat/completions
```

## Endpoints

### Chat Completions

**Endpoint:** `POST /v1/chat/completions`

**Description:** Creates a completion for the provided chat messages.

**Request Body:**
```json
{
  "model": "route-name",
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 100,
  "stream": false
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | The route name from your configuration |
| `messages` | array | Yes | Array of message objects |
| `temperature` | number | No | Sampling temperature (0.0 to 2.0) |
| `max_tokens` | number | No | Maximum tokens to generate |
| `top_p` | number | No | Nucleus sampling parameter |
| `stream` | boolean | No | Whether to stream the response |
| `stop` | string/array | No | Stop sequences |
| `presence_penalty` | number | No | Presence penalty (-2.0 to 2.0) |
| `frequency_penalty` | number | No | Frequency penalty (-2.0 to 2.0) |

**Message Object:**
```json
{
  "role": "user|assistant|system",
  "content": "Message content"
}
```

**Response:**
```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "route-name",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm doing well, thank you for asking."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 8,
    "total_tokens": 18
  }
}
```

### Embeddings

**Endpoint:** `POST /v1/embeddings`

**Description:** Creates an embedding for the provided input.

**Request Body:**
```json
{
  "model": "route-name",
  "input": "The text to embed"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | The route name with embedding models |
| `input` | string/array | Yes | Text to embed (string or array of strings) |

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [0.1, 0.2, 0.3, ...]
    }
  ],
  "model": "route-name",
  "usage": {
    "prompt_tokens": 5,
    "total_tokens": 5
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "message": "Error description",
    "type": "invalid_request_error",
    "code": "route_not_found"
  }
}
```

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `route_not_found` | Route name not found in configuration | Check route name in config.yaml |
| `model_not_found` | Model not found in route | Verify model configuration |
| `guardrail_blocked` | Content blocked by guardrail | Review guardrail configuration |
| `rate_limit_exceeded` | Rate limit exceeded | Adjust rate limiting configuration |
| `token_limit_exceeded` | Token limit exceeded | Adjust token limiting configuration |
| `authentication_failed` | Invalid API key | Check API key format and permissions |

## Examples

### Basic Chat Completion
```bash
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "customer-service",
    "messages": [
      {
        "role": "user",
        "content": "Hello, I need help with my order"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 150
  }'
```

### Multiple Messages
```bash
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "customer-service",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful customer service assistant"
      },
      {
        "role": "user",
        "content": "I have a problem with my order"
      },
      {
        "role": "assistant",
        "content": "I'm sorry to hear that. Can you tell me more about the issue?"
      },
      {
        "role": "user",
        "content": "The package arrived damaged"
      }
    ]
  }'
```

### Embeddings
```bash
curl -X POST http://localhost:8000/v1/embeddings \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "embeddings-route",
    "input": "This is a sample text for embedding"
  }'
```

### Batch Embeddings
```bash
curl -X POST http://localhost:8000/v1/embeddings \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "embeddings-route",
    "input": [
      "First text to embed",
      "Second text to embed",
      "Third text to embed"
    ]
  }'
```

### Routes Endpoint

**Endpoint:** `GET /routes`

**Description:** Returns all routes with their configuration and metrics.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `_from` | integer | No | Start timestamp (Unix timestamp) |
| `_to` | integer | No | End timestamp (Unix timestamp) |
| `include_groups` | boolean | No | Include group information (default: false) |

**Response:**
```json
[
  {
    "route_name": "production",
    "configuration":{"chat_models": [...]},
    "metrics": {
      "total_requests": 1000,
      "total_tokens": 50000
    }
  }
]
```

**Example:**
```bash
curl -X GET "http://localhost:8000/routes?include_groups=true" \
  -H "Authorization: Bearer your-api-key"
```

### Route Details Endpoint

**Endpoint:** `GET /routes/{route_name}`

**Description:** Returns detailed configuration and metrics for a specific route.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `route_name` | string | Yes | Name of the route |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `_from` | integer | No | Start timestamp (Unix timestamp) |
| `_to` | integer | No | End timestamp (Unix timestamp) |
| `include_groups` | boolean | No | Include group information (default: false) |

**Example:**
```bash
curl -X GET "http://localhost:8000/routes/production" \
  -H "Authorization: Bearer your-api-key"
```

### Events Endpoint

**Endpoint:** `GET /routes/{route_name}/events`

**Description:** Returns the latest N events for a specific route.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `route_name` | string | Yes | Name of the route |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `n` | integer | No | Number of events to return (default: 10) |
| `_from` | integer | No | Start timestamp (Unix timestamp) |
| `_to` | integer | No | End timestamp (Unix timestamp) |

**Response:**
```json
{
  "events": [
    {
      "event_type": "REQUEST_PROCESSED",
      "timestamp": 1677652288
    }
  ]
}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/routes/production/events?n=20&_from=1677652000&_to=1677653000" \
  -H "Authorization: Bearer your-api-key"
```

### Metrics Endpoint

**Endpoint:** `GET /metrics`

**Description:** Returns total metrics across all routes.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `_from` | integer | No | Start timestamp (Unix timestamp) |
| `_to` | integer | No | End timestamp (Unix timestamp) |

**Example:**
```bash
curl -X GET "http://localhost:8000/metrics?_from=1677652000&_to=1677653000" \
  -H "Authorization: Bearer your-api-key"
```

## SDK Compatibility

The gateway is compatible with popular OpenAI SDKs:

### Python
```python
import openai

client = openai.OpenAI(
    api_key="your-api-key",
    base_url="http://localhost:8000/v1"
)

response = client.chat.completions.create(
    model="customer-service",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)
```

### JavaScript/Node.js
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'your-api-key',
  baseURL: 'http://localhost:8000/v1',
});

const response = await openai.chat.completions.create({
  model: 'customer-service',
  messages: [
    { role: 'user', content: 'Hello!' }
  ],
});
```

### Go
```go
package main

import (
    "context"
    "fmt"
    "github.com/sashabaranov/go-openai"
)

func main() {
    client := openai.NewClientWithConfig(openai.ClientConfig{
        APIKey: "your-api-key",
        BaseURL: "http://localhost:8000/v1",
    })

    resp, err := client.CreateChatCompletion(
        context.Background(),
        openai.ChatCompletionRequest{
            Model: "customer-service",
            Messages: []openai.ChatCompletionMessage{
                {
                    Role:    openai.ChatMessageRoleUser,
                    Content: "Hello!",
                },
            },
        },
    )
}
```

## Rate Limits

The gateway implements rate limiting based on your configuration:

- **Request-based**: Number of requests per time window
- **Token-based**: Number of tokens per time window
- **Per-route**: Different limits for different routes


## Next Steps

- **[Configuration Guide](../configuration/advanced-configuration.md)** - Complete configuration reference
- **[Guardrails Reference](../features/guardrails-reference.md)** - Content safety implementation
- **[Monitoring](../monitoring.md)** - Set up observability and metrics
