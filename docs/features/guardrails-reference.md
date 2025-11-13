# Guardrails Reference

Guardrails are rules applied to either the user's `input`, the model's `output`, or both (`io`) to enforce content policies.

## Guardrail Classes

### **Check Guardrails**
These guardrails inspect content. If triggered, they can either:
- **`BLOCK`** the request (raising an error)
- **`SOFT_BLOCK`** the request (returning the response with the error message inside the content)
- **`WARN`** (logging a message and letting the request proceed)

### **Redact Guardrails**
These guardrails modify the content by removing or masking sensitive information.

## Configuration

- **`name`**: A unique, descriptive name for the guardrail.
- **`type`**: The type of check to perform.
- **`where`**: Where to apply the guardrail (`input`, `output`, or `io` for both).
- **`behavior`**: The action to take if the guardrail is triggered.
  - For `Check` types: `block`, `soft_block` or `warn`.
  - `Redact` types do not need a behavior; they always redact.
- **`parameters`**: A dictionary of settings specific to the guardrail type.

## Guardrail Types & Parameters

| Type                     | Description                                                                                                                     | `parameters` Example                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `starts_with`            | Checks if the text starts with a specific string.                                                                               | `values: [ "Hello", "Hi" ]`                                                          |
| `ends_with`              | Checks if the text ends with a specific string.                                                                                 | `values: [ "?", "!" ]`                                                               |
| `contains`               | Checks if the text contains a specific substring.                                                                               | `values: [ "forbidden_word" ]`                                                        |
| `regex`                  | Checks if the text matches a regular expression.                                                                                | `values: [ '\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z\|a-z]{2,}\b' ]`                   |
| `presidio_analyzer`      | A powerful `Check` guardrail that uses Microsoft Presidio to detect Personally Identifiable Information (PII).                    | `language: it`<br/>`entities: [ "EMAIL_ADDRESS", "IBAN_CODE" ]`                       |
| `presidio_anonymizer`    | A powerful `Redact` guardrail that uses Microsoft Presidio to find and mask PII (e.g., replacing an email with `<EMAIL_ADDRESS>`). | `language: it`<br/>`entities: [ "EMAIL_ADDRESS", "IBAN_CODE", "IT_IDENTITY_CARD" ]` |

## Traditional Guardrails

### Starts With
Checks if text starts with specific strings.

```yaml
guardrails:
  - name: greeting_check
    type: starts_with
    where: input
    behavior: warn
    parameters:
      values: ["Hello", "Hi", "Good morning"]
```

### Ends With
Checks if text ends with specific strings.

```yaml
guardrails:
  - name: question_check
    type: ends_with
    where: input
    behavior: soft_block
    parameters:
      values: ["?", "??", "???"]
```

### Contains
Checks if text contains specific substrings.

```yaml
guardrails:
  - name: profanity_filter
    type: contains
    where: input
    behavior: block
    parameters:
      values: ["inappropriate", "offensive", "spam"]
    response_message: "Content blocked due to inappropriate language"
```

### Regex
Checks text against regular expression patterns.

```yaml
guardrails:
  - name: email_detector
    type: regex
    where: input
    behavior: block
    parameters:
      values: ['\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b']
    response_message: "Email addresses are not allowed"
```

## Presidio Guardrails

### Presidio Analyzer
Detects PII entities in content.

```yaml
guardrails:
  - name: pii_detector
    type: presidio_analyzer
    where: input
    behavior: block
    parameters:
      language: en
      entities: ["EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD"]
    response_message: "Personal information detected and blocked"
```

### Presidio Anonymizer
Anonymizes PII entities by replacing them with placeholders.

```yaml
guardrails:
  - name: pii_anonymizer
    type: presidio_anonymizer
    where: io
    behavior: warn
    parameters:
      language: en
      entities: ["EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD"]
```

## LLM Judge Guardrails

### Judge
In-depth evaluation for critical decisions.

```yaml
guardrails:
  - name: toxicity_judge
    type: judge
    where: input
    behavior: block
    response_message: "🚨 Toxic content detected and blocked"
    parameters:
      prompt_ref: "toxicity_check.md"
      model_id: "gpt-4o-mini"
      temperature: 0.0
      max_tokens: 100
```

## Best Practices

### 1. Layer Defense
Use multiple guardrail types together for comprehensive protection:

```yaml
guardrails:
  - name: basic_filter
    type: contains
    where: input
    behavior: warn
    parameters:
      values: ["spam", "scam"]
  
  - name: pii_detector
    type: presidio_analyzer
    where: input
    behavior: block
    parameters:
      language: en
      entities: ["EMAIL_ADDRESS", "PHONE_NUMBER"]
  
  - name: toxicity_judge
    type: judge
    where: input
    behavior: block
    parameters:
      prompt_ref: "toxicity_check.md"
      model_id: "gpt-4o-mini"

```

### 2. Appropriate Behavior Selection
- **`block`**: For critical violations (PII, toxic content)
- **`soft_block`**: For policy violations that need user feedback
- **`warn`**: For monitoring and logging purposes

### 3. Performance Considerations
- Use traditional guardrails for fast filtering
- Use LLM judge guardrails for complex analysis
- Apply guardrails at the appropriate `where` point

### 4. Testing
Always test guardrails with various inputs to ensure they work as expected:

```bash
# Test with clean input
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "test-route",
    "messages": [{"role": "user", "content": "Hello, how are you?"}]
  }'

# Test with blocked content
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "test-route",
    "messages": [{"role": "user", "content": "This is spam content"}]
  }'
```

## Monitoring

Track guardrail performance through metrics:

- **`gateway_guardrails_triggered_total`**: Number of times each guardrail was triggered
- **`gateway_guardrails_duration_milliseconds`**: Processing time for each guardrail
- **`gateway_guardrails_blocked_total`**: Number of requests blocked by guardrails

## Next Steps

- **[Configuration Guide](../configuration/advanced-configuration.md)** - Complete configuration reference
- **[API Reference](../api-reference/endpoints.md)** - API documentation
- **[Monitoring](../monitoring.md)** - Set up observability
