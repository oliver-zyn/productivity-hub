import { useCallback } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { aiService } from '../services/aiService';
import type { AIMessage, NewProject, ProjectCategory, NewMeeting } from '../types';

export const useAI = () => {
  const aiChat = useAppStore((state) => state.aiChat);
  const setAIChat = useAppStore((state) => state.setAIChat);
  const addAIMessage = useAppStore((state) => state.addAIMessage);
  
  // Data for AI context
  const tasks = useAppStore((state) => state.tasks);
  const projects = useAppStore((state) => state.projects);
  const meetings = useAppStore((state) => state.meetings); // Novo sistema
  const metrics = useAppStore((state) => state.metrics);
  
  // Store actions
  const addProject = useAppStore((state) => state.addProject);
  const addSubtask = useAppStore((state) => state.addSubtask);
  const addMeeting = useAppStore((state) => state.addMeeting); // Novo sistema
  const setLoadingSubtasks = useAppStore((state) => state.setLoadingSubtasks);

  // Send message to AI
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Omit<AIMessage, 'id' | 'timestamp'> = {
      type: 'user',
      content: message,
    };
    addAIMessage(userMessage);

    // Set typing state
    setAIChat({ input: '', isTyping: true });

    try {
      // Prepare context for AI
      const context = {
        tasks,
        projects,
        meetings,
        metrics,
      };

      // Send to AI service
      const response = await aiService.sendMessage(message, context);

      if (!response.success) {
        throw new Error(response.error || 'Erro na comunicação com IA');
      }

      // Add AI response
      const aiMessage: Omit<AIMessage, 'id' | 'timestamp'> = {
        type: 'ai',
        content: response.data || 'Desculpe, não consegui processar sua mensagem.',
      };
      addAIMessage(aiMessage);

      // Process AI commands
      if (response.data) {
        await processAICommand(response.data);
      }

    } catch (error) {
      const errorMessage: Omit<AIMessage, 'id' | 'timestamp'> = {
        type: 'ai',
        content: `❌ Erro: ${(error as Error).message}`,
      };
      addAIMessage(errorMessage);
    } finally {
      setAIChat({ isTyping: false });
    }
  }, [addAIMessage, setAIChat, tasks, projects, meetings, metrics]);

  // Process AI commands
  const processAICommand = useCallback(async (response: string) => {
    const command = aiService.parseAICommand(response);
    
    if (!command) return;

    switch (command.type) {
      case 'CREATE_MEETING':
        await handleCreateMeeting(command.data as { title: string; hour: number; minute: number; duration: number });
        break;
        
      case 'CREATE_PROJECT':
        await handleCreateProject(command.data as { title: string; category: string; subtasks: string[] });
        break;
        
      case 'ANALYZE_PRODUCTIVITY':
        await handleProductivityAnalysis();
        break;
    }
  }, [addMeeting, addProject]);

  // Handle meeting creation - Novo sistema
  const handleCreateMeeting = useCallback(async (data: { title: string; hour: number; minute: number; duration: number }) => {
    try {
      const { title, hour, minute, duration } = data;
      
      const startTime = new Date();
      startTime.setHours(hour, minute, 0, 0);
      
      const newMeeting: NewMeeting = {
        title,
        startTime,
        duration: duration || 60,
        platform: 'meet', // Default para Google Meet
        description: 'Reunião criada pela IA',
      };

      addMeeting(newMeeting);
      
      const confirmMessage: Omit<AIMessage, 'id' | 'timestamp'> = {
        type: 'ai',
        content: `✅ Reunião "${title}" criada com sucesso para ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}! Link gerado automaticamente.`,
      };
      addAIMessage(confirmMessage);
    } catch (error) {
      console.error('Error creating meeting:', error);
    }
  }, [addMeeting, addAIMessage]);

  // Handle project creation
  const handleCreateProject = useCallback(async (data: { title: string; category: string; subtasks: string[] }) => {
    try {
      const { title, category, subtasks } = data;
      
      const newProject: NewProject = {
        title,
        category: (category || 'pessoal') as ProjectCategory,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        description: 'Projeto criado automaticamente pela IA',
      };
      addProject(newProject);
      
      // Add subtasks if provided
      if (subtasks && subtasks.length > 0) {
        // We need to wait a bit for the project to be created and get its ID
        setTimeout(() => {
          const createdProject = projects.find(p => p.title === title);
          if (createdProject) {
            subtasks.forEach((subtaskText: string) => {
              addSubtask(createdProject.id, subtaskText);
            });
          }
        }, 100);
      }
      
      const confirmMessage: Omit<AIMessage, 'id' | 'timestamp'> = {
        type: 'ai',
        content: `🎉 Projeto "${title}" criado com sucesso${subtasks.length > 0 ? ` com ${subtasks.length} subtarefas` : ''}!`,
      };
      addAIMessage(confirmMessage);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  }, [addProject, addSubtask, projects, addAIMessage]);

  // Handle productivity analysis
  const handleProductivityAnalysis = useCallback(async () => {
    try {
      const context = {
        tasks,
        projects,
        meetings, // Novo sistema
        metrics,
      };
      
      const result = await aiService.analyzeProductivity(context);
      
      if (result.success && result.data) {
        const analysisMessage: Omit<AIMessage, 'id' | 'timestamp'> = {
          type: 'ai',
          content: result.data,
        };
        addAIMessage(analysisMessage);
      }
    } catch (error) {
      console.error('Error analyzing productivity:', error);
    }
  }, [tasks, projects, meetings, metrics, addAIMessage]);

  // Generate subtasks for a project
  const generateSubtasks = useCallback(async (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || project.subtasks.length > 0) return;

    setLoadingSubtasks(projectId, true);

    try {
      const result = await aiService.generateSubtasks(project.title, project.description);
      
      if (result.success && result.data) {
        // Add each subtask
        result.data.forEach((subtaskText) => {
          addSubtask(projectId, subtaskText);
        });

        // Add confirmation message if chat is open
        if (aiChat.isOpen) {
          const confirmMessage: Omit<AIMessage, 'id' | 'timestamp'> = {
            type: 'ai',
            content: `✨ Criei ${result.data.length} subtarefas para "${project.title}" usando IA!`,
          };
          addAIMessage(confirmMessage);
        }
      }
    } catch (error) {
      console.error('Error generating subtasks:', error);
    } finally {
      setLoadingSubtasks(projectId, false);
    }
  }, [projects, addSubtask, setLoadingSubtasks, aiChat.isOpen, addAIMessage]);

  // Toggle chat visibility
  const toggleChat = useCallback(() => {
    setAIChat({ isOpen: !aiChat.isOpen });
  }, [aiChat.isOpen, setAIChat]);

  // Clear chat history
  const clearChat = useCallback(() => {
    setAIChat({
      messages: [
        {
          id: 1,
          type: 'ai',
          content: "👋 Chat limpo! Como posso ajudar você hoje?",
          timestamp: new Date(),
        },
      ],
    });
  }, [setAIChat]);

  // Update input
  const setInput = useCallback((input: string) => {
    setAIChat({ input });
  }, [setAIChat]);

  return {
    // State
    aiChat,
    
    // Actions
    sendMessage,
    generateSubtasks,
    toggleChat,
    clearChat,
    setInput,
    
    // Status
    isConfigured: aiService.isConfigured(),
    canSendMessage: !aiChat.isTyping && aiChat.input.trim().length > 0,
    messagesCount: aiChat.messages.length,
  };
};