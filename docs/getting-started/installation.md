# Installation

This guide walks through installing the Radicalbit AI Gateway with Docker Compose — the full stack, running on your machine in a few minutes.

:::info
This guide covers the **open source edition**, self-hosted with Docker. See [Enterprise](../reference/enterprise.md) for the additional governance features available on top of it.
:::

## Prerequisites

- **Docker**, with Compose support (Docker Desktop, or Docker Engine plus the Compose plugin)
- **Git**
- An API key for at least one supported [provider](../configuration/models.md) (e.g. OpenAI), to call a model once the gateway is running

---

## 1. Get the Code

Clone the repository:

```bash
git clone https://github.com/radicalbit/radicalbit-ai-gateway
cd radicalbit-ai-gateway
```

---

## 2. Add Your Provider Credentials

The gateway reads model credentials from a `secrets.yaml` file in the project root. Create one:

```yaml title="secrets.yaml"
OPENAI_API_KEY: sk-your-key-here
```

Add one line per provider you plan to use. See [Secrets Management](../deployment/secrets-management/index.md) for other ways to store credentials, including cloud secret managers.

---

## 3. Start the Stack

There are two ways to start the gateway:

**Use pre-built images** (fastest):

```bash
GATEWAY_TAG=latest docker compose up -d
```

**Build from source**:

```bash
docker compose up --build -d
```

Both commands start the same stack: the gateway, its UI, and the services it depends on. Wait 20–30 seconds for everything to become healthy, then open **http://localhost:9000** — you should see the Gateway UI.

---

## 4. What Gets Started

Docker Compose brings up these core services:

| Service | Port | Purpose |
|---|---|---|
| Gateway | `9000` | API and UI |
| Postgres | `5432` | Stores projects, routes, and configuration |
| Valkey | `6379` | Cache and task queue |
| ClickHouse | `8123` / `9002` | Stores traces and metrics |
| OTel Collector | — | Forwards traces to ClickHouse |
| Metrics Worker | — | Processes usage metrics and alert rules |

A few optional tools are also started, useful for inspecting data while testing locally:

| Tool | Port | Purpose |
|---|---|---|
| Adminer | `8090` | Browse the Postgres database |
| ClickHouse UI | `5521` | Browse traces and metrics |
| RedisInsight | `5540` | Browse the Valkey cache |

---

## 5. Verify the Installation

Check that the gateway is healthy:

```bash
curl http://localhost:9000/health
```

Then open **http://localhost:9000** in your browser. You should land on the Gateway UI with no projects yet — that's expected on a fresh install.

---

## 6. (Optional) Enable the AI Config Generator

The gateway can generate configuration from plain English, using an LLM. To enable it, set a real OpenAI API key in `CONFIG_GENERATOR_OPENAI_API_KEY` before starting the gateway.

:::warning
`docker-compose.yaml` ships with a placeholder value (`sk-123`). Replace it with a real key, or the generator will not work.
:::

See [Basic Configuration](../configuration/basic-setup.md) for details.

---

## Stopping the Gateway

```bash
docker compose down
```

To also remove stored data (database, cache, traces):

```bash
docker compose down -v
```

---

## Next Steps

- **[Quick Start](../quick-start.md)** — Create your first project, route, and API key
- **[Basic Configuration](../configuration/basic-setup.md)** — Understand the configuration format
- **[Secrets Management](../deployment/secrets-management/index.md)** — Store credentials outside `secrets.yaml`
