# Support

This page provides information about getting support for the Radicalbit AI Gateway.

## Getting Help

### Documentation

The first place to look for help is our comprehensive documentation:

- **[Getting Started](./getting-started/installation.md)** - Installation and basic setup
- **[Configuration Guide](./configuration/advanced-configuration.md)** - Complete configuration reference
- **[Configuration Examples](./configuration/examples.md)** - Practical configuration examples
- **[Guardrails](./features/guardrails.md)** - Content safety implementation
- **[API Reference](./api-reference/endpoints.md)** - Complete API documentation
- **[Monitoring](./monitoring.md)** - Observability and metrics setup
- **[Best Practices](./best-practices.md)** - Production guidelines
- **[Production Deployment](./deployment/production.md)** - Production deployment guide
- **[FAQ](./faq.md)** - Frequently asked questions

### Community Support

#### GitHub Issues

For bug reports, feature requests, and general questions:

1. **Search Existing Issues**: Check if your question has already been answered
2. **Create a New Issue**: Use the appropriate issue template
3. **Provide Details**: Include configuration, logs, and steps to reproduce

**Issue Types:**
- **Bug Report**: Something isn't working as expected
- **Feature Request**: Suggest a new feature or improvement
- **Documentation**: Report documentation issues or request improvements
- **Question**: Ask for help or clarification

#### GitHub Discussions

For general discussion, questions, and community support:

- **General Discussion**: Ask questions and share experiences
- **Ideas**: Discuss potential features and improvements
- **Q&A**: Get help from the community
- **Show and Tell**: Share your implementations and use cases

### Professional Support

#### Enterprise Support

For enterprise customers, we offer:

- **Priority Support**: Faster response times
- **Direct Access**: Direct communication with our team
- **Custom Solutions**: Tailored implementations
- **Training**: Custom training sessions
- **Consulting**: Architecture and implementation consulting

#### Contact Information

- **Email**: support@radicalbit.com
- **Website**: https://radicalbit.com
- **GitHub**: https://github.com/radicalbit/radicalbit-ai-gateway

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the problem
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Configuration**: Relevant configuration files (remove sensitive data)
6. **Logs**: Error logs and stack traces
7. **Environment**: OS, Docker version, Python version, etc.

**Example Bug Report:**
```markdown
## Bug Description
The gateway returns a 500 error when processing requests with certain guardrail configurations.

## Steps to Reproduce
1. Configure a guardrail with type 'judge'
2. Set model_id to a non-existent model
3. Send a request to the route
4. Observe 500 error

## Expected Behavior
The gateway should return a 400 error with a descriptive message about the invalid model_id.

## Actual Behavior
The gateway returns a 500 internal server error.

## Configuration
```yaml
routes:
  test-route:
    chat_models:
      - model_id: gpt-3.5-turbo
        model: openai/gpt-3.5-turbo
    guardrails:
      - invalid-judge

guardrails:
  - name: invalid-judge
    type: judge
    parameters:
      model_id: non-existent-model  # This model doesn't exist
        
```

## Logs
```
ERROR: Internal server error
Traceback (most recent call last):
  File "gateway.py", line 123, in process_request
    raise ValueError("Model not found")
```

## Environment
- OS: Ubuntu 20.04
- Docker: 20.10.7
- Python: 3.9.5
```

### Feature Requests

When requesting features, please include:

1. **Description**: Clear description of the feature
2. **Use Case**: Why this feature is needed
3. **Proposed Solution**: How you think it should work
4. **Alternatives**: Other ways to achieve the same goal
5. **Additional Context**: Any other relevant information

**Example Feature Request:**
```markdown
## Feature Description
Add support for custom guardrail types that can be defined by users.

## Use Case
We need to implement custom content filtering logic that isn't covered by existing guardrail types. This would allow us to integrate with our existing content moderation systems.

## Proposed Solution
Add a new guardrail type 'custom' that allows users to specify:
- Custom validation logic
- External API endpoints for validation
- Custom response handling

## Alternatives
- Extend existing guardrail types
- Use LLM judge guardrails with custom prompts
- Implement custom middleware

## Additional Context
This would be particularly useful for enterprise customers who have existing content moderation systems they want to integrate.
```

## Contributing

### Code Contributions

We welcome code contributions! See our [Contributing Guide](./contributing.md) for details on:

- Development setup
- Code style and standards
- Testing guidelines
- Pull request process

### Documentation Contributions

Help improve our documentation by:

- Reporting typos or unclear sections
- Adding examples and use cases
- Improving existing guides
- Creating new documentation

### Community Contributions

Other ways to contribute:

- Answer questions in GitHub Discussions
- Help test new features
- Share your use cases and implementations
- Provide feedback on proposals

## Training and Consulting

### Training Services

We offer training services for:

- **Basic Usage**: Getting started with the gateway
- **Advanced Configuration**: Complex setups and optimization
- **Production Deployment**: Enterprise deployment strategies
- **Custom Development**: Building custom integrations

### Consulting Services

Our consulting services include:

- **Architecture Review**: Review your AI infrastructure
- **Implementation Planning**: Plan your gateway deployment
- **Performance Optimization**: Optimize your configuration
- **Custom Development**: Build custom features and integrations

### Contact for Services

- **Email**: consulting@radicalbit.com
- **Website**: https://radicalbit.com/services
- **Schedule**: https://calendly.com/radicalbit-consulting

## Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please:

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow community standards

### Getting Started

1. **Read the Documentation**: Start with our comprehensive guides
2. **Join the Community**: Participate in GitHub Discussions
3. **Ask Questions**: Don't hesitate to ask for help
4. **Share Knowledge**: Help others with your experience

## Next Steps

- **[Getting Started](./getting-started/installation.md)** - Set up your first gateway instance
- **[Configuration Examples](./configuration/examples.md)** - See practical examples
- **[FAQ](./faq.md)** - Check frequently asked questions
- **[Contributing](./contributing.md)** - Learn how to contribute
- **[Best Practices](./best-practices.md)** - Follow production guidelines
