/**
 * app.js - Arquivo principal da aplicação
 * 
 * Este arquivo contém a lógica principal da aplicação, incluindo
 * inicialização, roteamento e gerenciamento de estado global.
 */

class App {
    /**
     * Inicializa a aplicação
     */
    constructor() {
        // Estado global da aplicação
        this.state = {
            currentView: '',
            user: null,
            isLoading: false
        };
        
        // Inicializa a aplicação quando o DOM estiver pronto
        document.addEventListener('DOMContentLoaded', () => this.init());
    }
    
    /**
     * Inicializa a aplicação
     */
    async init() {
        console.log('Inicializando aplicação...');
        
        // Configura o roteamento baseado em hash
        this.setupRouting();
        
        // Verifica se a API está configurada
        this.checkApiConfig();
        
        // Carrega a view inicial com base na URL atual ou vai para home
        const hash = window.location.hash.substring(1) || 'home';
        ui.navigateTo(hash);
    }
    
    /**
     * Configura o roteamento baseado em hash
     */
    setupRouting() {
        // Escuta mudanças no hash da URL
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.substring(1);
            if (hash) {
                ui.navigateTo(hash);
            }
        });
        
        // Escuta eventos de navegação disparados pela UI
        document.addEventListener('navigation', (event) => {
            this.state.currentView = event.detail.view;
        });
    }
    
    /**
     * Verifica se a URL da API está configurada
     */
    checkApiConfig() {
        if (CONFIG.API_URL === "SUA_URL_DO_WEB_APP_AQUI") {
            console.warn('A URL da API não foi configurada. O aplicativo não funcionará corretamente.');
            
            // Exibe uma notificação para o usuário
            setTimeout(() => {
                ui.showNotification(
                    'A URL da API não foi configurada. Edite o arquivo js/config.js com a URL do seu Web App do Google Apps Script.',
                    'warning',
                    10000
                );
            }, 1000);
        }
    }
    
    /**
     * Define o estado de carregamento da aplicação
     * @param {boolean} isLoading - Se a aplicação está carregando
     */
    setLoading(isLoading) {
        this.state.isLoading = isLoading;
        
        // Atualiza a UI para refletir o estado de carregamento
        const loadingContainers = document.querySelectorAll('.loading-container');
        loadingContainers.forEach(container => {
            if (isLoading) {
                container.style.display = 'flex';
            } else {
                container.style.display = 'none';
            }
        });
    }
    
    /**
     * Exporta dados para CSV
     * @param {Array} data - Array de objetos a serem exportados
     * @param {string} filename - Nome do arquivo CSV
     */
    exportToCSV(data, filename) {
        if (!data || !data.length) {
            ui.showNotification('Nenhum dado para exportar', 'warning');
            return;
        }
        
        // Obtém os cabeçalhos (chaves do primeiro objeto)
        const headers = Object.keys(data[0]);
        
        // Cria as linhas do CSV
        const csvRows = [];
        
        // Adiciona o cabeçalho
        csvRows.push(headers.join(','));
        
        // Adiciona os dados
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                // Escapa aspas e adiciona aspas em volta de strings
                return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
            });
            csvRows.push(values.join(','));
        }
        
        // Combina em uma única string
        const csvString = csvRows.join('\n');
        
        // Cria um blob e um link para download
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    /**
     * Abre uma URL em uma nova aba
     * @param {string} url - URL a ser aberta
     */
    openInNewTab(url) {
        window.open(url, '_blank');
    }
}

// Cria uma instância global da aplicação
const app = new App();
