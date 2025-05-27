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
            // Constrói a URL com os parâmetros
            const url = new URL(this.apiUrl);
            url.searchParams.append('action', action);
            
            // Adiciona os parâmetros adicionais
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
            
            console.log(`Fazendo requisição GET para: ${url}`);
            
            // Realiza a requisição
            const response = await fetch(url, {
                method: 'GET',
                redirect: 'follow' // Necessário para Apps Script Web Apps
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
            
            // Realiza a requisição
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                redirect: 'follow', // Necessário para Apps Script Web Apps
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
    
    /**
     * Busca a lista de turmas
     * @returns {Promise<Array>} - Lista de turmas
     */
    async getTurmas() {
        return this.get('getTurmas');
    }
    
    /**
     * Busca a lista de disciplinas
     * @returns {Promise<Array>} - Lista de disciplinas
     */
    async getDisciplinas() {
        return this.get('getDisciplinas');
    }
    
    /**
     * Busca a lista de professores
     * @returns {Promise<Array>} - Lista de professores
     */
    async getProfessores() {
        return this.get('getProfessores');
    }
    
    /**
     * Busca a lista de alunos de uma turma
     * @param {string} turmaId - ID da turma
     * @returns {Promise<Array>} - Lista de alunos
     */
    async getAlunos(turmaId) {
        return this.get('getAlunos', { turmaId });
    }
    
    /**
     * Salva os dados de uma chamada
     * @param {Object} dadosChamada - Dados da chamada a serem salvos
     * @returns {Promise<Object>} - Confirmação do salvamento
     */
    async salvarChamada(dadosChamada) {
        return this.post('salvarChamada', dadosChamada);
    }
    
    /**
     * Salva múltiplas chamadas em lote
     * @param {Array<Object>} listaChamadas - Lista de chamadas a serem salvas
     * @returns {Promise<Object>} - Confirmação do salvamento em lote
     */
    async salvarChamadasEmLote(listaChamadas) {
        return this.post('salvarChamadasEmLote', listaChamadas);
    }
    
    /**
     * Gera um relatório
     * @param {string} tipo - Tipo de relatório
     * @param {Object} params - Parâmetros do relatório
     * @returns {Promise<Object>} - Dados do relatório
     */
    async gerarRelatorio(tipo, params) {
        return this.get('getRelatorio', { tipo, ...params });
    }
    
    /**
     * Gera um relatório em PDF
     * @param {string} tipoRelatorio - Tipo de relatório
     * @param {Object} dadosRelatorio - Dados do relatório
     * @returns {Promise<Object>} - URL do PDF gerado
     */
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
