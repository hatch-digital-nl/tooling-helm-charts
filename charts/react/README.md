# React Helm Chart

This Helm chart deploys a React application on Kubernetes.

## Introduction

This chart bootstraps a React application deployment on a Kubernetes cluster using the Helm package manager.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+

## Installing the Chart

To install the chart with the release name `my-release`:

```bash
$ helm install my-release ./react
```

## Configuration

### Global Settings

| Parameter          | Description                         | Default |
|--------------------|-------------------------------------|---------|
| `nameOverride`     | Override the name of the chart      | `""`    |
| `fullnameOverride` | Override the full name of the chart | `""`    |
| `replicaCount`     | Override the cluster replicas       | 1       |

### Image Settings

| Parameter               | Description                      | Default                                                      |
|-------------------------|----------------------------------|--------------------------------------------------------------|
| `nginxImage.repository` | Nginx image repository           | `rg.nl-ams.scw.cloud/unframed-container-registry/nginx`      |
| `nginxImage.tag`        | Nginx image tag                  | `"latest"`                                                   |
| `nginxImage.pullPolicy` | Nginx image pull policy          | `IfNotPresent`                                               |
| `dataImage.repository`  | Data container image repository  | `rg.nl-ams.scw.cloud/unframed-container-registry/dummy_page` |
| `dataImage.tag`         | Data container image tag         | `"latest"`                                                   |
| `dataImage.pullPolicy`  | Data container image pull policy | `IfNotPresent`                                               |

### Application Settings

| Parameter              | Description        | Default           |
|------------------------|--------------------|-------------------|
| `react.config.webRoot` | Web root directory | `"/var/www/html"` |

### Resource Settings

| Parameter         | Description | Default |
|-------------------|-------------|---------|
| `resources.nginx` | Nginx       | []      |
| `resources.data`  | Data        | []      |


## Examples

### Basic React Application 

```yaml
replicaCount: 3

resources:
  nginx:
    limits:
      cpu: 500m
    requests:
      cpu: 10m
      memory: 32Mi
```

