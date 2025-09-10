# Laravel Helm Chart

This Helm chart deploys a Laravel application with PHP-FPM, Nginx, MySQL, and optional Redis support.

## Features

- **Laravel Application**: PHP-FPM container with Laravel application
- **Web Server**: Nginx container for serving static files and proxying PHP requests
- **Database**: MySQL database with persistent storage
- **Cache**: Optional Redis cache
- **Queue Workers**: Optional Laravel queue workers
- **Cron Jobs**: Laravel scheduler and custom cron jobs
- **Migration Job**: Automated database migrations with ArgoCD PreSync hooks

## Migration Job

The chart includes an automated migration job that runs Laravel database migrations before the main application deployment. This is particularly useful when using ArgoCD for GitOps deployments.

### ArgoCD Integration

The migration job uses ArgoCD hooks to ensure migrations run at the correct time:

```yaml
migrationJob:
  enabled: true
  hook:
    enabled: true
    phase: PreSync  # Runs before the main deployment
    deletePolicy: BeforeHookCreation  # Cleans up previous migration jobs
```

### Configuration

You can configure the migration job in your `values.yaml`:

```yaml
migrationJob:
  enabled: true
  hook:
    enabled: true
    phase: PreSync
    deletePolicy: BeforeHookCreation
  command: "php artisan migrate --force"
  resources:
    limits:
      cpu: 1000m
      memory: 1Gi
    requests:
      cpu: 500m
      memory: 512Mi
  backoffLimit: 3
  activeDeadlineSeconds: 600
  restartPolicy: Never
```

### How it works

1. **PreSync Phase**: When ArgoCD starts a sync, the migration job runs first
2. **Application Files**: The job copies Laravel application files from the data container
3. **Database Connection**: Uses the same database configuration as the main application
4. **Migration Execution**: Runs `php artisan migrate --force` (or custom command)
5. **Cleanup**: ArgoCD removes the job after completion based on the delete policy

### Customizing Migration Commands

You can customize the migration command:

```yaml
migrationJob:
  command: "php artisan migrate --force && php artisan db:seed --force"
```

Or run multiple commands:

```yaml
migrationJob:
  command: |
    php artisan migrate --force
    php artisan cache:clear
    php artisan config:cache
```

### Disabling the Migration Job

To disable the migration job:

```yaml
migrationJob:
  enabled: false
```

### Disabling ArgoCD Hooks

If you're not using ArgoCD, you can disable the hooks and the job will run as a regular Kubernetes Job:

```yaml
migrationJob:
  enabled: true
  hook:
    enabled: false
```

## Installation

```bash
helm install my-laravel-app ./laravel
```

## Configuration

See `values.yaml` for all available configuration options.

## Requirements

- Kubernetes 1.19+
- Helm 3.0+
- ArgoCD (optional, for hook functionality)
