# Yii2 Helm Chart

This Helm chart deploys a Yii2 application on Kubernetes.

## Introduction

This chart bootstraps a Yii2 application deployment on a Kubernetes cluster using the Helm package manager. It includes:

- PHP-FPM container for running Yii2 application
- Nginx container for serving the application
- Database integration with DB Operator for automatic database provisioning
- Optional Redis cache
- Queue workers for background job processing
- Cron jobs for scheduled tasks
- Support for environment variables and secrets

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+
- DB Operator (if using database integration)

## Installing the Chart

To install the chart with the release name `my-release`:

```bash
$ helm install my-release ./yii2
```

## Configuration

The following table lists the configurable parameters of the Yii2 chart and their default values.

### Database Integration (DB Operator)

This chart supports automatic database provisioning using the [DB Operator](https://github.com/db-operator/db-operator). When enabled, the chart will:

1. Create a Database CRD that the DB Operator will process
2. Automatically generate database credentials in a Kubernetes secret
3. Mount the credentials as environment variables in your Yii2 containers

#### Configuration

Enable database integration in your `values.yaml`:

```yaml
database:
  enabled: true
  instance: "my-postgres-cluster"  # Name of your database cluster
  name: "yii2_app"                 # Name of the database to create
  deletionProtected: true          # Protect against accidental deletion
```

#### Environment Variables

When database integration is enabled, the following environment variables are automatically available in your Yii2 containers:

- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_DATABASE` - Database name
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password

#### Custom Secret Templates

You can customize the generated secret using `secretsTemplates`:

```yaml
database:
  enabled: true
  instance: "my-postgres-cluster"
  name: "yii2_app"
  secretsTemplates:
    PASSWORD_USER: "{{ .Password }}_{{ .UserName }}"
    CUSTOM_DSN: "pgsql:host={{ .DatabaseHost }};port={{ .DatabasePort }};dbname={{ .DatabaseName }}"
```

### Database Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `database.enabled` | Enable database provisioning with DB Operator | `false` |
| `database.instance` | Name of the database cluster instance | `""` |
| `database.name` | Name of the database to create | `""` |
| `database.deletionProtected` | Enable deletion protection for the database | `true` |
| `database.secretsTemplates` | Custom secret templates for database credentials | `{}` |

### Global Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `nameOverride` | Override the name of the chart | `""` |
| `fullnameOverride` | Override the full name of the chart | `""` |

### Image Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `phpImage.repository` | PHP image repository | `rg.nl-ams.scw.cloud/unframed-container-registry/php` |
| `phpImage.tag` | PHP image tag | `"8.1"` |
| `phpImage.pullPolicy` | PHP image pull policy | `IfNotPresent` |
| `nginxImage.repository` | Nginx image repository | `rg.nl-ams.scw.cloud/unframed-container-registry/nginx` |
| `nginxImage.tag` | Nginx image tag | `"latest"` |
| `nginxImage.pullPolicy` | Nginx image pull policy | `IfNotPresent` |
| `dataImage.repository` | Data container image repository | `rg.nl-ams.scw.cloud/unframed-container-registry/dummy_page` |
| `dataImage.tag` | Data container image tag | `"latest"` |
| `dataImage.pullPolicy` | Data container image pull policy | `IfNotPresent` |

### Application Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `yii2.env.YII_DEBUG` | Enable Yii2 debug mode | `"false"` |
| `yii2.env.YII_ENV` | Yii2 environment | `production` |
| `yii2.config.webRoot` | Web root directory | `"/var/www/html/web"` |

### Queue Workers

The chart supports deploying Yii2 queue workers that run `php yii <name>/listen` commands.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `queueWorkers.enabled` | Enable queue workers | `false` |
| `queueWorkers.workers` | List of queue workers to deploy | `[]` |

Example configuration for queue workers:

```yaml
queueWorkers:
  enabled: true
  workers:
    - name: queue       # Worker name (used in command: php yii <name>/listen)
      replicas: 2       # Number of worker replicas
      resources:        # Optional resource limits and requests
        limits:
          cpu: 500m
          memory: 512Mi
        requests:
          cpu: 100m
          memory: 128Mi
    - name: email-queue
      replicas: 1
```

### Cron Jobs

The chart supports deploying Kubernetes CronJobs for scheduled tasks.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `cronJobs.enabled` | Enable cron jobs | `false` |
| `cronJobs.jobs` | List of cron jobs to deploy | `[]` |

Example configuration for cron jobs:

```yaml
cronJobs:
  enabled: true
  jobs:
    - name: cleanup        # Cron job name
      schedule: "0 0 * * *"   # Cron schedule expression (daily at midnight)
      command: "php yii cleanup/run"  # Command to run
      resources:                # Optional resource limits and requests
        limits:
          cpu: 500m
          memory: 512Mi
        requests:
          cpu: 100m
          memory: 128Mi
    - name: send-reports
      schedule: "0 7 * * 1"  # Every Monday at 7 AM
      command: "php yii reports/send-weekly"
```

### Redis Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `redis.enabled` | Enable Redis | `false` |
| `redis.image.repository` | Redis image repository | `redis` |
| `redis.image.tag` | Redis image tag | `"7.0-alpine"` |
| `redis.auth.enabled` | Enable Redis authentication | `false` |
| `redis.auth.password` | Redis password | `""` |
| `redis.persistence.enabled` | Enable Redis persistence | `false` |
| `redis.persistence.size` | Redis persistence size | `1Gi` |

## Secret Mounts

The chart supports mounting existing secrets as environment variables.

Example configuration:

```yaml
secretMounts:
  - secretName: "yii2-external-api"
    keys:
      # Simple key (no renaming)
      - "API_KEY"
      - "API_SECRET"
      # Key with renaming (from -> to)
      - from: "EXTERNAL_API_URL"
        to: "API_ENDPOINT"
```

## Examples

### Basic Yii2 Application with Database

```yaml
database:
  enabled: true
  instance: "production-postgres"
  name: "yii2_app"

yii2:
  env:
    YII_ENV: production
    YII_DEBUG: "false"
```

### Yii2 with Database and Queue Workers

```yaml
database:
  enabled: true
  instance: "production-postgres"
  name: "yii2_app"

queueWorkers:
  enabled: true
  workers:
    - name: queue
      replicas: 2
      resources:
        limits:
          cpu: 500m
          memory: 512Mi
        requests:
          cpu: 100m
          memory: 128Mi

yii2:
  env:
    YII_ENV: production
    YII_DEBUG: "false"
```

### Yii2 with Database, Redis, and Cron Jobs

```yaml
database:
  enabled: true
  instance: "production-postgres"
  name: "yii2_app"

redis:
  enabled: true
  auth:
    enabled: true
    password: "secure-redis-password"

cronJobs:
  enabled: true
  jobs:
    - name: cleanup
      schedule: "0 2 * * *"  # Daily at 2 AM
      command: "php yii cleanup/run"
    - name: reports
      schedule: "0 8 * * 1"  # Monday at 8 AM
      command: "php yii reports/generate"

yii2:
  env:
    YII_ENV: production
    YII_DEBUG: "false"
```
