## Summary

Complete docs overhaul: removes Docusaurus template leftovers, restructures content around new concepts (Projects, Access Control), and rewrites reference pages from bloated filler to concise, accurate content.

### New content

- **Access Control** (enterprise) — 3 new pages covering RBAC (Admin/Builder/Auditor roles), Keycloak IDP plugin, OIDC SSO plugin, JWT token auth, and sync operations
- **Projects** — new page documenting the project lifecycle (Create → Load → Approve → Serve), multi-project support, and `project-name/route-name` model format
- **Quick Start** — new single-page getting started guide replacing the old multi-step flow
- **Fallback** — moved from configuration to features section, expanded with embedding fallback, mixed config, validation rules, and monitoring

### Restructured content

- **Sidebar** — flattened navigation: Quick Start → Concepts → Config → Features → Operations → Deploy → Secrets → Access Control → Examples → Best Practices → API Reference → Reference
- **Basic Setup** — rewritten around project lifecycle, added AI config generator docs, model param now `project-name/route-name`
- **Models** — added provider-specific sections (Anthropic, DeepSeek, Mistral, Azure OpenAI, OpenAI-compatible endpoints), removed verbose examples, updated outdated `gpt-3.5-turbo` references
- **Basic Concepts** — added Projects as first-class concept, updated route naming, added `budget_limiting` and `routing` to feature list

### Rewrites (cut filler, kept substance)

- **About** — 205 → 58 lines of concrete capability description
- **Enterprise** — 114 → 46 lines with actual Access Control and Secrets Management details
- **Contributing** — 290 → 21 lines
- **Privacy Policy** — 235 → 7 lines of accurate statement (removed hallucinated config examples)
- **Terms of Service** — 249 → 7 lines (removed fictional legal text)

### Cleanup

- Deleted `tutorial-basics/` and `tutorial-extras/` (Docusaurus template leftovers)
- Port updated `8000` → `9000` across all docs
- Enterprise badge styling with dark mode support
- Minor consistency fixes across features, operations, and secrets management pages

## Test plan

- [ ] `npm run build` passes with no broken links
- [ ] Sidebar renders correctly with new structure
- [ ] Enterprise badges display properly in light and dark mode
- [ ] All internal doc links resolve correctly
- [ ] No references to deleted tutorial-basics/tutorial-extras pages
