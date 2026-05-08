# HashiCorp Vault

:::info[Enterprise Feature]{className="enterprise-badge"}
This feature is available exclusively in the **Enterprise edition** of the Radicalbit AI Gateway. [Contact sales](mailto:sales@radicalbit.ai) for licensing information.
:::

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

## Dependencies

- `hvac==2.4.0` — installed automatically from `requirements.txt` when the plugin is enabled
