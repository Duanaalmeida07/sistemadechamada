/**
 * ui.js - Funções para manipulação da interface do usuário
 * 
 * Este arquivo contém funções para manipular o DOM, exibir notificações,
 * carregar templates e gerenciar a navegação entre as diferentes telas.
 */

class UI {
    /**
     * Inicializa a UI
     */
    constructor() {
        // Elementos principais da UI
        this.mainContent = document.getElementById('mainContent');
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.menuToggle = document.getElementById('menuToggle');
        this.closeSidebar = document.getElementById('closeSidebar');
        
        // Configuração do tema
        this.initTheme();
        
        // Configuração dos eventos do menu
        this.setupMenuEvents();
    }
    
    /**
     * Inicializa o tema da aplicação
     */
    initTheme() {
        const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light';
        document.body.setAttribute('data-theme', savedTheme);
    }
    
    /**
     * Configura os eventos do menu lateral
     */
    setupMenuEvents() {
        // Abrir menu
        this.menuToggle.addEventListener('click', () => {
            this.sidebar.classList.add('active');
            this.sidebarOverlay.classList.add('active');
        });
        
        // Fechar menu
        this.closeSidebar.addEventListener('click', () => {
            this.sidebar.classList.remove('active');
            this.sidebarOverlay.classList.remove('active');
        });
        
        // Fechar menu ao clicar no overlay
        this.sidebarOverlay.addEventListener('click', () => {
            this.sidebar.classList.remove('active');
            this.sidebarOverlay.classList.remove('active');
        });
        
        // Navegação pelo menu
        const menuItems = document.querySelectorAll('.sidebar-menu li');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const view = item.getAttribute('data-view');
                this.navigateTo(view);
                this.sidebar.classList.remove('active');
                this.sidebarOverlay.classList.remove('active');
            });
        });
    }
    
    /**
     * Carrega um template HTML
     * @param {string} templateId - ID do template a ser carregado
     * @returns {HTMLElement} - Elemento clonado do template
     */
    loadTemplate(templateId) {
        const template = document.getElementById(templateId);
        if (!template) {
            console.error(`Template não encontrado: ${templateId}`);
            return document.createElement('div');
        }
        
        return document.importNode(template.content, true);
    }
    
    /**
     * Navega para uma view específica
     * @param {string} viewName - Nome da view para navegar
     * @param {Object} params - Parâmetros adicionais para a view
     */
    navigateTo(viewName, params = {}) {
        console.log(`Navegando para: ${viewName}`, params);
        
        // Atualiza a URL com hash para permitir navegação pelo histórico
        window.location.hash = viewName;
        
        // Dispara evento personalizado para que outros módulos possam reagir
        const event = new CustomEvent('navigation', {
            detail: { view: viewName, params }
        });
        document.dispatchEvent(event);
        
        // Carrega o template apropriado
        let templateContent;
        
        switch (viewName) {
            case 'home':
                templateContent = this.loadTemplate('template-home');
                break;
            case 'attendance':
                templateContent = this.loadTemplate('template-attendance-selection');
                break;
            case 'attendance-register':
                templateContent = this.loadTemplate('template-attendance-register');
                break;
            case 'reports':
                templateContent = this.loadTemplate('template-reports');
                break;
            case 'report-filters':
                templateContent = this.loadTemplate('template-report-filters');
                break;
            case 'report-view':
                templateContent = this.loadTemplate('template-report-view');
                break;
            case 'settings':
                templateContent = this.loadTemplate('template-settings');
                break;
            default:
                templateContent = this.loadTemplate('template-home');
                console.warn(`View desconhecida: ${viewName}, carregando home`);
        }
        
        // Limpa o conteúdo atual e adiciona o novo
        this.mainContent.innerHTML = '';
        this.mainContent.appendChild(templateContent);
        
        // Rola para o topo
        window.scrollTo(0, 0);
        
        // Inicializa os eventos específicos da view
        this.initViewEvents(viewName, params);
    }
    
    /**
     * Inicializa eventos específicos para cada view
     * @param {string} viewName - Nome da view atual
     * @param {Object} params - Parâmetros da view
     */
    initViewEvents(viewName, params) {
        // Eventos comuns a todas as views
        const cards = document.querySelectorAll('.card[data-view]');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const targetView = card.getAttribute('data-view');
                this.navigateTo(targetView);
            });
        });
        
        // Eventos específicos por view
        switch (viewName) {
            case 'home':
                // Eventos específicos da home
                break;
                
            case 'attendance':
                // Formulário de seleção para chamada
                const attendanceForm = document.getElementById('attendanceSelectionForm');
                if (attendanceForm) {
                    attendanceForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        
                        // Coleta os dados do formulário
                        const professorId = document.getElementById('professorSelect').value;
                        const turmaId = document.getElementById('turmaSelect').value;
                        const disciplinaId = document.getElementById('disciplinaSelect').value;
                        const data = document.getElementById('dataInput').value;
                        
                        // Navega para a tela de registro de chamada com os parâmetros
                        this.navigateTo('attendance-register', {
                            professorId,
                            turmaId,
                            disciplinaId,
                            data
                        });
                    });
                    
                    // Preenche o formulário com valores padrão
                    const today = new Date().toISOString().split('T')[0];
                    const dataInput = document.getElementById('dataInput');
                    if (dataInput) {
                        dataInput.value = today;
                    }
                    
                    // Carrega as listas de professores, turmas e disciplinas
                    this.loadSelectOptions();
                }
                break;
                
            case 'reports':
                // Eventos para os cards de relatórios
                const reportCards = document.querySelectorAll('.card[data-report]');
                reportCards.forEach(card => {
                    card.addEventListener('click', () => {
                        const reportType = card.getAttribute('data-report');
                        this.navigateTo('report-filters', { reportType });
                    });
                });
                break;
                
            case 'report-filters':
                // Configura o formulário de filtros de relatório
                if (params.reportType) {
                    this.setupReportFilters(params.reportType);
                }
                break;
                
            case 'settings':
                // Configura a tela de configurações
                this.setupSettingsView();
                break;
        }
    }
    
    /**
     * Carrega opções para os selects de professores, turmas e disciplinas
     */
    async loadSelectOptions() {
        try {
            // Professores
            const professores = await api.getProfessores();
            const professorSelect = document.getElementById('professorSelect');
            if (professorSelect) {
                professorSelect.innerHTML = '<option value="">Selecione o professor</option>';
                professores.forEach(professor => {
                    const option = document.createElement('option');
                    option.value = professor.ID_Professor;
                    option.textContent = professor.Nome_Professor;
                    professorSelect.appendChild(option);
                });
                
                // Seleciona o professor padrão, se existir
                const defaultProfessor = localStorage.getItem(CONFIG.STORAGE_KEYS.DEFAULT_PROFESSOR);
                if (defaultProfessor) {
                    professorSelect.value = defaultProfessor;
                }
            }
            
            // Turmas
            const turmas = await api.getTurmas();
            const turmaSelect = document.getElementById('turmaSelect');
            if (turmaSelect) {
                turmaSelect.innerHTML = '<option value="">Selecione a turma</option>';
                turmas.forEach(turma => {
                    const option = document.createElement('option');
                    option.value = turma.ID_Turma;
                    option.textContent = turma.Nome_Turma;
                    turmaSelect.appendChild(option);
                });
                
                // Seleciona a turma padrão, se existir
                const defaultTurma = localStorage.getItem(CONFIG.STORAGE_KEYS.DEFAULT_TURMA);
                if (defaultTurma) {
                    turmaSelect.value = defaultTurma;
                }
            }
            
            // Disciplinas
            const disciplinas = await api.getDisciplinas();
            const disciplinaSelect = document.getElementById('disciplinaSelect');
            if (disciplinaSelect) {
                disciplinaSelect.innerHTML = '<option value="">Selecione a disciplina</option>';
                disciplinas.forEach(disciplina => {
                    const option = document.createElement('option');
                    option.value = disciplina.ID_Disciplina;
                    option.textContent = disciplina.Nome_Disciplina;
                    disciplinaSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar opções:', error);
            this.showNotification('Erro ao carregar dados. Verifique sua conexão.', 'error');
        }
    }
    
    /**
     * Configura a tela de filtros de relatório
     * @param {string} reportType - Tipo de relatório
     */
    async setupReportFilters(reportType) {
        // Define o título do relatório
        const reportTitleElement = document.getElementById('reportTypeTitle');
        if (reportTitleElement) {
            let reportTitle = '';
            
            switch (reportType) {
                case 'presencaTurma':
                    reportTitle = 'Presença por Turma';
                    break;
                case 'rankingFaltosos':
                    reportTitle = 'Ranking de Faltosos';
                    break;
                case 'diasLetivos':
                    reportTitle = 'Dias Letivos';
                    break;
                case 'historicoAluno':
                    reportTitle = 'Histórico por Aluno';
                    break;
                case 'frequenciaDisciplina':
                    reportTitle = 'Frequência por Disciplina';
                    break;
                default:
                    reportTitle = 'Relatório';
            }
            
            reportTitleElement.textContent = reportTitle;
        }
        
        // Configura os grupos de filtros visíveis com base no tipo de relatório
        const turmaFilterGroup = document.getElementById('turmaFilterGroup');
        const alunoFilterGroup = document.getElementById('alunoFilterGroup');
        const disciplinaFilterGroup = document.getElementById('disciplinaFilterGroup');
        
        // Por padrão, mostra apenas o filtro de turma
        if (turmaFilterGroup) turmaFilterGroup.style.display = 'block';
        if (alunoFilterGroup) alunoFilterGroup.style.display = 'none';
        if (disciplinaFilterGroup) disciplinaFilterGroup.style.display = 'none';
        
        // Ajusta os filtros visíveis com base no tipo de relatório
        switch (reportType) {
            case 'historicoAluno':
                if (alunoFilterGroup) alunoFilterGroup.style.display = 'block';
                break;
            case 'frequenciaDisciplina':
                if (disciplinaFilterGroup) disciplinaFilterGroup.style.display = 'block';
                break;
        }
        
        // Carrega as opções para os selects
        try {
            // Turmas
            const turmas = await api.getTurmas();
            const turmaFilterSelect = document.getElementById('turmaFilterSelect');
            if (turmaFilterSelect) {
                turmaFilterSelect.innerHTML = '<option value="">Selecione a turma</option>';
                turmas.forEach(turma => {
                    const option = document.createElement('option');
                    option.value = turma.ID_Turma;
                    option.textContent = turma.Nome_Turma;
                    turmaFilterSelect.appendChild(option);
                });
                
                // Evento para carregar alunos quando a turma for selecionada
                turmaFilterSelect.addEventListener('change', async () => {
                    const turmaId = turmaFilterSelect.value;
                    if (turmaId && alunoFilterGroup && alunoFilterGroup.style.display !== 'none') {
                        try {
                            const alunos = await api.getAlunos(turmaId);
                            const alunoFilterSelect = document.getElementById('alunoFilterSelect');
                            if (alunoFilterSelect) {
                                alunoFilterSelect.innerHTML = '<option value="">Selecione o aluno</option>';
                                alunos.forEach(aluno => {
                                    const option = document.createElement('option');
                                    option.value = aluno.ID_Aluno;
                                    option.textContent = aluno.Nome_Completo;
                                    alunoFilterSelect.appendChild(option);
                                });
                            }
                        } catch (error) {
                            console.error('Erro ao carregar alunos:', error);
                            this.showNotification('Erro ao carregar alunos.', 'error');
                        }
                    }
                });
            }
            
            // Disciplinas
            const disciplinas = await api.getDisciplinas();
            const disciplinaFilterSelect = document.getElementById('disciplinaFilterSelect');
            if (disciplinaFilterSelect) {
                disciplinaFilterSelect.innerHTML = '<option value="">Selecione a disciplina</option>';
                disciplinas.forEach(disciplina => {
                    const option = document.createElement('option');
                    option.value = disciplina.ID_Disciplina;
                    option.textContent = disciplina.Nome_Disciplina;
                    disciplinaFilterSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar opções para filtros:', error);
            this.showNotification('Erro ao carregar dados. Verifique sua conexão.', 'error');
        }
        
        // Configura datas padrão (último mês)
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        const dataInicioFilter = document.getElementById('dataInicioFilter');
        const dataFimFilter = document.getElementById('dataFimFilter');
        
        if (dataInicioFilter) {
            dataInicioFilter.value = oneMonthAgo.toISOString().split('T')[0];
        }
        
        if (dataFimFilter) {
            dataFimFilter.value = today.toISOString().split('T')[0];
        }
        
        // Configura o botão de voltar
        const backToReportsBtn = document.getElementById('backToReportsBtn');
        if (backToReportsBtn) {
            backToReportsBtn.addEventListener('click', () => {
                this.navigateTo('reports');
            });
        }
        
        // Configura o formulário de filtros
        const reportFiltersForm = document.getElementById('reportFiltersForm');
        if (reportFiltersForm) {
            reportFiltersForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Coleta os filtros
                const filters = {
                    turmaId: document.getElementById('turmaFilterSelect')?.value,
                    dataInicio: document.getElementById('dataInicioFilter')?.value,
                    dataFim: document.getElementById('dataFimFilter')?.value
                };
                
                // Adiciona filtros específicos por tipo de relatório
                if (reportType === 'historicoAluno') {
                    filters.alunoId = document.getElementById('alunoFilterSelect')?.value;
                    if (!filters.alunoId) {
                        this.showNotification('Selecione um aluno.', 'warning');
                        return;
                    }
                }
                
                if (reportType === 'frequenciaDisciplina') {
                    filters.disciplinaId = document.getElementById('disciplinaFilterSelect')?.value;
                    if (!filters.disciplinaId) {
                        this.showNotification('Selecione uma disciplina.', 'warning');
                        return;
                    }
                }
                
                // Validação básica
                if (!filters.turmaId) {
                    this.showNotification('Selecione uma turma.', 'warning');
                    return;
                }
                
                // Navega para a visualização do relatório
                this.navigateTo('report-view', {
                    reportType,
                    filters
                });
            });
        }
    }
    
    /**
     * Configura a tela de configurações
     */
    async setupSettingsView() {
        try {
            // Carrega as opções para os selects
            const turmas = await api.getTurmas();
            const professores = await api.getProfessores();
            
            // Preenche o select de turma padrão
            const defaultTurmaSelect = document.getElementById('defaultTurmaSelect');
            if (defaultTurmaSelect) {
                defaultTurmaSelect.innerHTML = '<option value="">Nenhuma</option>';
                turmas.forEach(turma => {
                    const option = document.createElement('option');
                    option.value = turma.ID_Turma;
                    option.textContent = turma.Nome_Turma;
                    defaultTurmaSelect.appendChild(option);
                });
                
                // Seleciona a turma padrão atual, se existir
                const defaultTurma = localStorage.getItem(CONFIG.STORAGE_KEYS.DEFAULT_TURMA);
                if (defaultTurma) {
                    defaultTurmaSelect.value = defaultTurma;
                }
            }
            
            // Preenche o select de professor padrão
            const defaultProfessorSelect = document.getElementById('defaultProfessorSelect');
            if (defaultProfessorSelect) {
                defaultProfessorSelect.innerHTML = '<option value="">Nenhum</option>';
                professores.forEach(professor => {
                    const option = document.createElement('option');
                    option.value = professor.ID_Professor;
                    option.textContent = professor.Nome_Professor;
                    defaultProfessorSelect.appendChild(option);
                });
                
                // Seleciona o professor padrão atual, se existir
                const defaultProfessor = localStorage.getItem(CONFIG.STORAGE_KEYS.DEFAULT_PROFESSOR);
                if (defaultProfessor) {
                    defaultProfessorSelect.value = defaultProfessor;
                }
            }
            
            // Configura o select de tema
            const themeSelect = document.getElementById('themeSelect');
            if (themeSelect) {
                const currentTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light';
                themeSelect.value = currentTheme;
                
                // Evento para mudar o tema em tempo real
                themeSelect.addEventListener('change', () => {
                    const newTheme = themeSelect.value;
                    document.body.setAttribute('data-theme', newTheme);
                });
            }
            
            // Configura o botão de salvar
            const saveSettingsBtn = document.getElementById('saveSettingsBtn');
            if (saveSettingsBtn) {
                saveSettingsBtn.addEventListener('click', () => {
                    // Salva as configurações no localStorage
                    const theme = themeSelect?.value || 'light';
                    const defaultTurma = defaultTurmaSelect?.value || '';
                    const defaultProfessor = defaultProfessorSelect?.value || '';
                    
                    localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
                    localStorage.setItem(CONFIG.STORAGE_KEYS.DEFAULT_TURMA, defaultTurma);
                    localStorage.setItem(CONFIG.STORAGE_KEYS.DEFAULT_PROFESSOR, defaultProfessor);
                    
                    this.showNotification('Configurações salvas com sucesso!', 'success');
                });
            }
        } catch (error) {
            console.error('Erro ao configurar tela de configurações:', error);
            this.showNotification('Erro ao carregar dados. Verifique sua conexão.', 'error');
        }
    }
    
    /**
     * Exibe uma notificação na tela
     * @param {string} message - Mensagem a ser exibida
     * @param {string} type - Tipo de notificação (success, error, warning, info)
     * @param {number} duration - Duração em milissegundos
     */
    showNotification(message, type = 'info', duration = 3000) {
        // Remove notificações existentes
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });
        
        // Cria o elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Adiciona ao corpo do documento
        document.body.appendChild(notification);
        
        // Adiciona classe para animar a entrada
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove após a duração especificada
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }
    
    /**
     * Formata uma data para exibição
     * @param {string} dateString - String de data no formato YYYY-MM-DD
     * @returns {string} - Data formatada
     */
    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
}

// Cria uma instância global da UI
const ui = new UI();

// Adiciona estilos CSS para notificações
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: var(--border-radius);
    color: white;
    box-shadow: var(--shadow-md);
    z-index: 1000;
    transform: translateX(120%);
    transition: transform 0.3s ease;
}

.notification.show {
    transform: translateX(0);
}

.notification-success {
    background-color: var(--success-color);
}

.notification-error {
    background-color: var(--danger-color);
}

.notification-warning {
    background-color: var(--warning-color);
}

.notification-info {
    background-color: var(--info-color);
}
`;

// Adiciona os estilos ao documento
const styleElement = document.createElement('style');
styleElement.textContent = notificationStyles;
document.head.appendChild(styleElement);
