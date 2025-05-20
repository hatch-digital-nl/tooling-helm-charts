# WordPress Bedrock Helm Chart

This Helm chart deploys a WordPress application using the Bedrock structure, which provides a more modern and secure WordPress setup.

## Introduction

This chart bootstraps a WordPress Bedrock deployment on a Kubernetes cluster using the Helm package manager. It includes:

- PHP-FPM container for running WordPress
- Nginx container for serving the application
- Shared volume for application files
- Optional MySQL database deployment
- Support for environment variables and secrets

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
| `replicaCount`      | Number of replicas to deploy                                                      | `1`             |

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

## Persistence

The chart mounts an `emptyDir` volume to share files between the containers. For production use, you might want to consider using a persistent volume.
