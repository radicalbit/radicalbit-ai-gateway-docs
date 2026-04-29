# HashiCorp Vault

This plugin enables the gateway to resolve `!secret` references from HashiCorp Vault instead of a static `secrets.yaml` file.

Secrets are stored in Vault's KV engine (v1 or v2). The provider reads a single secret at `VAULT_MOUNT_PATH/VAULT_SECRET_PATH` and resolves individual keys from it.

```bash
vault kv put secret/gateway \
  OPENAI_API_KEY="sk-proj-..." \
  GOOGLE_API_KEY="AIzaSy..." \
  CACHE_REDIS_HOST="redis-host" \
  CACHE_REDIS_PORT="6379"
```

Then in `config.yaml`:

```yaml
credentials:
  api_key: !secret OPENAI_API_KEY
```

## Enabling the Plugin

```bash
export ENABLED_PLUGINS="hashicorp_vault"
```

No `secrets.yaml` is needed when this plugin is active.

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `VAULT_ADDR` | Yes | — | Vault server URL (e.g. `http://vault:8200`) |
| `VAULT_TOKEN` | One of token/approle | — | Token for static token auth |
| `VAULT_ROLE_ID` | With `VAULT_SECRET_ID` | — | AppRole role ID |
| `VAULT_SECRET_ID` | With `VAULT_ROLE_ID` | — | AppRole secret ID |
| `VAULT_MOUNT_PATH` | No | `secret` | KV mount path |
| `VAULT_SECRET_PATH` | No | `gateway` | Path to the secret within the mount |
| `VAULT_KV_VERSION` | No | `v2` | KV engine version: `v1` or `v2` |

## Authentication Methods

**Token auth** (simpler, good for development):

```bash
export VAULT_ADDR=http://vault:8200
export VAULT_TOKEN=root
```

**AppRole auth** (recommended for production):

```bash
export VAULT_ADDR=http://vault:8200
export VAULT_ROLE_ID=your-role-id
export VAULT_SECRET_ID=your-secret-id
```

## Docker Compose Example

```yaml
services:
  vault:
    image: hashicorp/vault:1.18
    ports:
      - "8200:8200"
    environment:
      VAULT_DEV_ROOT_TOKEN_ID: "root"
      VAULT_DEV_LISTEN_ADDRESS: "0.0.0.0:8200"
    cap_add:
      - IPC_LOCK

  gateway:
    environment:
      ENABLED_PLUGINS: "hashicorp_vault"
      VAULT_ADDR: "http://vault:8200"
      VAULT_TOKEN: "root"
      VAULT_MOUNT_PATH: "secret"
      VAULT_SECRET_PATH: "gateway"
      VAULT_KV_VERSION: "v2"
    depends_on:
      - vault
```

## Dependencies

- `hvac==2.4.0` — installed automatically from `requirements.txt` when the plugin is enabled
