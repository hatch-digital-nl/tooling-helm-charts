{{/*
Redis helper functions for common chart
*/}}

{{/*
Create a Redis name based on the chart's fullname
*/}}
{{- define "common.redis.name" -}}
{{- printf "%s-redis" .fullname -}}
{{- end -}}

{{/*
Create Redis labels
*/}}
{{- define "common.redis.labels" -}}
{{- .labels | nindent 4 }}
app.kubernetes.io/component: redis
{{- end -}}

{{/*
Create Redis selector labels
*/}}
{{- define "common.redis.selectorLabels" -}}
{{- .selectorLabels | nindent 6 }}
app.kubernetes.io/component: redis
{{- end -}}

{{/*
Create Redis pod selector labels
*/}}
{{- define "common.redis.podSelectorLabels" -}}
{{- .selectorLabels | nindent 8 }}
app.kubernetes.io/component: redis
{{- end -}}
