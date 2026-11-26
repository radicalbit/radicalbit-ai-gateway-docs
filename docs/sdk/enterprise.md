# Enterprise: Signing In

:::info[Enterprise Feature]{className="enterprise-badge"}
This feature is available exclusively in the **Enterprise edition** of the Radicalbit AI Gateway, with the [Keycloak IDP plugin](../access-control/keycloak-idp.md).
:::

With [Access Control](../access-control/index.md) enabled, every call to the management API must come from someone the gateway knows, with a [role](../access-control/keycloak-idp.md#roles) that allows it. The Enterprise SDK is the [Python SDK](./index.md) with Keycloak sign-in built in, and it also manages users, project members and the audit log.

To get the Enterprise SDK, [contact Radicalbit](../reference/contacts.md).

```python
from radicalbit_gateway_enterprise import Gateway

with Gateway() as gw:  # gateway, Keycloak and credentials from the environment
    project = gw.projects.create(name='payments')
    slot_a = project.configs[0]
    gw.configs.save(project.uuid, slot_a.uuid, config_file=config)
    gw.configs.approve(project.uuid, slot_a.uuid)
    gw.configs.serve(project.uuid, slot_a.uuid)
```

The pipeline contains no authentication code: the client gets a token from Keycloak, sends it with every call, and renews it before it expires.

---

## A Pipeline: Service Account

A pipeline signs in as a **service account**: a Keycloak client of its own, with no person behind it and no password to rotate by hand.

### Setting it up

1. **In Keycloak**, create a client for the pipeline (e.g. `ci-pipeline`) with **Client authentication** on and **Service accounts roles** enabled. Note its client secret.
2. **In Keycloak**, add the client's service-account user (`service-account-ci-pipeline`) to one of the gateway's RBAC groups (`KEYCLOAK_IDP_RBAC_GROUPS`). In an admin group (`KEYCLOAK_IDP_RBAC_ADMIN_GROUPS`) it becomes an ADMIN at once.
3. **Wait for the [user sync](../access-control/keycloak-idp.md#user-rbac-sync)**. The service account then appears on the **Users** page, in the **Service accounts** tab, named by its client ID (`ci-pipeline`). The sync adds it only if the gateway's Keycloak admin user can [read the clients](../access-control/keycloak-idp.md#keycloak-permissions).
4. **In the gateway**, an ADMIN gives it a role in the **Service accounts** tab and, for a BUILDER, adds it to the projects it works on — as for a person.

Give the pipeline the smallest role that does the job: a pipeline that only prepares configurations for review is a BUILDER; one that also publishes them must be an ADMIN.

### Configuring the pipeline

| Environment variable | Description |
|---|---|
| `RADICALBIT_GATEWAY_BASE_URL` | The gateway, e.g. `https://gateway.example.com` |
| `RADICALBIT_GATEWAY_KEYCLOAK_URL` | Keycloak, e.g. `https://sso.example.com` |
| `RADICALBIT_GATEWAY_KEYCLOAK_REALM` | The gateway's realm |
| `RADICALBIT_GATEWAY_CLIENT_ID` | The service account's client, e.g. `ci-pipeline` |
| `RADICALBIT_GATEWAY_CLIENT_SECRET` | Its client secret |

Keep the client secret in your CI's secret store, never in the repository.

---

## A Person: Tokens

For a script run by a person, pass their Keycloak tokens instead of a client secret: an access token, or a refresh token the SDK uses to get new ones. Use a service account for automation; the SDK does not take a username and password.

`help(KeycloakAuth)` lists the ways to sign in, in code or from the environment.

---

## Errors

A call refused by the access control raises `errors.AuthenticationError` (401) when the gateway does not know the caller, or the caller has no role yet, and `errors.AuthorizationError` (403) when the role does not allow the operation. The exception's `code` tells which case it is.

A service account just added to an RBAC group is refused until the next user sync, and then until an ADMIN gives it a role. If it never appears in the **Service accounts** tab, check the [Keycloak permissions](../access-control/keycloak-idp.md#keycloak-permissions) of the gateway's admin user.

---

## Next Steps

- **[Examples](./examples.md)** — Pipelines for common tasks, including one with a service account
- **[Keycloak IDP Plugin](../access-control/keycloak-idp.md)** — Roles, RBAC groups and syncs
