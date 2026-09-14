# Projects

Projects are the organizational unit for gateway configurations. Each project holds a configuration (the same YAML schema described throughout this documentation) and manages its lifecycle from draft to production.

The gateway can serve **multiple projects simultaneously** — each project is an isolated set of routes, models, guardrails, and limits that operate independently.

---

## Configuration Lifecycle

Every project follows a four-step lifecycle:

```
Create → Load Config → Approve → Serve
```

| Step | Config State | Description |
|------|-------------|-------------|
| **Create** | `DRAFT` | New project with empty or default configuration |
| **Load Config** | `DRAFT` | Write or paste your YAML configuration |
| **Approve** | `READY_TO_SERVE` | Mark the configuration as reviewed and ready |
| **Serve** | `SERVED` | Activate the configuration — routes become live |

### Config States

- **DRAFT** — Work-in-progress. Configuration can be freely edited. Not accessible to API consumers.
- **READY_TO_SERVE** — Configuration is validated and approved, but not yet active.
- **SERVED** — Configuration is live. Routes are registered and handling requests.

### Project Status

A project also has a status that reflects its environment:

| Status | Meaning |
|--------|---------|
| `DEV` | No configuration is currently served |
| `PROD` | A configuration is actively served and handling traffic |

---

## Updating a Configuration

To update a served project:

1. Load a new draft configuration (project goes back to `DRAFT`)
2. Approve it (`READY_TO_SERVE`)
3. Serve it (`SERVED`) — this replaces the previous configuration with zero downtime

The previous configuration remains active until the new one is served.

---

## Using Project Routes

When a project is served, its routes are namespaced by project name. Use the format `project-name/route-name` in the `model` parameter of your API requests:

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:9000/v1",
    api_key="your-gateway-api-key",
)

response = client.chat.completions.create(
    model="my-project/my-route",  # project-name/route-name
    messages=[{"role": "user", "content": "Hello"}],
)
```

```bash
curl http://localhost:9000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-gateway-api-key" \
  -d '{
    "model": "my-project/my-route",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

This applies to all OpenAI-compatible endpoints: Chat Completions, Embeddings, Audio Transcriptions, and Responses API.

---

## Multiple Projects

The gateway registers routes from all served projects under distinct keys (`project-name/route-name`). This means:

- Different teams can own separate projects with independent configurations
- The same route name can exist in different projects without conflict
- Each project has its own guardrails, limits, caching, and cost tracking

---

## Next Steps

- **[Basic Setup](./basic-setup.md)** - Create your first configuration
- **[Advanced Configuration](./advanced-configuration.md)** - Add guardrails, caching, and limits
- **[API Reference](../api-reference/endpoints.md)** - OpenAI-compatible endpoints
