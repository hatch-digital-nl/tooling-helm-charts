/**
 * Helm Charts Repository Website
 * JavaScript voor het laden en tonen van chart informatie uit index.yaml
 */

class HelmChartsApp {
    constructor() {
        this.charts = [];
        this.filteredCharts = [];
        this.repoUrl = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCharts();
    }

    setupEventListeners() {
        // Zoek functionaliteit
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterCharts(e.target.value);
            });
        }
    }

    async loadCharts() {
        try {
            this.showLoading();
            
            // Bepaal de basis URL voor de index.yaml
            const baseUrl = this.getBaseUrl();
            const indexUrl = `${baseUrl}/index.yaml`;
            
            console.log('Loading charts from:', indexUrl);
            
            const response = await fetch(indexUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const yamlText = await response.text();
            console.log('Raw YAML text:', yamlText.substring(0, 500) + '...');
            
            const data = this.parseYaml(yamlText);
            console.log('Parsed data:', data);
            
            this.processChartsData(data, baseUrl);
            this.renderCharts();
            this.showContent();
            
        } catch (error) {
            console.error('Error loading charts:', error);
            this.showError(error.message);
        }
    }

    getBaseUrl() {
        // Detecteer automatisch de GitHub Pages URL
        const hostname = window.location.hostname;
        const pathname = window.location.pathname;
        
        if (hostname.includes('github.io')) {
            // GitHub Pages URL structuur
            const pathParts = pathname.split('/').filter(part => part);
            if (pathParts.length > 0) {
                return `https://${hostname}/${pathParts[0]}`;
            }
            return `https://${hostname}`;
        }
        
        // Voor lokale ontwikkeling of andere hosting
        return window.location.origin + pathname.replace('/docs/', '').replace('/index.html', '');
    }

    parseYaml(yamlText) {
        // Verbeterde YAML parser voor index.yaml structuur
        const lines = yamlText.split('\n');
        const data = { entries: {} };
        
        let currentChart = null;
        let currentVersion = null;
        let inEntries = false;
        let currentKey = null;
        let arrayMode = false;
        let currentArray = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            const indentLevel = line.length - line.trimStart().length;
            
            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('#')) continue;
            
            if (trimmedLine === 'entries:') {
                inEntries = true;
                continue;
            }
            
            if (!inEntries) continue;
            
            // Chart naam (2 spaces indent)
            if (indentLevel === 2 && trimmedLine.endsWith(':')) {
                currentChart = trimmedLine.replace(':', '');
                data.entries[currentChart] = [];
                currentVersion = null;
                arrayMode = false;
                continue;
            }
            
            // Versie entry (4 spaces indent, starts with -)
            if (indentLevel === 4 && trimmedLine.startsWith('- ') && currentChart) {
                // Finish previous array if needed
                if (arrayMode && currentKey && currentVersion) {
                    currentVersion[currentKey] = currentArray;
                    arrayMode = false;
                }
                
                currentVersion = {};
                data.entries[currentChart].push(currentVersion);
                
                // Parse inline properties after the dash
                const inlineContent = trimmedLine.substring(2).trim();
                if (inlineContent) {
                    const match = inlineContent.match(/^([^:]+):\s*(.*)$/);
                    if (match) {
                        const key = match[1].trim();
                        let value = match[2].trim();
                        value = this.cleanYamlValue(value);
                        currentVersion[key] = value;
                    }
                }
                continue;
            }
            
            // Properties (6+ spaces indent)
            if (indentLevel >= 6 && currentVersion) {
                // Handle array continuation
                if (arrayMode && trimmedLine.startsWith('- ')) {
                    let arrayValue = trimmedLine.substring(2).trim();
                    arrayValue = this.cleanYamlValue(arrayValue);
                    currentArray.push(arrayValue);
                    continue;
                }
                
                // Finish previous array if starting new property
                if (arrayMode && currentKey && trimmedLine.includes(':')) {
                    currentVersion[currentKey] = currentArray;
                    arrayMode = false;
                }
                
                // Parse key-value pairs
                const match = trimmedLine.match(/^([^:]+):\s*(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    let value = match[2].trim();
                    
                    currentKey = key;
                    
                    // Check if this starts an array
                    if (!value || value === '') {
                        // Look ahead to see if next line is an array item
                        if (i + 1 < lines.length) {
                            const nextLine = lines[i + 1];
                            const nextTrimmed = nextLine.trim();
                            const nextIndent = nextLine.length - nextLine.trimStart().length;
                            
                            if (nextIndent > indentLevel && nextTrimmed.startsWith('- ')) {
                                arrayMode = true;
                                currentArray = [];
                                continue;
                            }
                        }
                        currentVersion[key] = '';
                    } else {
                        value = this.cleanYamlValue(value);
                        
                        // Handle inline arrays
                        if (value.startsWith('[') && value.endsWith(']')) {
                            const arrayContent = value.slice(1, -1);
                            if (arrayContent.trim()) {
                                value = arrayContent.split(',').map(item => this.cleanYamlValue(item.trim()));
                            } else {
                                value = [];
                            }
                        }
                        
                        currentVersion[key] = value;
                    }
                }
            }
        }
        
        // Finish any remaining array
        if (arrayMode && currentKey && currentVersion) {
            currentVersion[currentKey] = currentArray;
        }
        
        return data;
    }

    cleanYamlValue(value) {
        if (!value) return '';
        
        // Remove surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        
        return value;
    }

    processChartsData(data, baseUrl) {
        this.repoUrl = baseUrl;
        this.charts = [];
        
        console.log('Processing charts data:', data.entries);
        
        for (const [chartName, versions] of Object.entries(data.entries || {})) {
            console.log(`Processing chart: ${chartName}`, versions);
            
            if (versions && Array.isArray(versions) && versions.length > 0) {
                // Neem de nieuwste versie (eerste in de lijst)
                const latestVersion = versions[0];
                console.log(`Latest version for ${chartName}:`, latestVersion);
                
                const chart = {
                    name: chartName,
                    version: latestVersion.version || 'unknown',
                    appVersion: latestVersion.appVersion || 'N/A',
                    description: latestVersion.description || 'Geen beschrijving beschikbaar',
                    keywords: Array.isArray(latestVersion.keywords) ? latestVersion.keywords : [],
                    created: latestVersion.created || '',
                    urls: Array.isArray(latestVersion.urls) ? latestVersion.urls : [],
                    maintainers: Array.isArray(latestVersion.maintainers) ? latestVersion.maintainers : []
                };
                
                console.log(`Processed chart:`, chart);
                this.charts.push(chart);
            }
        }
        
        console.log('All processed charts:', this.charts);
        
        // Sorteer charts alfabetisch
        this.charts.sort((a, b) => a.name.localeCompare(b.name));
        this.filteredCharts = [...this.charts];
    }

    filterCharts(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (!term) {
            this.filteredCharts = [...this.charts];
        } else {
            this.filteredCharts = this.charts.filter(chart => {
                return chart.name.toLowerCase().includes(term) ||
                       chart.description.toLowerCase().includes(term) ||
                       chart.keywords.some(keyword => keyword.toLowerCase().includes(term));
            });
        }
        
        this.renderCharts();
    }

    renderCharts() {
        const container = document.getElementById('charts-grid');
        const countElement = document.getElementById('chart-count');
        const noResults = document.getElementById('no-results');
        
        if (!container) return;
        
        // Update count
        if (countElement) {
            countElement.textContent = this.filteredCharts.length;
        }
        
        // Show/hide no results
        if (noResults) {
            noResults.style.display = this.filteredCharts.length === 0 ? 'block' : 'none';
        }
        
        // Render charts
        container.innerHTML = this.filteredCharts.map(chart => this.renderChartCard(chart)).join('');
        
        // Update repository info
        this.renderRepoInfo();
    }

    renderChartCard(chart) {
        const keywords = chart.keywords.map(keyword => 
            `<span class="chart-card__keyword">${this.escapeHtml(keyword)}</span>`
        ).join('');
        
        const installCommand = `helm install my-${chart.name} my-repo/${chart.name}`;
        
        return `
            <div class="chart-card">
                <div class="chart-card__header">
                    <h3 class="chart-card__name">${this.escapeHtml(chart.name)}</h3>
                    <span class="chart-card__version">v${this.escapeHtml(chart.version)}</span>
                </div>
                
                <p class="chart-card__description">${this.escapeHtml(chart.description)}</p>
                
                ${keywords ? `<div class="chart-card__keywords">${keywords}</div>` : ''}
                
                <div class="chart-card__meta">
                    <div><strong>Chart Versie:</strong> ${this.escapeHtml(chart.version)}</div>
                    <div><strong>App Versie:</strong> ${this.escapeHtml(chart.appVersion)}</div>
                </div>
                
                <div class="chart-card__install">
                    <div class="chart-card__install-title">Installatie Commando:</div>
                    <code>${this.escapeHtml(installCommand)}</code>
                    <button onclick="app.copyToClipboard('${installCommand}')" class="button button--small chart-card__copy">
                        Kopiëren
                    </button>
                </div>
            </div>
        `;
    }

    renderRepoInfo() {
        const repoUrlElement = document.getElementById('repo-url');
        const helmCommandsElement = document.getElementById('helm-commands');
        
        if (repoUrlElement) {
            repoUrlElement.textContent = this.repoUrl;
        }
        
        if (helmCommandsElement) {
            const commands = [
                `# Repository toevoegen`,
                `helm repo add my-repo ${this.repoUrl}`,
                `helm repo update`,
                ``,
                `# Charts bekijken`,
                `helm search repo my-repo`,
                ``,
                `# Voorbeeld installatie`,
                `helm install my-release my-repo/[CHART_NAME]`
            ].join('\n');
            
            helmCommandsElement.textContent = commands;
        }
    }

    copyToClipboard(text) {
        // Als text een element ID is, haal de tekst op
        if (typeof text === 'string' && document.getElementById(text)) {
            const element = document.getElementById(text);
            text = element.textContent || element.innerText;
        }
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Gekopieerd naar klembord!');
            }).catch(err => {
                console.error('Failed to copy:', err);
                this.fallbackCopyToClipboard(text);
            });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showToast('Gekopieerd naar klembord!');
        } catch (err) {
            console.error('Fallback copy failed:', err);
            this.showToast('Kopiëren mislukt. Selecteer en kopieer handmatig.', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    showToast(message, type = 'success') {
        // Eenvoudige toast notificatie
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 1000;
            font-size: 14px;
            transition: all 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('error').style.display = 'none';
        document.getElementById('controls').style.display = 'none';
        document.getElementById('repo-info').style.display = 'none';
        document.getElementById('charts-container').style.display = 'none';
        document.getElementById('no-results').style.display = 'none';
    }

    showError(message) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        document.getElementById('error-message').textContent = message;
        document.getElementById('controls').style.display = 'none';
        document.getElementById('repo-info').style.display = 'none';
        document.getElementById('charts-container').style.display = 'none';
        document.getElementById('no-results').style.display = 'none';
    }

    showContent() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'none';
        document.getElementById('controls').style.display = 'block';
        document.getElementById('repo-info').style.display = 'block';
        document.getElementById('charts-container').style.display = 'block';
    }
}

// Globale functies voor HTML onclick handlers
function loadCharts() {
    if (window.app) {
        window.app.loadCharts();
    }
}

function copyToClipboard(text) {
    if (window.app) {
        window.app.copyToClipboard(text);
    }
}

// Initialiseer de app wanneer de pagina geladen is
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HelmChartsApp();
});