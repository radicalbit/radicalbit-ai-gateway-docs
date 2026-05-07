# Access Control

:::info[Enterprise Feature]{className="enterprise-badge"}
This feature is available exclusively in the **Enterprise edition** of the Radicalbit AI Gateway. [Contact sales](mailto:sales@radicalbit.ai) for licensing information.
:::

Access Control provides enterprise-grade authentication, role-based authorization, and identity provider integration for the Radicalbit AI Gateway. It enables organizations to manage user identities, enforce permissions, and integrate with existing SSO infrastructure.

---

## Overview

The access control module is built on two independent plugins that work together:

- **IDP Plugin** — integrates with an identity provider for user/group management, RBAC, and token-based authentication on API endpoints. Currently, Keycloak is the supported IDP. Additional IDP integrations can be developed on request.
- **OIDC Plugin** — OpenID Connect-based SSO for all admin and registry APIs. This plugin is standardized and works with any compatible IDP plugin.

---

## Roles

Access Control uses three roles with granular permissions:

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **ADMIN** | Full system access | Manage users, groups, API keys, all projects, serve configurations |
| **BUILDER** | Project configuration | Configure projects, mark configurations as ready to be served |
| **AUDITOR** | Read-only access | View project dashboards, tracing data, and metrics |

### Permission Matrix

| Operation | ADMIN | BUILDER | AUDITOR |
|-----------|:-----:|:-------:|:-------:|
| Manage API keys | Yes | No | No |
| Manage groups | Yes | No | No |
| Manage users | Yes | No | No |
| Associate users to projects | Yes | No | No |
| View project details | Yes | Yes | Yes |
| Configure projects | Yes | Yes | No |
| Mark config as ready to be served | Yes | Yes | No |
| Serve (approve) configuration | Yes | No | No |
| View dashboards and tracing | Yes | Yes | Yes |

---

## Token-Based API Authentication

When an IDP plugin is enabled, users can authenticate to the gateway's OpenAI-compatible endpoints (such as chat completions, embeddings, and responses) using their IDP-issued JWT token instead of a gateway API key.

```bash
curl -X POST http://gateway:9000/v1/chat/completions \
  -H "Authorization: Bearer <idp-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"model": "my-route", "messages": [{"role": "user", "content": "Hello"}]}'
```

The gateway validates the JWT against the configured identity provider and resolves the associated gateway group for route-level access control.

---

## Prerequisites

- A running identity provider instance (currently [Keycloak](https://www.keycloak.org/) 18+ is supported)
- An Enterprise license for the Radicalbit AI Gateway
- IDP realms and clients configured for the gateway

---

## Plugin Overview

| Plugin | Name | Purpose |
|--------|------|---------|
| [Keycloak IDP](./keycloak-idp.md) | `keycloak_idp` | User/group sync, RBAC, ACL enforcement, JWT token authentication |
| [OIDC SSO](./oidc.md) | `registry_oidc_auth` | SSO login for admin and registry APIs |

Enable both plugins together for full access control:

```bash
export ENABLED_PLUGINS="keycloak_idp,registry_oidc_auth"
```

:::tip
The OIDC plugin is designed to work with any IDP plugin. If you need integration with an identity provider other than Keycloak, [contact sales](mailto:sales@radicalbit.ai) to discuss a custom IDP plugin.
:::

---

## Next Steps

- **[Keycloak IDP Plugin](./keycloak-idp.md)** — Configure Keycloak integration, roles, and sync
- **[OIDC Plugin](./oidc.md)** — Set up SSO authentication for the admin interface
