# Yii2 Helm Chart

This Helm chart deploys a Yii2 application on Kubernetes.

## Introduction

This chart bootstraps a Yii2 application deployment on a Kubernetes cluster using the Helm package manager.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+

## Installing the Chart

To install the chart with the release name `my-release`:

```bash
$ helm install my-release ./yii2
```

## Configuration

The following table lists the configurable parameters of the Yii2 chart and their default values.

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
  - secretName: "yii2-db-credentials"
    keys:
      # Simple key (no renaming)
      - "DB_USERNAME"
      - "DB_PASSWORD"
      - "DB_HOST"
      # Key with renaming (from -> to)
      - from: "DB_DATABASE"
        to: "DB_NAME"
```
