# Best Practices

## Projects

**Name projects clearly** — the project name is part of every API call (`project-name/route-name`). Choose something that reflects the environment or team, and keep it consistent.

**One project per environment** — create separate projects for dev, staging, and production. Each project holds its own configuration and lifecycle independently, so you can update and serve a staging config without touching production.

---

## Model Configuration

**Use descriptive model IDs** — the `model_id` appears in metrics and logs. A name like `gpt-4o-customer-service` is easier to trace than `model1`.

**Define models once, reference by ID** — the top-level `chat_models` list is the single source of truth. Routes just reference IDs. Avoid duplicating model definitions across routes.

```yaml
# Good: defined once, reused
chat_models:
  - model_id: gpt-4o-support
    model: openai/gpt-4o
    credentials:
      api_key: !secret OPENAI_API_KEY
    prompt: "You are a helpful support assistant."
    role: system

routes:
  support:
    chat_models:
      - gpt-4o-support
  internal-tools:
    chat_models:
      - gpt-4o-support
```

**Prefer `prompt_ref` over `prompt` for long prompts** — storing prompts in Markdown files keeps the config readable and lets you update prompts without touching `config.yaml`. Mount the prompts directory and set `PROMPTS_DIR`.

**Never hardcode API keys** — always use `!secret`:

```yaml
# Good
credentials:
  api_key: !secret OPENAI_API_KEY

# Avoid
credentials:
  api_key: "sk-1234567890abcdef"
```

---

## Routes

**Name routes after the application or use case**, not after the model. Routes are the stable identifier your clients use — the underlying model can change without the client knowing.

**Keep routes focused** — a route that handles one application or one team is easier to monitor and limit independently than one shared route for everything.

**Associate groups and keys at the route level** — create a group per team or application, generate a key, and associate it with the appropriate routes. This gives you per-group cost tracking and lets you revoke access cleanly.

---

## Fallback

**Always configure a fallback for production routes** — a single model with no fallback is a single point of failure. At minimum, add one cross-provider fallback:

```yaml
chat_models:
  - model_id: gpt-4o
    model: openai/gpt-4o
  - model_id: claude-sonnet
    model: anthropic/claude-3-5-sonnet-latest

routes:
  production:
    chat_models:
      - gpt-4o
      - claude-sonnet
    fallback:
      - target: gpt-4o
        fallbacks:
          - claude-sonnet
```

**Use cross-provider fallbacks** — a fallback to another OpenAI model doesn't help if the OpenAI API is down. A fallback to Anthropic or a self-hosted model does.

---

## Guardrails

**Order guardrails from fastest to slowest** — text filters run in microseconds, Presidio in milliseconds, LLM judges in hundreds of milliseconds. Put the fast ones first so the expensive ones only run on traffic that passes basic checks.

```yaml
guardrails:
  - name: keyword_filter      # fast — run first
    type: contains
    where: input
    behavior: block
    parameters:
      values: ["spam", "scam"]

  - name: pii_check           # medium — run second
    type: presidio_analyzer
    where: input
    behavior: block
    parameters:
      language: en
      entities: ["EMAIL_ADDRESS", "PHONE_NUMBER"]

  - name: toxicity_judge      # slow — run last
    type: judge
    where: input
    behavior: block
    parameters:
      prompt_ref: "toxicity_check.md"
      model_id: gpt-4o-mini
      temperature: 0.0
      max_tokens: 50
```

**Define guardrails globally and reference by name** — the same PII guardrail can be shared across multiple routes without duplication.

---

## Limiting

**Match limits to the route's risk profile** — a high-volume internal tool and a customer-facing app have different cost and abuse risks. Set `rate_limiting`, `token_limiting`, and `budget_limiting` according to each route's use case rather than applying the same limits everywhere.

**Combine rate and token limits** — rate limits protect against burst abuse; token limits protect against expensive long-form requests. Both together give stronger cost control than either alone.

**Use `budget_limiting` with budget routing** — if you want to automatically switch to a cheaper model as spending approaches a threshold, configure `budget_limiting` on the route and pair it with a `budget` routing rule.

---

## Caching

**Use exact caching for repeated identical queries** — FAQ bots, document lookup tools, and any application where users ask the same questions repeatedly benefit significantly.

**Use semantic caching for "same intent, different wording"** — set `similarity_threshold` conservatively (0.85+) to start, then lower it if cache hit rates are low. Too low a threshold can return incorrect cached responses.

**Keep TTLs short for dynamic content** — cached responses are served verbatim, including any time-sensitive information in the original response.
