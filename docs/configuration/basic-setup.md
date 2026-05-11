# Basic Configuration

This guide will help you create your first gateway configuration and understand the basic concepts.

Configurations are managed inside **projects**. Each project holds a YAML configuration and follows a lifecycle: Create → Load Config → Approve → Serve. See [Projects](./projects.md) for the full lifecycle reference.

---

## 1. Create a Project

From the Gateway UI at `http://localhost:9000`, create a new project. Give it a name (e.g., `my-project`).

The project starts in `DRAFT` state.

---

## 2. Write Your Configuration

Write the YAML configuration. This defines your models and routes:

```yaml
chat_models:
  - model_id: gpt-pirate
    model: openai/gpt-4o
    credentials:
      api_key: "<YOUR OPENAI_API_KEY>"
    prompt: "You are a pirate!"
    role: system

routes:
  gpt-pirate-route:
    chat_models:
      - gpt-pirate
```

This creates:

- a **chat model** named `gpt-pirate` (defined at top-level)
- a **route** named `gpt-pirate-route` that references `gpt-pirate` by **model ID**

:::tip
Save your model API Key into a `secrets.yaml` file. See [Secrets Management](../deployment/secrets-management/index.md) for full details, including support for AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager, and Azure Key Vault.
:::

### ✨ Don't want to write YAML by hand?

The Gateway has a built-in **AI config generator**. Describe what you need in plain language and it produces a valid, ready-to-use `config.yaml` for you — including guardrails, caching, routing rules, or any combination of features.

> *"A customer service route on GPT-4o with PII masking, a 60 req/min rate limit, and semantic caching using text-embedding-3-small"*

The generator validates the config automatically and retries if anything is wrong. To enable it, set the following environment variable before starting the gateway:

```bash
CONFIG_GENERATOR_OPENAI_API_KEY=sk-your-key-here
```

| Variable | Default | Description |
|---|---|---|
| `CONFIG_GENERATOR_OPENAI_API_KEY` | — | **Required.** Enables the generator. |
| `CONFIG_GENERATOR_OPENAI_MODEL` | `gpt-4.1` | Model to use for generation. |
| `CONFIG_GENERATOR_OPENAI_BASE_URL` | — | Custom endpoint (e.g. for Azure or a local model). |

Once enabled, a **Generate** button appears in the project configuration editor in the UI.

---

## 3. Load, Approve, and Serve

In the Gateway UI:

1. **Load** the YAML configuration into the project's draft
2. **Approve** the configuration (moves to `READY_TO_SERVE`)
3. **Serve** the configuration (moves to `SERVED` — routes go live)

---

## 4. Create a Group and API Key

Go to the **Groups** section to create a group, then to the **API Key** section to create a key.

:::warning
The key will be visible only once — save it securely.
:::

Associate the group with the route and the key. This establishes that the group holds the key to authenticate to the route.

---

## 5. Connect Your Application

Point your LLM client to the Gateway. Use `project-name/route-name` as the `model` parameter:

```python
from openai import OpenAI

openai_client = OpenAI(
    base_url="http://localhost:9000/v1",
    api_key="sk-rb-******",
)

response = openai_client.chat.completions.create(
    model="my-project/gpt-pirate-route",
    messages=[{"role": "user", "content": "Hello!"}],
)
```

From this point on, all traffic for this model passes through the gateway.

**Congratulations, you have configured the gateway and integrated it into your application!**
