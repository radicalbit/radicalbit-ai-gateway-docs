# Changelog

This page tracks the version history and changes for the Radicalbit AI Gateway.

## Version 0.1.0 (Current)

### 🚀 New Features

#### Enhanced Guardrails System
- **LLM Judge Guardrails**: AI-powered content evaluation using `judge` and `classifier` types
- **Enhanced Presidio Integration**: Improved PII detection and anonymization
- **Custom Response Messages**: Configurable error messages for blocked content
- **Guardrail Performance Optimization**: Faster processing and reduced latency

#### Improved Configuration
- **Model ID Validation**: Automatic validation of `model_id` and `fallback_model_id` in guardrails
- **Enhanced Error Messages**: More descriptive error messages for configuration issues
- **Configuration Validation**: Comprehensive validation at startup

#### Weighted Round-Robin Load Balancing
- **Configurable Weights**: Distribute requests based on assigned weights
- **Algorithm Support**: Weighted round-robin balancing algorithm
- **Cost Optimization**: Optimize costs by directing traffic to cheaper models

### 🔧 Improvements

#### Performance Enhancements
- **Reduced Overhead**: Optimized request processing pipeline
- **Better Caching**: Improved cache hit rates and performance
- **Faster Guardrails**: Optimized guardrail processing

#### Monitoring and Observability
- **Enhanced Metrics**: More detailed Prometheus metrics
- **Better Logging**: Structured logging with request tracing
- **Health Checks**: Comprehensive health check endpoints

#### Security Enhancements
- **API Key Validation**: Improved API key handling and validation
- **Rate Limiting**: Enhanced rate limiting algorithms
- **Token Management**: Better token counting and limiting

### 🐛 Bug Fixes

- Fixed configuration validation issues
- Resolved guardrail performance problems
- Fixed fallback mechanism edge cases
- Corrected rate limiting calculations
- Fixed caching invalidation issues

### 📚 Documentation

- Complete API reference documentation
- Comprehensive configuration examples
- Production deployment guides
- Best practices and troubleshooting guides

## Version 1.5.0

### 🚀 New Features

#### Guardrails System
- **Traditional Guardrails**: Pattern matching with `contains`, `regex`, `starts_with`, `ends_with`
- **Presidio Integration**: PII detection and anonymization
- **Content Filtering**: Basic content safety measures

#### Load Balancing
- **Round Robin**: Basic load balancing algorithm
- **Fallback Mechanisms**: Simple fallback chains

#### Basic Monitoring
- **Prometheus Metrics**: Basic metrics collection
- **Health Checks**: Simple health check endpoints

### 🔧 Improvements

- Improved error handling
- Better configuration validation
- Enhanced logging

### 🐛 Bug Fixes

- Fixed configuration parsing issues
- Resolved API key handling problems
- Fixed rate limiting edge cases

## Version 1.0.0

### 🚀 Initial Release

#### Core Features
- **OpenAI Compatibility**: Full OpenAI Chat Completions API compatibility
- **Multi-Model Support**: Support for OpenAI, Anthropic, and OpenAI-compatible models
- **Basic Configuration**: YAML-based configuration system
- **Docker Support**: Containerized deployment

#### Basic Features
- **Single Model Routes**: Basic route configuration
- **API Key Management**: Simple API key handling
- **Basic Error Handling**: Standard error responses

## Migration Guide

### Upgrading from v1.5.0 to v2.0.0

#### Configuration Changes

1. **Guardrail Configuration**:
   ```yaml
   # Old format (v1.5.0)
   guardrails:
     - name: content_filter
       type: contains
       where: input
       behavior: block
       values: ["spam", "scam"]
   
   # New format (v2.0.0)
   guardrails:
     - name: content_filter
       type: contains
       where: input
       behavior: block
       parameters:
         values: ["spam", "scam"]
       response_message: "Content blocked"
   ```

2. **Model ID Validation**:
   ```yaml
   # v2.0.0 requires model_id validation
   routes:
     my-route:
       chat_models:
         - model_id: gpt-3.5-turbo  # Must be unique
           model: openai/gpt-3.5-turbo
       guardrails:
         - name: content_check
           type: judge
           parameters:
             judge_config:
               model_id: gpt-3.5-turbo  # Must exist in route
   ```

#### Breaking Changes

1. **Guardrail Parameters**: All guardrail parameters must be wrapped in a `parameters` object
2. **Model ID Validation**: `model_id` in guardrails must exist in the route's models
3. **Response Messages**: Custom response messages are now required for blocked content

#### Migration Steps

1. **Update Configuration**:
   ```bash
   # Backup current configuration
   cp config.yaml config.yaml.backup
   
   # Update guardrail format
   # Wrap parameters in 'parameters' object
   # Add response_message for blocked content
   ```

2. **Test Configuration**:
   ```bash
   # Validate new configuration
   docker run --rm -v $(pwd)/config.yaml:/app/config.yaml \
     radicalbit/ai-gateway:latest --validate-config
   ```

3. **Deploy Update**:
   ```bash
   # Deploy new version
   docker compose down
   docker compose pull
   docker compose up -d
   ```

### Upgrading from v1.0.0 to v1.5.0

#### Configuration Changes

1. **Guardrail Configuration**:
   ```yaml
   # v1.0.0 had no guardrails
   # v1.5.0 introduced basic guardrails
   guardrails:
     - name: content_filter
       type: contains
       where: input
       behavior: block
       values: ["spam", "scam"]
   ```

2. **Load Balancing**:
   ```yaml
   # v1.0.0 had no load balancing
   # v1.5.0 introduced basic load balancing
   balancing:
     algorithm: round_robin
   ```

#### Migration Steps

1. **Add Guardrails** (optional):
   ```yaml
   # Add basic content filtering
   guardrails:
     - name: content_filter
       type: contains
       where: input
       behavior: block
       values: ["spam", "scam"]
   ```

2. **Add Load Balancing** (optional):
   ```yaml
   # Add load balancing for multiple models
   balancing:
     algorithm: round_robin
   ```

3. **Deploy Update**:
   ```bash
   docker compose down
   docker compose pull
   docker compose up -d
   ```

## Support and Compatibility

### Supported Versions

- **v2.0.0**: Current version, full support
- **v1.5.0**: Previous version, security updates only
- **v1.0.0**: Legacy version, no longer supported

### Compatibility Matrix

| Feature | v1.0.0 | v1.5.0 | v2.0.0 |
|---------|--------|--------|--------|
| OpenAI Compatibility | ✅ | ✅ | ✅ |
| Basic Guardrails | ❌ | ✅ | ✅ |
| LLM Judge Guardrails | ❌ | ❌ | ✅ |
| Load Balancing | ❌ | ✅ | ✅ |
| Fallback Mechanisms | ❌ | ✅ | ✅ |
| Rate Limiting | ❌ | ✅ | ✅ |
| Caching | ❌ | ✅ | ✅ |
| Monitoring | ❌ | ✅ | ✅ |

### Upgrade Recommendations

1. **From v1.0.0**: Upgrade to v2.0.0 for full feature set
2. **From v1.5.0**: Upgrade to v2.0.0 for enhanced guardrails and performance
3. **Production**: Always test upgrades in staging environment first

## Next Steps

- **[Installation](./getting-started/installation.md)** - Set up the latest version
- **[Configuration Guide](./configuration/advanced-configuration.md)** - Learn about new features
- **[Best Practices](./best-practices.md)** - Production deployment guidelines
