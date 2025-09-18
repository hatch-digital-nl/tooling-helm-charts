# DB Operator Integration

Deze Helm charts ondersteunen automatische database provisioning via de [DB Operator](https://github.com/db-operator/db-operator).

## Overzicht

De DB Operator integratie maakt het mogelijk om met minimale configuratie automatisch databases aan te maken en de credentials beschikbaar te stellen aan je applicaties. Je hoeft alleen maar het database cluster en de database naam op te geven.

## Ondersteunde Charts

- **Laravel** (`charts/laravel/`)
- **WordPress Bedrock** (`charts/wordpress-bedrock/`)
- **Yii2** (`charts/yii2/`)

## Vereisten

- Kubernetes 1.19+
- Helm 3.0+
- [DB Operator](https://github.com/db-operator/db-operator) geïnstalleerd in je cluster

## Basis Configuratie

Voor alle charts is de configuratie hetzelfde:

```yaml
database:
  enabled: true
  instance: "my-postgres-cluster"  # Naam van je database cluster
  name: "my_app_database"          # Naam van de database die aangemaakt wordt
  deletionProtected: true          # Bescherming tegen onbedoelde verwijdering
```

## Automatisch Gegenereerde Environment Variabelen

Wanneer database integratie is ingeschakeld, worden de volgende environment variabelen automatisch beschikbaar:

### Laravel & Yii2
- `DB_HOST` - Database host
- `DB_PORT` - Database poort
- `DB_DATABASE` - Database naam
- `DB_USERNAME` - Database gebruikersnaam
- `DB_PASSWORD` - Database wachtwoord

### WordPress Bedrock
- `DB_HOST` - Database host
- `DB_PORT` - Database poort
- `DB_NAME` - Database naam
- `DB_USER` - Database gebruikersnaam
- `DB_PASSWORD` - Database wachtwoord

## Geavanceerde Configuratie

### Vooraf Geconfigureerde Secret Templates

Alle charts hebben nu vooraf geconfigureerde secret templates voor eenvoudig gebruik:

```yaml
# Laravel (MySQL) - vooraf geconfigureerd
database:
  enabled: true
  instance: "my-mysql-cluster"
  name: "laravel_app"
  # secretsTemplates zijn al ingesteld:
  # DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD

# WordPress Bedrock - vooraf geconfigureerd
database:
  enabled: true
  instance: "my-mysql-cluster"
  name: "wordpress_site"
  # secretsTemplates zijn al ingesteld:
  # DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

# Yii2 (MySQL) - vooraf geconfigureerd
database:
  enabled: true
  instance: "my-mysql-cluster"
  name: "yii2_app"
  # secretsTemplates zijn al ingesteld:
  # DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD
```

### Custom Secret Templates

Je kunt nog steeds aangepaste secret templates toevoegen:

```yaml
database:
  enabled: true
  instance: "my-mysql-cluster"
  name: "my_app_database"
  secretsTemplates:
    # Standaard templates blijven behouden
    DB_HOST: "{{ .DatabaseHost }}"
    DB_PORT: "{{ .DatabasePort }}"
    # Extra aangepaste templates
    PASSWORD_USER: "{{ .Password }}_{{ .UserName }}"
    DATABASE_URL: "mysql://{{ .UserName }}:{{ .Password }}@{{ .DatabaseHost }}:{{ .DatabasePort }}/{{ .DatabaseName }}"
```

### Deletion Protection

Standaard is deletion protection ingeschakeld. Om dit uit te schakelen:

```yaml
database:
  enabled: true
  instance: "my-postgres-cluster"
  name: "my_app_database"
  deletionProtected: false
```

## Voorbeelden

### Laravel Applicatie

```yaml
# values.yaml
database:
  enabled: true
  instance: "production-mysql"  # MySQL cluster voor Laravel
  name: "laravel_app"
  # secretsTemplates zijn vooraf geconfigureerd voor MySQL compatibiliteit

laravel:
  env:
    APP_NAME: "My Laravel App"
    APP_ENV: production
    APP_DEBUG: "false"

migrationJob:
  enabled: true
```

### WordPress Bedrock Site

```yaml
# values.yaml
database:
  enabled: true
  instance: "production-mysql"  # MySQL cluster voor WordPress
  name: "wordpress_site"
  # secretsTemplates zijn vooraf geconfigureerd voor WordPress Bedrock

wordpress:
  env:
    WP_ENV: production
    WP_HOME: https://example.com
    WP_SITEURL: https://example.com/wp

redis:
  enabled: true
```

### Yii2 Applicatie

```yaml
# values.yaml
database:
  enabled: true
  instance: "production-mysql"  # MySQL cluster voor Yii2
  name: "yii2_app"
  # secretsTemplates zijn vooraf geconfigureerd voor MySQL compatibiliteit

yii2:
  env:
    YII_ENV: production
    YII_DEBUG: "false"

queueWorkers:
  enabled: true
  workers:
    - name: queue
      replicas: 2
```

## Deployment

1. **Zorg dat de DB Operator is geïnstalleerd** in je Kubernetes cluster
2. **Configureer je values.yaml** met de database instellingen
3. **Deploy je applicatie**:

```bash
helm install my-app ./charts/laravel --values values.yaml
```

## Wat Gebeurt Er Achter de Schermen

1. **Database CRD wordt aangemaakt** - De chart maakt een Database Custom Resource aan
2. **DB Operator verwerkt de CRD** - De DB Operator ziet de nieuwe Database resource en maakt de database aan
3. **Secret wordt gegenereerd** - De DB Operator maakt een Kubernetes Secret aan met de database credentials
4. **Credentials worden gemount** - De chart mount automatisch de credentials als environment variabelen in je containers

## Testen

Er is een test script beschikbaar om de integratie te valideren:

```bash
./test-db-operator-integration.sh
```

Dit script test:
- ✅ Helm template rendering
- ✅ Database CRD generatie
- ✅ Secret referenties in deployments
- ✅ Environment variabelen configuratie
- ✅ Disabled database scenario

## Troubleshooting

### Database wordt niet aangemaakt

1. Controleer of de DB Operator draait:
   ```bash
   kubectl get pods -n db-operator-system
   ```

2. Controleer de Database CRD:
   ```bash
   kubectl get database
   kubectl describe database <database-name>
   ```

3. Controleer de DB Operator logs:
   ```bash
   kubectl logs -n db-operator-system deployment/db-operator
   ```

### Secret wordt niet aangemaakt

1. Controleer of de Database resource bestaat:
   ```bash
   kubectl get database <database-name> -o yaml
   ```

2. Controleer de status van de Database resource:
   ```bash
   kubectl describe database <database-name>
   ```

### Environment variabelen zijn niet beschikbaar

1. Controleer of het secret bestaat:
   ```bash
   kubectl get secret <app-name>-db-credentials
   ```

2. Controleer de inhoud van het secret:
   ```bash
   kubectl get secret <app-name>-db-credentials -o yaml
   ```

3. Controleer de pod environment variabelen:
   ```bash
   kubectl exec <pod-name> -- env | grep DB_
   ```

## Meer Informatie

- [DB Operator Documentation](https://github.com/db-operator/db-operator)
- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Helm Values Files](https://helm.sh/docs/chart_template_guide/values_files/)