# Installation

This guide will help you install and set up the Radicalbit AI Gateway on your system.

## Prerequisites

Before installing the gateway, ensure you have:

- **Docker** installed on your system
- **Docker Compose** (included with Docker Desktop)
- Basic knowledge of YAML configuration files

## Installation Method

### Docker Deployment (Recommended)

The Radicalbit AI Gateway is distributed as a Docker container for easy deployment and management.

1. **Create a project directory:**
   ```bash
   mkdir ai-gateway-project
   cd ai-gateway-project
   ```

2. **Create a Docker Compose file:**
   ```yaml
   # docker-compose.yml
   version: '3.8'
   services:
     gateway:
       image: radicalbit/ai-gateway:latest
       ports:
         - "8000:8000"
       volumes:
         - ./config.yaml:/app/config.yaml
         - ./secrets.yaml:/app/secrets.yaml
       environment:
         - CONFIG_PATH=/app/config.yaml
         - SECRETS_PATH=/app/secrets.yaml
   ```

3. **Start the gateway:**
   ```bash
   docker compose up -d
   ```

## Quick Start

Once the Docker container is running, you can test the gateway with a basic configuration:

1. **Create a basic configuration file:**
   ```yaml
   # config.yaml
   routes:
     default:
       chat_models:
         - model_id: gpt-3.5-turbo
           model: openai/gpt-3.5-turbo
           credentials:
             api_key: !secret OPENAI_API_KEY
   ```

2. **Create a secrets file:**
   ```yaml
   # secrets.yaml
   OPENAI_API_KEY: "your-openai-api-key"
   ```

3. **Restart the container with your configuration:**
   ```bash
   docker compose down
   docker compose up -d
   ```

4. **Test the gateway:**
   ```bash
   curl http://localhost:8000/v1/chat/completions \
     -H "Content-Type: application/json" \
     -d '{
       "model": "default",
       "messages": [
         {"role": "user", "content": "Hello!"}
       ]
     }'
   ```

## Configuration

The gateway requires a YAML configuration file. See the [Configuration Guide](../configuration/basic-setup.md) for detailed setup instructions.

## Next Steps

- **[Basic Configuration](../configuration/basic-setup.md)** - Set up your first route
- **[Model Configuration](../configuration/models.md)** - Add multiple AI models
- **[Guardrails Setup](../features/guardrails.md)** - Implement content safety
- **[Production Deployment](../configuration/production.md)** - Deploy to production

## Troubleshooting

If you encounter issues during installation:

- **Docker Issues**: Ensure Docker is running and you have sufficient permissions
- **Port Conflicts**: Check if port 8000 is already in use
- **Configuration Errors**: Verify your YAML syntax is correct
- **Container Logs**: Use `docker compose logs gateway` to view error messages
- **Network Issues**: Ensure you can access external AI providers from the container

For more help, see the [FAQ](../faq.md).
