import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { PersistenceManager } from './persistence';
import { validateTask, validateProject, validateMeeting, validateSubtask } from '@/utils/validation';
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
  AIMessage, 
  ImportDataType
} from '../types';
import { DEFAULT_TASKS, DEFAULT_PROJECTS, APP_CONSTANTS } from '../config';

// ===================================
// Persistência e Templates
// ===================================

const persistence = PersistenceManager.getInstance();

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

// ===================================
// Funções Utilitárias
// ===================================

const loadSavedData = () => {
  try {
    return {
      tasks: persistence.loadFromStorage<Task[]>(APP_CONSTANTS.STORAGE_KEYS.TASKS) || DEFAULT_TASKS,
      projects: persistence.loadFromStorage<Project[]>(APP_CONSTANTS.STORAGE_KEYS.PROJECTS) || DEFAULT_PROJECTS,
      meetings: persistence.loadFromStorage<Meeting[]>(APP_CONSTANTS.STORAGE_KEYS.MEETINGS) || [],
      meetingTemplates: persistence.loadFromStorage<MeetingTemplate[]>(APP_CONSTANTS.STORAGE_KEYS.MEETING_TEMPLATES) || DEFAULT_MEETING_TEMPLATES,
      pomodoroSessions: persistence.loadFromStorage<number>(APP_CONSTANTS.STORAGE_KEYS.POMODORO_SESSIONS) || 0,
    };
  } catch (error) {
    console.error('Erro ao carregar dados salvos:', error);
    return {
      tasks: DEFAULT_TASKS,
      projects: DEFAULT_PROJECTS,
      meetings: [],
      meetingTemplates: DEFAULT_MEETING_TEMPLATES,
      pomodoroSessions: 0,
    };
  }
};

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

const calculateProjectProgress = (subtasks: Subtask[]): number => {
  if (subtasks.length === 0) return 0;
  const completedCount = subtasks.filter((subtask) => subtask.completed).length;
  return Math.round((completedCount / subtasks.length) * 100);
};

const getProjectStatus = (progress: number): Project['status'] => {
  if (progress === 0) return 'nao_iniciado';
  if (progress === 100) return 'concluido';
  return 'em_andamento';
};

// ===================================
// Carregar dados salvos
// ===================================

const savedData = loadSavedData();

// ===================================
// Store Principal
// ===================================

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set, get) => ({
    // ===================================
    // Tasks State & Actions
    // ===================================
    tasks: savedData.tasks,

    addTask: (newTask: NewTask) => {
      // Validação
      const validation = validateTask(newTask);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const task: Task = {
        id: Date.now(),
        ...newTask,
        priority: newTask.priority || 'media',
        completed: false,
        createdAt: new Date(),
      };
      
      set((state) => {
        const newTasks = [...state.tasks, task];
        persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.TASKS, newTasks);
        return { tasks: newTasks };
      });
      
      get().updateMetrics();
    },

    toggleTask: (id: number) => {
      set((state) => {
        const newTasks = state.tasks.map((task) =>
          task.id === id
            ? {
                ...task,
                completed: !task.completed,
                completedAt: !task.completed ? new Date() : undefined,
              }
            : task
        );
        persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.TASKS, newTasks);
        return { tasks: newTasks };
      });
      
      get().updateMetrics();
    },

    deleteTask: (id: number) => {
      set((state) => {
        const newTasks = state.tasks.filter((task) => task.id !== id);
        persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.TASKS, newTasks);
        return { tasks: newTasks };
      });
      
      get().updateMetrics();
    },

    // ===================================
    // Projects State & Actions
    // ===================================
    projects: savedData.projects,

    addProject: (newProject: NewProject) => {
      // Validação
      const validation = validateProject(newProject);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

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
      
      set((state) => {
        const newProjects = [...state.projects, project];
        persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.PROJECTS, newProjects);
        return { projects: newProjects };
      });
      
      get().updateMetrics();
    },

    updateProject: (id: number, updates: Partial<Project>) => {
      set((state) => {
        const newProjects = state.projects.map((project) =>
          project.id === id
            ? { ...project, ...updates, updatedAt: new Date() }
            : project
        );
        persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.PROJECTS, newProjects);
        return { projects: newProjects };
      });
      
      get().updateMetrics();
    },

    deleteProject: (id: number) => {
      set((state) => {
        const newProjects = state.projects.filter((project) => project.id !== id);
        persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.PROJECTS, newProjects);
        return { projects: newProjects };
      });
      
      get().updateMetrics();
    },

    toggleProjectExpanded: (id: number) => {
      set((state) => {
        const newProjects = state.projects.map((project) =>
          project.id === id
            ? { ...project, expanded: !project.expanded }
            : project
        );
        persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.PROJECTS, newProjects);
        return { projects: newProjects };
      });
    },

    addSubtask: (projectId: number, text: string) => {
      // Validação
      const validation = validateSubtask(text);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const subtask: Subtask = {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        createdAt: new Date(),
      };
      
      set((state) => {
        const newProjects = state.projects.map((project) => {
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
        });
        persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.PROJECTS, newProjects);
        return { projects: newProjects };
      });
      
      get().updateMetrics();
    },

    toggleSubtask: (projectId: number, subtaskId: number) => {
      set((state) => {
        const newProjects = state.projects.map((project) => {
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
        });
        persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.PROJECTS, newProjects);
        return { projects: newProjects };
      });
      
      get().updateMetrics();
    },

    deleteSubtask: (projectId: number, subtaskId: number) => {
      set((state) => {
        const newProjects = state.projects.map((project) => {
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
        });
        persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.PROJECTS, newProjects);
        return { projects: newProjects };
      });
      
      get().updateMetrics();
    },

    // ===================================
    // Meetings State & Actions
    // ===================================
    meetings: savedData.meetings,
    meetingTemplates: savedData.meetingTemplates,

    addMeeting: (newMeeting: NewMeeting) => {
      // Validação
      const validation = validateMeeting(newMeeting);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const meeting: Meeting = {
        id: Date.now(),
        title: newMeeting.title.trim(),
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
        description: newMeeting.description?.trim() || '',
        participants: newMeeting.participants?.map(p => p.trim()).filter(Boolean) || [],
        templateId: newMeeting.templateId,
        isRecurring: newMeeting.isRecurring || false,
        recurringPattern: newMeeting.recurringPattern,
      };

      set((state) => {
        const newMeetings = [...state.meetings, meeting];
        persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.MEETINGS, newMeetings);
        return { meetings: newMeetings };
      });

      get().updateMetrics();
    },

    updateMeeting: (id: number, updates: Partial<Meeting>) => {
      set((state) => {
        const newMeetings = state.meetings.map((meeting) =>
          meeting.id === id ? { ...meeting, ...updates } : meeting
        );
        persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.MEETINGS, newMeetings);
        return { meetings: newMeetings };
      });
    },

    deleteMeeting: (id: number) => {
      set((state) => {
        const newMeetings = state.meetings.filter((meeting) => meeting.id !== id);
        persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.MEETINGS, newMeetings);
        return { meetings: newMeetings };
      });
      
      get().updateMetrics();
    },

    addMeetingTemplate: (template: Omit<MeetingTemplate, 'id'>) => {
      const newTemplate: MeetingTemplate = {
        id: Date.now(),
        ...template,
      };

      set((state) => {
        const newTemplates = [...state.meetingTemplates, newTemplate];
        persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.MEETING_TEMPLATES, newTemplates);
        return { meetingTemplates: newTemplates };
      });
    },

    deleteMeetingTemplate: (id: number) => {
      set((state) => {
        const newTemplates = state.meetingTemplates.filter((template) => template.id !== id);
        persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.MEETING_TEMPLATES, newTemplates);
        return { meetingTemplates: newTemplates };
      });
    },

    // ===================================
    // Pomodoro State & Actions
    // ===================================
    pomodoro: {
      minutes: APP_CONSTANTS.POMODORO.WORK_MINUTES,
      seconds: 0,
      isActive: false,
      mode: 'work',
      sessions: savedData.pomodoroSessions,
    },

    setPomodoroState: (state) => {
      set((currentState) => {
        const newPomodoro = { ...currentState.pomodoro, ...state };
        
        // Salvar sessões quando completadas
        if (state.sessions !== undefined && state.sessions !== currentState.pomodoro.sessions) {
          persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.POMODORO_SESSIONS, state.sessions);
        }
        
        return { pomodoro: newPomodoro };
      });
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
    // Metrics State & Actions
    // ===================================
    metrics: {
      tasksCompleted: 0,
      tasksPlanned: 0,
      pomodoroSessions: savedData.pomodoroSessions,
      focusTime: savedData.pomodoroSessions * 25, // 25 min por sessão
      projectsActive: 0,
      meetingsToday: 0,
      meetingsThisWeek: 0,
    },

    updateMetrics: () => {
      const state = get();
      const tasksCompleted = state.tasks.filter((task) => task.completed).length;
      const projectsActive = state.projects.filter(
        (project) => project.status === 'em_andamento'
      ).length;
      
      // Calcular reuniões de hoje e da semana - CORRIGIDO
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      // FUNÇÃO AUXILIAR para garantir que temos um objeto Date
      const ensureDate = (date: Date | string | number): Date => {
        if (date instanceof Date) return date;
        if (typeof date === 'string') return new Date(date);
        if (typeof date === 'number') return new Date(date);
        return new Date(); // fallback
      };
      
      const meetingsToday = state.meetings.filter(meeting => {
        try {
          const meetingDate = ensureDate(meeting.startTime);
          const todayStr = today.toDateString();
          const meetingStr = meetingDate.toDateString();
          return meetingStr === todayStr;
        } catch (error) {
          console.warn('Error processing meeting date:', error, meeting);
          return false;
        }
      }).length;
      
      const meetingsThisWeek = state.meetings.filter(meeting => {
        try {
          const meetingDate = ensureDate(meeting.startTime);
          return meetingDate >= startOfWeek && meetingDate <= endOfWeek;
        } catch (error) {
          console.warn('Error processing meeting date for week:', error, meeting);
          return false;
        }
      }).length;
      
      set((currentState) => ({
        metrics: {
          ...currentState.metrics,
          tasksCompleted,
          tasksPlanned: state.tasks.length,
          projectsActive,
          meetingsToday,
          meetingsThisWeek,
          pomodoroSessions: currentState.pomodoro.sessions,
          focusTime: currentState.pomodoro.sessions * 25,
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
      set((state) => ({
        loadingSubtasks: {
          ...state.loadingSubtasks,
          [projectId]: loading,
        },
      }));
    },

    // ===================================
    // Novas funcionalidades adicionadas
    // ===================================

    // Reordenar tarefas (para drag & drop futuro)
    reorderTasks: (oldIndex: number, newIndex: number) => {
      set((state) => {
        const newTasks = [...state.tasks];
        const [removed] = newTasks.splice(oldIndex, 1);
        newTasks.splice(newIndex, 0, removed);
        persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.TASKS, newTasks);
        return { tasks: newTasks };
      });
    },

    // Limpar todos os dados
    clearAllData: () => {
      persistence.clearAllData();
      set({
        tasks: DEFAULT_TASKS,
        projects: DEFAULT_PROJECTS,
        meetings: [],
        meetingTemplates: DEFAULT_MEETING_TEMPLATES,
        pomodoro: {
          minutes: APP_CONSTANTS.POMODORO.WORK_MINUTES,
          seconds: 0,
          isActive: false,
          mode: 'work',
          sessions: 0,
        },
        aiChat: {
          isOpen: false,
          messages: [
            {
              id: 1,
              type: 'ai',
              content: "👋 Dados limpos! Como posso ajudar você hoje?",
              timestamp: new Date(),
            },
          ],
          input: '',
          isTyping: false,
        },
        metrics: {
          tasksCompleted: 0,
          tasksPlanned: DEFAULT_TASKS.length,
          pomodoroSessions: 0,
          focusTime: 0,
          projectsActive: DEFAULT_PROJECTS.filter(p => p.status === 'em_andamento').length,
          meetingsToday: 0,
          meetingsThisWeek: 0,
        },
      });
    },

    // Exportar dados
    exportData: () => {
      const state = get();
      const exportData = {
        tasks: state.tasks,
        projects: state.projects,
        meetings: state.meetings,
        meetingTemplates: state.meetingTemplates,
        pomodoroSessions: state.pomodoro.sessions,
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `productivity-hub-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },

    // Importar dados
    importData: (data: ImportDataType) => {
      try {
        if (data.tasks) {
          persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.TASKS, data.tasks);
        }
        if (data.projects) {
          persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.PROJECTS, data.projects);
        }
        if (data.meetings) {
          persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.MEETINGS, data.meetings);
        }
        if (data.meetingTemplates) {
          persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.MEETING_TEMPLATES, data.meetingTemplates);
        }
        if (data.pomodoroSessions) {
          persistence.saveToStorage(APP_CONSTANTS.STORAGE_KEYS.POMODORO_SESSIONS, data.pomodoroSessions);
        }

        // Recarregar dados
        const newSavedData = loadSavedData();
        set({
          tasks: newSavedData.tasks,
          projects: newSavedData.projects,
          meetings: newSavedData.meetings,
          meetingTemplates: newSavedData.meetingTemplates,
          pomodoro: {
            ...get().pomodoro,
            sessions: newSavedData.pomodoroSessions,
          },
        });

        get().updateMetrics();
        return true;
      } catch (error) {
        console.error('Erro ao importar dados:', error);
        return false;
      }
    },
  }))
);

// ===================================
// Selectors (para performance optimization)
// ===================================

export const useTasksSelector = () => useAppStore((state) => state.tasks);
export const useProjectsSelector = () => useAppStore((state) => state.projects);
export const useMeetingsSelector = () => useAppStore((state) => state.meetings);
export const useMeetingTemplatesSelector = () => useAppStore((state) => state.meetingTemplates);
export const useMetricsSelector = () => useAppStore((state) => state.metrics);
export const usePomodoroSelector = () => useAppStore((state) => state.pomodoro);
export const useAIChatSelector = () => useAppStore((state) => state.aiChat);

// ===================================
// Auto-update metrics on store changes
// ===================================

// Subscribe to changes and update metrics automatically
useAppStore.subscribe(
  (state) => ({
    tasks: state.tasks,
    projects: state.projects,
    meetings: state.meetings,
    pomodoro: state.pomodoro,
  }),
  () => {
    // Debounce para evitar muitas atualizações
    setTimeout(() => {
      useAppStore.getState().updateMetrics();
    }, 100);
  }
);