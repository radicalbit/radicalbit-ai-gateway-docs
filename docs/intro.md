---
slug: /
---

# Radicalbit AI Gateway

The **Radicalbit AI Gateway** is a centralized access point to the generative AI models used across your organization.

It sits between your AI applications and the underlying models — analyzing traffic, filtering information based on configurable conditions, and recording metrics and events to give you full visibility into every operation. The result is a single, controlled layer that makes your AI applications observable, governed, and cost-efficient.

**The Gateway is application-agnostic and supports any model that adheres to the OpenAI standard**, making it compatible with the vast majority of AI applications and frameworks.

---

## Three Pillars

The Radicalbit AI Gateway is built on three core pillars that define its long-term vision:

### 1. Governance & Security
The Gateway lets you govern and secure your AI applications through authenticated access, configurable guardrails, and mechanisms to limit calls to the underlying models:

- **Inbound and Outbound Guardrails**: text control (contains, starts with, ends with, regex), PII detection and masking, and LLM-as-a-Judge for custom logic evaluation.
- **Rate and Token Limits**: control the volume and cost of requests at the route level.
- **Model Fallbacks and Routing**: automatic failover and intelligent traffic distribution across models.

### 2. Cost Control
The Gateway provides a dedicated UI with a detailed cost dashboard, as well as a set of features designed to actively reduce application costs:

- **Cost Dashboard**: monitor spending by group and API key.
- **Token and Rate Limiting**: cap the resources consumed by each application or team.
- **Semantic and Exact Caching**: avoid redundant model calls by reusing previous responses.

### 3. Observability
The Gateway gives you all the tools needed to make your AI applications — and the Gateway itself — fully inspectable:

- **Detailed Metrics**: investigate performance and usage across routes and models.
- **Gateway Tracing**: end-to-end traces of every request processed by the Gateway.
- **Event Notifications**: receive alerts based on configured conditions.

---

## Who Is It For

The Radicalbit AI Gateway serves different roles within an organization:

| Role | Responsibilities |
|------|-----------------|
| **DevOps** | Configure the Gateway, manage infrastructure, set up observability |
| **AI Engineers** | Build AI applications and integrate them with the Gateway |
| **System Administrators** | Create users and API keys, manage groups, maintain an administrative view of AI usage |
| **Project Managers** | Monitor application costs, detect unwanted events, and request technical investigations |

---

## How It Works

The Gateway is designed to be decoupled from your application development. The two are independent processes:

1. **Build your application** — a chat assistant, a RAG pipeline, or any GenAI app. Focus on your core logic without worrying about guardrails, caching, or metrics.
2. **Configure the Gateway** — write a `config.yaml` file that defines routes, models, and any control or monitoring logic. See the [configuration guide](./configuration/advanced-configuration.md).
3. **Integrate** — point your LLM client to the Gateway by setting:
   - the **route name** (in place of the model name, matching your `config.yaml`)
   - the **Gateway base URL**
   - the **Gateway API Key** (generated from the UI)

All traffic flows through the Gateway from that point on.

---

## Get Started

### For Developers
- **[Installation](./getting-started/installation.md)** — Set up your Gateway
- **[Basic Configuration](./configuration/basic-setup.md)** — Essential configuration
- **[Advanced Configuration](./configuration/advanced-configuration.md)** — Practical configurations

### For Operations
- **[Monitoring](./operations/monitoring.md)** — Observability and exposed metrics
- **[Telemetry](./operations/telemetry.md)** — Gateway traces
- **[Troubleshooting](./troubleshooting/common-issues.md)** — Common issues and solutions

**Ready to get started?** Begin with the [installation guide](./getting-started/installation.md).
