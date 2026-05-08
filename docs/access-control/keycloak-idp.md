# Keycloak IDP Plugin

:::info[Enterprise Feature]{className="enterprise-badge"}
This feature is available exclusively in the **Enterprise edition** of the Radicalbit AI Gateway. [Contact sales](mailto:sales@radicalbit.ai) for licensing information.
:::

The Keycloak IDP plugin provides deep integration with [Keycloak](https://www.keycloak.org/) for user and group management, role-based access control, token-based API authentication, and automatic synchronization of identities between Keycloak and the gateway.

---

## Enabling the Plugin

```bash
export ENABLED_PLUGINS="keycloak_idp"
```

When enabled, the plugin:

- Registers middleware that validates JWT tokens from Keycloak and enforces ACL rules
- Replaces the default API key validator with a Keycloak-aware validator that accepts both gateway API keys and Keycloak JWT tokens
- Starts background sync jobs for users, groups, and keys

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `KEYCLOAK_IDP_SERVER_URL` | Yes | — | Keycloak server base URL (e.g. `http://keycloak:8080`) |
| `KEYCLOAK_IDP_ADMIN_USER` | Yes | — | Admin username for Keycloak API access |
| `KEYCLOAK_IDP_ADMIN_PASSWORD` | Yes | — | Admin password for Keycloak API access |
| `KEYCLOAK_IDP_ADMIN_REALM` | Yes | — | Realm of the admin user (e.g. `master`) |
| `KEYCLOAK_IDP_APP_REALM` | No | — | Application realm (defaults to admin realm if empty) |
| `KEYCLOAK_IDP_IMPORT_CRON` | No | `*/5 * * * *` | Cron schedule for group and key synchronization |
| `KEYCLOAK_IDP_IMPORT_GROUPS` | No | — | Comma-separated list of Keycloak group names to import |
| `KEYCLOAK_IDP_RBAC_CRON` | No | `*/5 * * * *` | Cron schedule for user RBAC synchronization |
| `KEYCLOAK_IDP_RBAC_GROUPS` | No | — | Groups whose members are synced as gateway users |
| `KEYCLOAK_IDP_RBAC_ADMIN_GROUPS` | No | — | Groups whose members receive the ADMIN role |

---

## Roles

The plugin defines three roles with different permission levels:

### ADMIN

Full system access. ADMIN users can:

- Manage API keys, groups, and users
- Associate users to projects
- View, configure, and serve all project configurations

### BUILDER

Project-level configuration access. BUILDER users can:

- View project details and dashboards
- Load and generate project configurations
- Mark configurations as ready to be served

Cannot access user, group, or key management. Cannot associate users to projects.

### AUDITOR

Read-only access. AUDITOR users can:

- View project details they are members of
- Access dashboards and tracing data

Cannot modify any configuration or access management features.

---

## Token-Based API Authentication

When this plugin is enabled, the gateway's OpenAI-compatible endpoints accept Keycloak JWT tokens as an alternative to gateway API keys. This allows users to call the gateway directly with their Keycloak credentials, without needing to generate or manage separate API keys.

```bash
curl -X POST http://gateway:9000/v1/chat/completions \
  -H "Authorization: Bearer <keycloak-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"model": "my-project/my-route", "messages": [{"role": "user", "content": "Hello"}]}'
```

The gateway validates the JWT against Keycloak and resolves the user's associated gateway group for route-level access control.

---

## Sync Operations

The plugin runs two background sync jobs on configurable cron schedules.

### Group and Key Sync

Syncs Keycloak groups and their members into gateway Groups and API Keys:

- Fetches all Keycloak groups matching `KEYCLOAK_IDP_IMPORT_GROUPS`
- Creates or updates gateway Groups and API Keys for each group member
- Removes gateway groups that no longer exist in Keycloak
- Reconciles membership changes

Controlled by `KEYCLOAK_IDP_IMPORT_CRON` and `KEYCLOAK_IDP_IMPORT_GROUPS`.

### User RBAC Sync

Syncs users from RBAC groups into the gateway's user table:

- Members of `KEYCLOAK_IDP_RBAC_ADMIN_GROUPS` receive the **ADMIN** role
- Members of `KEYCLOAK_IDP_RBAC_GROUPS` receive a role based on their group membership
- Handles new users, role changes, and deletions

Controlled by `KEYCLOAK_IDP_RBAC_CRON`, `KEYCLOAK_IDP_RBAC_GROUPS`, and `KEYCLOAK_IDP_RBAC_ADMIN_GROUPS`.

---

---

## Dependencies

- `python-keycloak==5.8.1` — installed automatically from `requirements.txt` when the plugin is enabled
- `fastapi-crons==2.2.0` — installed automatically from `requirements.txt` when the plugin is enabled

---

## Next Steps

- **[OIDC Plugin](./oidc.md)** — Configure SSO authentication for the admin interface
- **[Access Control Overview](./index.md)** — Review the roles and architecture
