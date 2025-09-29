# GitHub Pages Deployment

This repository is configured to automatically deploy documentation to GitHub Pages.

## Automatic Deployment

The documentation is automatically deployed when:

1. Changes are pushed to the `main` branch
2. The GitHub Action workflow completes successfully
3. The build process generates static files

## Manual Deployment

To manually deploy:

```bash
npm run deploy
```

## Configuration

The deployment is configured in:

- **GitHub Action**: `.github/workflows/deploy.yml`
- **Docusaurus Config**: `docusaurus.config.ts`
- **Package Scripts**: `package.json`

## Environment Variables

Required environment variables:

- `GITHUB_TOKEN`: Automatically provided by GitHub Actions
- `MAIN_REPO_TOKEN`: For syncing content from main repository

## Custom Domain

To use a custom domain:

1. Add your domain to the `CNAME` file in `static/`
2. Configure DNS settings
3. Update the `url` field in `docusaurus.config.ts`

## Troubleshooting

### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review build logs for specific errors

### Deployment Issues
- Ensure GitHub Pages is enabled
- Check repository permissions
- Verify workflow file syntax

### Content Sync Issues
- Verify main repository access
- Check sync workflow configuration
- Review content file paths