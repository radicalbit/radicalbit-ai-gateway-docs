import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Framework Examples

The Radicalbit AI Gateway is fully compatible with the OpenAI standard. This means **you don't need to change your application code** — just point your LLM client to the Gateway by updating three values:

| Parameter | Value |
|-----------|-------|
| `base_url` | Your Gateway URL (e.g., `http://localhost:9000/v1`) |
| `api_key` | Your Gateway API Key (generated from the UI) |
| `model` | The **route name** defined in your `config.yaml` |

The examples below show how to do this with the most common Python frameworks.

---

## Gateway Configuration

All the framework examples on this page work with the same `config.yaml`. You only need to define one model and one route:

```yaml
chat_models:
  - model_id: gpt-5.1-assistant
    model: openai/gpt-5.1
    credentials:
      api_key: !secret OPENAI_API_KEY
    params:
      temperature: 0.7
      max_tokens: 500

routes:
  my-assistant:
    chat_models:
      - gpt-5.1-assistant
```

The route name (`my-assistant`) is what you pass as the `model` parameter in your application code. The Gateway handles the rest.

---

## Chat Completion

<Tabs>
  <TabItem value="openai" label="OpenAI SDK" default>

The [OpenAI Python SDK](https://github.com/openai/openai-python) works out of the box. Pass `base_url` and `api_key` to the client constructor.

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:9000/v1",
    api_key="your-gateway-api-key",
)

response = client.chat.completions.create(
    model="my-assistant",  # route name from config.yaml
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is the capital of France?"},
    ],
)

print(response.choices[0].message.content)
```

  </TabItem>
  <TabItem value="langchain" label="LangChain">

[LangChain](https://python.langchain.com/) supports OpenAI-compatible endpoints via `ChatOpenAI`. Set `openai_api_base` and `openai_api_key` to redirect traffic through the Gateway.

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

llm = ChatOpenAI(
    openai_api_base="http://localhost:9000/v1",
    openai_api_key="your-gateway-api-key",
    model_name="my-assistant",  # route name from config.yaml
)

messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="What is the capital of France?"),
]

response = llm.invoke(messages)
print(response.content)
```

LangChain chains and agents work the same way — just pass this `llm` instance wherever a language model is expected.

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant."),
    ("user", "{input}"),
])

chain = prompt | llm
response = chain.invoke({"input": "What is the capital of France?"})
print(response.content)
```

  </TabItem>
  <TabItem value="llamaindex" label="LlamaIndex">

[LlamaIndex](https://docs.llamaindex.ai/) supports custom OpenAI-compatible endpoints via the `OpenAI` LLM class.

```python
from llama_index.llms.openai import OpenAI

llm = OpenAI(
    api_base="http://localhost:9000/v1",
    api_key="your-gateway-api-key",
    model="my-assistant",  # route name from config.yaml
)

response = llm.complete("What is the capital of France?")
print(response.text)
```

For chat-style interactions:

```python
from llama_index.core.llms import ChatMessage

messages = [
    ChatMessage(role="system", content="You are a helpful assistant."),
    ChatMessage(role="user", content="What is the capital of France?"),
]

response = llm.chat(messages)
print(response.message.content)
```

  </TabItem>
  <TabItem value="instructor" label="Instructor">

[Instructor](https://python.useinstructor.com/) adds structured output parsing on top of the OpenAI SDK. Patch the client after pointing it to the Gateway.

```python
import instructor
from openai import OpenAI
from pydantic import BaseModel

client = instructor.from_openai(
    OpenAI(
        base_url="http://localhost:9000/v1",
        api_key="your-gateway-api-key",
    )
)

class Answer(BaseModel):
    capital: str
    country: str

response = client.chat.completions.create(
    model="my-assistant",  # route name from config.yaml
    messages=[
        {"role": "user", "content": "What is the capital of France?"},
    ],
    response_model=Answer,
)

print(response.capital)   # Paris
print(response.country)   # France
```

  </TabItem>
  <TabItem value="haystack" label="Haystack">

[Haystack](https://haystack.deepset.ai/) supports OpenAI-compatible endpoints through `OpenAIChatGenerator`. Pass the Gateway URL as `api_base_url`.

```python
from haystack.components.generators.chat import OpenAIChatGenerator
from haystack.dataclasses import ChatMessage

generator = OpenAIChatGenerator(
    api_base_url="http://localhost:9000/v1",
    api_key="your-gateway-api-key",  # pass as a Secret or plain string
    model="my-assistant",  # route name from config.yaml
)

messages = [
    ChatMessage.from_system("You are a helpful assistant."),
    ChatMessage.from_user("What is the capital of France?"),
]

response = generator.run(messages=messages)
print(response["replies"][0].content)
```

  </TabItem>
  <TabItem value="autogen" label="AutoGen">

[AutoGen](https://microsoft.github.io/autogen/) supports custom OpenAI-compatible endpoints through its `llm_config`. Any agent that uses `llm_config` will route through the Gateway automatically.

```python
import autogen

llm_config = {
    "config_list": [
        {
            "model": "my-assistant",  # route name from config.yaml
            "api_key": "your-gateway-api-key",
            "base_url": "http://localhost:9000/v1",
        }
    ]
}

assistant = autogen.AssistantAgent(
    name="assistant",
    llm_config=llm_config,
)

user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=1,
)

user_proxy.initiate_chat(
    assistant,
    message="What is the capital of France?",
)
```

  </TabItem>
  <TabItem value="litellm" label="LiteLLM">

[LiteLLM](https://docs.litellm.ai/) is a unified interface for multiple LLM providers. Use the `openai/` prefix and pass `api_base` to route through the Gateway.

```python
import litellm

response = litellm.completion(
    model="openai/my-assistant",  # openai/ prefix + route name from config.yaml
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is the capital of France?"},
    ],
    api_base="http://localhost:9000/v1",
    api_key="your-gateway-api-key",
)

print(response.choices[0].message.content)
```

  </TabItem>
  <TabItem value="curl" label="cURL">

You can call the Gateway directly over HTTP without any SDK.

```bash
curl http://localhost:9000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-gateway-api-key" \
  -d '{
    "model": "my-assistant",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is the capital of France?"}
    ]
  }'
```

  </TabItem>
</Tabs>

---

## Streaming

All frameworks above support streaming. Here is an example using the OpenAI SDK — the pattern is identical across frameworks:

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:9000/v1",
    api_key="your-gateway-api-key",
)

stream = client.chat.completions.create(
    model="my-assistant",
    messages=[{"role": "user", "content": "Tell me a short story."}],
    stream=True,
)

for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        print(delta, end="", flush=True)
```

---

## Next Steps

- **[Basic Configuration](../configuration/basic-setup.md)** — Set up your first route
- **[Advanced Configuration](../configuration/advanced-configuration.md)** — Add guardrails, caching, and limits to your route
- **[Guardrails](../features/guardrails.md)** — Protect your application without changing application code
