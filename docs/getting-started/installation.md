# Installation

This guide assumes you have already obtained a commercial license for the Radicalbit AI Gateway by contacting our sales team and have the software installed and operational on your host system.

## Prerequisites

Before configuring the gateway, ensure you have:

- **Radicalbit AI Gateway** installed and licensed on your system
- **Docker** installed (if using containerized deployment)
- **Docker Compose** (included with Docker Desktop)
- Basic knowledge of YAML configuration files
- Valid API keys for your AI providers

## Verification

To verify your installation is working correctly:

1. **Check gateway status:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Verify configuration:**
   ```bash
   curl http://localhost:8000/v1/models
   ```

## Quick Configuration Test

Once you've confirmed the gateway is running, test it with a basic configuration:

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

3. **Apply your configuration:**
   ```bash
   # Restart the gateway with your configuration
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
- **[Production Deployment](../deployment/production.md)** - Deploy to production

## Troubleshooting

If you encounter issues with your licensed installation:

- **Gateway Not Responding**: Check if the gateway service is running
- **Port Conflicts**: Verify port 8000 is available and not blocked
- **Configuration Errors**: Validate your YAML syntax and file paths
- **API Key Issues**: Ensure your AI provider API keys are valid and accessible
- **License Issues**: Contact sales@radicalbit.ai for licensing support
- **Container Logs**: Use `docker compose logs gateway` to view error messages
- **Network Issues**: Ensure external AI providers are accessible from your network

For more help, see the [FAQ](../faq.md) or contact our support team.
