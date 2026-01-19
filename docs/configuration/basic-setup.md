# Basic Configuration

This guide will help you create your first gateway configuration and understand the basic concepts.

As a first step, create the `config.yaml` file with the following content:

```yaml
chat_models:
  - model_id: gpt-pirate
    model: openai/gpt-4o
    credentials:
      api_key: "<YOUR OPENAI_API_KEY>"
    prompt: "You are a pirate!"
    role: system

routes:
  gpt-pirate-route:
    chat_models:
      - gpt-pirate
```

This creates:

- a **chat model** named `gpt-pirate` (defined at top-level)
- a **route** named `gpt-pirate-route` that references `gpt-pirate` by **model ID**

:::tip
Save your model API Key into a `secrets.yaml` file.
:::

Once the gateway is started, you will need to access the UI (http://localhost:9000) to view route information, create a group and a key, and finally, associate the group with the route.

Go to the `Groups` section to create the group, and then to the `API Key` section to create the key.

:::warning
Remember that the key will be visible only once, so handle it with care and save it securely.
:::

As a final step, you will need to associate the group with the route and the key. In this way, we are establishing that the `pirate-crew` group holds the key to authenticate to the `gpt-pirate-route`.

Next, you will need to instantiate the model client by specifying the `base_url`, using the route instead of the `model` name, and using the `api_key` retrieved from the gateway UI.

```python
from openai import OpenAI

openai_client = OpenAI(
    base_url="http://localhost:9000/v1",
    model="gpt-pirate-route",
    api_key="sk-rb-******",
)
```

From this moment on, input and output traffic for this model will pass through the gateway.

**Congratulations, you have configured the gateway and integrated it into your application!**
