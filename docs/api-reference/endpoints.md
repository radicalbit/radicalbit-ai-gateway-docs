# API Reference

The Radicalbit AI Gateway implements the OpenAI Chat Completions API specification, making it compatible with existing OpenAI libraries and tools.

## Base URL

```
http://localhost:8000
```

## Authentication

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
