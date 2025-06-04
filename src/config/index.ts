import type { AppConfig } from '../types';

// =====================================================
// 🔧 CONFIGURAÇÃO - COLOQUE SUAS CREDENCIAIS AQUI
// =====================================================

export const CONFIG: AppConfig = {
  // Microsoft Teams (Azure App Registration)
  TEAMS: {
    CLIENT_ID: import.meta.env.VITE_TEAMS_CLIENT_ID || "SEU_CLIENT_ID_AQUI",
    TENANT_ID: import.meta.env.VITE_TEAMS_TENANT_ID || "SEU_TENANT_ID_AQUI",
    REDIRECT_URI: typeof window !== 'undefined' ? window.location.origin : '',
    SCOPES: ["User.Read", "Calendars.ReadWrite", "offline_access"]
  },
  
  // OpenAI API
  OPENAI: {
    API_KEY: import.meta.env.VITE_OPENAI_API_KEY || "SEU_OPENAI_API_KEY_AQUI",
    MODEL: import.meta.env.VITE_OPENAI_MODEL || "gpt-3.5-turbo",
    BASE_URL: "https://api.openai.com/v1"
  }
};

// =====================================================
// Environment validation
// =====================================================

export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;

// Check if required environment variables are set
export const isTeamsConfigured = () => {
  return CONFIG.TEAMS.CLIENT_ID !== "SEU_CLIENT_ID_AQUI" && 
         CONFIG.TEAMS.TENANT_ID !== "SEU_TENANT_ID_AQUI";
};

export const isOpenAIConfigured = () => {
  return CONFIG.OPENAI.API_KEY !== "SEU_OPENAI_API_KEY_AQUI";
};

// =====================================================
// App Constants
// =====================================================

export const APP_CONSTANTS = {
  // Pomodoro timer defaults
  POMODORO: {
    WORK_MINUTES: 25,
    SHORT_BREAK_MINUTES: 5,
    LONG_BREAK_MINUTES: 15,
    SESSIONS_UNTIL_LONG_BREAK: 4,
  },
  
  // Local storage keys
  STORAGE_KEYS: {
    TASKS: 'productivity-hub-tasks',
    PROJECTS: 'productivity-hub-projects',
    POMODORO_SESSIONS: 'productivity-hub-pomodoro-sessions',
    USER_PREFERENCES: 'productivity-hub-preferences',
  },
  
  // API endpoints and timeouts
  API: {
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
  },
  
  // UI constants
  UI: {
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 5000,
    MAX_SUBTASKS_PER_PROJECT: 20,
    MAX_CHAT_MESSAGES: 100,
  },
  
  // Microsoft Graph API
  GRAPH_API: {
    BASE_URL: 'https://graph.microsoft.com/v1.0',
    ENDPOINTS: {
      ME: '/me',
      EVENTS: '/me/events',
      CALENDAR_VIEW: '/me/calendar/calendarView',
    }
  }
};

// =====================================================
// Default data
// =====================================================

export const DEFAULT_TASKS = [
  {
    id: 1,
    text: "Daily às 10:00",
    type: "trabalho" as const,
    completed: false,
    priority: "alta" as const,
    createdAt: new Date(),
  },
  {
    id: 2,
    text: "Revisar tickets do Movidesk",
    type: "trabalho" as const,
    completed: false,
    priority: "media" as const,
    createdAt: new Date(),
  },
  {
    id: 3,
    text: "Estudar para prova de SQL",
    type: "faculdade" as const,
    completed: false,
    priority: "alta" as const,
    createdAt: new Date(),
  },
];

export const DEFAULT_PROJECTS = [
  {
    id: 1,
    title: "Sistema de Gestão Financeira",
    category: "trabalho" as const,
    deadline: "2025-06-30",
    status: "em_andamento" as const,
    progress: 65,
    description: "Desenvolvimento completo do módulo financeiro",
    subtasks: [
      { id: 11, text: "Modelagem do banco de dados", completed: true, createdAt: new Date() },
      { id: 12, text: "API de transações", completed: true, createdAt: new Date() },
      { id: 13, text: "Interface de relatórios", completed: false, createdAt: new Date() },
      { id: 14, text: "Testes unitários", completed: false, createdAt: new Date() },
      { id: 15, text: "Deploy em produção", completed: false, createdAt: new Date() },
    ],
    expanded: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const DEFAULT_MEETINGS = [
  {
    id: 1,
    title: "Daily Standup",
    time: "10:00 - 10:30",
    attendees: 8,
    link: "https://teams.microsoft.com/...",
    type: "recorrente" as const,
  },
  {
    id: 2,
    title: "Review de Sprint",
    time: "14:00 - 15:00",
    attendees: 12,
    link: "https://teams.microsoft.com/...",
    type: "unica" as const,
  },
];