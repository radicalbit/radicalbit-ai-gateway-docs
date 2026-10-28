---
name: update-docs-from-pr
description: >
  Updates the AI Gateway documentation site based on a pull request from the gateway repo
  (radicalbit/radicalbit-ai-gateway). Use this skill whenever the user gives you a PR number
  and wants the docs updated, or asks to "document PR #X", "write docs for PR", "update docs
  from the gateway PR", or anything involving translating gateway code changes into documentation.
  Also trigger when the user mentions a PR number in the context of this docs repo.
---

# Update Docs from Gateway PR

You are updating the Radicalbit AI Gateway documentation site based on changes from a pull request
in the gateway source repo (`radicalbit/radicalbit-ai-gateway`).

## Step 1: Fetch the PR

Use `gh` to get the PR details and diff from the **gateway repo**:

```bash
gh pr view <PR_NUMBER> --repo radicalbit/radicalbit-ai-gateway --json title,body,files,labels
gh pr diff <PR_NUMBER> --repo radicalbit/radicalbit-ai-gateway
```

Read the PR title, description, and full diff carefully. Understand what changed and why.

## Step 2: Classify the change

Determine what kind of documentation update is needed:

- **New feature** (new routing strategy, guardrail type, caching mode, API endpoint, etc.) → may need a new doc page or a new section in an existing page
- **Behavior change or enhancement** to an existing feature → update the relevant existing doc page
- **New configuration options** → update configuration docs with new YAML fields/examples
- **Bug fix** with user-facing impact → update troubleshooting or relevant feature docs
- **API changes** → update `docs/api-reference/endpoints.md`

## Step 3: Read the relevant existing docs

Before writing anything, read the doc files you plan to modify. The docs live in:

- `docs/features/` — feature documentation (guardrails, caching, rate-limiting, etc.)
- `docs/configuration/` — setup and config guides (basic-setup, advanced-configuration, models, load-balancing, fallback)
- `docs/api-reference/` — API endpoint docs
- `docs/operations/` — monitoring, telemetry
- `docs/getting-started/` — installation guide
- `docs/troubleshooting/` — common issues, FAQ
- `docs/deployment/` — production deployment

Also read `sidebars.ts` — you'll need to update it if you create a new page.

## Step 4: Write the documentation

Follow the existing conventions strictly:

### Structure of a feature doc

```markdown
# Feature Name

Brief intro sentence about what this page covers.

## Overview

2-3 paragraphs explaining the feature, its purpose, and business value.

---

## Configuration

YAML code block examples showing how to configure the feature.

---

## Best Practices

- Bullet points with practical advice

---

## Troubleshooting

### Common Issues

1. **Issue name**: Solution

---

## Next Steps

- **[Related Feature](../path/file.md)** — Brief description
```

### Formatting conventions

- **Admonitions**: Use `:::tip`, `:::warning`, `:::info` for callouts
- **Code blocks**: Use `yaml`, `python`, `bash`, `json` language tags
- **YAML examples**: Show complete, working configuration snippets. Use placeholder values like `<YOUR_API_KEY>` for secrets
- **Mermaid diagrams**: Use fenced `mermaid` blocks for flow/architecture diagrams when they help explain a concept. Use `graph LR` or `graph TD`
- **Tables**: Use markdown tables for comparing options or listing config fields
- **Bold** for field names, feature names, and important terms
- **Backticks** for code references: config keys, model names, file paths
- **Horizontal rules** (`---`) to separate major sections
- **Internal links**: Relative paths like `../configuration/basic-setup.md`

### Writing style

- Clear, non-technical language focused on business value and use cases
- Explain what the feature does and why a user would want it before diving into configuration
- Include practical examples — show real YAML config, not just describe fields
- Do NOT expose internal implementation details or source code from the gateway repo
- The documentation is for users of the gateway, not developers of it

### Tabs for variants

When a feature has multiple variants (e.g., different cache backends), use the Docusaurus Tabs component:

```markdown
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="variant1" label="Variant 1" default>
    Content here
  </TabItem>
  <TabItem value="variant2" label="Variant 2">
    Content here
  </TabItem>
</Tabs>
```

## Step 5: Update sidebars (if needed)

If you created a new doc page, add it to `sidebars.ts` in the appropriate category. Follow the existing pattern:

```typescript
{
  type: 'category',
  label: 'Features',
  items: [
    'features/existing-feature',
    'features/your-new-feature',  // Add here
  ],
},
```

## Step 6: Verify

After making changes:
1. Run `npm run build` to check for broken links or build errors
2. Review your changes — do they match the style of surrounding docs?
3. Present a summary of what you changed and why
