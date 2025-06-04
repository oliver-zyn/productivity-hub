import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { 
  AppStore, 
  Task, 
  NewTask, 
  Project, 
  NewProject, 
  Meeting, 
  NewMeeting,
  MeetingTemplate,
  Subtask, 
  AIMessage 
} from '../types';
import { DEFAULT_TASKS, DEFAULT_PROJECTS, APP_CONSTANTS } from '../config';

// Templates padrão de reuniões
const DEFAULT_MEETING_TEMPLATES: MeetingTemplate[] = [
  {
    id: 1,
    name: "Daily Standup",
    duration: 30,
    description: "Reunião diária da equipe para alinhamento",
    platform: "teams",
    defaultParticipants: ["equipe@empresa.com"],
    isRecurring: true,
    category: "trabalho",
  },
  {
    id: 2,
    name: "1:1 Meeting",
    duration: 60,
    description: "Reunião individual para feedback e alinhamento",
    platform: "meet",
    defaultParticipants: [],
    isRecurring: false,
    category: "trabalho",
  },
  {
    id: 3,
    name: "Review de Sprint",
    duration: 90,
    description: "Revisão dos resultados e planejamento",
    platform: "zoom",
    defaultParticipants: ["dev-team@empresa.com"],
    isRecurring: false,
    category: "trabalho",
  },
  {
    id: 4,
    name: "Aula Online",
    duration: 120,
    description: "Aula ou seminário acadêmico",
    platform: "meet",
    defaultParticipants: [],
    isRecurring: true,
    category: "faculdade",
  },
  {
    id: 5,
    name: "Reunião Familiar",
    duration: 45,
    description: "Conversa com família ou amigos",
    platform: "custom",
    defaultParticipants: [],
    isRecurring: false,
    category: "pessoal",
  },
];

// Função para gerar links de reunião
const generateMeetingLink = (platform: string): string => {
  const meetingId = Math.random().toString(36).substring(2, 15);
  
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

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set, get) => ({
    // ===================================
    // Tasks State & Actions
    // ===================================
    tasks: DEFAULT_TASKS,

    addTask: (newTask: NewTask) => {
      const task: Task = {
        id: Date.now(),
        ...newTask,
        priority: newTask.priority || 'media',
        completed: false,
        createdAt: new Date(),
      };
      
      set((state) => ({
        tasks: [...state.tasks, task],
      }));
      
      get().updateMetrics();
    },

    toggleTask: (id: number) => {
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? {
                ...task,
                completed: !task.completed,
                completedAt: !task.completed ? new Date() : undefined,
              }
            : task
        ),
      }));
      
      get().updateMetrics();
    },

    deleteTask: (id: number) => {
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }));
      
      get().updateMetrics();
    },

    // ===================================
    // Projects State & Actions
    // ===================================
    projects: DEFAULT_PROJECTS,

    addProject: (newProject: NewProject) => {
      const project: Project = {
        id: Date.now(),
        ...newProject,
        status: 'nao_iniciado',
        progress: 0,
        subtasks: [],
        expanded: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      set((state) => ({
        projects: [...state.projects, project],
      }));
      
      get().updateMetrics();
    },

    updateProject: (id: number, updates: Partial<Project>) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === id
            ? { ...project, ...updates, updatedAt: new Date() }
            : project
        ),
      }));
      
      get().updateMetrics();
    },

    deleteProject: (id: number) => {
      set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
      }));
      
      get().updateMetrics();
    },

    toggleProjectExpanded: (id: number) => {
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === id
            ? { ...project, expanded: !project.expanded }
            : project
        ),
      }));
    },

    addSubtask: (projectId: number, text: string) => {
      const subtask: Subtask = {
        id: Date.now(),
        text,
        completed: false,
        createdAt: new Date(),
      };
      
      set((state) => ({
        projects: state.projects.map((project) => {
          if (project.id === projectId) {
            const updatedSubtasks = [...project.subtasks, subtask];
            const progress = calculateProjectProgress(updatedSubtasks);
            const status = getProjectStatus(progress);
            
            return {
              ...project,
              subtasks: updatedSubtasks,
              progress,
              status,
              updatedAt: new Date(),
            };
          }
          return project;
        }),
      }));
      
      get().updateMetrics();
    },

    toggleSubtask: (projectId: number, subtaskId: number) => {
      set((state) => ({
        projects: state.projects.map((project) => {
          if (project.id === projectId) {
            const updatedSubtasks = project.subtasks.map((subtask) =>
              subtask.id === subtaskId
                ? {
                    ...subtask,
                    completed: !subtask.completed,
                    completedAt: !subtask.completed ? new Date() : undefined,
                  }
                : subtask
            );
            
            const progress = calculateProjectProgress(updatedSubtasks);
            const status = getProjectStatus(progress);
            
            return {
              ...project,
              subtasks: updatedSubtasks,
              progress,
              status,
              updatedAt: new Date(),
            };
          }
          return project;
        }),
      }));
      
      get().updateMetrics();
    },

    deleteSubtask: (projectId: number, subtaskId: number) => {
      set((state) => ({
        projects: state.projects.map((project) => {
          if (project.id === projectId) {
            const updatedSubtasks = project.subtasks.filter(
              (subtask) => subtask.id !== subtaskId
            );
            
            const progress = calculateProjectProgress(updatedSubtasks);
            const status = getProjectStatus(progress);
            
            return {
              ...project,
              subtasks: updatedSubtasks,
              progress,
              status,
              updatedAt: new Date(),
            };
          }
          return project;
        }),
      }));
      
      get().updateMetrics();
    },

    // ===================================
    // Meetings State & Actions - NOVO SISTEMA
    // ===================================
    meetings: [],
    meetingTemplates: DEFAULT_MEETING_TEMPLATES,

    addMeeting: (newMeeting: NewMeeting) => {
      const meeting: Meeting = {
        id: Date.now(),
        title: newMeeting.title,
        time: `${newMeeting.startTime.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })} - ${new Date(newMeeting.startTime.getTime() + newMeeting.duration * 60000).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        duration: newMeeting.duration,
        platform: newMeeting.platform,
        link: generateMeetingLink(newMeeting.platform),
        type: newMeeting.templateId ? 'template' : 'unica',
        startTime: newMeeting.startTime,
        endTime: new Date(newMeeting.startTime.getTime() + newMeeting.duration * 60000),
        description: newMeeting.description || '',
        participants: newMeeting.participants || [],
        templateId: newMeeting.templateId,
        isRecurring: newMeeting.isRecurring || false,
        recurringPattern: newMeeting.recurringPattern,
      };

      set((state) => ({
        meetings: [...state.meetings, meeting],
      }));

      get().updateMetrics();
    },

    updateMeeting: (id: number, updates: Partial<Meeting>) => {
      set((state) => ({
        meetings: state.meetings.map((meeting) =>
          meeting.id === id ? { ...meeting, ...updates } : meeting
        ),
      }));
    },

    deleteMeeting: (id: number) => {
      set((state) => ({
        meetings: state.meetings.filter((meeting) => meeting.id !== id),
      }));
      
      get().updateMetrics();
    },

    addMeetingTemplate: (template: Omit<MeetingTemplate, 'id'>) => {
      const newTemplate: MeetingTemplate = {
        id: Date.now(),
        ...template,
      };

      set((state) => ({
        meetingTemplates: [...state.meetingTemplates, newTemplate],
      }));
    },

    deleteMeetingTemplate: (id: number) => {
      set((state) => ({
        meetingTemplates: state.meetingTemplates.filter((template) => template.id !== id),
      }));
    },

    // ===================================
    // Pomodoro State & Actions
    // ===================================
    pomodoro: {
      minutes: APP_CONSTANTS.POMODORO.WORK_MINUTES,
      seconds: 0,
      isActive: false,
      mode: 'work',
      sessions: 0,
    },

    setPomodoroState: (state) => {
      set((currentState) => ({
        pomodoro: { ...currentState.pomodoro, ...state },
      }));
    },

    startPomodoro: () => {
      set((state) => ({
        pomodoro: { ...state.pomodoro, isActive: true },
      }));
    },

    pausePomodoro: () => {
      set((state) => ({
        pomodoro: { ...state.pomodoro, isActive: false },
      }));
    },

    resetPomodoro: () => {
      const { mode } = get().pomodoro;
      const minutes = mode === 'work' 
        ? APP_CONSTANTS.POMODORO.WORK_MINUTES
        : mode === 'shortBreak'
        ? APP_CONSTANTS.POMODORO.SHORT_BREAK_MINUTES
        : APP_CONSTANTS.POMODORO.LONG_BREAK_MINUTES;
      
      set((state) => ({
        pomodoro: {
          ...state.pomodoro,
          minutes,
          seconds: 0,
          isActive: false,
        },
      }));
    },

    // ===================================
    // AI Chat State & Actions
    // ===================================
    aiChat: {
      isOpen: false,
      messages: [
        {
          id: 1,
          type: 'ai',
          content: "👋 Oi! Sou sua IA assistente. Posso criar reuniões, projetos, analisar produtividade e muito mais!\n\n💡 Experimente:\n• \"reunião às 18h sobre projeto X\"\n• \"criar projeto sobre machine learning\"\n• \"como está minha produtividade?\"",
          timestamp: new Date(),
        },
      ],
      input: '',
      isTyping: false,
    },

    setAIChat: (chat) => {
      set((state) => ({
        aiChat: { ...state.aiChat, ...chat },
      }));
    },

    addAIMessage: (message) => {
      const newMessage: AIMessage = {
        id: Date.now(),
        timestamp: new Date(),
        ...message,
      };
      
      set((state) => {
        const messages = [...state.aiChat.messages, newMessage];
        
        if (messages.length > APP_CONSTANTS.UI.MAX_CHAT_MESSAGES) {
          messages.splice(0, messages.length - APP_CONSTANTS.UI.MAX_CHAT_MESSAGES);
        }
        
        return {
          aiChat: {
            ...state.aiChat,
            messages,
          },
        };
      });
    },

    // ===================================
    // Metrics State & Actions - ATUALIZADO
    // ===================================
    metrics: {
      tasksCompleted: 0,
      tasksPlanned: DEFAULT_TASKS.length,
      pomodoroSessions: 0,
      focusTime: 0,
      projectsActive: DEFAULT_PROJECTS.filter(p => p.status === 'em_andamento').length,
      meetingsToday: 0,
      meetingsThisWeek: 0,
    },

    updateMetrics: () => {
      const state = get();
      const tasksCompleted = state.tasks.filter((task) => task.completed).length;
      const projectsActive = state.projects.filter(
        (project) => project.status === 'em_andamento'
      ).length;
      
      // Calcular reuniões de hoje e da semana
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const meetingsToday = state.meetings.filter(meeting => {
        const meetingDate = meeting.startTime.toDateString();
        return meetingDate === today.toDateString();
      }).length;
      
      const meetingsThisWeek = state.meetings.filter(meeting => {
        return meeting.startTime >= startOfWeek && meeting.startTime <= endOfWeek;
      }).length;
      
      set((currentState) => ({
        metrics: {
          ...currentState.metrics,
          tasksCompleted,
          tasksPlanned: state.tasks.length,
          projectsActive,
          meetingsToday,
          meetingsThisWeek,
        },
      }));
    },

    // ===================================
    // UI State & Actions
    // ===================================
    showConfig: false,
    setShowConfig: (show: boolean) => {
      set({ showConfig: show });
    },

    loadingSubtasks: {},
    setLoadingSubtasks: (projectId: number, loading: boolean) => {
      set((state: { loadingSubtasks: Record<number, boolean> }) => ({
        loadingSubtasks: {
          ...state.loadingSubtasks,
          [projectId]: loading,
        },
      }));
    },
  }))
);

// ===================================
// Helper Functions
// ===================================

function calculateProjectProgress(subtasks: Subtask[]): number {
  if (subtasks.length === 0) return 0;
  
  const completedCount = subtasks.filter((subtask) => subtask.completed).length;
  return Math.round((completedCount / subtasks.length) * 100);
}

function getProjectStatus(progress: number): Project['status'] {
  if (progress === 0) return 'nao_iniciado';
  if (progress === 100) return 'concluido';
  return 'em_andamento';
}

// ===================================
// Selectors (for performance optimization)
// ===================================

export const useTasksSelector = () => useAppStore((state) => state.tasks);
export const useProjectsSelector = () => useAppStore((state) => state.projects);
export const useMeetingsSelector = () => useAppStore((state) => state.meetings);
export const useMeetingTemplatesSelector = () => useAppStore((state) => state.meetingTemplates);
export const useMetricsSelector = () => useAppStore((state) => state.metrics);
export const usePomodoroSelector = () => useAppStore((state) => state.pomodoro);
export const useAIChatSelector = () => useAppStore((state) => state.aiChat);