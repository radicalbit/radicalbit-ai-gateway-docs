---
slug: /
---

# Radicalbit AI Gateway

The **Radicalbit AI Gateway** connects to the LLMs used in your Generative AI application, providing the ability to apply guardrails, routing, and management of inbound and outbound traffic.

Thanks to the Radicalbit AI Gateway, you will be able to:
* **Configure Inbound and Outbound Guardrails** based on:
  * Text control (e.g.,‘contains’, ‘starts with’, ‘ends with’, ‘regex’).
  * Detection and/or masking of PII.
  * LLM-as-a-Judge to manage custom logic.
* **Configure Semantic or Exact Cache to prevent redundant responses.**
* **Configure rate limits and token limits.**
* **Manage model fallbacks and traffic routing.**
* **Monitor applications via an authenticated UI** that allows you to: to:
  * Create groups and keys.
  * Control costs by group and key.
  * Investigate detailed metrics.
  * Benefit from total observability through the Gateway tracing.

**The Radicalbit AI Gateway is application-agnostic and supports any model that adheres to the OpenAI standard.** This makes the tool usable in the vast majority of applications.




# How to use it

**The Radicalbit AI Gateway is designed  to be agnostic to any GenAI framework and application.** For this reason, the application development and the Gateway are two independent processes.

The first step is to develop your application, regardless of the Gateway. It can be a chat assistant, a RAG application or anything else. Focus on the main logic of your application without struggling with guardrails, caching or metrics to expose. These complexities can be delegated to the Gateway.

Once the application has been built, we can move on to the **Gateway [configuration](docs/configuration/advanced-configuration.md)**. At this stage, we need to write the `config.yaml` file by choosing the route name, the model to use as well as any logic required to control, limit and monitor your application.

The hard part is over. To integrate your application with the Gateway, we have to specify the following information in the LLM Client:
* the Route name instead of the model name (the same as in the config.yaml).
* the Gateway base URL.
* the Gateway API Key (generated in the UI).

This ensures that all the traffic is sent to and processed by the Gateway.
Before using your application, remember to configure  the Gateway pointing it to the `config.yaml` file.




## Key Capabilities

The Radicalbit AI Gateway enables you to:

### **Guardrails**
- **Text Control**: Contains, starts with, ends with, regex patterns
- **PII Detection and Masking**: Automatic detection and anonymization of sensitive data
- **LLM-as-a-Judge**: Custom logic evaluation using AI models

### **Caching**
- **Semantic Cache**: Intelligent caching based on content similarity
- **Exact Cache**: Precise response caching to avoid redundancy

### **Traffic Management**
- **Rate Limits**: Control requests per time interval
- **Token Limits**: Cap tokens processed by models
- **Model Fallbacks**: Automatic failover for error handling
- **Intelligent Routing**: Traffic distribution across models

### **Monitoring & Observability**
- **Authenticated UI**: Monitor and manage your applications
- **Groups and Keys**: Create and manage API keys and groups
- **Cost Control**: Track costs by groups and keys
- **Event Notifications**: Receive alerts based on configured logic
- **Detailed Metrics**: Investigate performance and usage


## Get Started

### **For Developers**
- **[Installation](./getting-started/installation.md)** - Set up your gateway
- **[Basic Configuration](./configuration/basic-setup.md)** - Essential configuration
- **[Advanced Configuration](./configuration/advanced-configuration.md)** - Practical configurations

### **For Operations**
- **[Monitoring](./operations//monitoring.md)** - Observability and exposed metrics
- **[Telemetry](./operations//telemetry.md)** - Gateway Traces
- **[Troubleshooting](./troubleshooting/common-issues.md)** - Common issues and solutions



**Ready to get started?** Begin with the [installation guide](./getting-started/installation.md)!