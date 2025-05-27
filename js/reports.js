/**
 * reports.js - Funções específicas para geração e exibição de relatórios
 * 
 * Este arquivo contém a lógica para geração, exibição e exportação
 * de relatórios de frequência.
 */

class ReportsManager {
    /**
     * Inicializa o gerenciador de relatórios
     */
    constructor() {
        // Escuta eventos de navegação
        document.addEventListener('navigation', (event) => {
            if (event.detail.view === 'report-view' && event.detail.params) {
                this.initReportView(event.detail.params);
            }
        });
    }
    
    /**
     * Inicializa a visualização de relatório
     * @param {Object} params - Parâmetros do relatório (reportType, filters)
     */
    async initReportView(params) {
        console.log('Inicializando visualização de relatório:', params);
        
        if (!params.reportType || !params.filters) {
            ui.showNotification('Parâmetros de relatório inválidos.', 'error');
            ui.navigateTo('reports');
            return;
        }
        
        // Configura o título do relatório
        this.setReportTitle(params.reportType);
        
        // Configura o botão de voltar
        const backToFiltersBtn = document.getElementById('backToFiltersBtn');
        if (backToFiltersBtn) {
            backToFiltersBtn.addEventListener('click', () => {
                ui.navigateTo('report-filters', { reportType: params.reportType });
            });
        }
        
        // Gera e exibe o relatório
        await this.generateReport(params.reportType, params.filters);
    }
    
    /**
     * Define o título do relatório
     * @param {string} reportType - Tipo de relatório
     */
    setReportTitle(reportType) {
        const reportTitle = document.getElementById('reportTitle');
        if (!reportTitle) return;
        
        switch (reportType) {
            case 'presencaTurma':
                reportTitle.textContent = 'Presença por Turma';
                break;
            case 'rankingFaltosos':
                reportTitle.textContent = 'Ranking de Faltosos';
                break;
            case 'diasLetivos':
                reportTitle.textContent = 'Dias Letivos';
                break;
            case 'historicoAluno':
                reportTitle.textContent = 'Histórico por Aluno';
                break;
            case 'frequenciaDisciplina':
                reportTitle.textContent = 'Frequência por Disciplina';
                break;
            default:
                reportTitle.textContent = 'Relatório';
        }
    }
    
    /**
     * Gera e exibe o relatório
     * @param {string} reportType - Tipo de relatório
     * @param {Object} filters - Filtros do relatório
     */
    async generateReport(reportType, filters) {
        try {
            app.setLoading(true);
            
            // Busca os dados do relatório
            const reportData = await api.gerarRelatorio(reportType, filters);
            
            if (!reportData) {
                ui.showNotification('Nenhum dado encontrado para o relatório.', 'warning');
                return;
            }
            
            console.log('Dados do relatório:', reportData);
            
            // Exibe as informações do relatório
            this.displayReportInfo(reportType, reportData, filters);
            
            // Exibe o conteúdo do relatório
            this.displayReportContent(reportType, reportData);
            
            // Configura os botões de download
            this.setupDownloadButtons(reportType, reportData);
            
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            ui.showNotification('Erro ao gerar relatório. Verifique sua conexão.', 'error');
        } finally {
            app.setLoading(false);
        }
    }
    
    /**
     * Exibe as informações do relatório
     * @param {string} reportType - Tipo de relatório
     * @param {Object} reportData - Dados do relatório
     * @param {Object} filters - Filtros aplicados
     */
    async displayReportInfo(reportType, reportData, filters) {
        const reportInfo = document.getElementById('reportInfo');
        if (!reportInfo) return;
        
        // Limpa as informações anteriores
        reportInfo.innerHTML = '';
        
        // Adiciona informações comuns
        if (reportData.periodo) {
            const periodoInfo = document.createElement('p');
            periodoInfo.innerHTML = `<strong>Período:</strong> ${ui.formatDate(reportData.periodo.inicio)} a ${ui.formatDate(reportData.periodo.fim)}`;
            reportInfo.appendChild(periodoInfo);
        }
        
        // Adiciona informações específicas por tipo de relatório
        switch (reportType) {
            case 'presencaTurma':
            case 'rankingFaltosos':
            case 'diasLetivos':
                if (reportData.turma) {
                    const turmaInfo = document.createElement('p');
                    turmaInfo.innerHTML = `<strong>Turma:</strong> ${reportData.turma.Nome_Turma}`;
                    reportInfo.appendChild(turmaInfo);
                }
                break;
                
            case 'historicoAluno':
                if (reportData.aluno) {
                    const alunoInfo = document.createElement('p');
                    alunoInfo.innerHTML = `<strong>Aluno:</strong> ${reportData.aluno.nome}`;
                    reportInfo.appendChild(alunoInfo);
                    
                    const turmaInfo = document.createElement('p');
                    turmaInfo.innerHTML = `<strong>Turma:</strong> ${reportData.aluno.turma}`;
                    reportInfo.appendChild(turmaInfo);
                }
                break;
                
            case 'frequenciaDisciplina':
                if (reportData.disciplina) {
                    const disciplinaInfo = document.createElement('p');
                    disciplinaInfo.innerHTML = `<strong>Disciplina:</strong> ${reportData.disciplina.Nome_Disciplina}`;
                    reportInfo.appendChild(disciplinaInfo);
                }
                
                if (reportData.turma) {
                    const turmaInfo = document.createElement('p');
                    turmaInfo.innerHTML = `<strong>Turma:</strong> ${reportData.turma.Nome_Turma}`;
                    reportInfo.appendChild(turmaInfo);
                }
                break;
        }
    }
    
    /**
     * Exibe o conteúdo do relatório
     * @param {string} reportType - Tipo de relatório
     * @param {Object} reportData - Dados do relatório
     */
    displayReportContent(reportType, reportData) {
        const reportContent = document.getElementById('reportContent');
        if (!reportContent) return;
        
        // Limpa o conteúdo anterior
        reportContent.innerHTML = '';
        
        // Cria o conteúdo específico por tipo de relatório
        switch (reportType) {
            case 'presencaTurma':
                this.displayPresencaTurmaReport(reportContent, reportData);
                break;
                
            case 'rankingFaltosos':
                this.displayRankingFaltososReport(reportContent, reportData);
                break;
                
            case 'diasLetivos':
                this.displayDiasLetivosReport(reportContent, reportData);
                break;
                
            case 'historicoAluno':
                this.displayHistoricoAlunoReport(reportContent, reportData);
                break;
                
            case 'frequenciaDisciplina':
                this.displayFrequenciaDisciplinaReport(reportContent, reportData);
                break;
                
            default:
                reportContent.innerHTML = '<p>Tipo de relatório não suportado.</p>';
        }
    }
    
    /**
     * Exibe relatório de presença por turma
     * @param {HTMLElement} container - Elemento container
     * @param {Object} data - Dados do relatório
     */
    displayPresencaTurmaReport(container, data) {
        // Cria o container para o gráfico
        const chartContainer = document.createElement('div');
        chartContainer.style.height = '300px';
        chartContainer.style.marginBottom = '20px';
        container.appendChild(chartContainer);
        
        // Cria o canvas para o gráfico
        const canvas = document.createElement('canvas');
        canvas.id = 'presencaChart';
        chartContainer.appendChild(canvas);
        
        // Cria a tabela de dados
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        container.appendChild(tableContainer);
        
        const table = document.createElement('table');
        tableContainer.appendChild(table);
        
        // Cabeçalho da tabela
        const thead = document.createElement('thead');
        table.appendChild(thead);
        
        const headerRow = document.createElement('tr');
        thead.appendChild(headerRow);
        
        const headers = ['Nome do Aluno', 'Presenças', 'Faltas', 'Faltas Justificadas', 'Asteriscos', 'Dispensas', '% Presença'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        // Corpo da tabela
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
        
        // Dados para o gráfico
        const labels = [];
        const presencaData = [];
        const faltaData = [];
        
        // Adiciona as linhas da tabela
        data.alunos.forEach(aluno => {
            const row = document.createElement('tr');
            tbody.appendChild(row);
            
            // Nome do aluno
            const tdNome = document.createElement('td');
            tdNome.textContent = aluno.nome;
            row.appendChild(tdNome);
            
            // Presenças
            const tdPresencas = document.createElement('td');
            tdPresencas.textContent = aluno.totais.presente;
            row.appendChild(tdPresencas);
            
            // Faltas
            const tdFaltas = document.createElement('td');
            tdFaltas.textContent = aluno.totais.falta;
            row.appendChild(tdFaltas);
            
            // Faltas Justificadas
            const tdJustificadas = document.createElement('td');
            tdJustificadas.textContent = aluno.totais.justificada;
            row.appendChild(tdJustificadas);
            
            // Asteriscos
            const tdAsteriscos = document.createElement('td');
            tdAsteriscos.textContent = aluno.totais.asterisco;
            row.appendChild(tdAsteriscos);
            
            // Dispensas
            const tdDispensas = document.createElement('td');
            tdDispensas.textContent = aluno.totais.dispensa;
            row.appendChild(tdDispensas);
            
            // % Presença
            const tdPercentual = document.createElement('td');
            tdPercentual.textContent = `${aluno.percentualPresenca}%`;
            row.appendChild(tdPercentual);
            
            // Adiciona dados para o gráfico
            labels.push(aluno.nome);
            presencaData.push(aluno.percentualPresenca);
            faltaData.push(100 - aluno.percentualPresenca);
        });
        
        // Cria o gráfico
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '% Presença',
                        data: presencaData,
                        backgroundColor: CONFIG.STATUS_COLORS.Presente,
                        borderColor: CONFIG.STATUS_COLORS.Presente,
                        borderWidth: 1
                    },
                    {
                        label: '% Ausência',
                        data: faltaData,
                        backgroundColor: CONFIG.STATUS_COLORS.Falta,
                        borderColor: CONFIG.STATUS_COLORS.Falta,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Percentual (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Alunos'
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Exibe relatório de ranking de faltosos
     * @param {HTMLElement} container - Elemento container
     * @param {Object} data - Dados do relatório
     */
    displayRankingFaltososReport(container, data) {
        // Cria o container para o gráfico
        const chartContainer = document.createElement('div');
        chartContainer.style.height = '300px';
        chartContainer.style.marginBottom = '20px';
        container.appendChild(chartContainer);
        
        // Cria o canvas para o gráfico
        const canvas = document.createElement('canvas');
        canvas.id = 'rankingChart';
        chartContainer.appendChild(canvas);
        
        // Cria a tabela de dados
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        container.appendChild(tableContainer);
        
        const table = document.createElement('table');
        tableContainer.appendChild(table);
        
        // Cabeçalho da tabela
        const thead = document.createElement('thead');
        table.appendChild(thead);
        
        const headerRow = document.createElement('tr');
        thead.appendChild(headerRow);
        
        const headers = ['Posição', 'Nome do Aluno', 'Faltas', 'Faltas Justificadas', 'Total', '% Presença'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        // Corpo da tabela
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
        
        // Dados para o gráfico
        const labels = [];
        const faltasData = [];
        const justificadasData = [];
        
        // Adiciona as linhas da tabela
        data.ranking.forEach((aluno, index) => {
            const row = document.createElement('tr');
            tbody.appendChild(row);
            
            // Posição
            const tdPosicao = document.createElement('td');
            tdPosicao.textContent = index + 1;
            row.appendChild(tdPosicao);
            
            // Nome do aluno
            const tdNome = document.createElement('td');
            tdNome.textContent = aluno.nome;
            row.appendChild(tdNome);
            
            // Faltas
            const tdFaltas = document.createElement('td');
            tdFaltas.textContent = aluno.totais.falta;
            row.appendChild(tdFaltas);
            
            // Faltas Justificadas
            const tdJustificadas = document.createElement('td');
            tdJustificadas.textContent = aluno.totais.justificada;
            row.appendChild(tdJustificadas);
            
            // Total
            const total = aluno.totais.falta + aluno.totais.justificada;
            const tdTotal = document.createElement('td');
            tdTotal.textContent = total;
            row.appendChild(tdTotal);
            
            // % Presença
            const tdPercentual = document.createElement('td');
            tdPercentual.textContent = `${aluno.percentualPresenca}%`;
            row.appendChild(tdPercentual);
            
            // Adiciona dados para o gráfico (limitado aos 10 primeiros)
            if (index < 10) {
                labels.push(aluno.nome);
                faltasData.push(aluno.totais.falta);
                justificadasData.push(aluno.totais.justificada);
            }
        });
        
        // Cria o gráfico
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Faltas',
                        data: faltasData,
                        backgroundColor: CONFIG.STATUS_COLORS.Falta,
                        borderColor: CONFIG.STATUS_COLORS.Falta,
                        borderWidth: 1
                    },
                    {
                        label: 'Faltas Justificadas',
                        data: justificadasData,
                        backgroundColor: CONFIG.STATUS_COLORS["Falta Justificada"],
                        borderColor: CONFIG.STATUS_COLORS["Falta Justificada"],
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Número de Faltas'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Alunos'
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Exibe relatório de dias letivos
     * @param {HTMLElement} container - Elemento container
     * @param {Object} data - Dados do relatório
     */
    displayDiasLetivosReport(container, data) {
        // Cria o container para o gráfico
        const chartContainer = document.createElement('div');
        chartContainer.style.height = '300px';
        chartContainer.style.marginBottom = '20px';
        container.appendChild(chartContainer);
        
        // Cria o canvas para o gráfico
        const canvas = document.createElement('canvas');
        canvas.id = 'diasLetivosChart';
        chartContainer.appendChild(canvas);
        
        // Adiciona o total de dias letivos
        const totalDias = document.createElement('div');
        totalDias.className = 'report-summary';
        totalDias.innerHTML = `<h3>Total de Dias Letivos: ${data.totalDias}</h3>`;
        container.appendChild(totalDias);
        
        // Cria as seções por mês
        data.meses.forEach(mes => {
            const mesSection = document.createElement('div');
            mesSection.className = 'report-section';
            container.appendChild(mesSection);
            
            const mesTitle = document.createElement('h3');
            mesTitle.textContent = `${mes.nome} (${mes.total} dias)`;
            mesSection.appendChild(mesTitle);
            
            const diasList = document.createElement('div');
            diasList.className = 'dias-list';
            mesSection.appendChild(diasList);
            
            mes.dias.forEach(dia => {
                const diaItem = document.createElement('span');
                diaItem.className = 'dia-item';
                diaItem.textContent = ui.formatDate(dia);
                diasList.appendChild(diaItem);
            });
        });
        
        // Dados para o gráfico
        const labels = data.meses.map(mes => mes.nome);
        const diasData = data.meses.map(mes => mes.total);
        
        // Cria o gráfico
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Dias Letivos',
                        data: diasData,
                        backgroundColor: CONFIG.STATUS_COLORS.Presente,
                        borderColor: CONFIG.STATUS_COLORS.Presente,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Número de Dias'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Meses'
                        }
                    }
                }
            }
        });
        
        // Adiciona estilos específicos
        const style = document.createElement('style');
        style.textContent = `
            .report-summary {
                margin-bottom: 20px;
                padding: 15px;
                background-color: var(--primary-very-light);
                border-radius: var(--border-radius);
            }
            
            .report-section {
                margin-bottom: 20px;
            }
            
            .dias-list {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 10px;
            }
            
            .dia-item {
                padding: 5px 10px;
                background-color: var(--primary-very-light);
                border-radius: var(--border-radius);
                font-size: var(--font-size-sm);
            }
        `;
        container.appendChild(style);
    }
    
    /**
     * Exibe relatório de histórico de aluno
     * @param {HTMLElement} container - Elemento container
     * @param {Object} data - Dados do relatório
     */
    displayHistoricoAlunoReport(container, data) {
        // Cria o resumo
        const resumo = document.createElement('div');
        resumo.className = 'report-summary';
        container.appendChild(resumo);
        
        const resumoTitle = document.createElement('h3');
        resumoTitle.textContent = 'Resumo';
        resumo.appendChild(resumoTitle);
        
        const resumoContent = document.createElement('div');
        resumoContent.className = 'resumo-content';
        resumo.appendChild(resumoContent);
        
        // Adiciona os totais
        const totaisDiv = document.createElement('div');
        totaisDiv.className = 'totais';
        resumoContent.appendChild(totaisDiv);
        
        const totaisItems = [
            { label: 'Presenças', value: data.totais.presente, color: CONFIG.STATUS_COLORS.Presente },
            { label: 'Faltas', value: data.totais.falta, color: CONFIG.STATUS_COLORS.Falta },
            { label: 'Faltas Justificadas', value: data.totais.justificada, color: CONFIG.STATUS_COLORS["Falta Justificada"] },
            { label: 'Asteriscos', value: data.totais.asterisco, color: CONFIG.STATUS_COLORS.Asterisco },
            { label: 'Dispensas', value: data.totais.dispensa, color: CONFIG.STATUS_COLORS.Dispensa }
        ];
        
        totaisItems.forEach(item => {
            const totalItem = document.createElement('div');
            totalItem.className = 'total-item';
            totalItem.innerHTML = `
                <div class="total-value" style="color: ${item.color}">${item.value}</div>
                <div class="total-label">${item.label}</div>
            `;
            totaisDiv.appendChild(totalItem);
        });
        
        // Adiciona o gráfico de pizza
        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.style.width = '200px';
        chartContainer.style.height = '200px';
        resumoContent.appendChild(chartContainer);
        
        const canvas = document.createElement('canvas');
        canvas.id = 'historicoChart';
        chartContainer.appendChild(canvas);
        
        // Cria a tabela de chamadas
        const tableTitle = document.createElement('h3');
        tableTitle.textContent = 'Detalhamento por Data';
        tableTitle.style.marginTop = '20px';
        container.appendChild(tableTitle);
        
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        container.appendChild(tableContainer);
        
        const table = document.createElement('table');
        tableContainer.appendChild(table);
        
        // Cabeçalho da tabela
        const thead = document.createElement('thead');
        table.appendChild(thead);
        
        const headerRow = document.createElement('tr');
        thead.appendChild(headerRow);
        
        const headers = ['Data', 'Disciplina', 'Professor', 'Período 1', 'Período 2', 'Período 3', 'Observação'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        // Corpo da tabela
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
        
        // Adiciona as linhas da tabela
        data.chamadas.forEach(chamada => {
            const row = document.createElement('tr');
            tbody.appendChild(row);
            
            // Data
            const tdData = document.createElement('td');
            tdData.textContent = ui.formatDate(chamada.data);
            row.appendChild(tdData);
            
            // Disciplina
            const tdDisciplina = document.createElement('td');
            tdDisciplina.textContent = chamada.disciplina;
            row.appendChild(tdDisciplina);
            
            // Professor
            const tdProfessor = document.createElement('td');
            tdProfessor.textContent = chamada.professor;
            row.appendChild(tdProfessor);
            
            // Períodos
            const periodos = [chamada.periodos.periodo1, chamada.periodos.periodo2, chamada.periodos.periodo3];
            periodos.forEach(periodo => {
                const tdPeriodo = document.createElement('td');
                tdPeriodo.textContent = periodo;
                tdPeriodo.style.color = CONFIG.STATUS_COLORS[periodo] || '';
                row.appendChild(tdPeriodo);
            });
            
            // Observação
            const tdObservacao = document.createElement('td');
            tdObservacao.textContent = chamada.observacao || '-';
            row.appendChild(tdObservacao);
        });
        
        // Cria o gráfico de pizza
        new Chart(canvas, {
            type: 'pie',
            data: {
                labels: ['Presenças', 'Faltas', 'Faltas Justificadas', 'Asteriscos', 'Dispensas'],
                datasets: [
                    {
                        data: [
                            data.totais.presente,
                            data.totais.falta,
                            data.totais.justificada,
                            data.totais.asterisco,
                            data.totais.dispensa
                        ],
                        backgroundColor: [
                            CONFIG.STATUS_COLORS.Presente,
                            CONFIG.STATUS_COLORS.Falta,
                            CONFIG.STATUS_COLORS["Falta Justificada"],
                            CONFIG.STATUS_COLORS.Asterisco,
                            CONFIG.STATUS_COLORS.Dispensa
                        ]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
        
        // Adiciona estilos específicos
        const style = document.createElement('style');
        style.textContent = `
            .report-summary {
                margin-bottom: 20px;
                padding: 15px;
                background-color: var(--primary-very-light);
                border-radius: var(--border-radius);
            }
            
            .resumo-content {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                margin-top: 10px;
                justify-content: space-between;
            }
            
            .totais {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .total-item {
                text-align: center;
                min-width: 80px;
            }
            
            .total-value {
                font-size: var(--font-size-2xl);
                font-weight: bold;
            }
            
            .total-label {
                font-size: var(--font-size-sm);
                color: var(--text-muted);
            }
            
            .chart-container {
                margin: 0 auto;
            }
            
            @media (max-width: 768px) {
                .resumo-content {
                    flex-direction: column;
                }
                
                .chart-container {
                    width: 100% !important;
                }
            }
        `;
        container.appendChild(style);
    }
    
    /**
     * Exibe relatório de frequência por disciplina
     * @param {HTMLElement} container - Elemento container
     * @param {Object} data - Dados do relatório
     */
    displayFrequenciaDisciplinaReport(container, data) {
        // Cria o resumo
        const resumo = document.createElement('div');
        resumo.className = 'report-summary';
        container.appendChild(resumo);
        
        const resumoTitle = document.createElement('h3');
        resumoTitle.textContent = 'Resumo Geral';
        resumo.appendChild(resumoTitle);
        
        const resumoContent = document.createElement('div');
        resumoContent.className = 'resumo-content';
        resumo.appendChild(resumoContent);
        
        // Adiciona os totais
        const totaisDiv = document.createElement('div');
        totaisDiv.className = 'totais';
        resumoContent.appendChild(totaisDiv);
        
        const totaisItems = [
            { label: 'Presenças', value: data.totaisGerais.presente, color: CONFIG.STATUS_COLORS.Presente },
            { label: 'Faltas', value: data.totaisGerais.falta, color: CONFIG.STATUS_COLORS.Falta },
            { label: 'Faltas Justificadas', value: data.totaisGerais.justificada, color: CONFIG.STATUS_COLORS["Falta Justificada"] },
            { label: 'Asteriscos', value: data.totaisGerais.asterisco, color: CONFIG.STATUS_COLORS.Asterisco },
            { label: 'Dispensas', value: data.totaisGerais.dispensa, color: CONFIG.STATUS_COLORS.Dispensa }
        ];
        
        totaisItems.forEach(item => {
            const totalItem = document.createElement('div');
            totalItem.className = 'total-item';
            totalItem.innerHTML = `
                <div class="total-value" style="color: ${item.color}">${item.value}</div>
                <div class="total-label">${item.label}</div>
            `;
            totaisDiv.appendChild(totalItem);
        });
        
        // Adiciona o percentual de presença
        const percentualDiv = document.createElement('div');
        percentualDiv.className = 'percentual';
        percentualDiv.innerHTML = `
            <div class="percentual-value">${data.percentualPresencaGeral}%</div>
            <div class="percentual-label">Presença</div>
        `;
        resumoContent.appendChild(percentualDiv);
        
        // Cria o container para o gráfico
        const chartContainer = document.createElement('div');
        chartContainer.style.height = '300px';
        chartContainer.style.marginTop = '20px';
        chartContainer.style.marginBottom = '20px';
        container.appendChild(chartContainer);
        
        // Cria o canvas para o gráfico
        const canvas = document.createElement('canvas');
        canvas.id = 'frequenciaChart';
        chartContainer.appendChild(canvas);
        
        // Cria a tabela de dados por data
        const tableTitle = document.createElement('h3');
        tableTitle.textContent = 'Detalhamento por Data';
        container.appendChild(tableTitle);
        
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        container.appendChild(tableContainer);
        
        const table = document.createElement('table');
        tableContainer.appendChild(table);
        
        // Cabeçalho da tabela
        const thead = document.createElement('thead');
        table.appendChild(thead);
        
        const headerRow = document.createElement('tr');
        thead.appendChild(headerRow);
        
        const headers = ['Data', 'Presenças', 'Faltas', 'Faltas Justificadas', 'Asteriscos', 'Dispensas', '% Presença'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        
        // Corpo da tabela
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
        
        // Dados para o gráfico
        const labels = [];
        const presencaData = [];
        
        // Adiciona as linhas da tabela
        data.estatisticasPorData.forEach(estatistica => {
            const row = document.createElement('tr');
            tbody.appendChild(row);
            
            // Data
            const tdData = document.createElement('td');
            tdData.textContent = ui.formatDate(estatistica.data);
            row.appendChild(tdData);
            
            // Presenças
            const tdPresencas = document.createElement('td');
            tdPresencas.textContent = estatistica.totais.presente;
            row.appendChild(tdPresencas);
            
            // Faltas
            const tdFaltas = document.createElement('td');
            tdFaltas.textContent = estatistica.totais.falta;
            row.appendChild(tdFaltas);
            
            // Faltas Justificadas
            const tdJustificadas = document.createElement('td');
            tdJustificadas.textContent = estatistica.totais.justificada;
            row.appendChild(tdJustificadas);
            
            // Asteriscos
            const tdAsteriscos = document.createElement('td');
            tdAsteriscos.textContent = estatistica.totais.asterisco;
            row.appendChild(tdAsteriscos);
            
            // Dispensas
            const tdDispensas = document.createElement('td');
            tdDispensas.textContent = estatistica.totais.dispensa;
            row.appendChild(tdDispensas);
            
            // % Presença
            const tdPercentual = document.createElement('td');
            tdPercentual.textContent = `${estatistica.percentualPresenca}%`;
            row.appendChild(tdPercentual);
            
            // Adiciona dados para o gráfico
            labels.push(ui.formatDate(estatistica.data));
            presencaData.push(estatistica.percentualPresenca);
        });
        
        // Cria o gráfico
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '% Presença',
                        data: presencaData,
                        backgroundColor: 'rgba(66, 153, 225, 0.2)',
                        borderColor: CONFIG.STATUS_COLORS.Presente,
                        borderWidth: 2,
                        tension: 0.1,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Percentual de Presença (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Data'
                        }
                    }
                }
            }
        });
        
        // Adiciona estilos específicos
        const style = document.createElement('style');
        style.textContent = `
            .report-summary {
                margin-bottom: 20px;
                padding: 15px;
                background-color: var(--primary-very-light);
                border-radius: var(--border-radius);
            }
            
            .resumo-content {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                margin-top: 10px;
                justify-content: space-between;
                align-items: center;
            }
            
            .totais {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .total-item {
                text-align: center;
                min-width: 80px;
            }
            
            .total-value {
                font-size: var(--font-size-2xl);
                font-weight: bold;
            }
            
            .total-label {
                font-size: var(--font-size-sm);
                color: var(--text-muted);
            }
            
            .percentual {
                text-align: center;
                background-color: var(--primary-color);
                color: white;
                padding: 15px;
                border-radius: var(--border-radius);
                min-width: 120px;
            }
            
            .percentual-value {
                font-size: var(--font-size-3xl);
                font-weight: bold;
            }
            
            .percentual-label {
                font-size: var(--font-size-sm);
            }
        `;
        container.appendChild(style);
    }
    
    /**
     * Configura os botões de download
     * @param {string} reportType - Tipo de relatório
     * @param {Object} reportData - Dados do relatório
     */
    setupDownloadButtons(reportType, reportData) {
        // Botão de download PDF
        const downloadPdfBtn = document.getElementById('downloadPdfBtn');
        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', async () => {
                try {
                    ui.showNotification('Gerando PDF...', 'info');
                    app.setLoading(true);
                    
                    const pdfResult = await api.gerarRelatorioPDF(reportType, reportData);
                    
                    if (pdfResult && pdfResult.pdfUrl) {
                        app.openInNewTab(pdfResult.pdfUrl);
                        ui.showNotification('PDF gerado com sucesso!', 'success');
                    } else {
                        ui.showNotification('Erro ao gerar PDF.', 'error');
                    }
                } catch (error) {
                    console.error('Erro ao gerar PDF:', error);
                    ui.showNotification('Erro ao gerar PDF. Verifique sua conexão.', 'error');
                } finally {
                    app.setLoading(false);
                }
            });
        }
        
        // Botão de download CSV
        const downloadCsvBtn = document.getElementById('downloadCsvBtn');
        if (downloadCsvBtn) {
            downloadCsvBtn.addEventListener('click', () => {
                try {
                    let csvData = [];
                    let filename = `relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
                    
                    // Prepara os dados para CSV com base no tipo de relatório
                    switch (reportType) {
                        case 'presencaTurma':
                            csvData = reportData.alunos.map(aluno => ({
                                Nome: aluno.nome,
                                Presencas: aluno.totais.presente,
                                Faltas: aluno.totais.falta,
                                FaltasJustificadas: aluno.totais.justificada,
                                Asteriscos: aluno.totais.asterisco,
                                Dispensas: aluno.totais.dispensa,
                                PercentualPresenca: `${aluno.percentualPresenca}%`
                            }));
                            break;
                            
                        case 'rankingFaltosos':
                            csvData = reportData.ranking.map((aluno, index) => ({
                                Posicao: index + 1,
                                Nome: aluno.nome,
                                Faltas: aluno.totais.falta,
                                FaltasJustificadas: aluno.totais.justificada,
                                Total: aluno.totais.falta + aluno.totais.justificada,
                                PercentualPresenca: `${aluno.percentualPresenca}%`
                            }));
                            break;
                            
                        case 'diasLetivos':
                            // Cria um CSV com todos os dias letivos
                            const diasList = [];
                            reportData.meses.forEach(mes => {
                                mes.dias.forEach(dia => {
                                    diasList.push({
                                        Data: ui.formatDate(dia),
                                        Mes: mes.nome
                                    });
                                });
                            });
                            csvData = diasList;
                            break;
                            
                        case 'historicoAluno':
                            csvData = reportData.chamadas.map(chamada => ({
                                Data: ui.formatDate(chamada.data),
                                Disciplina: chamada.disciplina,
                                Professor: chamada.professor,
                                Periodo1: chamada.periodos.periodo1,
                                Periodo2: chamada.periodos.periodo2,
                                Periodo3: chamada.periodos.periodo3,
                                Observacao: chamada.observacao || ''
                            }));
                            break;
                            
                        case 'frequenciaDisciplina':
                            csvData = reportData.estatisticasPorData.map(estatistica => ({
                                Data: ui.formatDate(estatistica.data),
                                Presencas: estatistica.totais.presente,
                                Faltas: estatistica.totais.falta,
                                FaltasJustificadas: estatistica.totais.justificada,
                                Asteriscos: estatistica.totais.asterisco,
                                Dispensas: estatistica.totais.dispensa,
                                PercentualPresenca: `${estatistica.percentualPresenca}%`
                            }));
                            break;
                    }
                    
                    // Exporta para CSV
                    app.exportToCSV(csvData, filename);
                    ui.showNotification('CSV gerado com sucesso!', 'success');
                } catch (error) {
                    console.error('Erro ao gerar CSV:', error);
                    ui.showNotification('Erro ao gerar CSV.', 'error');
                }
            });
        }
    }
}

// Cria uma instância global do gerenciador de relatórios
const reportsManager = new ReportsManager();
