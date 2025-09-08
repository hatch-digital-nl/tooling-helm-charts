# Helm Charts Website

Deze directory bevat een statische website die automatisch een overzicht toont van alle beschikbare Helm charts en hun versies door de `index.yaml` file te lezen.

## Functionaliteit

- **Automatisch laden**: De website haalt automatisch de `index.yaml` op van de GitHub Pages URL
- **Chart overzicht**: Toont alle beschikbare charts met versies, beschrijvingen en keywords
- **Zoek functionaliteit**: Filter charts op naam of keywords
- **Installatie instructies**: Dynamisch gegenereerde Helm commando's
- **Responsive design**: Werkt op desktop en mobiel
- **Kopieer functionaliteit**: Eenvoudig kopiëren van installatie commando's

## Bestanden

- [`index.html`](index.html) - Hoofdpagina met chart overzicht
- [`assets/css/style.css`](assets/css/style.css) - CSS styling
- [`assets/js/charts.js`](assets/js/charts.js) - JavaScript voor index.yaml parsing
- [`assets/favicon.ico`](assets/favicon.ico) - Website icoon

## Hoe het werkt

1. De JavaScript code detecteert automatisch de GitHub Pages URL
2. Het haalt de `index.yaml` file op van de root van de repository
3. Het parst de YAML structuur om chart informatie te extraheren
4. Het toont de charts in een responsive grid layout
5. Gebruikers kunnen zoeken en filteren op charts
6. Installatie commando's worden automatisch gegenereerd

## Deployment

De website wordt automatisch gedeployed via GitHub Actions wanneer:
- Er wijzigingen worden gepusht naar de `main` branch
- De workflow handmatig wordt gestart

De website is beschikbaar op: `https://[USERNAME].github.io/helm_charts/docs/`

## Lokaal testen

Om de website lokaal te testen:

```bash
# Start een lokale webserver in de docs directory
cd docs
python -m http.server 8000

# Of met Node.js
npx serve .

# Bezoek http://localhost:8000
```

**Let op**: Voor lokaal testen moet je de `index.yaml` file handmatig in de docs directory plaatsen, of de JavaScript code aanpassen om naar een andere URL te wijzen.

## Technische details

- **Vanilla JavaScript**: Geen externe dependencies
- **CSS Grid/Flexbox**: Voor responsive layout
- **YAML parsing**: Eenvoudige custom parser voor index.yaml structuur
- **Error handling**: Graceful handling van netwerk problemen
- **Accessibility**: Semantische HTML en keyboard navigation

## Aanpassingen

Om de website aan te passen:

1. **Styling**: Bewerk [`assets/css/style.css`](assets/css/style.css)
2. **Functionaliteit**: Bewerk [`assets/js/charts.js`](assets/js/charts.js)
3. **Layout**: Bewerk [`index.html`](index.html)

De website wordt automatisch bijgewerkt bij de volgende deployment.