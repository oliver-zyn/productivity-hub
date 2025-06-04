// ===================================
// Core Types
// ===================================

export type Priority = 'baixa' | 'media' | 'alta';
export type TaskType = 'trabalho' | 'faculdade' | 'pessoal';
export type ProjectStatus = 'nao_iniciado' | 'em_andamento' | 'concluido';
export type ProjectCategory = 'trabalho' | 'faculdade' | 'pessoal';
export type MeetingType = 'unica' | 'recorrente' | 'criada_ia' | 'template';
export type MeetingPlatform = 'teams' | 'meet' | 'zoom' | 'custom';
export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

// ===================================
// Task Types
// ===================================

export interface Task {
  id: number;
  text: string;
  type: TaskType;
  completed: boolean;
  priority: Priority;
  createdAt?: Date;
  completedAt?: Date;
}

export interface NewTask {
  text: string;
  type: TaskType;
  priority?: Priority;
}

// ===================================
// Project Types
// ===================================

export interface Subtask {
  id: number;
  text: string;
  completed: boolean;
  createdAt?: Date;
  completedAt?: Date;
}

export interface Project {
  id: number;
  title: string;
  category: ProjectCategory;
  deadline: string;
  status: ProjectStatus;
  progress: number;
  description: string;
  subtasks: Subtask[];
  expanded: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NewProject {
  title: string;
  category: ProjectCategory;
  deadline: string;
  description: string;
}

// ===================================
// Meeting Types - ATUALIZADOS
// ===================================

export interface MeetingTemplate {
  id: number;
  name: string;
  duration: number; // em minutos
  description: string;
  platform: MeetingPlatform;
  defaultParticipants: string[];
  isRecurring: boolean;
  category: ProjectCategory;
}

export interface Meeting {
  id: number;
  title: string;
  time: string; // formato display
  duration: number; // em minutos
  platform: MeetingPlatform;
  link?: string;
  type: MeetingType;
  startTime: Date;
  endTime: Date;
  description?: string;
  participants: string[];
  templateId?: number; // se criada a partir de template
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
}

export interface QuickMeetingOption {
  label: string;
  minutes: number; // minutos a partir de agora
  icon: string;
}

export interface NewMeeting {
  title: string;
  startTime: Date;
  duration: number;
  platform: MeetingPlatform;
  description?: string;
  participants?: string[];
  templateId?: number;
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
}

// ===================================
// Pomodoro Types
// ===================================

export interface PomodoroState {
  minutes: number;
  seconds: number;
  isActive: boolean;
  mode: PomodoroMode;
  sessions: number;
}

// ===================================
// AI Types
// ===================================

export interface AIMessage {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface AIChat {
  isOpen: boolean;
  messages: AIMessage[];
  input: string;
  isTyping: boolean;
}

export interface AICommand {
  type: 'CREATE_MEETING' | 'CREATE_PROJECT' | 'ANALYZE_PRODUCTIVITY';
  data: Record<string, string | string[] | number | boolean | null | undefined>;
}

// ===================================
// Metrics Types
// ===================================

export interface Metrics {
  tasksCompleted: number;
  tasksPlanned: number;
  pomodoroSessions: number;
  focusTime: number;
  projectsActive: number;
  meetingsToday: number;
  meetingsThisWeek: number;
}

// ===================================
// Configuration Types - SIMPLIFICADOS
// ===================================

export interface OpenAIConfig {
  API_KEY: string;
  MODEL: string;
  BASE_URL: string;
}

export interface AppConfig {
  OPENAI: OpenAIConfig;
}

// ===================================
// Store Types (Zustand) - ATUALIZADOS
// ===================================

export interface AppStore {
  // Tasks
  tasks: Task[];
  addTask: (task: NewTask) => void;
  toggleTask: (id: number) => void;
  deleteTask: (id: number) => void;

  // Projects
  projects: Project[];
  addProject: (project: NewProject) => void;
  updateProject: (id: number, updates: Partial<Project>) => void;
  deleteProject: (id: number) => void;
  toggleProjectExpanded: (id: number) => void;
  addSubtask: (projectId: number, text: string) => void;
  toggleSubtask: (projectId: number, subtaskId: number) => void;
  deleteSubtask: (projectId: number, subtaskId: number) => void;

  // Meetings - NOVO SISTEMA
  meetings: Meeting[];
  meetingTemplates: MeetingTemplate[];
  addMeeting: (meeting: NewMeeting) => void;
  updateMeeting: (id: number, updates: Partial<Meeting>) => void;
  deleteMeeting: (id: number) => void;
  addMeetingTemplate: (template: Omit<MeetingTemplate, 'id'>) => void;
  deleteMeetingTemplate: (id: number) => void;

  // Pomodoro
  pomodoro: PomodoroState;
  setPomodoroState: (state: Partial<PomodoroState>) => void;
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;

  // AI Chat
  aiChat: AIChat;
  setAIChat: (chat: Partial<AIChat>) => void;
  addAIMessage: (message: Omit<AIMessage, 'id' | 'timestamp'>) => void;

  // Metrics
  metrics: Metrics;
  updateMetrics: () => void;

  // UI State
  showConfig: boolean;
  setShowConfig: (show: boolean) => void;
  loadingSubtasks: Record<number, boolean>;
  setLoadingSubtasks: (projectId: number, loading: boolean) => void;
}

// ===================================
// API Response Types
// ===================================

export interface APIResponse<T = Record<string, string | number | boolean | null | undefined>> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ===================================
// Utility Types
// ===================================

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  category: 'meeting' | 'task' | 'project' | 'pomodoro';
}

export interface NotificationSettings {
  meetingReminders: boolean;
  pomodoroNotifications: boolean;
  taskDeadlines: boolean;
  soundEnabled: boolean;
}