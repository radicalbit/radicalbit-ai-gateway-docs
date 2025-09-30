import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    'technical-overview',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
      ],
    },
    {
      type: 'category',
      label: 'Configuration',
      items: [
        'configuration/basic-setup',
        'configuration/models',
        'configuration/advanced-configuration',
        'configuration/examples',
      ],
    },
    {
      type: 'category',
      label: 'Features',
      items: [
        'features/guardrails',
        'features/guardrails-reference',
        'features/caching',
        'features/rate-limiting',
        'features/budget-limiting',
        'configuration/load-balancing',
        'configuration/fallback',
      ],
    },
    {
      type: 'category',
      label: 'Operations',
      items: [
        'monitoring',
        'best-practices',
      ],
    },
    {
      type: 'category',
      label: 'Deployment',
      items: [
        'deployment/production',
      ],
    },
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
        'faq',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'about',
        'enterprise',
        'changelog',
        'roadmap',
        'contributing',
        'support',
        'privacy-policy',
        'terms-of-service',
      ],
    },
  ],
};

export default sidebars;
