# Tags

Without tags, usage and cost data is only visible per route. Tags let you slice it further, by team, environment, or any dimension you define.

## Overview

Tags are custom `key=value` labels you attach to a request, such as a cost center, an environment, an application name, or anything else that matters to you. Once a request carries tags, you can filter usage, cost, and trace data by them, making it easy to answer questions like "how much did the `retail` team spend last week" or "show me the traces from `env=staging`".

---

## Sending Tags

Add the `X-RB-Tags` header to any proxied request. The value is a comma-separated list of `key=value` pairs:

```bash
curl -X POST http://localhost:9000/v1/chat/completions \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -H "X-RB-Tags: cost_center=retail,env=prod,app=my-app" \
  -d '{
    "model": "project-name/route-name",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

The header is read by the gateway and never forwarded to the upstream model provider.

Order does not matter, and duplicate `key=value` pairs are removed automatically, so `env=prod,app=x,env=prod` and `app=x,env=prod` are stored the same way.

### Tag Key and Value Rules

| Rule | Limit |
|---|---|
| Key format | Must start with a letter or digit, then only letters, digits, `_`, `.`, `:`, `-` |
| Key length | Max 64 characters |
| Value format | Letters, digits, and `_ . : @ / + - #` only |
| Value length | Max 256 characters |
| Header size | Max 4096 bytes total |

A request with an invalid `X-RB-Tags` header is rejected with `400 Bad Request` before it reaches any model:

```json
{
  "error": {
    "message": "X-RB-Tags tag 1 is invalid: key 'cost center' must start with a letter or digit and contain only letters, digits and _ . : - (max 64 characters). Expected comma-separated key=value pairs",
    "type": "gateway_error",
    "code": "tags_header_invalid"
  }
}
```

---

## What You Can Achieve

Once requests are tagged, you can filter by tag wherever the gateway breaks down usage, cost, or traces:

- **Cost attribution**: see how much a team, project, or environment is spending, instead of only the total per route.
- **Environment separation**: compare `env=prod` against `env=staging` traffic on the same route.
- **Custom slicing**: filter by any dimension you tag, like a customer, an application, or a feature flag.

Filtering supports multiple tags at once: values for the same key are combined with OR, and different keys are combined with AND. For example, filtering on `env=prod`, `env=staging`, and `cost_center=retail` together matches requests that are (`env=prod` OR `env=staging`) AND `cost_center=retail`.

---

## Best Practices

### Naming

- Use a small, consistent set of keys across a project (e.g. `env`, `cost_center`, `app`), rather than a new key per request.
- Prefer stable values like `prod` / `staging` / `dev` over free-form text, so filtering stays useful.

### Usage

- Tag at the client level, so every request from a given service or team carries the same tags automatically.

---

## Next Steps

- **[Monitoring](./operations/monitoring.md)** - Set up observability and metrics
- **[API Reference](./api-reference/endpoints.md)** - Complete API documentation
