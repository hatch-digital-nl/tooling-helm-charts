# ArgoCD Sync Waves Implementation

## Overzicht

Deze Helm Charts zijn uitgebreid met ArgoCD Sync Waves om de juiste volgorde van resource deployment te garanderen. Dit lost het probleem op waarbij migration jobs faalden omdat de database nog niet beschikbaar was.

## Sync Wave Strategie

### Volgorde van Deployment

```
Wave -3: Database CRD (KindaDB operator)
Wave -2: Redis resources
Wave -1: Migration Jobs
Wave 0:  Alle applicatie resources (Deployment, Service, Queue Workers, Cronjobs, Ingress)
```

### Rationale

1. **Wave -3 (Database CRD)**: De Database CRD moet eerst worden aangemaakt zodat de KindaDB operator de database kan provisionen en credentials kan genereren.

2. **Wave -2 (Redis)**: Redis resources worden gedeployed nadat de database setup is gestart, maar voor de applicatie.

3. **Wave -1 (Migration Jobs)**: Migration jobs draaien nadat de database beschikbaar is, maar voor de hoofdapplicatie start.

4. **Wave 0 (Applicatie Resources)**: Alle hoofdapplicatie resources (Deployment, Service, Queue Workers, Cronjobs, Ingress) worden tegelijkertijd gedeployed nadat de migraties zijn voltooid.

## Configuratie

### Values.yaml

Alle charts bevatten nu een `syncWaves` sectie in hun values.yaml:

```yaml
## ArgoCD Sync Waves configuration
## Controls the order of resource deployment in ArgoCD
syncWaves:
  enabled: true
  # Database CRD must be created first so KindaDB operator can provision database
  database: -3
  # Redis can be deployed after database but before application
  redis: -2
  # Migration job runs after database is ready but before application starts
  migration: -1
  # All application resources deploy together
  application: 0
```

### Template Implementatie

Elke template bevat nu conditionele sync wave annotaties:

```yaml
metadata:
  name: {{ include "chart.fullname" . }}
  labels:
    {{- include "chart.labels" . | nindent 4 }}
  {{- if .Values.syncWaves.enabled }}
  annotations:
    argocd.argoproj.io/sync-wave: "{{ .Values.syncWaves.database }}"
  {{- end }}
```

## Geïmplementeerde Charts

### Laravel Chart
- ✅ Database CRD (wave -3)
- ✅ Redis resources (wave -2)
- ✅ Migration Job (wave -1)
- ✅ Deployment (wave 0)
- ✅ Service (wave 0)
- ✅ Queue Workers (wave 0)
- ✅ Cronjobs (wave 0)
- ✅ Ingress (wave 0)

### Yii2 Chart
- ✅ Database CRD (wave -3)
- ✅ Redis resources (wave -2)
- ✅ Migration Job (wave -1)
- ⏳ Deployment (wave 0)
- ⏳ Service (wave 0)
- ⏳ Queue Workers (wave 0)
- ⏳ Cronjobs (wave 0)
- ⏳ Ingress (wave 0)

### WordPress-Bedrock Chart
- ✅ Database CRD (wave -3)
- ✅ Redis resources (wave -2)
- ⏳ Deployment (wave 0)
- ⏳ Service (wave 0)
- ⏳ Ingress (wave 0)

### Common Redis Templates
- ✅ Redis Deployment (wave -2)
- ✅ Redis Service (wave -2)
- ✅ Redis PVC (wave -2)

## Gebruik

### Sync Waves Inschakelen

Sync waves zijn standaard ingeschakeld. Om ze uit te schakelen:

```yaml
syncWaves:
  enabled: false
```

### Sync Wave Nummers Aanpassen

Je kunt de sync wave nummers aanpassen naar je behoeften:

```yaml
syncWaves:
  enabled: true
  database: -5
  redis: -3
  migration: -1
  application: 0
```

### Backwards Compatibility

De implementatie is backwards compatible:
- Bestaande ArgoCD hook configuratie blijft werken
- Sync waves kunnen worden uitgeschakeld zonder impact
- Alle templates werken nog steeds zonder sync wave configuratie

## Troubleshooting

### Migration Job Faalt Nog Steeds

1. Controleer of sync waves zijn ingeschakeld:
   ```yaml
   syncWaves:
     enabled: true
   ```

2. Controleer of de database wave lager is dan migration wave:
   ```yaml
   database: -3  # Moet lager zijn dan migration
   migration: -1
   ```

3. Controleer ArgoCD logs voor sync wave execution

### Resources Worden in Verkeerde Volgorde Gedeployed

1. Controleer de sync wave annotaties in de gegenereerde manifests
2. Verhoog het verschil tussen sync wave nummers
3. Controleer ArgoCD Application sync policy

## Toekomstige Uitbreidingen

- Automatische dependency detection
- Configureerbare sync wave strategieën
- Health checks tussen sync waves
- Rollback strategieën per sync wave