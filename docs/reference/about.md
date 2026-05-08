# About

This page provides information about the Radicalbit AI Gateway project and the team behind it.

## Project Overview

The Radicalbit AI Gateway is a simple and streamlined tool that connects to the models used in your Generative AI application, offering the ability to apply guardrails, routing, and management of inbound and outbound traffic.

### Mission

Our mission is to simplify and secure AI model access while providing essential features for managing and monitoring AI applications.

## Key Features

### Core Capabilities

- **OpenAI Compatibility**: Full OpenAI Chat Completions, Embeddings, and Responses API compatibility
- **Multi-Model Support**: Support for OpenAI, Anthropic, Google Gemini, Ollama, and OpenAI-compatible models
- **Comprehensive Guardrails**: Content filtering, PII detection, LLM-as-a-Judge
- **Robust Fallback Mechanisms**: Automatic failover and recovery
- **API Key Management**: Groups and keys management through UI
- **Monitoring UI**: Web interface for managing routes, groups, keys, and monitoring costs
- **Caching**: Semantic and exact caching for improved performance and reduced costs
- **Advanced Routing**: Keyword, token length, semantic, time-based, and budget-aware routing

### Security Features

- **Content Safety**: Built-in content filtering and safety measures
- **PII Protection**: Automatic detection and anonymization of sensitive data via Presidio
- **Rate Limiting**: Control costs and prevent abuse
- **Token Management**: Comprehensive token counting and limiting
- **Budget Limiting**: Cost-based request limiting
- **Audit Logging**: Request and response logging

### Observability

- **Prometheus Metrics**: Detailed metrics for monitoring
- **Grafana Dashboards**: Pre-built dashboards for visualization
- **OpenTelemetry**: Distributed tracing and telemetry
- **ClickHouse**: Long-term metrics storage
- **Performance Tracking**: Detailed performance metrics

## Technology Stack

### Backend

- **Python**: Core application language
- **FastAPI**: High-performance web framework
- **Pydantic**: Data validation and settings management
- **SQLAlchemy**: Database ORM
- **Celery**: Background task processing

### Data & Caching

- **PostgreSQL**: Data persistence
- **Redis / Valkey**: Caching and message broker
- **ClickHouse**: Metrics storage

### Infrastructure

- **Docker**: Containerization
- **Docker Compose**: Orchestration
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **Loki**: Log aggregation
- **OpenTelemetry**: Distributed tracing

### AI Models

- **OpenAI**: GPT models and embeddings
- **Anthropic**: Claude models
- **Google**: Gemini models
- **Self-hosted**: Ollama, vLLM, and other OpenAI-compatible models

## Architecture

### Core Components

- **Gateway Core**: Main application logic and model invocation
- **Route Manager**: Route configuration and management
- **Guardrail Engine**: Content filtering and safety
- **Fallback Manager**: Automatic failover
- **Cache Manager**: Exact and semantic response caching
- **Routing Engine**: Deterministic and semantic routing
- **Limiter**: Rate, token, and budget limiting
- **Metrics Worker**: Background metrics processing

## Contact

- **Email**: info@radicalbit.ai
- **Phone**: +39 02 37920598
- **Website**: https://radicalbit.ai
- **Sales**: sales@radicalbit.ai

## Next Steps

- **[Getting Started](../getting-started/installation.md)** - Set up your first gateway instance
- **[Configuration Guide](../configuration/advanced-configuration.md)** - Learn about configuration
- **[Enterprise](./enterprise.md)** - Learn about enterprise features
