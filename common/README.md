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
