# Configuration Examples

This page provides practical configuration examples for common use cases with the Radicalbit AI Gateway.

## Basic Single Model Setup

### Simple OpenAI Route
```yaml
routes:
  openai-route:
    chat_models:
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
        system_prompt: "You are a helpful assistant."
```

### Anthropic Route
```yaml
routes:
  anthropic-route:
    chat_models:
      - model_id: claude-3-sonnet
        model: anthropic/claude-3-5-sonnet-latest
        credentials:
          api_key: !secret ANTHROPIC_API_KEY
        system_prompt: "You are a helpful assistant."
```

## Fallback Configuration

### Simple Fallback Chain
```yaml
routes:
  fallback-route:
    chat_models:
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
      - model_id: claude-3-sonnet
        model: anthropic/claude-3-5-sonnet-latest
        credentials:
          api_key: !secret ANTHROPIC_API_KEY
    fallback:
      - target: gpt-4o-mini
        fallbacks:
          - gpt-4o-mini
          - claude-3-sonnet
      - target: gpt-4o-mini
        fallbacks:
          - claude-3-sonnet
```

### Complex Fallback with Embeddings
```yaml
routes:
  multi-model-route:
    chat_models:
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
    embedding_models:
      - model_id: text-embedding-3-small
        model: openai/text-embedding-3-small
        credentials:
          api_key: !secret OPENAI_API_KEY
      - model_id: text-embedding-ada-002
        model: openai/text-embedding-ada-002
        credentials:
          api_key: !secret OPENAI_API_KEY
    fallback:
      - target: gpt-4o-mini
        fallbacks:
          - gpt-3.5-turbo
      - target: text-embedding-3-small
        fallbacks:
          - text-embedding-ada-002
        type: embedding
```

## Guardrails Configuration

### Basic Content Filtering
```yaml
routes:
  filtered-route:
    chat_models:
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
    guardrails:
      - profanity_filter
      - spam_detector

guardrails:
  - name: profanity_filter
    type: contains
    where: input
    behavior: block
    parameters:
      values: ["spam", "scam", "inappropriate"]
    response_message: "Content blocked due to inappropriate language"
  
  - name: spam_detector
    type: regex
    where: input
    behavior: warn
    parameters:
      values: ['\b(click here|buy now|limited time|act fast)\b']
    response_message: "Potential spam content detected"
```

### PII Protection with Presidio
```yaml
routes:
  pii-protected:
    chat_models:
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
    guardrails:
      - pii_analyzer
      - pii_anonymizer

guardrails:
  - name: pii_analyzer
    type: presidio_analyzer
    where: input
    behavior: block
    parameters:
      language: en
      entities: ["EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD"]
    response_message: "Personal information detected and blocked"
  
  - name: pii_anonymizer
    type: presidio_anonymizer
    where: io
    behavior: warn
    parameters:
      language: en
      entities: ["EMAIL_ADDRESS", "PHONE_NUMBER"]
```

### LLM Judge Guardrails
```yaml
routes:
  ai-judged:
    chat_models:
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
    guardrails:
      - toxicity_judge
      - business_context_judge

guardrails:
  - name: toxicity_judge
    type: judge
    where: input
    behavior: block
    parameters:
      judge_config:
        prompt_ref: "toxicity_check.md"
        model_id: "gpt-4o-mini"
        temperature: 0.0
        max_tokens: 100
        threshold: 0.01
    response_message: "🚨 Toxic content detected and blocked"
  
  - name: business_context_judge
    type: classifier
    where: input
    behavior: soft_block
    parameters:
      threshold: 0.7
      judge_config:
        prompt_ref: "business_context_check.md"
        model_id: "gpt-4o-mini"
        temperature: 0.0
        max_tokens: 50
        action_on_fail: "block"
    response_message: "⚠️ Content may not be appropriate for business context"
```

## Rate Limiting Examples

### Basic Rate Limiting
```yaml
routes:
  rate-limited:
    chat_models:
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
    rate_limiting:
      algorithm: fixed_window
      window_size: 1 minute
      max_requests: 20
```

### Token Limiting
```yaml
routes:
  token-limited:
    chat_models:
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
    token_limiting:
      input:
        window_size: 10 seconds
        max_token: 1000
      output:
        window_size: 10 minutes
        max_token: 5000
```

### Combined Rate and Token Limiting
```yaml
routes:
  fully-limited:
    chat_models:
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
    rate_limiting:
      algorithm: fixed_window
      window_size: 1 minute
      max_requests: 50
    token_limiting:
      input:
        window_size: 1 minute
        max_token: 5000
      output:
        window_size: 1 minute
        max_token: 10000
```

## Caching Configuration

### Basic Caching
```yaml
routes:
  cached-route:
    chat_models:
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
    caching:
      enabled: true
      ttl: 300  # 5 minutes

cache:
  redis_host: 'redis'
  redis_port: 6379
```

### Long-term Caching
```yaml
routes:
  long-cached:
    chat_models:
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
    caching:
      enabled: true
      ttl: 3600  # 1 hour

cache:
  redis_host: 'redis'
  redis_port: 6379
```

## Multi-Route Configuration

### Customer Service Route
```yaml
routes:
  customer-service:
    chat_models:
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
        system_prompt: "You are a helpful customer service assistant. Be polite and professional."
    guardrails:
      - profanity_filter
      - pii_analyzer
    rate_limiting:
      algorithm: fixed_window
      window_size: 1 minute
      max_requests: 30
    caching:
      enabled: true
      ttl: 600  # 10 minutes
```

### Business Development Route
```yaml
routes:
  business-development:
    chat_models:
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
        system_prompt: "You are a business development assistant. Focus on growth and strategy."
    guardrails:
      - business_context_judge
    rate_limiting:
      algorithm: fixed_window
      window_size: 1 minute
      max_requests: 10
    token_limiting:
      input:
        window_size: 1 minute
        max_token: 2000
```

### Finance Route
```yaml
routes:
  finance:
    chat_models:
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
        system_prompt: "You are a financial assistant. Be precise and conservative."
    guardrails:
      - pii_analyzer
      - financial_judge
    rate_limiting:
      algorithm: fixed_window
      window_size: 1 minute
      max_requests: 5
    token_limiting:
      input:
        window_size: 1 minute
        max_token: 1000
      output:
        window_size: 1 minute
        max_token: 2000
```

## Self-Hosted Models

### Ollama Integration
```yaml
routes:
  ollama-route:
    chat_models:
      - model_id: llama3.2
        model: openai/llama3.2
        credentials:
          api_key: "dummy-key"  # Required even if not used
          base_url: "http://ollama:11434/v1"
        system_prompt: "You are a helpful assistant."
      - model_id: qwen2.5
        model: openai/qwen2.5:3b
        credentials:
          api_key: "dummy-key"
          base_url: "http://ollama:11434/v1"
    balancing:
      algorithm: round_robin
```

### vLLM Integration
```yaml
routes:
  vllm-route:
    chat_models:
      - model_id: llama3.2
        model: openai/llama3.2
        credentials:
          api_key: "dummy-key"
          base_url: "http://vllm:8000/v1"
        system_prompt: "You are a helpful assistant."
    rate_limiting:
      algorithm: fixed_window
      window_size: 1 minute
      max_requests: 100
```

## Complete Production Example

```yaml
routes:
  production:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
        credentials:
          api_key: !secret OPENAI_API_KEY
        system_prompt: "You are a helpful assistant."
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
        system_prompt: "You are a helpful assistant."
    embedding_models:
      - model_id: text-embedding-3-small
        model: openai/text-embedding-3-small
        credentials:
          api_key: !secret OPENAI_API_KEY
    guardrails:
      - profanity_filter
      - pii_analyzer
      - toxicity_judge
    balancing:
      algorithm: weighted_round_robin
      weights:
        - model_id: gpt-4o
          weight: 3
        - model_id: gpt-4o-mini
          weight: 1
    fallback:
      - target: gpt-4o
        fallbacks:
          - gpt-4o-mini
      - target: gpt-4o-mini
        fallbacks:
          - gpt-3.5-turbo
      - target: text-embedding-3-small
        fallbacks: []
        type: embedding
    rate_limiting:
      algorithm: fixed_window
      window_size: 1 minute
      max_requests: 100
    token_limiting:
      input:
        window_size: 1 minute
        max_token: 5000
      output:
        window_size: 1 minute
        max_token: 10000
    caching:
      enabled: true
      ttl: 300

guardrails:
  - name: profanity_filter
    type: contains
    where: input
    behavior: block
    parameters:
      values: ["spam", "scam", "inappropriate"]
    response_message: "Content blocked due to inappropriate language"
  
  - name: pii_analyzer
    type: presidio_analyzer
    where: input
    behavior: block
    parameters:
      language: en
      entities: ["EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD"]
    response_message: "Personal information detected and blocked"
  
  - name: toxicity_judge
    type: judge
    where: input
    behavior: block
    parameters:
      judge_config:
        prompt_ref: "toxicity_check.md"
        model_id: "gpt-4o-mini"
        temperature: 0.0
        max_tokens: 100
        threshold: 0.01
    response_message: "🚨 Toxic content detected and blocked"

cache:
  redis_host: 'redis'
  redis_port: 6379
```

## Multi-Model Load Balancing

### Weighted Round-Robin Load Balancing
```yaml
routes:
  load-balanced:
    chat_models:
      - model_id: gpt-4o
        model: openai/gpt-4o
        credentials:
          api_key: !secret OPENAI_API_KEY
      - model_id: gpt-4o-mini
        model: openai/gpt-4o-mini
        credentials:
          api_key: !secret OPENAI_API_KEY
      - model_id: claude-3-sonnet
        model: anthropic/claude-3-5-sonnet-latest
        credentials:
          api_key: !secret ANTHROPIC_API_KEY
    balancing:
      algorithm: weighted_round_robin
      weights:
        - model_id: gpt-4o
          weight: 3  # Gets 3 out of every 4 requests
        - model_id: gpt-4o-mini
          weight: 1  # Gets 1 out of every 4 requests
```

## Next Steps

- **[Configuration Guide](./advanced-configuration.md)** - Complete configuration reference
- **[Guardrails Reference](../features/guardrails-reference.md)** - Detailed guardrail configuration
- **[Production Deployment](../deployment/production.md)** - Deploy to production environments
- **[Monitoring](../monitoring.md)** - Set up observability and metrics
