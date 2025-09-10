{{/*
Expand the name of the chart.
*/}}
{{- define "yii2.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "yii2.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "yii2.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "yii2.labels" -}}
helm.sh/chart: {{ include "yii2.chart" . }}
{{ include "yii2.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "yii2.selectorLabels" -}}
app.kubernetes.io/name: {{ include "yii2.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Common environment variables for Yii2 containers
*/}}
{{- define "yii2.env" -}}
{{- range $key, $value := .Values.yii2.env }}
- name: {{ $key }}
  value: {{ $value | quote }}
{{- end }}
{{- if .Values.redis.enabled }}
# Redis environment variables
- name: REDIS_HOST
  value: {{ include "yii2.fullname" . }}-redis
- name: REDIS_PORT
  value: {{ .Values.redis.service.port | quote }}
{{- if .Values.redis.auth.enabled }}
- name: REDIS_PASSWORD
  valueFrom:
    secretKeyRef:
      name: {{ include "yii2.fullname" . }}-redis
      key: redis-password
{{- end }}
- name: REDIS_TIMEOUT
  value: "1"
- name: REDIS_READ_TIMEOUT
  value: "1"
- name: REDIS_DATABASE
  value: "0"
{{- end }}
{{- if .Values.secretMounts }}
# Mount secrets as environment variables
{{- range $secretConfig := .Values.secretMounts }}
{{- if $secretConfig.secretName }}
{{- range $keyMapping := $secretConfig.keys }}
{{- if kindIs "string" $keyMapping }}
# Simple key (no renaming)
- name: {{ $keyMapping }}
  valueFrom:
    secretKeyRef:
      name: {{ $secretConfig.secretName }}
      key: {{ $keyMapping }}
{{- else }}
# Key with renaming (from -> to)
- name: {{ $keyMapping.to }}
  valueFrom:
    secretKeyRef:
      name: {{ $secretConfig.secretName }}
      key: {{ $keyMapping.from }}
{{- end }}
{{- end }}
{{- end }}
{{- end }}
{{- end }}
{{- end }}
