# Creating a Custom Secrets Plugin

You can integrate the gateway with any secret management system by implementing a custom plugin.

## 1. Implement the `SecretProvider` interface

Create a new directory under the gateway's `plugins/` folder. Implement the abstract `SecretProvider` class:

```python title="plugins/my_secret_provider/plugin.py"
from radicalbit_ai_gateway.utils.secrets import (
    SecretNotFoundError,
    SecretProvider,
    set_secret_provider_factory,
)

class MyCustomProvider(SecretProvider):
    def get_secret(self, key: str) -> str:
        # Fetch the secret from your system
        value = my_backend.fetch(key)
        if value is None:
            raise SecretNotFoundError(key, source="my_secret_provider")
        return value

    def list_secret_keys(self) -> list[str]:
        # Return the secret keys your system holds: keys only, never values
        return my_backend.list_keys()

# Register the provider at import time
set_secret_provider_factory(MyCustomProvider)
```

Both methods are required.

- `get_secret` is called for each `!secret KEY` reference whenever the gateway registers a project's routes (at startup and on every publish) and whenever it validates a configuration's references. Raise `SecretNotFoundError` when a key is not found.
- `list_secret_keys` returns the secret keys the backend holds. It powers the [Secrets section](./secrets-section.md) and is called on every request the page makes. Return keys only, never secret values. If the backend cannot be reached, raise `SecretsBackendError` (from `radicalbit_ai_gateway.utils.exceptions`). The page then shows its error state. Do not return an empty list, because the page would show an outage as "no secret keys".

The gateway builds a new provider instance each time it reads the backend. Do not rely on instance state lasting longer than a single read.

## 2. Add dependencies

Create a `requirements.txt` in the same plugin directory. Dependencies are installed automatically when the plugin is enabled:

```text title="plugins/my_secret_provider/requirements.txt"
my-secret-lib>=1.0.0
```

## 3. Directory structure

```
plugins/
  my_secret_provider/
    __init__.py
    plugin.py
    requirements.txt
```

## 4. Enable the plugin

```bash
export ENABLED_PLUGINS="my_secret_provider"
```

The gateway discovers plugins by scanning the `plugins/` directory and matching names against `ENABLED_PLUGINS`. The plugin's `plugin.py` module is imported at startup, which triggers the `set_secret_provider_factory()` call.
