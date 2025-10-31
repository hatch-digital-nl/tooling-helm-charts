# Common Helm Chart

This is a library chart that provides shared templates and functionality for all other charts in this repository.

## Overview

The common chart is designed to be used as a dependency in other charts, providing reusable templates and functionality. This approach helps maintain consistency across charts and reduces duplication of code.

## Current Features

### Redis

The common chart provides a centralized Redis configuration that can be used by all charts. This includes:

- Redis deployment
- Redis service
- Redis persistent volume claim (optional)
- Redis secret for authentication (optional)

### PostgreSQL (CloudNativePG)

The common chart provides reusable templates to create a PostgreSQL Cluster using the CloudNativePG operator, with optional automated backups to S3 via Barman. This includes:

- CloudNativePG Cluster resource
- Optional S3 credentials Secret (or use an existing one)
- Optional ScheduledBackup resource
- Optional ArgoCD sync-wave annotations support

Note: You must have the CloudNativePG operator installed in your cluster.

## Usage

### Adding as a Dependency

To use the common chart in your Helm chart, add it as a dependency in your `Chart.yaml` file:

```yaml
dependencies:
  - name: common
    version: 0.1.0
    repository: file://../common
```

Then run `helm dependency update` to fetch the dependency.

### Using Redis Templates

To use the Redis templates in your chart, create a `redis.yaml` file in your templates directory with the following content:

```yaml
{{- if .Values.redis.enabled }}
{{/* Create context for Redis */}}
{{- $redisContext := dict "Values" .Values "fullname" (include "your-chart.fullname" .) "labels" (include "your-chart.labels" .) "selectorLabels" (include "your-chart.selectorLabels" .) -}}

{{/* Include common Redis templates */}}
{{- include "common.redis" $redisContext }}
{{- end }}
```

Replace `your-chart` with your chart's name.

### Redis Configuration

Add the following Redis configuration to your `values.yaml` file:

```yaml
## Redis cache settings
redis:
  enabled: false
  image:
    repository: redis
    tag: "7.0-alpine"
    pullPolicy: IfNotPresent
  auth:
    enabled: false
    password: ""
  persistence:
    enabled: false
    size: 1Gi
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
  service:
    port: 6379
  config:
    maxmemory: "100mb"
    maxmemoryPolicy: "allkeys-lru"
```

Users can then enable Redis by setting `redis.enabled` to `true` in their values file or with `--set redis.enabled=true`.

## Extending

To add new shared functionality to the common chart:

1. Create a new template file in the `templates` directory
2. Define a named template using `define` and `end`
3. Document the template and its parameters
4. Update this README.md with information about the new functionality

# Common Helm Chart

This is a library chart that provides shared templates and functionality for all other charts in this repository.

## Overview

The common chart is designed to be used as a dependency in other charts, providing reusable templates and functionality. This approach helps maintain consistency across charts and reduces duplication of code.

## Current Features

### Redis

The common chart provides a centralized Redis configuration that can be used by all charts. This includes:

- Redis deployment
- Redis service
- Redis persistent volume claim (optional)
- Redis secret for authentication (optional)

### PostgreSQL (CloudNativePG)

The common chart provides reusable templates to create a PostgreSQL Cluster using the CloudNativePG operator, with optional automated backups to S3 via Barman. This includes:

- CloudNativePG Cluster resource
- Optional S3 credentials Secret (or use an existing one)
- Optional ScheduledBackup resource
- Optional ArgoCD sync-wave annotations support

Note: You must have the CloudNativePG operator installed in your cluster.

## Usage

### Adding as a Dependency

To use the common chart in your Helm chart, add it as a dependency in your `Chart.yaml` file:

```yaml
dependencies:
  - name: common
    version: 0.1.0
    repository: file://../common
```

Then run `helm dependency update` to fetch the dependency.

### Using Redis Templates

To use the Redis templates in your chart, create a `redis.yaml` file in your templates directory with the following content:

```yaml
{{- if .Values.redis.enabled }}
{{/* Create context for Redis */}}
{{- $redisContext := dict "Values" .Values "fullname" (include "your-chart.fullname" .) "labels" (include "your-chart.labels" .) "selectorLabels" (include "your-chart.selectorLabels" .) -}}

{{/* Include common Redis templates */}}
{{- include "common.redis" $redisContext }}
{{- end }}
```

Replace `your-chart` with your chart's name.

### Redis Configuration

Add the following Redis configuration to your `values.yaml` file:

```yaml
## Redis cache settings
redis:
  enabled: false
  image:
    repository: redis
    tag: "7.0-alpine"
    pullPolicy: IfNotPresent
  auth:
    enabled: false
    password: ""
  persistence:
    enabled: false
    size: 1Gi
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
  service:
    port: 6379
  config:
    maxmemory: "100mb"
    maxmemoryPolicy: "allkeys-lru"
```

Users can then enable Redis by setting `redis.enabled` to `true` in their values file or with `--set redis.enabled=true`.

### Using PostgreSQL (CloudNativePG) Templates

To use the PostgreSQL templates in your chart, create a `postgres.yaml` file in your templates directory with the following content:

```yaml
{{- if .Values.postgres.enabled }}
{{/* Create context for Postgres */}}
{{- $pgContext := dict "Values" .Values "fullname" (include "your-chart.fullname" .) "labels" (include "your-chart.labels" .) "selectorLabels" (include "your-chart.selectorLabels" .) "syncWaves" .Values.syncWaves -}}

{{/* Include common Postgres (CloudNativePG) templates */}}
{{- include "common.postgres" $pgContext }}
{{- end }}
```

If you are using ArgoCD sync waves in your app chart, set `syncWaves.database` to control the order in which the database is created.

### PostgreSQL (CloudNativePG) Configuration

Add the following PostgreSQL configuration to your `values.yaml` file and adjust as needed:

```yaml
postgres:
  enabled: true
  cnpg:
    description: "Application database"
    cluster:
      imageName: ghcr.io/cloudnative-pg/postgresql:16
      instances: 2
      storage:
        size: 20Gi
      bootstrap:
        initdb:
          database: app
          owner: app
          # Provide an existing secret name if you want to set an explicit password for the owner
          # If omitted, a random password will be generated by the operator
          secret:
            name: ""
      monitoring:
        enabled: false
    backup:
      enabled: true
      retentionPolicy: "7d"
      # Create a scheduled backup every day at 03:00
      schedule: "0 3 * * *"
      s3:
        # Barman destination path, required when backups are enabled
        destinationPath: "s3://my-bucket/backups/app-db"
        # For AWS S3 leave endpoint default (s3.amazonaws.com); for MinIO or other S3-compatible, set endpointURL
        endpoint: s3.amazonaws.com
        region: eu-west-1
        # Option A: use an existing secret created outside of Helm
        # s3Credentials:
        #   existingSecret: my-barman-s3
        # Option B: have this chart create the secret for you (not recommended to commit credentials)
        s3Credentials:
          accessKeyId: "YOUR_AWS_ACCESS_KEY_ID"
          secretAccessKey: "YOUR_AWS_SECRET_ACCESS_KEY"
```

With the above values, the chart will:

- Create a CloudNativePG Cluster named `<release-name>-postgres`
- Configure Barman S3 for WAL archiving and backups
- Create a Secret `<release-name>-postgres-barman-s3` if no `existingSecret` is provided and credentials are set
- Create a ScheduledBackup that runs at the defined cron schedule

#### Notes

- Ensure the CloudNativePG CRDs and operator are installed in your cluster before applying these resources.
- For production, prefer referencing an `existingSecret` with your S3 credentials instead of embedding them in values.
- You can set `postgres.cnpg.cluster.postgresql` to pass extra `postgresql.conf` and `pg_hba` entries if needed.

## Extending

To add new shared functionality to the common chart:

1. Create a new template file in the `templates` directory
2. Define a named template using `define` and `end`
3. Document the template and its parameters
4. Update this README.md with information about the new functionality
