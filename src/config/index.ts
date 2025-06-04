import type { AppConfig } from '../types';

// =====================================================
// 🔧 CONFIGURAÇÃO - COLOQUE SUAS CREDENCIAIS AQUI
// =====================================================

export const CONFIG: AppConfig = {
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
    MEETINGS: 'productivity-hub-meetings',
    MEETING_TEMPLATES: 'productivity-hub-meeting-templates',
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
    MAX_MEETINGS_PER_DAY: 50,
  },

  // Meeting platforms
  MEETING_PLATFORMS: {
    TEAMS: {
      name: 'Microsoft Teams',
      baseUrl: 'https://teams.microsoft.com',
      icon: '🔷',
      color: 'blue',
    },
    MEET: {
      name: 'Google Meet',
      baseUrl: 'https://meet.google.com',
      icon: '🟢',
      color: 'green',
    },
    ZOOM: {
      name: 'Zoom',
      baseUrl: 'https://zoom.us',
      icon: '🟦',
      color: 'blue',
    },
    CUSTOM: {
      name: 'Personalizado',
      baseUrl: '',
      icon: '🔗',
      color: 'gray',
    },
  },
};

// =====================================================
// Default data
// =====================================================

export const DEFAULT_TASKS = [
  {
    id: 1,
    text: "Revisar tickets do sistema",
    type: "trabalho" as const,
    completed: false,
    priority: "alta" as const,
    createdAt: new Date(),
  },
  {
    id: 2,
    text: "Finalizar projeto React",
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

// =====================================================
// Meeting utilities
// =====================================================

export const QUICK_MEETING_OPTIONS = [
  { label: "Em 15min", minutes: 15, icon: "⚡", duration: 30 },
  { label: "Em 30min", minutes: 30, icon: "🕐", duration: 60 },
  { label: "Em 1h", minutes: 60, icon: "⏰", duration: 60 },
  { label: "Amanhã 9h", minutes: -1, icon: "📅", duration: 60 }, // special case
];

export const generateMeetingId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export const generateMeetingLink = (platform: string): string => {
  const meetingId = generateMeetingId();
  
  switch (platform) {
    case 'meet':
      return `https://meet.google.com/${meetingId}`;
    case 'zoom':
      return `https://zoom.us/j/${meetingId}`;
    case 'teams':
      return `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${meetingId}`;
    case 'custom':
      return 'Link personalizado';
    default:
      return '#';
  }
};

export const getPlatformIcon = (platform: string): string => {
  return APP_CONSTANTS.MEETING_PLATFORMS[platform.toUpperCase() as keyof typeof APP_CONSTANTS.MEETING_PLATFORMS]?.icon || '🔗';
};

export const getPlatformName = (platform: string): string => {
  return APP_CONSTANTS.MEETING_PLATFORMS[platform.toUpperCase() as keyof typeof APP_CONSTANTS.MEETING_PLATFORMS]?.name || 'Personalizado';
};

// =====================================================
// Date utilities
// =====================================================

export const formatMeetingTime = (startTime: Date, endTime: Date): string => {
  const startFormatted = startTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endFormatted = endTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${startFormatted} - ${endFormatted}`;
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
};

export const isThisWeek = (date: Date): boolean => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  return date >= startOfWeek && date <= endOfWeek;
};

// =====================================================
// Notification utilities
// =====================================================

export const requestNotificationPermission = async (): Promise<boolean> => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const showNotification = (title: string, options?: NotificationOptions) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  }
};

// =====================================================
// Local storage helpers
// =====================================================

export const saveToStorage = <T>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
};

export const loadFromStorage = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Erro ao carregar do localStorage:', error);
    return null;
  }
};