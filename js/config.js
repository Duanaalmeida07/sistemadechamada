/**
 * config.js - Configurações do Sistema de Chamada
 * 
 * Este arquivo contém as configurações globais do aplicativo,
 * incluindo a URL do Google Apps Script publicado.
 */

const CONFIG = {
    // URL do Google Apps Script Web App publicado
    // IMPORTANTE: Substitua esta URL pela URL do seu Web App após publicá-lo
    API_URL: "https://script.google.com/macros/s/AKfycby1L8FdvNusY2-8p8JoXWONrLczWIyzk2RMRKzkYBuW6eIolsadEZh-Vc556NZmbkGJ/exec",
    
    // Nome do aplicativo
    APP_NAME: "Sistema de Chamada",
    
    // Versão do aplicativo
    APP_VERSION: "1.0.0",
    
    // Configurações de cache local (localStorage)
    STORAGE_KEYS: {
        THEME: "sistema_chamada_theme",
        DEFAULT_TURMA: "sistema_chamada_default_turma",
        DEFAULT_PROFESSOR: "sistema_chamada_default_professor",
        USER_DATA: "sistema_chamada_user_data"
    },
    
    // Status de presença disponíveis
    ATTENDANCE_STATUS: {
        PRESENTE: "Presente",
        FALTA: "Falta",
        FALTA_JUSTIFICADA: "Falta Justificada",
        ASTERISCO: "Asterisco",
        DISPENSA: "Dispensa"
    },
    
    // Cores para os diferentes status (para gráficos e indicadores visuais)
    STATUS_COLORS: {
        "Presente": "#48bb78", // Verde
        "Falta": "#f56565",    // Vermelho
        "Falta Justificada": "#ecc94b", // Amarelo
        "Asterisco": "#4299e1", // Azul
        "Dispensa": "#a0aec0"   // Cinza
    }
};
