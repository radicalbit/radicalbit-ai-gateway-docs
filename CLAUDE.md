# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Public documentation site for the Radicalbit AI Gateway, built with **Docusaurus 3.9.2** (TypeScript + React 19). Deploys as a static site to GitHub Pages at `https://docs.ai-gateway.radicalbit.ai`.

## Commands

- `npm start` — local dev server with hot reload
- `npm run build` — build static site to `./build`
- `npm run typecheck` — TypeScript type checking
- `npm run clear` — clear Docusaurus cache
- `npm run deploy` — deploy to GitHub Pages

## Architecture

- **docs/** — all documentation content as Markdown files with frontmatter. Organized into subdirectories: `getting-started/`, `configuration/`, `features/`, `api-reference/`, `operations/`, `deployment/`, `troubleshooting/`, `reference/`.
- **sidebars.ts** — defines the sidebar navigation structure and doc ordering. When adding/removing docs, update this file.
- **docusaurus.config.ts** — main site config (URL, navbar, footer, themes, plugins). Docs are served at the root (`routeBasePath: '/'`), not under `/docs/`.
- **src/components/** — custom React components (e.g., `HomepageFeatures`). Uses CSS Modules for styling.
- **src/css/custom.css** — global styles and Radicalbit brand colors/fonts.
- **static/** — static assets (images, logos, example configs). Files here are copied as-is to the build output.

## Key Configuration Details

- Mermaid diagrams are enabled (`@docusaurus/theme-mermaid`) — use fenced `mermaid` code blocks in docs.
- Broken links are set to `warn` (not `throw`), so builds won't fail on broken links.
- Docusaurus v4 future compatibility flag is enabled.
- CI/CD: `.github/workflows/docs-workflow.yml` builds and deploys on push to `main` (Node.js 20).

## Content Guidelines

- Use clear, non-technical language focused on business value and use cases.
- Include practical examples and configurations.
- Do not expose private implementation details or source code of the AI Gateway product.
- Use diagrams and visual explanations when helpful.
