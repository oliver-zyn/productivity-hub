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
  const meetings = useAppStore((state) => state.meetings);
  const metrics = useAppStore((state) => state.metrics);
  
  // Store actions
  const addProject = useAppStore((state) => state.addProject);
  const addSubtask = useAppStore((state) => state.addSubtask);
  const addMeeting = useAppStore((state) => state.addMeeting);
  const setLoadingSubtasks = useAppStore((state) => state.setLoadingSubtasks);

  // Send message to AI
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    console.log('🚀 Sending message to AI:', message);

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

      console.log('📊 AI Context:', context);

      // Send to AI service
      const response = await aiService.sendMessage(message, context);

      if (!response.success) {
        throw new Error(response.error || 'Erro na comunicação com IA');
      }

      console.log('🤖 AI Response:', response.data);

      // Add AI response
      const aiMessage: Omit<AIMessage, 'id' | 'timestamp'> = {
        type: 'ai',
        content: response.data || 'Desculpe, não consegui processar sua mensagem.',
      };
      addAIMessage(aiMessage);

      // Process AI commands - CORRIGIDO
      if (response.data) {
        await processAICommand(response.data);
      }

    } catch (error) {
      console.error('❌ AI Error:', error);
      const errorMessage: Omit<AIMessage, 'id' | 'timestamp'> = {
        type: 'ai',
        content: `❌ Erro: ${(error as Error).message}`,
      };
      addAIMessage(errorMessage);
    } finally {
      setAIChat({ isTyping: false });
    }
  }, [addAIMessage, setAIChat, tasks, projects, meetings, metrics]);

  // Process AI commands - CORRIGIDO
  const processAICommand = useCallback(async (response: string) => {
    console.log('🔍 Processing AI command from response:', response);
    
    const command = aiService.parseAICommand(response);
    
    if (!command) {
      console.log('❌ No command found in response');
      return;
    }

    console.log('✅ Command detected:', command);

    try {
      switch (command.type) {
        case 'CREATE_MEETING':
          console.log('📅 Creating meeting...');
          await handleCreateMeeting(command.data as { title: string; hour: number; minute: number; duration: number });
          break;
          
        case 'CREATE_PROJECT':
          console.log('📋 Creating project...');
          await handleCreateProject(command.data as { title: string; category: string; subtasks: string[] });
          break;
          
        case 'ANALYZE_PRODUCTIVITY':
          console.log('📊 Analyzing productivity...');
          await handleProductivityAnalysis();
          break;

        default:
          console.log('❓ Unknown command type:', command.type);
      }
    } catch (error) {
      console.error('❌ Error processing command:', error);
      
      // Adicionar mensagem de erro
      const errorMessage: Omit<AIMessage, 'id' | 'timestamp'> = {
        type: 'ai',
        content: `❌ Erro ao executar comando: ${(error as Error).message}`,
      };
      addAIMessage(errorMessage);
    }
  }, [addMeeting, addProject]);

  // Handle meeting creation
  const handleCreateMeeting = useCallback(async (data: { title: string; hour: number; minute: number; duration: number }) => {
    try {
      console.log('📅 Creating meeting with data:', data);
      
      const { title, hour, minute, duration } = data;
      
      // Validar horário
      if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        throw new Error('Horário inválido');
      }
      
      const startTime = new Date();
      startTime.setHours(hour, minute, 0, 0);
      
      // Se o horário for no passado, assumir que é para amanhã
      if (startTime < new Date()) {
        startTime.setDate(startTime.getDate() + 1);
      }
      
      const newMeeting: NewMeeting = {
        title,
        startTime,
        duration: duration || 60,
        platform: 'meet', // Default para Google Meet
        description: 'Reunião criada pela IA',
      };

      console.log('📅 Meeting object:', newMeeting);
      addMeeting(newMeeting);
      
      console.log('✅ Meeting created successfully');
      
      const confirmMessage: Omit<AIMessage, 'id' | 'timestamp'> = {
        type: 'ai',
        content: `✅ Reunião "${title}" criada com sucesso para ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}! 🎉\n\nLink gerado automaticamente no painel de reuniões.`,
      };
      addAIMessage(confirmMessage);
    } catch (error) {
      console.error('❌ Error creating meeting:', error);
      throw error; // Re-throw para ser capturado pelo processAICommand
    }
  }, [addMeeting, addAIMessage]);

  // Handle project creation - CORRIGIDO
  const handleCreateProject = useCallback(async (data: { title: string; category: string; subtasks: string[] }) => {
    try {
      console.log('📋 Creating project with data:', data);
      
      const { title, category, subtasks } = data;
      
      // Validar categoria
      const validCategories = ['trabalho', 'faculdade', 'pessoal'];
      const normalizedCategory = category.toLowerCase();
      const finalCategory = validCategories.includes(normalizedCategory) ? normalizedCategory : 'pessoal';
      
      // Criar deadline padrão (30 dias a partir de hoje)
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 30);
      
      const newProject: NewProject = {
        title,
        category: finalCategory as ProjectCategory,
        deadline: deadline.toISOString().split('T')[0],
        description: 'Projeto criado automaticamente pela IA',
      };
      
      console.log('📋 Project object:', newProject);
      addProject(newProject);
      
      // Adicionar subtarefas se fornecidas - CORRIGIDO COM TIMEOUT
      if (subtasks && subtasks.length > 0) {
        console.log('📝 Adding subtasks:', subtasks);
        
        // Aguardar um pouco para o projeto ser criado
        setTimeout(() => {
          const state = useAppStore.getState();
          // Encontrar o projeto recém-criado (último adicionado com o título correto)
          const createdProject = state.projects
            .filter(p => p.title === title)
            .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))[0];
          
          if (createdProject) {
            console.log('✅ Found created project:', createdProject.id);
            subtasks.forEach((subtaskText: string) => {
              if (subtaskText.trim()) {
                console.log('📝 Adding subtask:', subtaskText);
                addSubtask(createdProject.id, subtaskText.trim());
              }
            });
          } else {
            console.error('❌ Project not found after creation');
          }
        }, 500); // Aumentar timeout para 500ms
      }
      
      console.log('✅ Project created successfully');
      
      const confirmMessage: Omit<AIMessage, 'id' | 'timestamp'> = {
        type: 'ai',
        content: `🎉 Projeto "${title}" criado com sucesso${subtasks && subtasks.length > 0 ? ` com ${subtasks.length} subtarefas` : ''}!\n\n📅 Deadline: ${deadline.toLocaleDateString('pt-BR')}\n📂 Categoria: ${finalCategory}`,
      };
      addAIMessage(confirmMessage);
    } catch (error) {
      console.error('❌ Error creating project:', error);
      throw error; // Re-throw para ser capturado pelo processAICommand
    }
  }, [addProject, addSubtask, addAIMessage]);

  // Handle productivity analysis
  const handleProductivityAnalysis = useCallback(async () => {
    try {
      console.log('📊 Analyzing productivity...');
      
      const context = {
        tasks,
        projects,
        meetings,
        metrics,
      };
      
      const result = await aiService.analyzeProductivity(context);
      
      if (result.success && result.data) {
        console.log('✅ Productivity analysis completed');
        
        const analysisMessage: Omit<AIMessage, 'id' | 'timestamp'> = {
          type: 'ai',
          content: result.data,
        };
        addAIMessage(analysisMessage);
      } else {
        throw new Error(result.error || 'Erro na análise de produtividade');
      }
    } catch (error) {
      console.error('❌ Error analyzing productivity:', error);
      throw error;
    }
  }, [tasks, projects, meetings, metrics, addAIMessage]);

  // Generate subtasks for a project
  const generateSubtasks = useCallback(async (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || project.subtasks.length > 0) return;
  
    console.log('🧠 Generating subtasks for project:', project.title);
  
    setLoadingSubtasks(projectId, true);
  
    try {
      const result = await aiService.generateSubtasks(project.title, project.description);
      
      if (result.success && result.data) {
        console.log('✅ Subtasks generated:', result.data);
        
        // Add each subtask com delay pequeno entre elas
        result.data.forEach((subtaskText, index) => {
          setTimeout(() => {
            try {
              addSubtask(projectId, subtaskText);
              console.log(`✅ Subtask ${index + 1} added:`, subtaskText);
            } catch (error) {
              console.error(`❌ Error adding subtask ${index + 1}:`, error);
            }
          }, index * 100); // 100ms entre cada subtarefa
        });
  
        // Add confirmation message if chat is open
        if (aiChat.isOpen) {
          setTimeout(() => {
            const confirmMessage: Omit<AIMessage, 'id' | 'timestamp'> = {
              type: 'ai',
              content: `✨ Criei ${result.data?.length} subtarefas para "${project.title}" usando IA!`,
            };
            addAIMessage(confirmMessage);
          }, result.data?.length * 100 + 200); // Aguardar todas as subtarefas + buffer
        }
      } else {
        throw new Error(result.error || 'Erro ao gerar subtarefas');
      }
    } catch (error) {
      console.error('❌ Error generating subtasks:', error);
      
      if (aiChat.isOpen) {
        const errorMessage: Omit<AIMessage, 'id' | 'timestamp'> = {
          type: 'ai',
          content: `❌ Erro ao gerar subtarefas: ${(error as Error).message}`,
        };
        addAIMessage(errorMessage);
      }
    } finally {
      // Aguardar um pouco antes de parar o loading para garantir que todas as subtarefas foram adicionadas
      setTimeout(() => {
        setLoadingSubtasks(projectId, false);
      }, 1000);
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