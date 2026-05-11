# Quick Start

Get your first AI Gateway route running and callable in under 5 minutes.

## Prerequisites

- Docker (with Compose support)
- An API key for at least one supported provider (e.g. OpenAI)

---

## 1. Start the Gateway

Clone the repository and start the stack using pre-built images:

```bash
git clone https://github.com/radicalbit/radicalbit-ai-gateway
cd radicalbit-ai-gateway
```

Create a `secrets.yaml` file in the root directory with your provider API key:

```yaml title="secrets.yaml"
OPENAI_API_KEY: sk-your-key-here
```

Then start the gateway:

```bash
GATEWAY_TAG=latest docker compose up -d
```

This starts the full stack: gateway, database, cache, and observability services. Wait a few seconds for the services to be healthy, then open **http://localhost:9000** — you should see the Gateway UI.

---

## 2. Create a Project

In the UI, create a new project and give it a short name, e.g. `quickstart`.

The project starts in `DRAFT` state. You will load your configuration into it next.

---

## 3. Write Your Configuration

In the project editor, paste the following configuration:

```yaml
chat_models:
  - model_id: gpt-4o-mini
    model: openai/gpt-4o-mini
    credentials:
      api_key: !secret OPENAI_API_KEY

routes:
  my-assistant:
    chat_models:
      - gpt-4o-mini
```

This defines one model and one route named `my-assistant`.

---

## 4. Approve and Serve

Click **Load** to load the configuration into the project, then **Approve**, then **Serve**.

Your route is now live. You will see it listed in the Routes section of the UI.

---

## 5. Create a Group and API Key

Go to **Groups** and create a group (e.g. `my-team`). Then go to **API Keys**, create a key, and associate it with the `my-assistant` route inside the `quickstart` project.

:::warning
The key is shown only once — copy it and store it securely.
:::

---

## 6. Make Your First Call

```bash
curl http://localhost:9000/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "quickstart/my-assistant",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

You should get a response from the model. That's it — your gateway is running.

---

## Next Steps

- **[Basic Concepts](./basic-concepts.md)** — Understand projects, routes, and models
- **[Advanced Configuration](./configuration/advanced-configuration.md)** — Add guardrails, caching, and limits
- **[Framework Examples](./getting-started/examples.md)** — Integrate with LangChain, LlamaIndex, and others
