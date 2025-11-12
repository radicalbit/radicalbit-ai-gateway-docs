---
slug: /
---

# Radicalbit AI Gateway

The **Radicalbit AI Gateway** is a tool that connects to the LLMs used in your Generative AI application, offering the ability to apply guardrails, routing and management of inbound and outbound traffic.

Thanks to the Radicalbit AI Gateway, you will be able to:

- Configure inbound and outbound guardrails based on:
  - Text control (contains, starts with, ends with, regex)
  - Detection and/or masking of PII
  - LLM-as-a-Judge to manage custom logic
- Configure Semantic or Exact Cache, avoiding redundancy in responses already proposed by your application
- Configure rate limits and token limits
- Manage model fallbacks and traffic routing
- Monitor your applications through an authenticated UI that will allow you to:
  - Create groups and keys
  - Control costs by groups and keys
  - Receive event notifications based on configured logic
  - Investigate detailed metrics
  - Benefit from total observability through the Gateway tracing

The Radicalbit AI Gateway is agnostic to the type of application and supports any model that **adheres to the OpenAI standard**. This makes the tool usable in the vast majority of applications.




# How to use it

The Radicalbit AI Gateway is meant to be agnostic to any GenAI framework and application: for this reason, the application development and the Gateway are two independent processes. 

First things first, never mind the Gateway: you need to develop your application. It can be a chat assistant, a RAG application or anything else. Just focus on the main logic of your application without struggling with guardrails, caching or metrics to expose. These are complexities you can delegate to the Gateway. 

Once the application is built, let’s move to the Gateway configuration. In this step, we need to write the `config.yaml` file by choosing the route name, model to use and any logic you need to use to control, limit and monitor your application. 

The worst is over. To hook your application in the Gateway, we have to specify into the LLM client the following information:

- the Route name instead of the model name (the same you have in the `config.yaml`)
- the Gateway base URL 
- the Gateway API Key (generated in the UI)

In this way, all the traffic is sent and processed by the gateway.

Before starting to use your application, remember to serve the Gateway pointing to the `config.yaml` file.



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
- **[Configuration Examples](./configuration/examples.md)** - Practical configurations

### **For Configuration**
- **[Model Configuration](./configuration/models.md)** - Configure AI models
- **[Guardrails](./features/guardrails.md)** - Content safety implementation
- **[Caching](./features/caching.md)** - Semantic and exact caching
- **[Rate Limiting](./features/rate-limiting.md)** - Request and token limits
- **[Intelligent Routing](./configuration/intelligent-routing.md)** - Traffic distribution
- **[Fallback](./configuration/fallback.md)** - Automatic failover

### **For Operations**
- **[Monitoring](./monitoring.md)** - Observability and metrics
- **[Best Practices](./best-practices.md)** - Production guidelines
- **[Troubleshooting](./troubleshooting/common-issues.md)** - Common issues and solutions

---

## Complete Documentation

- **[Technical Overview](./technical-overview.md)** - Architecture and components
- **[API Reference](./api-reference/endpoints.md)** - Complete API documentation
- **[Support](./support.md)** - Technical assistance and support
- **[Enterprise](./enterprise.md)** - Commercial licensing and services
- **[FAQ](./faq.md)** - Frequently asked questions

**Ready to get started?** Begin with the [installation guide](./getting-started/installation.md)!