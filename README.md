# Helm Charts Repository

This repository contains a collection of Helm charts for various applications:

- **common**: Library chart with shared templates and functionality
- **laravel**: Helm chart for Laravel applications
- **react**: Helm chart for React applications
- **wordpress-bedrock**: Helm chart for WordPress using Bedrock structure
- **yii2**: Helm chart for Yii2 applications

## Common Chart

The common chart is a library chart that provides shared templates and functionality for all other charts. It currently includes:

- **Redis**: Centralized Redis configuration that can be used by all charts

## Using the Helm Repository

The Helm charts in this repository are published to GitHub Pages, making them easily installable using the Helm CLI.

### Add the Repository

```bash
helm repo add my-repo https://[GITHUB_USERNAME].github.io/helm_charts
helm repo update
```

Replace `[GITHUB_USERNAME]` with your GitHub username or organization name.

### Install a Chart

```bash
# Install the Laravel chart
helm install my-laravel my-repo/laravel

# Install the React chart
helm install my-react my-repo/react

# Install the WordPress Bedrock chart
helm install my-wordpress my-repo/wordpress-bedrock

# Install the Yii2 chart
helm install my-yii2 my-repo/yii2
```

## Chart Documentation

Each chart includes its own documentation in its respective directory:

- [Laravel Chart](./laravel/README.md)
- [React Chart](./react/README.md)
- [WordPress Bedrock Chart](./wordpress-bedrock/README.md)
- [Yii2 Chart](./yii2/README.md)

## Redis Configuration

All charts now use a centralized Redis configuration from the common chart. To enable Redis in any chart, set the following in your values.yaml or with --set:

```yaml
redis:
  enabled: true
  # Other Redis configuration options...
```

## GitHub Actions Workflow

This repository uses GitHub Actions to automatically package and publish the Helm charts to GitHub Pages. The workflow is triggered when changes are pushed to the main branch or manually through the GitHub Actions UI.

The workflow:
1. Packages all Helm charts in the repository
2. Creates or updates the Helm repository index
3. Publishes the charts to the gh-pages branch

## Contributing

To contribute to this repository:

1. Fork the repository
2. Create a new branch for your changes
3. Make your changes to the chart(s)
4. Submit a pull request

When adding a new chart or updating an existing one, please ensure:
- The chart follows Helm best practices
- The chart includes proper documentation
- The chart has been tested locally using `helm template` and `helm install`

## License

This project is licensed under the MIT License - see the LICENSE file for details.
