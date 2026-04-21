# Azure Key Vault

This plugin enables the gateway to resolve `!secret` references from Azure Key Vault instead of a static `secrets.yaml` file.

The plugin bulk-loads all secrets from the configured vault at startup, caches them in memory, and resolves every `!secret KEY` reference from that cache.

## Enabling the Plugin

```bash
export ENABLED_PLUGINS="azure_keyvault"
```

No `secrets.yaml` is needed when this plugin is active.

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `AZURE_KEYVAULT_URL` | Yes | — | Vault URL, e.g. `https://myvault.vault.azure.net/` |
| `AZURE_TENANT_ID` | No | — | Service Principal tenant ID |
| `AZURE_CLIENT_ID` | No | — | Service Principal client ID |
| `AZURE_CLIENT_SECRET` | No | — | Service Principal client secret |
| `AZURE_KEYVAULT_SECRET_PREFIX` | No | — | Only load secrets whose name starts with this prefix |

## Authentication Methods

**Service Principal** (recommended for CI/CD and non-Azure environments):

```bash
export AZURE_KEYVAULT_URL=https://myvault.vault.azure.net/
export AZURE_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
export AZURE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
export AZURE_CLIENT_SECRET=your-client-secret
```

**Managed Identity / Default credential chain** (preferred for Azure-hosted workloads):

```bash
export AZURE_KEYVAULT_URL=https://myvault.vault.azure.net/
# No credentials needed; azure-identity uses DefaultAzureCredential chain
# (Managed Identity, Azure CLI, Workload Identity, etc.)
```

## Secret Naming

Azure Key Vault secret names may only contain alphanumeric characters and hyphens. Config references must use the exact name as it appears in the vault:

```yaml
credentials:
  api_key: !secret OPENAI-API-KEY
```

:::warning
Underscores (`_`) are **not allowed** in Azure Key Vault secret names. Use hyphens (`-`) instead. For example, name your secret `OPENAI-API-KEY`, not `OPENAI_API_KEY`.
:::

## Prefix Filtering

When `AZURE_KEYVAULT_SECRET_PREFIX` is set, only secrets whose name starts with the given prefix are loaded. Useful in shared vaults:

```bash
export AZURE_KEYVAULT_SECRET_PREFIX=gateway-
```

## Dependencies

- `azure-keyvault-secrets==4.9.0` — installed automatically from `requirements.txt` when the plugin is enabled
- `azure-identity==1.21.0` — installed automatically from `requirements.txt` when the plugin is enabled
