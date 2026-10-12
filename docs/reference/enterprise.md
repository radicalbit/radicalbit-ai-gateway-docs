# Enterprise

The Enterprise edition of the Radicalbit AI Gateway is designed for organizations that need to operate AI infrastructure at scale, with strong governance, security controls, and integration into existing identity systems.

It includes everything in the standard edition, plus the following capabilities.

---

## Access Control

Enterprise deployments can integrate the gateway with an existing **Identity Provider (IDP)** to centralize user and group management. Rather than managing gateway users manually, your organization's existing identity infrastructure is used as the source of truth.

Key capabilities:

- **IDP Integration** — currently supports Keycloak, with additional providers available on request. Users and groups are automatically synchronized from the IDP into the gateway on a configurable schedule.
- **Role-Based Access Control** — three built-in roles with granular permissions:
  - **ADMIN** — full access: manage users, groups, API keys, projects, and serve configurations
  - **BUILDER** — configure projects and mark configurations as ready to serve
  - **AUDITOR** — read-only access to dashboards, tracing, and metrics
- **OIDC Single Sign-On** — the gateway admin interface supports SSO via standard OpenID Connect, so users log in with their existing organizational credentials
- **JWT Token Authentication** — users can call gateway API endpoints directly using IDP-issued JWT tokens, without needing separately managed gateway API keys

See [Access Control](../access-control/index.md) for configuration details.

---

## Secrets Management

In production environments, secret values such as model provider API keys should not live inside configuration files. The gateway supports pluggable **secrets backends** that resolve `!secret KEY` references from a secure external store when it registers a project's routes.

Supported providers:

- **AWS Secrets Manager** — secrets stored as a single JSON object
- **HashiCorp Vault** — key-value pairs under a configurable path, with token or AppRole authentication
- **Google Cloud Secret Manager** — individual secrets per key, with label-based filtering
- **Azure Key Vault** — individual secrets per key, with optional prefix filtering

When a secrets plugin is enabled, no `secrets.yaml` file is needed — the plugin replaces it transparently. Your `config.yaml` remains unchanged.

Custom secrets providers can also be implemented as plugins. See [Secrets Management](../deployment/secrets-management/index.md) for details.

The **Secrets section** of the UI lists the secret keys the backend holds and the projects whose published configuration uses each one. It never shows a secret value. Every authenticated role can read it. **Used in projects** lists only the projects the reader is a member of, and an admin sees all of them. See [The Secrets Section](../deployment/secrets-management/secrets-section.md).

---

## Licensing

For licensing inquiries and enterprise agreements: sales@radicalbit.ai
