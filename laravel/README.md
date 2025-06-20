# Laravel Helm Chart

This Helm chart deploys a Laravel application on Kubernetes.

## Introduction

This chart bootstraps a Laravel application deployment on a Kubernetes cluster using the Helm package manager.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+

## Installing the Chart

To install the chart with the release name `my-release`:

```bash
$ helm install my-release ./laravel
```

## Configuration

The following table lists the configurable parameters of the Laravel chart and their default values.

### Global Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `nameOverride` | Override the name of the chart | `""` |
| `fullnameOverride` | Override the full name of the chart | `""` |

### Image Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `phpImage.repository` | PHP image repository | `registry.scaleway.com/unframed/php` |
| `phpImage.tag` | PHP image tag | `"8.1-fpm"` |
| `phpImage.pullPolicy` | PHP image pull policy | `IfNotPresent` |
| `nginxImage.repository` | Nginx image repository | `registry.scaleway.com/unframed/nginx` |
| `nginxImage.tag` | Nginx image tag | `"stable-alpine"` |
| `nginxImage.pullPolicy` | Nginx image pull policy | `IfNotPresent` |
| `dataImage.repository` | Data container image repository | `registry.scaleway.com/unframed/laravel-data` |
| `dataImage.tag` | Data container image tag | `"latest"` |
| `dataImage.pullPolicy` | Data container image pull policy | `IfNotPresent` |

### Application Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `laravel.env.APP_NAME` | Laravel application name | `Laravel` |
| `laravel.env.APP_ENV` | Laravel environment | `production` |
| `laravel.env.APP_KEY` | Laravel application key | `""` |
| `laravel.env.APP_DEBUG` | Enable Laravel debug mode | `"false"` |
| `laravel.env.APP_URL` | Laravel application URL | `https://example.com` |
| `laravel.config.webRoot` | Web root directory | `"/var/www/html/public"` |

### Service Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `service.type` | Service type | `ClusterIP` |
| `service.port` | Service port | `8080` |

### Queue Workers

The chart supports deploying Laravel queue workers that run `php artisan queue:work` commands.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `queueWorkers.enabled` | Enable queue workers | `false` |
| `queueWorkers.workers` | List of queue workers to deploy | `[]` |

Example configuration for queue workers:

```yaml
queueWorkers:
  enabled: true
  workers:
    - name: default       # Worker name
      replicas: 2         # Number of worker replicas
      connection: redis   # Queue connection to use (default: default)
      queue: default      # Queue to process (default: default)
      tries: 3            # Number of times to attempt a job before logging it failed (default: 3)
      timeout: 60         # The number of seconds a child process can run (default: 60)
      sleep: 3            # Number of seconds to sleep when no job is available (default: 3)
      memory: 128         # The memory limit in megabytes (default: 128)
      resources:          # Optional resource limits and requests
        limits:
          cpu: 500m
          memory: 512Mi
        requests:
          cpu: 100m
          memory: 128Mi
    - name: emails
      replicas: 1
      queue: emails
```

### Cron Jobs

The chart supports deploying Kubernetes CronJobs for scheduled tasks, including Laravel's scheduler.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `cronJobs.enabled` | Enable cron jobs | `false` |
| `cronJobs.scheduler` | Enable Laravel's scheduler | `true` |
| `cronJobs.jobs` | List of cron jobs to deploy | `[]` |

Example configuration for cron jobs:

```yaml
cronJobs:
  enabled: true
  scheduler: true  # Enables Laravel's scheduler (runs every minute)
  jobs:
    - name: cleanup        # Cron job name
      schedule: "0 0 * * *"   # Cron schedule expression (daily at midnight)
      command: "php artisan cleanup:run"  # Command to run
      resources:                # Optional resource limits and requests
        limits:
          cpu: 500m
          memory: 512Mi
        requests:
          cpu: 100m
          memory: 128Mi
    - name: send-reports
      schedule: "0 7 * * 1"  # Every Monday at 7 AM
      command: "php artisan reports:send-weekly"
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

### MySQL Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `mysql.enabled` | Enable MySQL | `true` |
| `mysql.auth.database` | MySQL database name | `laravel` |
| `mysql.auth.username` | MySQL username | `laravel` |
| `mysql.auth.password` | MySQL password | `""` |
| `mysql.auth.rootPassword` | MySQL root password | `""` |
| `mysql.primary.persistence.enabled` | Enable MySQL persistence | `true` |
| `mysql.primary.persistence.size` | MySQL persistence size | `8Gi` |

## Secret Mounts

The chart supports mounting existing secrets as environment variables.

Example configuration:

```yaml
secretMounts:
  - secretName: "laravel-db-credentials"
    keys:
      # Simple key (no renaming)
      - "DB_USERNAME"
      - "DB_PASSWORD"
      - "DB_HOST"
      # Key with renaming (from -> to)
      - from: "DB_DATABASE"
        to: "DB_NAME"
```

## Probes

The chart supports configuring liveness, readiness, and startup probes for the application.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `probes.liveness.enabled` | Enable liveness probe | `false` |
| `probes.liveness.path` | Path for liveness probe | `/` |
| `probes.liveness.port` | Port for liveness probe | `8080` |
| `probes.readiness.enabled` | Enable readiness probe | `false` |
| `probes.readiness.path` | Path for readiness probe | `/` |
| `probes.readiness.port` | Port for readiness probe | `8080` |
| `probes.startup.enabled` | Enable startup probe | `false` |
| `probes.startup.path` | Path for startup probe | `/` |
| `probes.startup.port` | Port for startup probe | `8080` |

## Autoscaling

The chart supports horizontal pod autoscaling.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `autoscaling.enabled` | Enable autoscaling | `false` |
| `autoscaling.minReplicas` | Minimum number of replicas | `1` |
| `autoscaling.maxReplicas` | Maximum number of replicas | `5` |
| `autoscaling.targetCPUUtilizationPercentage` | Target CPU utilization percentage | `80` |
| `autoscaling.targetMemoryUtilizationPercentage` | Target memory utilization percentage | `80` |
