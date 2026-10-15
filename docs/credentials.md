# Credentials

A credential is the API key your application uses to call the gateway. Admins create credentials in the **Credentials** section of the UI and hand them to the teams that need access.

```python
openai_client = openai.OpenAI(
    base_url="http://localhost:9000/v1",
    api_key="sk-rb-*******************"  # your credential
)
```

A credential can call only the routes linked to its group, so every credential must belong to a [group](./basic-concepts.md#authentication-groups-and-keys). Usage and costs are tracked per group and per credential.

:::note
Credentials are not [secrets](./deployment/secrets-management/index.md). Secrets hold the provider keys the gateway uses to call your models. Credentials are what your applications use to call the gateway.
:::

---

## Create a Credential

1. Go to **Credentials** and create a credential.
2. Give it a name.
3. Choose whether it expires, and on which date. See [Expiration](#expiration).
4. Copy the credential value and store it securely.
5. Associate the credential with a group.

:::warning
The credential value is shown only once, when it is created. If you lose it, create a new credential.
:::

---

## Expiration

Give a credential an expiry date when access should be temporary: a contractor, a demo, a proof of concept, or simply a regular rotation policy. Once the date has passed, the credential stops working on its own, with nothing to remember to clean up.

### Choosing the date

You set the expiry date when you create the credential. It can be any day from today onwards. Keep in mind:

- **The date can't be changed later.** To extend access, create a new credential and hand it over before the old one expires.
- **The credential works until the end of that day in UTC** (23:59:59 UTC). The date is the same for everyone, whatever their timezone, but for callers outside UTC the cut-off is not at their local midnight. For example, a credential expiring on 31 December stops working at 18:59:59 on 31 December in New York.
- **Credentials from your identity provider never expire in the gateway.** Their lifecycle is managed by the identity provider. See [Access Control](./access-control/index.md).

### Before it expires

The **Credentials** list shows when each credential expires, and flags the ones expiring by the end of the next day. If a team still needs access, hand over a replacement before then.

### After it expires

Requests made with an expired credential are rejected with a `401`:

```json
{
  "error": {
    "message": "API key has expired.",
    "type": "authentication_error",
    "param": null,
    "code": "key_expired_unauthorized"
  }
}
```

The message tells callers the credential has expired, so they know to ask for a new one rather than look for a typo.

An expired credential stays in the list, marked as expired. It can't be reactivated or edited: you can only delete it or remove it from its group.

---

## Next Steps

- [Basic Concepts](./basic-concepts.md): groups, routes and how they fit together
- [Access Control](./access-control/index.md): signing in with your identity provider (Enterprise)
- [API Reference](./api-reference/endpoints.md#error-responses): all the errors a caller can receive
