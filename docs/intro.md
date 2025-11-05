---
slug: /
---

# Radicalbit AI Gateway

**A simple and streamlined tool for managing your Generative AI applications**

The Radicalbit AI Gateway connects to the models used in your Generative AI application, offering the ability to apply guardrails, load balancing, and management of inbound and outbound traffic.

## 🎯 Key Capabilities

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
- **Load Balancing**: Traffic distribution across models

### **Monitoring & Observability**
- **Authenticated UI**: Monitor and manage your applications
- **Groups and Keys**: Create and manage API keys and groups
- **Cost Control**: Track costs by groups and keys
- **Event Notifications**: Receive alerts based on configured logic
- **Detailed Metrics**: Investigate performance and usage
- **Gateway Tracing**: Total observability through distributed tracing

## 🔌 OpenAI Compatibility

The Radicalbit AI Gateway is agnostic to the type of application and supports any model that adheres to the OpenAI standard. This makes the tool usable in the vast majority of Generative AI applications without requiring changes to your application code.

## 🏗️ How It Works

The Radicalbit AI Gateway is designed to be agnostic to any GenAI framework and application. Application development and Gateway configuration are two independent processes:

1. **Develop Your Application**: Build your chat assistant, RAG application, or any other GenAI solution without worrying about guardrails, caching, or metrics
2. **Configure the Gateway**: Write the `config.yaml` file to define routes, models, and control logic
3. **Connect Your Application**: Point your LLM client to the Gateway by using:
   - The Route name instead of the model name
   - The Gateway base URL
   - The Gateway API Key (generated in the UI)

All traffic is then sent and processed by the Gateway, which handles guardrails, caching, monitoring, and cost control transparently.

## 🚀 Get Started

### **For Developers**
- **[Installation](./getting-started/installation.md)** - Set up your gateway
- **[Basic Configuration](./configuration/basic-setup.md)** - Essential configuration
- **[Configuration Examples](./configuration/examples.md)** - Practical configurations

### **For Configuration**
- **[Model Configuration](./configuration/models.md)** - Configure AI models
- **[Guardrails](./features/guardrails.md)** - Content safety implementation
- **[Caching](./features/caching.md)** - Semantic and exact caching
- **[Rate Limiting](./features/rate-limiting.md)** - Request and token limits
- **[Load Balancing](./configuration/load-balancing.md)** - Traffic distribution
- **[Fallback](./configuration/fallback.md)** - Automatic failover

### **For Operations**
- **[Monitoring](./monitoring.md)** - Observability and metrics
- **[Best Practices](./best-practices.md)** - Production guidelines
- **[Troubleshooting](./troubleshooting/common-issues.md)** - Common issues and solutions

---

## 📖 Complete Documentation

- **[Technical Overview](./technical-overview.md)** - Architecture and components
- **[API Reference](./api-reference/endpoints.md)** - Complete API documentation
- **[Support](./support.md)** - Technical assistance and support
- **[Enterprise](./enterprise.md)** - Commercial licensing and services
- **[FAQ](./faq.md)** - Frequently asked questions

**🎯 Ready to get started?** Begin with the [installation guide](./getting-started/installation.md)!