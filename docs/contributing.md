# Contributing

Thank you for your interest in contributing to the Radicalbit AI Gateway! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Issues

If you find a bug or have a feature request, please create an issue on our GitHub repository:

1. **Bug Reports**: Include steps to reproduce, expected behavior, and actual behavior
2. **Feature Requests**: Describe the feature, its use case, and potential implementation
3. **Documentation Issues**: Report typos, unclear sections, or missing information

### Code Contributions

We welcome code contributions! Please follow these steps:

1. **Fork the Repository**: Create your own fork of the repository
2. **Create a Branch**: Create a feature branch for your changes
3. **Make Changes**: Implement your changes with proper tests
4. **Test Your Changes**: Ensure all tests pass and add new tests if needed
5. **Submit a Pull Request**: Create a pull request with a clear description

## Development Setup

### Prerequisites

- Python 3.8+
- Docker and Docker Compose
- Git

### Local Development

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/radicalbit/radicalbit-ai-gateway.git
   cd radicalbit-ai-gateway
   ```

2. **Set Up Development Environment**:
   ```bash
   cd gateway
   uv sync
   source .venv/bin/activate
   ```

3. **Run Tests**:
   ```bash
   pytest
   ```

4. **Start Development Server**:
   ```bash
   radicalbit-ai-gateway serve -c config.yaml
   ```

### Docker Development

1. **Build Development Image**:
   ```bash
   docker build -t radicalbit-ai-gateway:dev .
   ```

2. **Run with Docker Compose**:
   ```bash
   docker compose up --build
   ```

## Code Style and Standards

### Python Code Style

We follow PEP 8 and use the following tools:

- **Black**: Code formatting
- **isort**: Import sorting
- **flake8**: Linting
- **mypy**: Type checking

```bash
# Format code
black .

# Sort imports
isort .

# Check linting
flake8 .

# Type checking
mypy .
```

### Documentation Style

- Use clear, concise language
- Include code examples
- Follow the existing documentation structure
- Use proper markdown formatting

### Commit Messages

Use conventional commit messages:

```
feat: add new guardrail type
fix: resolve configuration validation issue
docs: update API documentation
test: add unit tests for guardrails
refactor: improve error handling
```

## Testing Guidelines

### Unit Tests

Write unit tests for new features:

```python
def test_guardrail_validation():
    """Test guardrail configuration validation."""
    config = {
        "name": "test_guardrail",
        "type": "contains",
        "where": "input",
        "behavior": "block",
        "parameters": {
            "values": ["spam", "scam"]
        }
    }
    
    guardrail = GuardrailConfig(**config)
    assert guardrail.name == "test_guardrail"
    assert guardrail.type == GuardrailType.CONTAINS
```

### Integration Tests

Write integration tests for complex features:

```python
def test_guardrail_execution():
    """Test guardrail execution with real requests."""
    gateway = GatewayRoute(config)
    response = gateway.process_request({
        "model": "test-route",
        "messages": [{"role": "user", "content": "spam content"}]
    })
    
    assert response.status_code == 400
    assert "Content blocked" in response.json()["error"]["message"]
```

### Performance Tests

Add performance tests for critical paths:

```python
def test_guardrail_performance():
    """Test guardrail performance under load."""
    start_time = time.time()
    
    for _ in range(1000):
        gateway.process_request(test_request)
    
    end_time = time.time()
    assert (end_time - start_time) < 10.0  # Should complete in under 10 seconds
```

## Pull Request Process

### Before Submitting

1. **Ensure Tests Pass**: Run all tests and ensure they pass
2. **Update Documentation**: Update relevant documentation
3. **Check Code Style**: Run formatting and linting tools
4. **Test Your Changes**: Test your changes thoroughly

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and checks
2. **Code Review**: Team members review the code
3. **Testing**: Changes are tested in staging environment
4. **Approval**: Maintainer approves the pull request
5. **Merge**: Changes are merged into main branch

## Documentation Contributions

### Types of Documentation

- **API Documentation**: Endpoint descriptions and examples
- **Configuration Guides**: Setup and configuration instructions
- **Tutorials**: Step-by-step guides for common tasks
- **Best Practices**: Production deployment and optimization guides

### Documentation Standards

- Use clear, concise language
- Include practical examples
- Follow the existing structure
- Test all code examples

### Updating Documentation

1. **Identify the Section**: Find the relevant documentation section
2. **Make Changes**: Update the content with your changes
3. **Test Examples**: Ensure all code examples work
4. **Submit PR**: Create a pull request with documentation changes

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow community standards

### Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **Discussions**: For questions and general discussion
- **Pull Requests**: For code contributions

### Recognition

Contributors are recognized in:
- **README**: List of contributors
- **Changelog**: Credit for contributions
- **Release Notes**: Acknowledgment of major contributions

## Release Process

### Version Numbering

We use semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

1. **Update Version**: Update version numbers
2. **Update Changelog**: Document all changes
3. **Run Tests**: Ensure all tests pass
4. **Build Images**: Build Docker images
5. **Create Release**: Create GitHub release
6. **Update Documentation**: Update documentation

## License

By contributing to the Radicalbit AI Gateway, you agree that your contributions will be subject to the commercial licensing terms of the project. For detailed licensing information, please contact our commercial team:

- **Email**: sales@radicalbit.ai
- **Website**: https://radicalbit.com

See our [Enterprise](../enterprise.md) page for detailed commercial licensing options.

## Next Steps

- **[Installation](./getting-started/installation.md)** - Set up your development environment
- **[Configuration Guide](./configuration/advanced-configuration.md)** - Learn about configuration options
- **[API Reference](./api-reference/endpoints.md)** - Understand the API
- **[Best Practices](./best-practices.md)** - Follow development best practices
