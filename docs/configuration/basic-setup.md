# Basic Configuration

This guide will help you create your first gateway configuration and understand the basic concepts.

## Configuration File Structure

The gateway uses YAML configuration files. Here's the basic structure:

```yaml
routes:
  your-route-name:
    chat_models:
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
```

## Understanding Routes

Routes are the main building blocks of the gateway. Each route represents a different API endpoint with its own configuration:

- **Route Name**: The identifier you'll use in API calls
- **Models**: The AI models available for this route
- **Configuration**: Settings specific to this route

## Adding Your First Model

1. **Choose a model**: Select an AI model from supported providers
2. **Get API credentials**: Obtain API keys from your chosen provider
3. **Configure the model**: Add model configuration to your route

### Example: OpenAI GPT-3.5 Turbo

```yaml
routes:
  customer-service:
    chat_models:
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: "sk-your-openai-key"
        params:
          temperature: 0.7
          max_tokens: 1000
```

## Security Best Practices

### Secret Management
Never put API keys directly in configuration files. Use environment variables or secret management (the default secrets file should be named `secrets.yaml`):

```yaml
credentials:
  api_key: !secret OPENAI_API_KEY
```

### Environment Variables
Set up environment variables for sensitive data:

```bash
export OPENAI_API_KEY="sk-your-key"
export ANTHROPIC_API_KEY="sk-ant-your-key"
```

## Testing Your Configuration

1. **Start the gateway**:
   ```bash
   radicalbit-ai-gateway serve -c config.yaml
   ```

2. **Test with curl**:
   ```bash
   curl http://localhost:8000/v1/chat/completions \
     -H "Content-Type: application/json" \
     -d '{
       "model": "customer-service",
       "messages": [
         {"role": "user", "content": "Hello!"}
       ]
     }'
   ```

## Next Steps

- **[Model Configuration](./models.md)** - Add multiple models and providers
- **[Load Balancing](./load-balancing.md)** - Distribute requests across models
- **[Guardrails](../features/guardrails.md)** - Implement content safety
- **[Production Setup](../deployment/production.md)** - Deploy to production
