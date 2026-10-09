# The Secrets Section

The **Secrets** section of the gateway UI lists the secret keys you can reference in a configuration with `!secret`. You find it in the navbar under **SETUP**, after **Configurations**.

Use it when you write a configuration: find the exact secret key you need, copy it, and paste it after `!secret`. That way you are not guessing a key and finding out it is wrong when the configuration is published.

---

## What the section shows

Each row is a **secret key**, the identifier that follows `!secret` in a configuration. The table has two columns:

- **Secret key**: the key, with a copy to clipboard action. An **Unavailable** key is greyed out and marked with a warning badge (see below).
- **Used in projects**: the projects whose published configuration references the key. Click a project name to open the Projects list filtered to that project. The first three projects are shown by name. A `+N` chip opens a popover listing all of them.

The list combines two sources: every secret key the configured secrets backend holds, and every secret key referenced by a published configuration. It is paginated, and you can search it by secret key. The search and the current page are stored in the URL, so a filtered view can be reloaded or shared.

:::info Secret values are never shown
The section shows secret keys only. The **secret value** behind a key is never returned by the management API and never rendered in the UI, either in clear text or masked. Secret values stay on the server. The gateway reads them only to resolve and validate `!secret` references, and on GCP Secret Manager and Azure Key Vault to load the backend (see [Backend cost](#backend-cost-and-scoping-what-the-gateway-loads)).
:::

### Secrets are not Credentials

The Secrets section and the Credentials section both deal with "keys", but these are two separate concepts:

| | Secret key | Credential |
|---|---|---|
| What it is | A reference used **inside a configuration** to reach a model provider, for example `!secret OPENAI_API_KEY` | What **authenticates a caller** of a gateway route |
| Where it lives | The secrets backend (a `secrets.yaml` file, HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager, Azure Key Vault) | The gateway |
| Managed from | The secrets backend itself; the gateway only reads it | The Credentials section |

The gateway never creates, edits or deletes a secret key. You manage secret keys in the secrets backend, and the Secrets section shows what that backend currently holds.

### Unavailable secret keys

A secret key is **Unavailable** when a published configuration still references it but the secrets backend no longer holds it. This usually happens because the key was renamed or deleted in the backend after the configuration was published.

Routes that are already registered keep the secret value they resolved, but they fail the next time they are registered, for example on a restart or when the project is published again. Because these rows need attention, they are always sorted first. An Unavailable key cannot be copied, because there is nothing in the backend to reference. To fix it, add the key back to the secrets backend, or publish a configuration that no longer references it.

### When the backend cannot be read

If the gateway cannot reach the secrets backend, the section shows an error with a **Retry** action, not an empty table. An outage is never displayed as "the backend holds no secret keys".

---

## What each role sees

:::info[Enterprise Feature]{className="enterprise-badge"}
Role-based visibility applies to the **Enterprise edition** with [Access Control](../../access-control/index.md) enabled. [Contact sales](mailto:sales@radicalbit.ai) for licensing information.
:::

In Enterprise, every authenticated role (**ADMIN**, **BUILDER** and **AUDITOR**) can read the Secrets section. Without a session, the section and its API endpoint are not reachable.

What the section shows depends on project membership:

| | ADMIN | BUILDER, AUDITOR |
|---|---|---|
| Secret keys held by the secrets backend | All of them | All of them |
| Projects listed in **Used in projects** | Every referencing project | Only the projects the user is a member of |
| Unavailable secret keys | All of them | Only those referenced by a project the user is a member of |

Secret keys are not filtered by project. Anyone who writes a configuration needs the full list of secret keys the deployment provides, so every role sees all of them.

**Used in projects** is filtered by project, because it names projects. A non-admin user sees only the projects they are a member of. As a result:

- For a non-admin user, an empty **Used in projects** means *no configuration you can see references this key*. It does not mean the key is unused. Another project might still use it.
- An Unavailable key that only appears in configurations of projects you are not a member of is not listed for you at all.
- An admin always sees every referencing project. Before rotating or removing a secret key, ask an admin to check its **Used in projects**.

The UI does not show any indicator for projects that are hidden from you. Showing one would reveal how many projects you cannot see.

---

## Backend cost and scoping what the gateway loads

The Secrets section reads the secrets backend on every request, without a cache. The page sends a request when it loads, on every change to the search box, and on every page change. **Each request reads the whole backend**:

- **HashiCorp Vault** and **AWS Secrets Manager** read their single secret entry. With AppRole authentication, Vault also performs an AppRole login on each request.
- **GCP Secret Manager** lists the secrets in scope and **reads each one's secret value**.
- **Azure Key Vault** lists every secret in the vault and **reads the secret value** of each one in scope.

Secret values are never sent to the UI, but GCP and Azure still fetch them. On a GCP project or an Azure vault that holds many secrets unrelated to the gateway, this cost is real: API calls, quota, latency, and secret access audit entries for every request, by every user.

The supported way to reduce it is to limit what the gateway loads from the backend:

| Backend | Variable | Effect |
|---|---|---|
| GCP Secret Manager | `GCP_SECRET_LABEL` | Loads only secrets that carry the given `KEY=VALUE` label |
| Azure Key Vault | `AZURE_KEYVAULT_SECRET_PREFIX` | Reads the secret value only of secrets whose name starts with the given prefix. The vault's secret list is still read in full. |

```bash
# GCP: label the gateway's secrets, then scope to that label
gcloud secrets update OPENAI_API_KEY --update-labels=app=gateway
export GCP_SECRET_LABEL=app=gateway

# Azure: name the gateway's secrets with a common prefix, then scope to it
export AZURE_KEYVAULT_SECRET_PREFIX=gateway-
```

These variables control everything the gateway loads from the backend, not just what this page shows. A secret key outside the label or prefix does not appear in the Secrets section, and a `!secret` reference to it does not resolve. Label or rename every secret key your configurations use before you set either variable.

See [GCP Secret Manager](./gcp-secret-manager.md#label-based-filtering) and [Azure Key Vault](./azure-key-vault.md#prefix-filtering) for details.

---

## Next Steps

- **[Secrets Management](./index.md)**: configure a secrets backend
- **[Access Control](../../access-control/index.md)**: roles and project membership in Enterprise
