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
    {
      type: 'doc',
      id: 'basic-concepts',
      label: 'Basic Concepts',
    },
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
        'configuration/advanced-configuration',
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
        'features/semantic-caching',
        'configuration/load-balancing',
        'configuration/fallback',
      ],
    },
    {
      type: 'category',
      label: 'Operations',
      items: [
        'operations/monitoring',
        'operations/telemetry',
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
        'troubleshooting/faq',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/contacts',
      ],
    },
  ],
};

export default sidebars;
