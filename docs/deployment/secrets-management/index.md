# Secrets Management

The Radicalbit AI Gateway uses `!secret KEY` references in `config.yaml` to keep API keys and other sensitive values out of your configuration files. When the gateway loads a configuration that contains `!secret OPENAI_API_KEY`, it resolves the value from a configured secrets backend.

```yaml
# config.yaml
credentials:
  api_key: !secret OPENAI_API_KEY
```

The gateway supports multiple backends for storing secrets:

- **Local file** — a `secrets.yaml` file mounted alongside your configuration
- **Cloud secret managers** — [AWS Secrets Manager](./aws-secrets-manager.md), [HashiCorp Vault](./hashicorp-vault.md), [GCP Secret Manager](./gcp-secret-manager.md), or [Azure Key Vault](./azure-key-vault.md) via built-in plugins
- **Custom plugins** — [implement your own](./custom-plugin.md) secrets provider

---

## Using `secrets.yaml` (Local File)

By default, the gateway reads secrets from a `secrets.yaml` file placed alongside `config.yaml`. The file is a flat mapping of secret names to values:

```yaml title="secrets.yaml"
OPENAI_API_KEY: sk-proj-xxxxxxxxxxxxxxxx
GOOGLE_API_KEY: AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY: sk-ant-xxxxxxxxxxxxxxxx
DEEPSEEK_API_KEY: your-deepseek-key
```

Reference these values in `config.yaml` with `!secret`:

```yaml title="config.yaml"
chat_models:
  - model_id: gpt-4o
    model: openai/gpt-4o
    credentials:
      api_key: !secret OPENAI_API_KEY
```

The `secrets.yaml` file must be mounted into the container at `/radicalbit_ai_gateway/secrets.yaml`.

:::warning
Never commit `secrets.yaml` to version control. Add it to `.gitignore`.
:::

---

## Plugin-based Secrets Management

For production deployments, the gateway supports retrieving secrets from external secret managers via plugins. When a plugin is enabled, no `secrets.yaml` file is needed — the plugin replaces it entirely.

Plugins are enabled through the `ENABLED_PLUGINS` environment variable:

```bash
export ENABLED_PLUGINS="<plugin_name>"
```

All plugins share the same behavior:

- Secrets are bulk-loaded at startup and cached in memory
- Authentication failures cause the gateway to fail to start (errors are caught early)
- The `!secret KEY` pattern in `config.yaml` works unchanged — the plugin is transparent to your configuration

### Supported Providers

| Provider | Plugin Name | Secret Model |
|---|---|---|
| [AWS Secrets Manager](./aws-secrets-manager.md) | `aws_secrets_manager` | All secrets in one JSON object |
| [HashiCorp Vault](./hashicorp-vault.md) | `hashicorp_vault` | Key-value pairs under a single path |
| [GCP Secret Manager](./gcp-secret-manager.md) | `gcp_secret_manager` | One secret per key (individual resources) |
| [Azure Key Vault](./azure-key-vault.md) | `azure_keyvault` | One secret per key, prefix filtering available |

Need to integrate with a different system? See [Creating a Custom Secrets Plugin](./custom-plugin.md).

---

## Next Steps

- **[Basic Configuration](../../configuration/basic-setup.md)** — Get started with a simple gateway setup
- **[Best Practices](../../best-practices.md)** — Security and configuration best practices
- **[Advanced Configuration](../../configuration/advanced-configuration.md)** — Full configuration reference
