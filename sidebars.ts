import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    // ── Entry point ──────────────────────────────────────────────────────────
    'intro',

    // ── First action: install, then get something running ────────────────────
    {
      type: 'doc',
      id: 'getting-started/installation',
      label: 'Installation',
    },
    {
      type: 'doc',
      id: 'quick-start',
      label: 'Quick Start',
    },

    // ── Understand the system ────────────────────────────────────────────────
    {
      type: 'doc',
      id: 'basic-concepts',
      label: 'Basic Concepts',
    },

    // ── Configure (models + routes — the minimum viable config) ─────────────
    {
      type: 'category',
      label: 'Configuration',
      items: [
        'configuration/basic-setup',
        'configuration/projects',
        'configuration/models',
        'configuration/advanced-configuration',
      ],
    },

    // ── Optional features layered on top ─────────────────────────────────────
    {
      type: 'category',
      label: 'Features',
      items: [
        'features/guardrails',
        'features/caching',
        'features/semantic-caching',
        'features/rate-limiting',
        'features/token-limiting',
        'features/budget-limiting',
        'features/fallback',
        'features/advanced-routing',
        'features/mcp',
      ],
    },

    // ── Cross-cutting request metadata ───────────────────────────────────────
    {
      type: 'doc',
      id: 'tags',
      label: 'Tags',
    },

    // ── Operate ──────────────────────────────────────────────────────────────
    {
      type: 'category',
      label: 'Operations',
      items: [
        'operations/monitoring',
        'operations/telemetry',
      ],
    },

    // ── Deploy to production ─────────────────────────────────────────────────
    {
      type: 'category',
      label: 'Deployment',
      items: [
        'deployment/production',
      ],
    },

    // ── Secrets Management ───────────────────────────────────────────────────
    {
      type: 'category',
      label: 'Secrets Management',
      items: [
        'deployment/secrets-management/index',
        'deployment/secrets-management/aws-secrets-manager',
        'deployment/secrets-management/hashicorp-vault',
        'deployment/secrets-management/gcp-secret-manager',
        'deployment/secrets-management/azure-key-vault',
        'deployment/secrets-management/custom-plugin',
      ],
    },

    // ── Enterprise: identity & access ────────────────────────────────────────
    {
      type: 'category',
      label: 'Access Control',
      items: [
        'access-control/index',
        'access-control/keycloak-idp',
        'access-control/oidc',
      ],
    },

    // ── Integrate with your stack ────────────────────────────────────────────
    {
      type: 'doc',
      id: 'getting-started/examples',
      label: 'Framework Examples',
    },

    // ── Do it well ───────────────────────────────────────────────────────────
    {
      type: 'doc',
      id: 'best-practices',
      label: 'Best Practices',
    },

    // ── Reference ────────────────────────────────────────────────────────────
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api-reference/endpoints',
      ],
    },
    {
      type: 'category',
      label: 'Troubleshooting',
      items: [
        'troubleshooting/common-issues',
        'troubleshooting/faq',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/about',
        'reference/contacts',
        'reference/enterprise',
        'reference/privacy-policy',
        'reference/terms-of-service',
        'reference/contributing',
      ],
    },
  ],
};

export default sidebars;
