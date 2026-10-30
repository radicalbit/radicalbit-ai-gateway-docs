# Fallback

Fallback provides automatic failover when a primary model fails or becomes unavailable. The gateway tries each fallback model in order until one succeeds or all are exhausted. All fallback models must be declared in the route's model list alongside the target.

---

## Configuration

```yaml
routes:
  production:
    chat_models:
      - gpt-4o
      - gpt-4o-mini
      - claude-3-sonnet
    fallback:
      - target: gpt-4o          # primary model_id
        fallbacks:
          - gpt-4o-mini         # tried first
          - claude-3-sonnet     # tried second
```

### Fields

- **`target`**: The `model_id` of the primary model.
- **`fallbacks`**: List of `model_id`s to try in order if `target` fails.
- **`type`**: Use `embedding` for embedding fallbacks, `transcription` for transcription fallbacks or `decision` for [decision model](./decision-models.md) fallbacks. Omit for chat (default).

---

## Embedding Fallback

```yaml
routes:
  production:
    embedding_models:
      - openai-embedding
      - local-embedding
    fallback:
      - target: openai-embedding
        fallbacks:
          - local-embedding
        type: embedding
```

---

## Mixed Chat + Embedding

```yaml
routes:
  production:
    chat_models:
      - gpt-4o
      - gpt-4o-mini
    embedding_models:
      - openai-embedding
      - local-embedding
    fallback:
      - target: gpt-4o
        fallbacks:
          - gpt-4o-mini
      - target: openai-embedding
        fallbacks:
          - local-embedding
        type: embedding
```

---

## Responses API

Fallback works on [`POST /v1/responses`](../api-reference/endpoints.md#responses-api) too, with three differences:

- A fallback model that doesn't serve the Responses API is skipped.
- When streaming, the gateway falls back only before the first event reaches the client.
- Requests with `previous_response_id` never fall back: only the provider that stored the response can continue it.

The fallback model gets the conversation rewritten for it. See [Switching models in the middle of a conversation](../api-reference/endpoints.md#switching-models-in-the-middle-of-a-conversation).

---

## Validation Rules

- `target` and all `fallbacks` must be listed in the route's model list for that `type` (`chat_models`, `embedding_models`, `transcription_models` or `decision_models`)
- A fallback can only reference models of its own type: chat with chat, embedding with embedding, and so on
- The gateway rejects configurations that violate these rules at startup

---

## Monitoring

Fallback activations are tracked via the `gateway_fallbacks_triggered_total` metric with labels `route_name`, `target`, and `fallback`. See [Monitoring](../operations/monitoring.md).

---

## Next Steps

- **[Intelligent Routing](./advanced-routing.md)** — Proactively route to cheaper models before failures occur
- **[Model Configuration](../configuration/models.md)** — Configure retry attempts per model
- **[Advanced Configuration](../configuration/advanced-configuration.md)** — Full configuration reference
