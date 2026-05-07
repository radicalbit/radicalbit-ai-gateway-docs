# AWS Secrets Manager

:::info[Enterprise Feature]{className="enterprise-badge"}
This feature is available exclusively in the **Enterprise edition** of the Radicalbit AI Gateway. [Contact sales](mailto:sales@radicalbit.ai) for licensing information.
:::

This plugin enables the gateway to resolve `!secret` references from AWS Secrets Manager instead of a static `secrets.yaml` file.

All gateway secrets are stored in **one AWS Secrets Manager secret** as a JSON object of key-value pairs. Each `!secret KEY` reference fetches the corresponding key from that single secret.

```bash
aws secretsmanager create-secret \
  --name gateway/secrets \
  --secret-string '{
    "OPENAI_API_KEY": "sk-proj-...",
    "GOOGLE_API_KEY": "AIzaSy...",
    "CACHE_REDIS_HOST": "redis-host",
    "CACHE_REDIS_PORT": "6379"
  }'
```

Then in `config.yaml`:

```yaml
credentials:
  api_key: !secret OPENAI_API_KEY
```

## Enabling the Plugin

```bash
export ENABLED_PLUGINS="aws_secrets_manager"
```

No `secrets.yaml` is needed when this plugin is active.

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `AWS_SECRET_NAME` | Yes | — | Name or ARN of the secret |
| `AWS_REGION` | Yes | — | AWS region (e.g. `eu-west-1`) |
| `AWS_ACCESS_KEY_ID` | No | — | Explicit AWS access key (falls back to default credential chain) |
| `AWS_SECRET_ACCESS_KEY` | No | — | Explicit AWS secret key |
| `AWS_SESSION_TOKEN` | No | — | Session token for temporary credentials |

## Authentication Methods

**IAM Role** (recommended for EC2/ECS/EKS) — no explicit credentials needed:

```bash
export AWS_SECRET_NAME=gateway/secrets
export AWS_REGION=eu-west-1
```

**Explicit credentials** (on-prem or environments without IAM roles):

```bash
export AWS_SECRET_NAME=gateway/secrets
export AWS_REGION=eu-west-1
export AWS_ACCESS_KEY_ID=AKIA...
export AWS_SECRET_ACCESS_KEY=wJalrXU...
```

## Docker Compose Example

```yaml
services:
  gateway:
    environment:
      ENABLED_PLUGINS: "aws_secrets_manager"
      AWS_REGION: "eu-west-1"
      AWS_SECRET_NAME: "gateway/secrets"
      # No explicit credentials — uses IAM role attached to the instance
```

## Dependencies

- `boto3>=1.26.0` — installed automatically from `requirements.txt` when the plugin is enabled
