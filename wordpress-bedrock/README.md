# WordPress Bedrock Helm Chart

This Helm chart deploys a WordPress application using the Bedrock structure, which provides a more modern and secure WordPress setup.

## Introduction

This chart bootstraps a WordPress Bedrock deployment on a Kubernetes cluster using the Helm package manager. It includes:

- PHP-FPM container for running WordPress
- Nginx container for serving the application
- Shared volume for application files
- Optional MySQL database deployment
- Optional Redis cache for W3 Total Cache plugin
- Support for environment variables and secrets
- Horizontal Pod Autoscaler (HPA) for automatic scaling based on resource usage
- Kubernetes probes (liveness, readiness, startup) for improved reliability

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+
- PV provisioner support in the underlying infrastructure (if persistence is required)

## Installing the Chart

```bash
helm install my-wordpress my-repo/wordpress-bedrock
```

## Configuration

### Environment Variables

The chart allows you to set environment variables for the WordPress application through the `wordpress.env` section in the `values.yaml` file:

```yaml
wordpress:
  env:
    DB_NAME: wordpress
    DB_USER: wordpress
    DB_PASSWORD: ""
    DB_HOST: mysql
    WP_ENV: production
    WP_HOME: https://example.com
    WP_SITEURL: https://example.com/wp
```

### Secrets Management

The chart supports mounting existing Kubernetes Secrets as environment variables in the PHP container. This is particularly useful for database credentials and S3 storage configuration.

You can reference existing secrets using the `secretMounts` configuration in the `values.yaml` file:

```yaml
secretMounts:
  - secretName: "wordpress-db-credentials"
    keys:
      - "DB_USER"
      - "DB_PASSWORD"
      - "DB_HOST"
      - "DB_NAME"
```

#### Key Renaming

Sometimes the key names in your secrets might not match what your application expects. For example, your secret might have `DB_DATABASE` but WordPress expects `DB_NAME`. The chart supports renaming keys when mounting them as environment variables:

```yaml
secretMounts:
  - secretName: "wordpress-db-credentials"
    keys:
      - "DB_USER"
      - "DB_PASSWORD"
      - "DB_HOST"
      # Rename DB_DATABASE to DB_NAME
      - from: "DB_DATABASE"
        to: "DB_NAME"
```

#### Using Multiple Secrets Simultaneously

The chart supports mounting multiple secrets simultaneously. All keys from all referenced secrets will be mounted as environment variables in the PHP container:

```yaml
secretMounts:
  - secretName: "wordpress-db-credentials"
    keys:
      - "DB_USER"
      - "DB_PASSWORD"
      - "DB_HOST"
      - from: "DB_DATABASE"
        to: "DB_NAME"
  - secretName: "wordpress-s3-credentials"
    keys:
      - "S3_UPLOADS_KEY"
      - "S3_UPLOADS_SECRET"
      - "S3_UPLOADS_REGION"
      # Rename AWS_S3_BUCKET to S3_UPLOADS_BUCKET
      - from: "AWS_S3_BUCKET"
        to: "S3_UPLOADS_BUCKET"
```

This approach allows you to:
1. Reference existing secrets created outside the chart
2. Mount multiple secrets with different purposes
3. Select specific keys from each secret to mount as environment variables
4. Rename keys to match what your application expects

## Parameters

### Common Parameters

| Name                | Description                                                                       | Value           |
|---------------------|-----------------------------------------------------------------------------------|-----------------|
| `nameOverride`      | String to partially override the release name                                     | `""`            |
| `fullnameOverride`  | String to fully override the release name                                         | `""`            |
| `replicaCount`      | Number of replicas to deploy (ignored if autoscaling is enabled)                  | `1`             |

### Probe Parameters

| Name                               | Description                                                | Value           |
|------------------------------------|------------------------------------------------------------|-----------------|
| `probes.liveness.enabled`          | Enable liveness probe for Nginx container                  | `true`          |
| `probes.liveness.*`                | Same parameters as PHP liveness probe                      | See values.yaml |
| `probes.readiness.enabled`         | Enable readiness probe for Nginx container                 | `true`          |
| `probes.readiness.*`               | Same parameters as PHP readiness probe                     | See values.yaml |
| `probes.startup.enabled`           | Enable startup probe for Nginx container                   | `false`         |
| `probes.startup.*`                 | Same parameters as PHP startup probe                       | See values.yaml |

### Autoscaling Parameters

| Name                                     | Description                                                | Value           |
|------------------------------------------|------------------------------------------------------------|-----------------|
| `autoscaling.enabled`                    | Enable autoscaling for the WordPress deployment            | `false`         |
| `autoscaling.minReplicas`                | Minimum number of replicas                                 | `1`             |
| `autoscaling.maxReplicas`                | Maximum number of replicas                                 | `5`             |
| `autoscaling.targetCPUUtilizationPercentage`    | Target CPU utilization percentage                   | `80`            |
| `autoscaling.targetMemoryUtilizationPercentage` | Target memory utilization percentage                | `80`            |
| `autoscaling.customMetrics`              | Custom metrics for autoscaling                             | `[]`            |
| `autoscaling.behavior`                   | Scaling behavior configuration                             | `{}`            |

### Image Parameters

| Name                      | Description                                                | Value                                                  |
|---------------------------|------------------------------------------------------------|--------------------------------------------------------|
| `phpImage.repository`     | PHP image repository                                       | `rg.nl-ams.scw.cloud/unframed-container-registry/php` |
| `phpImage.tag`            | PHP image tag                                              | `8.3`                                                  |
| `phpImage.pullPolicy`     | PHP image pull policy                                      | `IfNotPresent`                                         |
| `nginxImage.repository`   | Nginx image repository                                     | `rg.nl-ams.scw.cloud/unframed-container-registry/nginx` |
| `nginxImage.tag`          | Nginx image tag                                            | `latest`                                               |
| `nginxImage.pullPolicy`   | Nginx image pull policy                                    | `IfNotPresent`                                         |
| `dataImage.repository`    | Data container image repository                            | `rg.nl-ams.scw.cloud/unframed-container-registry/dummy_page` |
| `dataImage.tag`           | Data container image tag                                   | `latest`                                               |
| `dataImage.pullPolicy`    | Data container image pull policy                           | `IfNotPresent`                                         |

### WordPress Parameters

| Name                      | Description                                                | Value           |
|---------------------------|------------------------------------------------------------|-----------------|
| `wordpress.bedrock.enabled` | Enable Bedrock structure                                 | `true`          |
| `wordpress.bedrock.webRoot` | Web root directory for Bedrock                           | `/var/www/html/public` |
| `wordpress.env`           | Environment variables for WordPress                        | See values.yaml |

### Secret Parameters

| Name                      | Description                                                | Value           |
|---------------------------|------------------------------------------------------------|-----------------|
| `secretMounts`            | List of secret configurations to mount as environment vars | `[]`            |
| `secretMounts[].secretName` | Name of the existing Kubernetes Secret                   | `""`            |
| `secretMounts[].keys`     | List of keys from the secret to mount as environment vars  | `[]`            |
| `secretMounts[].keys[]`   | String key name or object with from/to for key renaming    | `""`            |
| `secretMounts[].keys[].from` | Original key name in the secret                         | `""`            |
| `secretMounts[].keys[].to`   | Desired environment variable name in the container      | `""`            |

### MySQL Parameters

| Name                      | Description                                                | Value           |
|---------------------------|------------------------------------------------------------|-----------------|
| `mysql.enabled`           | Deploy a MySQL server                                      | `true`          |
| `mysql.auth.database`     | MySQL database name                                        | `wordpress`     |
| `mysql.auth.username`     | MySQL user name                                            | `wordpress`     |
| `mysql.auth.password`     | MySQL user password                                        | `""`            |
| `mysql.auth.rootPassword` | MySQL root password                                        | `""`            |
| `mysql.primary.persistence.enabled` | Enable MySQL persistence using PVC               | `true`          |
| `mysql.primary.persistence.size`    | PVC Storage Request for MySQL volume             | `8Gi`           |

### Redis Parameters

| Name                      | Description                                                | Value           |
|---------------------------|------------------------------------------------------------|-----------------|
| `redis.enabled`           | Deploy a Redis server for caching                          | `false`         |
| `redis.image.repository`  | Redis image repository                                     | `redis`         |
| `redis.image.tag`         | Redis image tag                                            | `7.0-alpine`    |
| `redis.image.pullPolicy`  | Redis image pull policy                                    | `IfNotPresent`  |
| `redis.auth.enabled`      | Enable Redis password authentication                       | `false`         |
| `redis.auth.password`     | Redis password                                             | `""`            |
| `redis.persistence.enabled` | Enable Redis persistence using PVC                       | `false`         |
| `redis.persistence.size`  | PVC Storage Request for Redis volume                       | `1Gi`           |
| `redis.resources.requests.cpu` | CPU resource requests                                 | `100m`          |
| `redis.resources.requests.memory` | Memory resource requests                           | `128Mi`         |
| `redis.service.port`      | Redis service port                                         | `6379`          |
| `redis.config.maxmemory`  | Redis maximum memory                                       | `100mb`         |
| `redis.config.maxmemoryPolicy` | Redis memory eviction policy                          | `allkeys-lru`   |

## Persistence

The chart mounts an `emptyDir` volume to share files between the containers. For production use, you might want to consider using a persistent volume.

## Autoscaling

The chart supports Horizontal Pod Autoscaler (HPA) for automatically scaling the WordPress deployment based on resource usage. By default, autoscaling is disabled.

### Enabling Autoscaling

To enable autoscaling, set `autoscaling.enabled` to `true` in your values file:

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80
```

This configuration will:
- Enable autoscaling for the WordPress deployment
- Set the minimum number of replicas to 2
- Set the maximum number of replicas to 10
- Scale up when CPU utilization exceeds 70%
- Scale up when memory utilization exceeds 80%

### Advanced Configuration

The HPA supports advanced configuration options through the `behavior` parameter:

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      selectPolicy: Max
```

You can also configure custom metrics for scaling:

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  customMetrics:
  - type: Pods
    pods:
      metric:
        name: php_requests_per_second
      target:
        type: AverageValue
        averageValue: 1k
```

For more information on HPA configuration, refer to the [Kubernetes documentation](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/).

## Kubernetes Probes

The chart supports Kubernetes probes for both the PHP and Nginx containers to improve reliability and availability. Three types of probes are available:

1. **Liveness Probes**: Determine if a container is running. If the probe fails, the container is restarted.
2. **Readiness Probes**: Determine if a container is ready to receive traffic. If the probe fails, the container is removed from service endpoints.
3. **Startup Probes**: Determine if an application within a container has started. If the probe fails, the container is restarted.

### Configuring Probes

By default, liveness and readiness probes are enabled for both PHP and Nginx containers, while startup probes are disabled. You can customize the probe settings in your values file:

```yaml
probes:
  php:
    liveness:
      enabled: true
      initialDelaySeconds: 60
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 6
      successThreshold: 1
      command: ["php-fpm-healthcheck"]
    readiness:
      enabled: true
      initialDelaySeconds: 30
      command: ["php-fpm-healthcheck"]
      # Other parameters...
    startup:
      enabled: true
      failureThreshold: 30
      command: ["php-fpm-healthcheck"]
      # Other parameters...
  nginx:
    liveness:
      enabled: true
      initialDelaySeconds: 30
      periodSeconds: 10
      timeoutSeconds: 5
      failureThreshold: 6
      successThreshold: 1
      path: /
      port: 8080
    # Other Nginx probe configurations...
```

### PHP-FPM Probes

For the PHP-FPM container, the probes use exec commands with `php-fpm-healthcheck` to check the status of the PHP-FPM process. This is more appropriate for PHP-FPM than HTTP probes, as PHP-FPM doesn't directly handle HTTP requests but instead processes FastCGI requests.

### Nginx Probes

For the Nginx container, the probes are configured to check the root path (`/`) on port 8080. This ensures that the Nginx server is running and can serve web content.

### Disabling Probes

If you want to disable a specific probe, set its `enabled` parameter to `false`:

```yaml
probes:
  php:
    liveness:
      enabled: false
    # Other probes...
```

For more information on Kubernetes probes, refer to the [Kubernetes documentation](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/).

## Redis Caching

The chart includes an optional Redis server for caching with the W3 Total Cache WordPress plugin. Redis caching can significantly improve the performance of WordPress sites by caching database queries, objects, and pages.

### Enabling Redis

To enable Redis caching, set `redis.enabled` to `true` in your values file:

```yaml
redis:
  enabled: true
  config:
    maxmemory: "256mb"
    maxmemoryPolicy: "allkeys-lru"
```

When Redis is enabled, the following environment variables are automatically set in the WordPress container:

- `WP_REDIS_HOST`: The Redis service hostname
- `WP_REDIS_PORT`: The Redis service port (default: 6379)
- `WP_REDIS_PASSWORD`: The Redis password (if authentication is enabled)
- `WP_REDIS_TIMEOUT`: Connection timeout (default: 1)
- `WP_REDIS_READ_TIMEOUT`: Read timeout (default: 1)
- `WP_REDIS_DATABASE`: Redis database index (default: 0)

### Redis Authentication

For production environments, it's recommended to enable Redis authentication:

```yaml
redis:
  enabled: true
  auth:
    enabled: true
    password: "your-secure-password"
```

### Redis Persistence

By default, Redis data is not persisted. For production environments, you might want to enable persistence:

```yaml
redis:
  enabled: true
  persistence:
    enabled: true
    size: 2Gi
```

### W3 Total Cache Configuration

After deploying WordPress with Redis enabled, you'll need to:

1. Install the W3 Total Cache plugin in WordPress
2. Configure W3 Total Cache to use Redis for object caching
3. In the W3 Total Cache settings, set the Redis server to the environment variables that are automatically configured

This setup provides a robust caching solution that can significantly improve the performance of your WordPress site.
