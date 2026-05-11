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
- **`type`**: Use `embedding` for embedding fallbacks. Omit for chat (default).

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

## Validation Rules

- `target` and all `fallbacks` must be listed in the route's `chat_models` (or `embedding_models` for embedding fallbacks)
- Chat fallbacks can only reference chat models, embedding fallbacks only embedding models
- The gateway rejects configurations that violate these rules at startup

---

## Monitoring

Fallback activations are tracked via the `gateway_fallbacks_triggered_total` metric with labels `route_name`, `target`, and `fallback`. See [Monitoring](../operations/monitoring.md).

---

## Next Steps

- **[Intelligent Routing](./advanced-routing.md)** — Proactively route to cheaper models before failures occur
- **[Model Configuration](../configuration/models.md)** — Configure retry attempts per model
- **[Advanced Configuration](../configuration/advanced-configuration.md)** — Full configuration reference
