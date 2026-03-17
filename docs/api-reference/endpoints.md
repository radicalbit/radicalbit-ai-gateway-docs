# API Reference

The Radicalbit AI Gateway implements the OpenAI API specification — including Chat Completions, Embeddings, and the Responses API — making it compatible with existing OpenAI libraries and tools.

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

### Responses API

**Endpoint:** `POST /v1/responses`

**Description:** Creates a response using the [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses) format (stateless Phase 1). The gateway translates the request to Chat Completions internally, so all gateway features (guardrails, caching, rate limiting) apply as usual.

:::tip
The `model` field works exactly like in Chat Completions — it maps to a **route name** from your `config.yaml`, not directly to an upstream model name.
:::

:::warning
The gateway operates in **stateless mode** only. Setting `previous_response_id` will return an error. Multi-turn conversations must be managed client-side.
:::

**Request Body:**
```json
{
  "model": "route-name",
  "input": "What is the capital of France?",
  "instructions": "You are a helpful assistant.",
  "stream": false,
  "temperature": 0.7,
  "max_output_tokens": 200
}
```

The `input` field also accepts a list of message objects:
```json
{
  "model": "route-name",
  "input": [
    {"role": "user", "content": "What is the capital of France?"}
  ]
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `model` | string | Yes | Gateway route name |
| `input` | string or array | Yes | User prompt or list of message objects |
| `instructions` | string | No | System-level instructions (equivalent to a system message) |
| `stream` | boolean | No | Whether to stream the response |
| `temperature` | number | No | Sampling temperature |
| `top_p` | number | No | Nucleus sampling parameter |
| `max_output_tokens` | integer | No | Maximum output tokens (mapped to `max_completion_tokens`) |
| `tools` | array | No | Function tools to make available |
| `tool_choice` | string or object | No | Tool selection strategy |
| `parallel_tool_calls` | boolean | No | Allow parallel tool calls |
| `user` | string | No | End-user identifier forwarded to the upstream provider |
| `previous_response_id` | string | No | **Not supported** — raises an error |

**Response:**
```json
{
  "id": "resp_123",
  "object": "response",
  "created_at": 1677652288,
  "model": "route-name",
  "output": [
    {
      "type": "message",
      "role": "assistant",
      "content": [
        {
          "type": "output_text",
          "text": "The capital of France is Paris."
        }
      ]
    }
  ],
  "usage": {
    "input_tokens": 10,
    "output_tokens": 8,
    "total_tokens": 18
  }
}
```

---

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
