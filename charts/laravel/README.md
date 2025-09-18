# Laravel Helm Chart

This Helm chart deploys a Laravel application with PHP-FPM, Nginx and optional Redis support.

## Features

- **Laravel Application**: PHP-FPM container with Laravel application
- **Web Server**: Nginx container for serving static files and proxying PHP requests
- **Database Integration**: Automatic database provisioning with DB Operator
- **Cache**: Optional Redis cache
- **Queue Workers**: Optional Laravel queue workers
- **Cron Jobs**: Laravel scheduler and custom cron jobs
- **Migration Job**: Automated database migrations with ArgoCD PreSync hooks

## Database Integration (DB Operator)

This chart supports automatic database provisioning using the [DB Operator](https://github.com/db-operator/db-operator). When enabled, the chart will:

1. Create a Database CRD that the DB Operator will process
2. Automatically generate database credentials in a Kubernetes secret
3. Mount the credentials as environment variables in your Laravel containers

### Configuration

Enable database integration in your `values.yaml`:

```yaml
database:
  enabled: true
  instance: "my-mysql-cluster"     # Name of your MySQL database cluster
  name: "laravel_app"              # Name of the database to create
  deletionProtected: true          # Protect against accidental deletion
```

### Environment Variables

When database integration is enabled, the following environment variables are automatically available in your Laravel containers:

- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_DATABASE` - Database name
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password

### Custom Secret Templates

You can customize the generated secret using `secretsTemplates`:

```yaml
database:
  enabled: true
  instance: "my-mysql-cluster"
  name: "laravel_app"
  # secretsTemplates are pre-configured for MySQL compatibility
  # You can override them if needed:
  # secretsTemplates:
  #   DB_HOST: "{{ .DatabaseHost }}"
  #   DB_PORT: "{{ .DatabasePort }}"
  #   DB_DATABASE: "{{ .DatabaseName }}"
  #   DB_USERNAME: "{{ .UserName }}"
  #   DB_PASSWORD: "{{ .Password }}"
  #   CUSTOM_DSN: "mysql://{{ .UserName }}:{{ .Password }}@{{ .DatabaseHost }}:{{ .DatabasePort }}/{{ .DatabaseName }}"
```

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

## Examples

### Basic Laravel Application with Database

```yaml
database:
  enabled: true
  instance: "production-mysql"
  name: "my_laravel_app"

laravel:
  env:
    APP_NAME: "My Laravel App"
    APP_ENV: production
    APP_DEBUG: "false"

migrationJob:
  enabled: true
```

### With Redis Cache

```yaml
database:
  enabled: true
  instance: "production-mysql"
  name: "my_laravel_app"

redis:
  enabled: true
  auth:
    enabled: true
    password: "my-redis-password"

laravel:
  env:
    CACHE_DRIVER: redis
    SESSION_DRIVER: redis
```

### With Queue Workers

```yaml
database:
  enabled: true
  instance: "production-postgres"
  name: "my_laravel_app"

queueWorkers:
  enabled: true
  workers:
    - name: default
      replicas: 2
      connection: database
      queue: default
```

## Requirements

- Kubernetes 1.19+
- Helm 3.0+
- DB Operator (if using database integration)
- ArgoCD (optional, for hook functionality)
