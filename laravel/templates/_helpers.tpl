{{/*
Expand the name of the chart.
*/}}
{{- define "laravel.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "laravel.fullname" -}}
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
{{- define "laravel.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "laravel.labels" -}}
helm.sh/chart: {{ include "laravel.chart" . }}
{{ include "laravel.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "laravel.selectorLabels" -}}
app.kubernetes.io/name: {{ include "laravel.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Laravel environment variables
*/}}
{{- define "laravel.env" -}}
{{- range $key, $value := .Values.laravel.env }}
- name: {{ $key }}
  value: {{ $value | quote }}
{{- end }}
{{- if .Values.secretMounts }}
{{- range .Values.secretMounts }}
{{- range .keys }}
{{- if kindIs "string" . }}
- name: {{ . }}
  valueFrom:
    secretKeyRef:
      name: {{ $.secretName }}
      key: {{ . }}
{{- else }}
- name: {{ .to }}
  valueFrom:
    secretKeyRef:
      name: {{ $.secretName }}
      key: {{ .from }}
{{- end }}
{{- end }}
{{- end }}
{{- end }}
{{- if .Values.redis.enabled }}
- name: REDIS_HOST
  value: {{ include "laravel.fullname" . }}-redis
- name: REDIS_PORT
  value: {{ .Values.redis.service.port | quote }}
{{- if .Values.redis.auth.enabled }}
- name: REDIS_PASSWORD
  valueFrom:
    secretKeyRef:
      name: {{ include "laravel.fullname" . }}-redis
      key: redis-password
{{- end }}
{{- end }}
{{- end }}
