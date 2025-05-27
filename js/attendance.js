/**
 * attendance.js - Funções específicas para o registro de chamada
 * 
 * Este arquivo contém a lógica para o registro de chamada,
 * incluindo a exibição dos alunos e o salvamento dos dados.
 */

class AttendanceManager {
    /**
     * Inicializa o gerenciador de chamada
     */
    constructor() {
        // Estado da chamada atual
        this.currentAttendance = {
            professorId: '',
            turmaId: '',
            disciplinaId: '',
            data: '',
            alunos: [],
            currentIndex: 0,
            chamadas: [] // Armazena as chamadas para envio em lote
        };
        
        // Escuta eventos de navegação
        document.addEventListener('navigation', (event) => {
            if (event.detail.view === 'attendance-register' && event.detail.params) {
                this.initAttendanceRegister(event.detail.params);
            }
        });
    }
    
    /**
     * Inicializa a tela de registro de chamada
     * @param {Object} params - Parâmetros da chamada (professorId, turmaId, disciplinaId, data)
     */
    async initAttendanceRegister(params) {
        console.log('Inicializando registro de chamada:', params);
        
        // Salva os parâmetros no estado
        this.currentAttendance.professorId = params.professorId;
        this.currentAttendance.turmaId = params.turmaId;
        this.currentAttendance.disciplinaId = params.disciplinaId;
        this.currentAttendance.data = params.data;
        this.currentAttendance.currentIndex = 0;
        this.currentAttendance.chamadas = [];
        
        // Exibe as informações da chamada
        this.updateAttendanceInfo();
        
        // Carrega a lista de alunos
        await this.loadStudents();
        
        // Configura os eventos dos botões
        this.setupButtonEvents();
        
        // Exibe o primeiro aluno
        this.showCurrentStudent();
    }
    
    /**
     * Atualiza as informações da chamada na tela
     */
    async updateAttendanceInfo() {
        try {
            // Busca informações da turma e disciplina
            const turmas = await api.getTurmas();
            const disciplinas = await api.getDisciplinas();
            
            const turma = turmas.find(t => t.ID_Turma === this.currentAttendance.turmaId);
            const disciplina = disciplinas.find(d => d.ID_Disciplina === this.currentAttendance.disciplinaId);
            
            // Atualiza os elementos na tela
            const turmaInfo = document.getElementById('turmaInfo');
            const disciplinaInfo = document.getElementById('disciplinaInfo');
            const dataInfo = document.getElementById('dataInfo');
            
            if (turmaInfo) turmaInfo.textContent = turma ? turma.Nome_Turma : this.currentAttendance.turmaId;
            if (disciplinaInfo) disciplinaInfo.textContent = disciplina ? disciplina.Nome_Disciplina : this.currentAttendance.disciplinaId;
            if (dataInfo) dataInfo.textContent = ui.formatDate(this.currentAttendance.data);
        } catch (error) {
            console.error('Erro ao atualizar informações da chamada:', error);
            ui.showNotification('Erro ao carregar informações da chamada.', 'error');
        }
    }
    
    /**
     * Carrega a lista de alunos da turma
     */
    async loadStudents() {
        try {
            app.setLoading(true);
            
            // Busca os alunos da turma
            const alunos = await api.getAlunos(this.currentAttendance.turmaId);
            
            if (!alunos || alunos.length === 0) {
                ui.showNotification('Nenhum aluno encontrado para esta turma.', 'warning');
                ui.navigateTo('attendance');
                return;
            }
            
            // Salva a lista de alunos no estado
            this.currentAttendance.alunos = alunos;
            
            // Atualiza os contadores
            const currentStudent = document.getElementById('currentStudent');
            const totalStudents = document.getElementById('totalStudents');
            
            if (currentStudent) currentStudent.textContent = '1';
            if (totalStudents) totalStudents.textContent = alunos.length.toString();
            
            // Inicializa a barra de progresso
            this.updateProgressBar();
        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
            ui.showNotification('Erro ao carregar alunos. Verifique sua conexão.', 'error');
        } finally {
            app.setLoading(false);
        }
    }
    
    /**
     * Configura os eventos dos botões
     */
    setupButtonEvents() {
        // Botões de status
        const statusButtons = document.querySelectorAll('.status-btn');
        statusButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove a classe 'active' de todos os botões do mesmo período
                const period = button.parentElement.getAttribute('data-period');
                const periodButtons = document.querySelectorAll(`.status-buttons[data-period="${period}"] .status-btn`);
                periodButtons.forEach(btn => btn.classList.remove('active'));
                
                // Adiciona a classe 'active' ao botão clicado
                button.classList.add('active');
            });
        });
        
        // Botão de aluno anterior
        const prevStudentBtn = document.getElementById('prevStudentBtn');
        if (prevStudentBtn) {
            prevStudentBtn.addEventListener('click', () => {
                this.saveCurrentStudent(false);
                this.showPreviousStudent();
            });
        }
        
        // Botão de salvar e próximo aluno
        const saveStudentBtn = document.getElementById('saveStudentBtn');
        if (saveStudentBtn) {
            saveStudentBtn.addEventListener('click', () => {
                this.saveCurrentStudent(true);
            });
        }
        
        // Botão de concluir chamada
        const finishAttendanceBtn = document.getElementById('finishAttendanceBtn');
        if (finishAttendanceBtn) {
            finishAttendanceBtn.addEventListener('click', () => {
                this.finishAttendance();
            });
        }
        
        // Botão de cancelar
        const cancelAttendanceBtn = document.getElementById('cancelAttendanceBtn');
        if (cancelAttendanceBtn) {
            cancelAttendanceBtn.addEventListener('click', () => {
                if (confirm('Tem certeza que deseja cancelar a chamada? Os dados não salvos serão perdidos.')) {
                    ui.navigateTo('attendance');
                }
            });
        }
    }
    
    /**
     * Exibe o aluno atual
     */
    showCurrentStudent() {
        const currentIndex = this.currentAttendance.currentIndex;
        const alunos = this.currentAttendance.alunos;
        
        if (currentIndex < 0 || currentIndex >= alunos.length) {
            console.error('Índice de aluno inválido:', currentIndex);
            return;
        }
        
        const aluno = alunos[currentIndex];
        
        // Atualiza o nome do aluno
        const studentName = document.getElementById('studentName');
        if (studentName) studentName.textContent = aluno.Nome_Completo;
        
        // Limpa os botões de status
        const statusButtons = document.querySelectorAll('.status-btn');
        statusButtons.forEach(button => button.classList.remove('active'));
        
        // Seleciona o status "Presente" por padrão para cada período
        for (let i = 1; i <= 3; i++) {
            const presenteBtn = document.querySelector(`.status-buttons[data-period="${i}"] .status-btn[data-status="Presente"]`);
            if (presenteBtn) presenteBtn.classList.add('active');
        }
        
        // Limpa o campo de observação
        const observationInput = document.getElementById('observationInput');
        if (observationInput) observationInput.value = '';
        
        // Atualiza o contador de alunos
        const currentStudent = document.getElementById('currentStudent');
        if (currentStudent) currentStudent.textContent = (currentIndex + 1).toString();
        
        // Atualiza a barra de progresso
        this.updateProgressBar();
        
        // Desabilita o botão "Anterior" se estiver no primeiro aluno
        const prevStudentBtn = document.getElementById('prevStudentBtn');
        if (prevStudentBtn) {
            prevStudentBtn.disabled = currentIndex === 0;
        }
        
        // Atualiza o texto do botão "Salvar e Próximo" se estiver no último aluno
        const saveStudentBtn = document.getElementById('saveStudentBtn');
        if (saveStudentBtn) {
            if (currentIndex === alunos.length - 1) {
                saveStudentBtn.textContent = 'Salvar e Concluir';
            } else {
                saveStudentBtn.textContent = 'Salvar e Próximo';
                saveStudentBtn.innerHTML = 'Salvar e Próximo <i class="fas fa-arrow-right"></i>';
            }
        }
    }
    
    /**
     * Exibe o aluno anterior
     */
    showPreviousStudent() {
        if (this.currentAttendance.currentIndex > 0) {
            this.currentAttendance.currentIndex--;
            this.showCurrentStudent();
        }
    }
    
    /**
     * Exibe o próximo aluno
     */
    showNextStudent() {
        if (this.currentAttendance.currentIndex < this.currentAttendance.alunos.length - 1) {
            this.currentAttendance.currentIndex++;
            this.showCurrentStudent();
        } else {
            // Se for o último aluno, finaliza a chamada
            this.finishAttendance();
        }
    }
    
    /**
     * Salva os dados do aluno atual
     * @param {boolean} goToNext - Se deve avançar para o próximo aluno após salvar
     */
    saveCurrentStudent(goToNext = true) {
        const currentIndex = this.currentAttendance.currentIndex;
        const aluno = this.currentAttendance.alunos[currentIndex];
        
        // Obtém os status selecionados para cada período
        const periodos = {};
        for (let i = 1; i <= 3; i++) {
            const activeBtn = document.querySelector(`.status-buttons[data-period="${i}"] .status-btn.active`);
            periodos[`Periodo_${i}`] = activeBtn ? activeBtn.getAttribute('data-status') : 'Presente';
        }
        
        // Obtém a observação
        const observationInput = document.getElementById('observationInput');
        const observacao = observationInput ? observationInput.value.trim() : '';
        
        // Cria o objeto de chamada
        const chamada = {
            Data: this.currentAttendance.data,
            ID_Professor: this.currentAttendance.professorId,
            ID_Disciplina: this.currentAttendance.disciplinaId,
            ID_Turma: this.currentAttendance.turmaId,
            ID_Aluno: aluno.ID_Aluno,
            Periodo_1: periodos.Periodo_1,
            Periodo_2: periodos.Periodo_2,
            Periodo_3: periodos.Periodo_3,
            Observacao: observacao
        };
        
        // Adiciona à lista de chamadas para envio em lote
        this.currentAttendance.chamadas.push(chamada);
        
        console.log('Chamada salva para aluno:', aluno.Nome_Completo, chamada);
        
        // Avança para o próximo aluno ou finaliza
        if (goToNext) {
            if (currentIndex < this.currentAttendance.alunos.length - 1) {
                this.showNextStudent();
            } else {
                this.finishAttendance();
            }
        }
    }
    
    /**
     * Atualiza a barra de progresso
     */
    updateProgressBar() {
        const currentIndex = this.currentAttendance.currentIndex;
        const totalAlunos = this.currentAttendance.alunos.length;
        
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            const progressPercentage = (currentIndex / totalAlunos) * 100;
            progressFill.style.width = `${progressPercentage}%`;
        }
    }
    
    /**
     * Finaliza a chamada e envia os dados para o servidor
     */
    async finishAttendance() {
        try {
            // Salva o aluno atual se ainda não foi salvo
            const currentIndex = this.currentAttendance.currentIndex;
            const chamadas = this.currentAttendance.chamadas;
            
            if (chamadas.length <= currentIndex) {
                this.saveCurrentStudent(false);
            }
            
            // Verifica se há chamadas para enviar
            if (chamadas.length === 0) {
                ui.showNotification('Nenhuma chamada para salvar.', 'warning');
                return;
            }
            
            // Exibe mensagem de carregamento
            ui.showNotification('Salvando chamadas...', 'info');
            app.setLoading(true);
            
            // Envia as chamadas em lote
            const result = await api.salvarChamadasEmLote(chamadas);
            
            console.log('Resultado do salvamento em lote:', result);
            
            // Exibe mensagem de sucesso
            ui.showNotification('Chamada concluída com sucesso!', 'success');
            
            // Volta para a tela de seleção
            ui.navigateTo('attendance');
        } catch (error) {
            console.error('Erro ao finalizar chamada:', error);
            ui.showNotification('Erro ao salvar chamadas. Verifique sua conexão.', 'error');
        } finally {
            app.setLoading(false);
        }
    }
}

// Cria uma instância global do gerenciador de chamada
const attendanceManager = new AttendanceManager();
