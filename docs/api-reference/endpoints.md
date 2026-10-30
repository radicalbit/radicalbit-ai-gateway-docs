# API Reference

The Radicalbit AI Gateway implements the OpenAI API specification — including Chat Completions, Embeddings, Audio Transcriptions, and the Responses API — making it compatible with existing OpenAI libraries and tools. It also proxies Typesafe's decision API for [decision models](#decision-models).

## Base URL

```
http://localhost:9000
```

## Authentication

### API Key Authentication
```bash
curl -H "Authorization: Bearer your-api-key" \
     -H "Content-Type: application/json" \
     http://localhost:9000/v1/chat/completions
```

The gateway reads the [credential](../credentials.md) from the `Authorization: Bearer` header, which OpenAI SDKs and compatible libraries send for you. A credential past its [expiry date](../credentials.md#expiration) is rejected with `401` and code `key_expired_unauthorized`. After a [rotation](../credentials.md#rotation), the previous value works only until the grace period ends, and is then rejected with `401` and code `key_invalid_unauthorized`, like a wrong value.

## Endpoints

### Chat Completions

**Endpoint:** `POST /v1/chat/completions`

**Description:** Creates a completion for the provided chat messages.

**Request Body:**
```json
{
  "model": "project-name/route-name",
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 100
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | The route in `project-name/route-name` format |
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
  "model": "project-name/route-name",
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
  "model": "project-name/route-name",
  "input": "The text to embed"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | The route in `project-name/route-name` format |
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
  "model": "project-name/route-name",
  "usage": {
    "prompt_tokens": 5,
    "total_tokens": 5
  }
}
```

### Audio Transcriptions

**Endpoint:** `POST /v1/audio/transcriptions`

**Description:** Transcribes audio into text, following the OpenAI Audio API format. Unlike the other endpoints, the request body is `multipart/form-data`, not JSON.

**Request Body (multipart/form-data):**
```bash
curl http://localhost:9000/v1/audio/transcriptions \
  -H "Authorization: Bearer your-api-key" \
  -F model="project-name/route-name" \
  -F file="@audio.mp3" \
  -F language="en"
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | The route in `project-name/route-name` format |
| `file` | file | Yes | The audio file to transcribe |
| `language` | string | No | Language of the input audio, in ISO-639-1 format (e.g. `en`) |
| `prompt` | string | No | Text to guide the model's style, or to continue a previous audio segment |
| `response_format` | string | No | `json` (default) or `verbose_json`. `verbose_json` is only supported by `whisper-1` models |
| `temperature` | number | No | Sampling temperature (0.0 to 1.0) |
| `stream` | boolean | No | Stream the transcript as it's generated, via SSE. Only supported by the `gpt-4o-transcribe` family, not by `whisper-1` |

:::note
The gateway supports two model families, with different capabilities:
- **`whisper-1`**: returns a full `verbose_json` response with language, duration and segments, but does not support streaming.
- **`gpt-4o-transcribe` family** (`gpt-4o-transcribe`, `gpt-4o-mini-transcribe`): supports streaming, but only returns a plain `json` response.
:::

**Response (`response_format: "json"`):**
```json
{
  "text": "Hello, how are you today?"
}
```

**Response (`response_format: "verbose_json"`, whisper-1 only):**
```json
{
  "language": "english",
  "duration": 3.2,
  "text": "Hello, how are you today?",
  "segments": [
    {
      "id": 0,
      "start": 0.0,
      "end": 3.2,
      "text": "Hello, how are you today?"
    }
  ]
}
```

**Streaming Response:**

When `stream` is `true`, the gateway returns a Server-Sent Events (SSE) stream of transcript deltas, ending with a `[DONE]` marker:

```
data: {"type":"transcript.text.delta","delta":"Hello,"}

data: {"type":"transcript.text.delta","delta":" how are you today?"}

data: {"type":"transcript.text.done","text":"Hello, how are you today?"}

data: [DONE]
```

:::warning
`stream: true` is not supported by `whisper-1` and returns an error.
:::

### Responses API

**Endpoint:** `POST /v1/responses`

**Description:** Creates a response with the [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses). The gateway forwards your request body to the provider as sent, and returns the provider's response, or its stream of events, unchanged. The only field it changes is `model`. Authentication, rate limits, budgets, guardrails, caching, cost tracking and tracing work as for Chat Completions.

:::tip
The `model` field works exactly like in Chat Completions: it is a **route name** from your `config.yaml`, not an upstream model name.
:::

**Request Body:**
```json
{
  "model": "project-name/route-name",
  "input": "What is the capital of France?",
  "instructions": "You are a helpful assistant.",
  "stream": false,
  "max_output_tokens": 200
}
```

Every Responses API field reaches the provider: typed `input` items, `tools`, `reasoning`, `include`, `store`, `previous_response_id`, `metadata` and the rest. The route's configured model parameters fill only the fields your request leaves out.

**Response:** the provider's response object, with `model` set to your route:
```json
{
  "id": "resp_123",
  "object": "response",
  "created_at": 1677652288,
  "model": "project-name/route-name",
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

#### Which models serve it

| Model in `config.yaml` | Served |
|---|---|
| `openai/...` (OpenAI) | Yes |
| `openai/...` with a `base_url` (OpenRouter, vLLM, Mistral, any OpenAI-compatible endpoint) | Yes, if the endpoint serves `/v1/responses`. If it doesn't, you get the endpoint's own error. |
| `azure/...`, `azure_openai/...` | Yes |
| `deepseek/...` | Yes |
| `anthropic/...`, `google-genai/...`, `mistralai/...` | No: `400 ... does not serve the Responses API`. Anthropic and Gemini are reachable through OpenRouter. |

#### Switching models in the middle of a conversation

Most agents keep the conversation themselves: every turn they send the whole history again in `input`. That history can contain items produced by another provider, for example when the route falls back to another model, when a router picks a different model, or after you switch the served configuration. A provider usually rejects another provider's items, so before each attempt the gateway rewrites `input` for the model about to receive it:

- **Messages, tool calls and tool outputs always pass.** The model sees the whole visible conversation.
- **Reasoning passes only when the model can recognise it as its own.** Otherwise it is dropped. Reasoning is the model's private scratchpad: without it the model thinks again, and the conversation continues.
- **Item ids pass only when the model accepts them.** Otherwise they are removed, and the items stay.

What each model gets:

| Model in `config.yaml` | Reasoning it gets | Item ids |
|---|---|---|
| `openai/...` without `base_url` | only OpenAI's own reasoning | kept; ids in another provider's format are removed |
| `openai/...` with a `base_url` | none | removed |
| `deepseek/...` | its own reasoning, and the readable summary of OpenAI's reasoning (see below) | kept |
| any other model | none | kept |

DeepSeek in thinking mode needs reasoning before each tool call of the current turn. When a tool call came from another model and has none, the gateway adds a short note in its place: `Reasoning not available: this step came from another model.`

:::note
Behind a `base_url` the gateway can't tell which reasoning the endpoint produced itself, so it sends none, even on a route that uses only that endpoint. The conversation still works; the model reasons again.
:::

### Decision Models

**Endpoint:** `POST /v1/systemone`

**Description:** Asks a [decision model](../features/decision-models.md) (Typesafe's Jev) structured questions about a piece of input, and returns a typed answer with a confidence for each question. The endpoint mirrors [Typesafe's API](https://docs.typesafe.ai): the body uses Typesafe's format, except that `model` is your gateway route. The gateway forwards the request and returns Typesafe's status and body unchanged.

:::tip
Any Typesafe client works through the gateway. Point its base URL at the gateway, use a gateway API key, and set `model` to `project-name/route-name`.
:::

:::warning
Streaming is not supported. The response is always returned in one piece.
:::

**Request Body:**
```json
{
  "model": "project-name/route-name",
  "state": "My card was charged twice and I need the money back today!",
  "questions": {
    "intent": {
      "type": "choice",
      "instructions": "What does the customer want?",
      "criteria": {
        "refund": "Wants money back",
        "information": "Wants an explanation",
        "complaint": "Wants to complain"
      }
    },
    "is_urgent": {
      "type": "noul",
      "instructions": "Does this convey urgency?"
    },
    "frustration": {
      "type": "score",
      "instructions": "How frustrated is the customer?",
      "criteria": ["Calm", "Mildly annoyed", "Clearly frustrated", "Angry"]
    }
  }
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | The route in `project-name/route-name` format. The gateway replaces it with the configured Typesafe model |
| `state` | string/object/array | Yes | The input to evaluate. Route input guardrails check and redact its text values |
| `questions` | object | Yes | Map of question id to question object |
| other fields | any | No | Forwarded to Typesafe unchanged |

**Question Object:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | `choice`, `score` or `noul` |
| `instructions` | string | Yes | The question to answer |
| `criteria` | object/array | Depends on `type` | `choice`: map of option to description. `score`: ordered list of levels. `noul`: optional description of what yes and no mean |

**Question Types:**

| Type | Answers | Main answer field |
|------|---------|-------------------|
| `choice` | One option out of a set | `choice`, with `probabilities` and `confidence` |
| `score` | A position on an ordered scale | `score`, with `probabilities` and `confidence` |
| `noul` | A yes/no statement | `noul`, the probability (0 to 1) that the statement is true |

See [Typesafe's documentation](https://docs.typesafe.ai/primitives) for the full question and answer format.

**Response:**
```json
{
  "model": "jev-1.13.0",
  "answers": {
    "intent": {
      "type": "choice",
      "choice": "refund",
      "confidence": 1.0,
      "probabilities": { "refund": 1.0, "information": 0.0, "complaint": 0.0 }
    }
  },
  "usage": {
    "input_tokens": 337,
    "output_tokens": 31
  }
}
```

The response is Typesafe's body, unchanged. `model` holds the Typesafe model that answered, not your route. Cost is computed on `usage.input_tokens` only. See [Limits and Cost](../features/decision-models.md#limits-and-cost).

**Errors:**

| Status | Cause |
|--------|-------|
| `400` | Unknown route, a route with no decision models, or a guardrail block or soft block (`guardrail_violation_bad_request`) |
| `401` | Missing, invalid or [expired](../credentials.md#expiration) gateway key, or a key that does not belong to the route |
| `422` | The request body is invalid, for example `model` is missing |
| `429` | A rate, token or budget limit is full |
| `502` | No decision model answered (`model_invoker_bad_gateway`) |
| Other `4xx` | Returned by Typesafe and forwarded unchanged. They are not retried and do not trigger fallback |

---

## Error Responses

### Standard Error Format

Errors follow the OpenAI error format, so OpenAI SDKs raise them as regular API errors:

```json
{
  "error": {
    "message": "The route name [my-project/my-route] was not found in the config",
    "type": "gateway_error",
    "param": null,
    "code": "gateway_bad_request"
  }
}
```

- `type` is the error family, for example `authentication_error`, `rate_limit_error` or `guardrail_error`.
- `code` is the specific error. Use it to tell errors apart.

### Common Error Codes

| Status | Code | Description | Solution |
|--------|------|-------------|----------|
| `400` | `gateway_bad_request` | Unknown route, or a route with no models of the requested kind | Check the `model` field (`project-name/route-name`) and the route configuration |
| `400` | `guardrail_violation_bad_request` | Content blocked by a guardrail | Review the guardrail configuration |
| `401` | `key_missing_unauthorized` | No credential in the request | Send the credential in the `Authorization: Bearer` header |
| `401` | `key_invalid_unauthorized` | Unknown credential, a credential whose group is not linked to the route, or a [previous value](../credentials.md#after-the-grace-period) used after its grace period | Check the credential value and its group's routes |
| `401` | `key_expired_unauthorized` | "API key has expired.": the credential's [expiry date](../credentials.md#expiration) has passed | Ask an Admin for a new credential |
| `401` | `invalid_jwt_token` | Invalid identity provider token (Enterprise, see [Access Control](../access-control/index.md)) | Get a new token from the identity provider |
| `429` | `request_rate_limited` | [Rate limit](../features/rate-limiting.md) exceeded | Retry later, or raise the limit |
| `429` | `token_limit_rate_limited` | [Token limit](../features/token-limiting.md) exceeded | Retry later, or raise the limit |
| `429` | `budget_limit_rate_limited` | [Budget limit](../features/budget-limiting.md) exceeded | Raise the budget, or wait for the next budget window |
| `502` | `model_invoker_bad_gateway` | No [decision model](../features/decision-models.md) answered, fallbacks included | Check Typesafe's status and the fallback configuration |
