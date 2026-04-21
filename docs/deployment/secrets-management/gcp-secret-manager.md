# GCP Secret Manager

This plugin enables the gateway to resolve `!secret` references from Google Cloud Secret Manager instead of a static `secrets.yaml` file.

Unlike other providers that store all secrets under one path, GCP Secret Manager treats **each secret as an individual resource**. So `!secret OPENAI_API_KEY` fetches the secret named `OPENAI_API_KEY` from the configured project.

```bash
gcloud secrets create OPENAI_API_KEY --data-file=- <<< "sk-proj-..."
gcloud secrets create GOOGLE_API_KEY --data-file=- <<< "AIzaSy..."
```

Then in `config.yaml`:

```yaml
credentials:
  api_key: !secret OPENAI_API_KEY
```

## Prerequisites

1. A GCP project with the **Secret Manager API** enabled
2. A service account with roles:
   - `roles/secretmanager.secretAccessor` — to read secret values
   - `roles/secretmanager.viewer` — to list secrets
3. Either a service account JSON key file, or a runtime that supports Application Default Credentials (GKE, Cloud Run, Compute Engine)

## Enabling the Plugin

```bash
export ENABLED_PLUGINS="gcp_secret_manager"
```

No `secrets.yaml` is needed when this plugin is active.

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GCP_PROJECT_ID` | Yes | — | GCP project ID containing the secrets |
| `GCP_SM_CREDENTIALS` | No | — | Path to a service account JSON key file. When not set, Application Default Credentials are used |
| `GCP_SECRET_VERSION` | No | `latest` | Secret version to access |
| `GCP_SECRET_LABEL` | No | — | Label filter in `KEY=VALUE` format. When set, only secrets with the matching label are loaded |

## Authentication Methods

**Service account key file** (recommended for Docker / Kubernetes):

```bash
export GCP_PROJECT_ID=my-gcp-project
export GCP_SM_CREDENTIALS=/path/to/service-account.json
```

**Application Default Credentials** (GKE / Cloud Run / Compute Engine):

```bash
export GCP_PROJECT_ID=my-gcp-project
# ADC is picked up automatically from the runtime environment
```

## Label-Based Filtering

When `GCP_SECRET_LABEL` is set, only secrets with the matching label are loaded at startup. This is useful when a GCP project contains many secrets but only a subset belong to the gateway.

```bash
# Tag secrets with a label
gcloud secrets update OPENAI_API_KEY --update-labels=app=gateway
gcloud secrets update GOOGLE_API_KEY --update-labels=app=gateway
```

```bash
export GCP_PROJECT_ID=my-gcp-project
export GCP_SECRET_LABEL=app=gateway
```

When `GCP_SECRET_LABEL` is not set, all secrets in the project are loaded at startup.

## Docker Compose Example

```yaml
services:
  gateway:
    environment:
      ENABLED_PLUGINS: "gcp_secret_manager"
      GCP_PROJECT_ID: "my-gcp-project"
      GCP_SM_CREDENTIALS: "/secrets/service-account.json"
    volumes:
      - ./service-account.json:/secrets/service-account.json:ro
```

## Dependencies

- `google-cloud-secret-manager==2.27.0` — installed automatically from `requirements.txt` when the plugin is enabled
