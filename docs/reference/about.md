# About

## What Is the Radicalbit AI Gateway

The Radicalbit AI Gateway is a centralized access point to the generative AI models used across your organization. It sits between your AI applications and the underlying models — analyzing traffic, filtering information based on configurable conditions, and recording metrics and events to give you full visibility into every operation.

The result is a single, controlled layer that makes your AI applications observable, governed, and cost-efficient. The Gateway is application-agnostic and fully compatible with the OpenAI standard, which means it integrates with the vast majority of AI applications and frameworks without requiring any code changes.

### Mission

Our mission is to give organizations full control over their AI usage — making it secure, observable, and cost-efficient — without adding friction to the teams building AI applications.

---

## Capabilities

### Governance & Security

- **Guardrails** — rule-based filters (contains, starts with, ends with, regex), PII detection and masking via Microsoft Presidio, and LLM-as-a-Judge for semantic content evaluation
- **Fallback** — automatic failover across models when a provider fails or is unavailable
- **Rate Limiting** — cap the number of requests per time window at the route level
- **Token Limiting** — cap input and output token consumption per time window
- **Budget Limiting** — cap spending based on combined token costs per time window
- **API Key Authentication** — every route requires a gateway-issued API key; no direct model access

### Cost Control

- **Exact Caching** — serve identical requests from memory without calling the model
- **Semantic Caching** — match semantically similar requests using embedding similarity
- **Intelligent Routing** — route requests dynamically based on keywords, token length, context length, time of day, budget consumption, ML classifiers, or embedding similarity
- **Cost Dashboard** — monitor spending by group and API key from the UI

### Observability

- **Prometheus Metrics** — request rate, latency, token usage, cache hits, guardrail triggers, fallback activations, and more, exposed on a dedicated metrics endpoint
- **OpenTelemetry Tracing** — end-to-end traces of every request, exportable to any OTLP-compatible backend
- **Event Tracking** — UI-level visibility into events per route with time filtering
- **UI Monitoring** — web interface for routes, groups, keys, cost trends, and feature status

### Multi-Provider Support

- **Native providers** — OpenAI, Anthropic, Google Gemini, DeepSeek, Mistral, Azure OpenAI
- **OpenAI-compatible endpoints** — Ollama, vLLM, OpenRouter, and any on-premises deployment

---

## Enterprise Capabilities

:::info[Enterprise Feature]
The following capabilities are available exclusively in the **Enterprise edition**. [Contact sales](mailto:sales@radicalbit.ai) for licensing information.
:::

- **Identity Provider Integration** — sync users, groups, and roles from Keycloak (or a custom IDP) into the gateway
- **Role-Based Access Control** — three built-in roles (Admin, Builder, Auditor) with granular permissions
- **SSO / OIDC Authentication** — OpenID Connect-based single sign-on for the admin interface
- **JWT Token Authentication** — users can call gateway endpoints directly with IDP-issued tokens instead of gateway API keys
- **Project-Level User Association** — assign users to specific projects with role-scoped visibility

