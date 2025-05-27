/**
 * api.js - Funções para comunicação com o backend (Google Apps Script)
 * 
 * Este arquivo contém todas as funções necessárias para se comunicar
 * com o backend do Google Apps Script, incluindo busca de dados e
 * envio de informações.
 */

class API {
    /**
     * Inicializa a API com a URL do Web App
     */
    constructor() {
        this.apiUrl = CONFIG.API_URL;
    }

    /**
     * Realiza uma requisição GET para o Google Apps Script
     * @param {string} action - A ação a ser executada no backend
     * @param {Object} params - Parâmetros adicionais para a requisição
     * @returns {Promise<Object>} - Promessa que resolve com os dados da resposta
     */
    async get(action, params = {}) {
        try {
            const url = new URL(this.apiUrl);
            url.searchParams.append('action', action);
            
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
            
            console.log(`Fazendo requisição GET para: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                redirect: 'follow'
            });
            
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.status === 'error') {
                throw new Error(`Erro do servidor: ${result.message}`);
            }
            
            return result.data;
        } catch (error) {
            console.error('Erro na requisição GET:', error);
            throw error;
        }
    }
    
    /**
     * Realiza uma requisição POST para o Google Apps Script
     * @param {string} action - A ação a ser executada no backend
     * @param {Object} data - Dados a serem enviados no corpo da requisição
     * @returns {Promise<Object>} - Promessa que resolve com os dados da resposta
     */
    async post(action, data = {}) {
        try {
            console.log(`Fazendo requisição POST para: ${this.apiUrl}`, { action, data });
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                redirect: 'follow',
                body: JSON.stringify({
                    action: action,
                    data: data
                })
            });
            
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.status === 'error') {
                throw new Error(`Erro do servidor: ${result.message}`);
            }
            
            return result.data;
        } catch (error) {
            console.error('Erro na requisição POST:', error);
            throw error;
        }
    }
    
    // --- Funções específicas para as operações do sistema ---
    
    async getTurmas() {
        return this.get('getTurmas');
    }
    
    async getDisciplinas() {
        return this.get('getDisciplinas');
    }
    
    async getProfessores() {
        return this.get('getProfessores');
    }
    
    async getAlunos(turmaId) {
        return this.get('getAlunos', { turmaId });
    }
    
    async salvarChamada(dadosChamada) {
        return this.post('salvarChamada', dadosChamada);
    }
    
    async salvarChamadasEmLote(listaChamadas) {
        return this.post('salvarChamadasEmLote', listaChamadas);
    }
    
    async gerarRelatorio(tipo, params) {
        return this.get('getRelatorio', { tipo, ...params });
    }
    
    async gerarRelatorioPDF(tipoRelatorio, dadosRelatorio) {
        return this.get('getRelatorio', { 
            tipo: 'pdf',
            tipoRelatorio,
            dadosRelatorio: JSON.stringify(dadosRelatorio)
        });
    }
}

// Cria uma instância global da API
const api = new API();

/**
 * Função utilitária para requisições flexíveis com `fetch`
 * 
 * @param {string} endpoint - Query string de parâmetros ou vazio
 * @param {string} method - Método HTTP ('GET' ou 'POST')
 * @param {Object|null} data - Dados para enviar no corpo (POST)
 * @returns {Promise<Object>} - Objeto vazio por causa do no-cors
 */
async function fetchAPI(endpoint, method = 'GET', data = null) {
    try {
        const url = `${CONFIG.API_URL}${endpoint ? '?' + endpoint : ''}`;
        
        const options = {
            method: method,
            mode: 'no-cors',  // Importante para evitar bloqueios de CORS
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data && method === 'POST') {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, options);
        
        // Como estamos usando 'no-cors', não podemos ler a resposta diretamente
        return {};
    } catch (error) {
        console.error('Erro na API:', error);
        throw error;
    }
}
