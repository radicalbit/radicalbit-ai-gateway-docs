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
The credential value is shown only once, when it is created. If you lose it, [rotate](#rotation) the credential to get a new value.
:::

---

## Expiration

Give a credential an expiry date when access should be temporary: a contractor, a demo or a proof of concept. Once the date has passed, the credential stops working on its own, with nothing to remember to clean up.

### Choosing the date

You set the expiry date when you create the credential. It can be any day from today onwards. Keep in mind:

- **The date can't be changed later**, not even by a [rotation](#rotation). To extend access, create a new credential and hand it over before the old one expires.
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

## Rotation

Rotate a credential to give it a new value while it keeps everything else: its name, group, limits, usage history and expiry date all stay. Rotate on a schedule, when someone who knew the value leaves, or when the value may have leaked.

1. In **Credentials**, open the credential's menu and choose **Rotate credential**.
2. Choose a [grace period](#grace-period), or [no grace period](#no-grace-period).
3. Copy the new value and store it securely.
4. Hand the new value to the teams using the credential.

:::warning
The new value is shown only once, like the value at creation.
:::

Only credentials created in the gateway can be rotated. Credentials from your identity provider are managed there, and expired credentials can't be rotated.

### Grace period

During the grace period both values work: the new one and the previous one. Callers can switch to the new value at their own pace, with no downtime. When the grace period ends, the previous value stops working.

- **It is 24 hours by default.** You can pick 1 hour or 7 days, or set your own length in hours, days or weeks.
- **It lasts at least 1 hour.**
- **It never ends after the credential expires.** Within the last hour before expiry, only no grace period is possible.

While the grace period runs, the **Credentials** list shows when the previous value stops working, and flags it when that is less than 24 hours away. Once the grace period is over, the list shows when the credential was last rotated.

A credential can't be rotated again while its grace period is running. [End it](#ending-a-grace-period-early) first, then rotate.

### No grace period

With no grace period, the previous value stops working at once, and only the new value works. Use it when the value has leaked: the credential keeps its name, group, limits and usage history, and the leaked value is useless from that moment.

Callers that still use the previous value fail until they switch to the new one, so hand it over quickly.

:::tip
If the credential's identity doesn't need to survive, for example because nobody uses it anymore, delete it instead.
:::

### Ending a grace period early

Once every caller has switched to the new value, you don't have to wait for the grace period to run out. Open the credential's menu, choose **End grace period** and confirm. The previous value stops working at once.

### After the grace period

A request made with the previous value after the grace period gets the same `401` as a wrong value:

```json
{
  "error": {
    "message": "Incorrect API key provided.",
    "type": "authentication_error",
    "param": null,
    "code": "key_invalid_unauthorized"
  }
}
```

The gateway keeps no record of earlier values, so it can't tell a caller their value was rotated. A caller who sees this error after a rotation needs the new value from an Admin.

When the credential reaches its [expiry date](#expiration), neither value works, even if a grace period was still running. The new value gets `key_expired_unauthorized`, the previous one `key_invalid_unauthorized`.

---

## Next Steps

- [Basic Concepts](./basic-concepts.md): groups, routes and how they fit together
- [Access Control](./access-control/index.md): signing in with your identity provider (Enterprise)
- [API Reference](./api-reference/endpoints.md#credential-rotation): rotating a credential through the API
- [API Reference](./api-reference/endpoints.md#error-responses): all the errors a caller can receive
