import type { OpenAIResponse, APIResponse, Task, Project, Meeting, Metrics, AICommand } from '../types';
import { CONFIG, isOpenAIConfigured } from '../config';

interface AIContext {
  tasks: Task[];
  projects: Project[];
  meetings: Meeting[];
  metrics: Metrics;
}

class AIService {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = CONFIG.OPENAI.API_KEY;
    this.model = CONFIG.OPENAI.MODEL;
    this.baseUrl = CONFIG.OPENAI.BASE_URL;
  }

  // ===================================
  // Main AI Chat Method
  // ===================================
  async sendMessage(message: string, context?: AIContext): Promise<APIResponse<string>> {
    if (!isOpenAIConfigured()) {
      return {
        success: false,
        error: '⚠️ Configure sua API key da OpenAI no arquivo .env',
      };
    }

    try {
      const systemPrompt = this.buildSystemPrompt(context);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error?.message || 
          `OpenAI API error: ${response.status} ${response.statusText}`
        );
      }

      const data: OpenAIResponse = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';

      return { success: true, data: aiResponse };
    } catch (error) {
      console.error('AI Service error:', error);
      return {
        success: false,
        error: (error as Error).message || 'Erro ao comunicar com a IA',
      };
    }
  }

  // ===================================
  // Command Processing - CORRIGIDO
  // ===================================
  parseAICommand(response: string): AICommand | null {
    console.log('🤖 Parsing AI response (SUBSTRING VERSION)');
    console.log('Raw response:', response);
    
    // Limpar resposta
    const cleanResponse = response
      .replace(/\r?\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log('Cleaned response:', cleanResponse);
    
    // === CRIAR PROJETO ===
    if (cleanResponse.includes('AÇÃO:CREATE_PROJECT') || cleanResponse.includes('ACAO:CREATE_PROJECT')) {
      console.log('🎯 CREATE_PROJECT detected');
      
      try {
        // MÉTODO MANUAL - MAIS CONFIÁVEL
        const titleStart = cleanResponse.indexOf('TÍTULO:');
        const categoryStart = cleanResponse.indexOf('CATEGORIA:');
        const subtasksStart = cleanResponse.indexOf('SUBTAREFAS:');
        
        // Encontrar fim da seção de comando
        const endMarkers = ['Projeto criado', 'CONTEXTO ATUAL', '🚀', 'sucesso!'];
        let commandEnd = cleanResponse.length;
        
        for (const marker of endMarkers) {
          const markerPos = cleanResponse.indexOf(marker);
          if (markerPos > subtasksStart && markerPos < commandEnd) {
            commandEnd = markerPos;
          }
        }
        
        console.log('🔍 Positions found:');
        console.log('TÍTULO start:', titleStart);
        console.log('CATEGORIA start:', categoryStart);
        console.log('SUBTAREFAS start:', subtasksStart);
        console.log('Command end:', commandEnd);
        
        // EXTRAIR POR SUBSTRING
        let title = 'Novo Projeto';
        let category = 'pessoal';
        let subtasksString = '';
        
        if (titleStart > -1 && categoryStart > titleStart) {
          title = cleanResponse.substring(titleStart + 7, categoryStart).trim();
          console.log('📝 Extracted title:', title);
        }
        
        if (categoryStart > -1 && subtasksStart > categoryStart) {
          category = cleanResponse.substring(categoryStart + 10, subtasksStart).trim().toLowerCase();
          console.log('📂 Extracted category:', category);
        }
        
        if (subtasksStart > -1) {
          subtasksString = cleanResponse.substring(subtasksStart + 11, commandEnd).trim();
          console.log('📝 Extracted subtasks string:', subtasksString);
        }
        
        // LIMPAR E VALIDAR DADOS
        title = title.replace(/[^\w\s\-.àáâãäéêëíîïóôõöúûüçÀÁÂÃÄÉÊËÍÎÏÓÔÕÖÚÛÜÇ]/g, '').trim();
        category = category.replace(/[^\w]/g, '').trim();
        
        // Se título ainda vazio, tentar fallback
        if (!title || title.length === 0) {
          title = 'Novo Projeto';
          console.log('⚠️ Title empty, using fallback');
        }
        
        // Validar categoria
        const validCategories = ['trabalho', 'faculdade', 'pessoal'];
        if (!validCategories.includes(category)) {
          category = 'pessoal';
          console.log('⚠️ Invalid category, using fallback');
        }
        
        // PROCESSAR SUBTAREFAS
        const subtasks = subtasksString 
          ? subtasksString.split('|').map(s => s.trim()).filter(s => s.length > 0)
          : [];
        
        console.log('📊 FINAL EXTRACTED DATA:');
        console.log('Title:', title);
        console.log('Category:', category);
        console.log('Subtasks:', subtasks);
        console.log('Subtasks count:', subtasks.length);
        
        // VERIFICAR SE CAPTUROU DADOS REAIS
        if (title === 'Novo Projeto' && category === 'pessoal' && subtasks.length === 0) {
          console.log('❌ All values are defaults - extraction may have failed');
          
          // ÚLTIMO FALLBACK - REGEX SUPER SIMPLES
          const fallbackTitle = cleanResponse.match(/TÍTULO:\s*([^]+?)CATEGORIA/i)?.[1]?.trim();
          const fallbackCategory = cleanResponse.match(/CATEGORIA:\s*([^]+?)SUBTAREFAS/i)?.[1]?.trim();
          const fallbackSubtasks = cleanResponse.match(/SUBTAREFAS:\s*([^]+?)(?:Projeto|$)/i)?.[1]?.trim();
          
          if (fallbackTitle) {
            console.log('🔄 Using fallback extraction:');
            console.log('Fallback title:', fallbackTitle);
            console.log('Fallback category:', fallbackCategory);
            console.log('Fallback subtasks:', fallbackSubtasks);
            
            return {
              type: 'CREATE_PROJECT',
              data: {
                title: fallbackTitle.replace(/[^\w\s\-.àáâãäéêëíîïóôõöúûüçÀÁÂÃÄÉÊËÍÎÏÓÔÕÖÚÛÜÇ]/g, '').trim() || 'Projeto da IA',
                category: (fallbackCategory?.toLowerCase().replace(/[^\w]/g, '') || 'pessoal'),
                subtasks: fallbackSubtasks ? fallbackSubtasks.split('|').map(s => s.trim()).filter(Boolean) : [],
              },
            };
          }
        }
        
        return {
          type: 'CREATE_PROJECT',
          data: {
            title,
            category,
            subtasks,
          },
        };
        
      } catch (error) {
        console.error('❌ Error in substring extraction:', error);
        
        // FALLBACK FINAL - Tentar detectar informações básicas
        const basicTitle = cleanResponse.match(/projeto\s+sobre\s+([^.!?]+)/i)?.[1]?.trim() || 'Projeto da IA';
        return {
          type: 'CREATE_PROJECT',
          data: {
            title: basicTitle,
            category: 'pessoal',
            subtasks: [],
          },
        };
      }
    }
    
    // === CRIAR REUNIÃO ===
    if (cleanResponse.includes('AÇÃO:CREATE_MEETING') || cleanResponse.includes('ACAO:CREATE_MEETING')) {
      console.log('🎯 CREATE_MEETING detected');
      
      // Usar mesmo método de substring para reuniões
      const titleStart = cleanResponse.indexOf('TÍTULO:');
      const timeStart = cleanResponse.indexOf('HORÁRIO:');
      const durationStart = cleanResponse.indexOf('DURAÇÃO:');
      
      let title = 'Nova Reunião';
      let timeString = '';
      let durationString = '';
      
      if (titleStart > -1 && timeStart > titleStart) {
        title = cleanResponse.substring(titleStart + 7, timeStart).trim();
      }
      
      if (timeStart > -1) {
        const timeEnd = durationStart > timeStart ? durationStart : timeStart + 20;
        timeString = cleanResponse.substring(timeStart + 8, timeEnd).trim();
      }
      
      if (durationStart > -1) {
        durationString = cleanResponse.substring(durationStart + 8, durationStart + 20).trim();
      }
      
      // Extrair hora e minuto
      const timeMatch = timeString.match(/(\d{1,2}):(\d{2})/);
      const hour = timeMatch ? parseInt(timeMatch[1]) : 14;
      const minute = timeMatch ? parseInt(timeMatch[2]) : 0;
      const duration = parseInt(durationString) || 60;
      
      console.log('📅 Meeting data:', { title, hour, minute, duration });
      
      return {
        type: 'CREATE_MEETING',
        data: { title, hour, minute, duration },
      };
    }
    
    // === ANÁLISE DE PRODUTIVIDADE ===
    const lowerResponse = cleanResponse.toLowerCase();
    if (lowerResponse.includes('produtividade') || 
        lowerResponse.includes('análise') ||
        lowerResponse.includes('desempenho')) {
      
      console.log('📊 PRODUCTIVITY ANALYSIS detected');
      return {
        type: 'ANALYZE_PRODUCTIVITY',
        data: {},
      };
    }
    
    console.log('❌ No command detected');
    return null;
  }

  // ===================================
  // Specialized AI Functions
  // ===================================
  async generateSubtasks(projectTitle: string, projectDescription: string): Promise<APIResponse<string[]>> {
    if (!isOpenAIConfigured()) {
      return {
        success: true,
        data: this.getDefaultSubtasks(),
      };
    }

    const prompt = `Crie uma lista de 5-7 subtarefas específicas e práticas para o projeto "${projectTitle}".

Descrição do projeto: ${projectDescription}

Retorne APENAS as subtarefas, uma por linha, sem numeração ou símbolos. Cada subtarefa deve ser:
- Específica e clara
- Realizável
- Relevante para o projeto
- Em português

Exemplo de formato:
Análise de requisitos
Criação do protótipo
Desenvolvimento da funcionalidade principal`;

    try {
      const response = await this.sendMessage(prompt);
      
      if (!response.success || !response.data) {
        return {
          success: true,
          data: this.getDefaultSubtasks(),
        };
      }

      const subtasks = response.data
        .split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => line.trim().replace(/^[-•*\d.)\s]+/, ''))
        .filter((line: string) => line.length > 0)
        .slice(0, 7);

      return {
        success: true,
        data: subtasks.length > 0 ? subtasks : this.getDefaultSubtasks(),
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message || 'Erro ao gerar subtarefas',
        data: this.getDefaultSubtasks(),
      };
    }
  }

  async analyzeProductivity(context: AIContext): Promise<APIResponse<string>> {
    const completionRate = context.metrics.tasksPlanned > 0 
      ? Math.round((context.metrics.tasksCompleted / context.metrics.tasksPlanned) * 100)
      : 0;

    const prompt = `Analise a produtividade do usuário baseado nos seguintes dados:

MÉTRICAS:
- Tarefas concluídas: ${context.metrics.tasksCompleted}/${context.metrics.tasksPlanned} (${completionRate}%)
- Pomodoros realizados: ${context.metrics.pomodoroSessions}
- Tempo focado: ${context.metrics.focusTime} minutos
- Projetos ativos: ${context.metrics.projectsActive}
- Reuniões hoje: ${context.metrics.meetingsToday}

TAREFAS PENDENTES: ${context.tasks.filter(t => !t.completed).length}
PROJETOS EM ANDAMENTO: ${context.projects.filter(p => p.status === 'em_andamento').length}

Forneça uma análise concisa e construtiva com:
1. Avaliação geral (2-3 frases)
2. Principais pontos fortes
3. Sugestões de melhoria (máximo 2)
4. Uma dica prática

Use um tom motivador e personalizado. Máximo 200 palavras.`;

    const response = await this.sendMessage(prompt, context);
    
    if (!response.success) {
      return {
        success: true,
        data: this.getDefaultProductivityAnalysis(context.metrics),
      };
    }

    return response;
  }

  // ===================================
  // Helper Methods
  // ===================================
  private buildSystemPrompt(context?: AIContext): string {
    const basePrompt = `Você é um assistente de produtividade pessoal integrado a um hub de tarefas e projetos.

SUAS CAPACIDADES:
1. CRIAR REUNIÕES: Se o usuário mencionar "reunião" + horário + tema, responda SEMPRE no formato:
   AÇÃO:CREATE_MEETING
   TÍTULO:[título da reunião]
   HORÁRIO:[HH:MM]
   DURAÇÃO:[minutos]

2. CRIAR PROJETOS: Se o usuário quiser um projeto, responda SEMPRE no formato:
   AÇÃO:CREATE_PROJECT
   TÍTULO:[título do projeto]
   CATEGORIA:[trabalho/faculdade/pessoal]
   SUBTAREFAS:[lista de subtarefas separadas por |]

3. ANÁLISE: Analise a produtividade baseado no contexto fornecido

IMPORTANTE:
- Quando detectar uma solicitação de criação, SEMPRE use o formato exato acima
- Seja direto e use os comandos de AÇÃO quando apropriado
- Seja conversacional e útil para outras perguntas
- Use emojis quando apropriado
- Mantenha respostas concisas

Exemplo de resposta para "criar projeto sobre machine learning":
✨ Claro! Vou criar um projeto sobre machine learning para você.

AÇÃO:CREATE_PROJECT
TÍTULO:Aprendizado de Machine Learning
CATEGORIA:pessoal
SUBTAREFAS:Estudar conceitos básicos|Escolher linguagem e ferramentas|Fazer primeiro projeto prático|Estudar algoritmos avançados|Criar portfolio

Projeto criado com sucesso! 🚀`;

    if (!context) return basePrompt;

    return `${basePrompt}

CONTEXTO ATUAL DO USUÁRIO:
- Tarefas: ${context.tasks.length} (${context.tasks.filter(t => t.completed).length} concluídas)
- Projetos: ${context.projects.length} (${context.projects.filter(p => p.status === 'em_andamento').length} em andamento)
- Reuniões hoje: ${context.meetings.length}
- Pomodoros: ${context.metrics.pomodoroSessions}
- Tempo focado: ${context.metrics.focusTime} minutos`;
  }

  private getDefaultSubtasks(): string[] {
    return [
      'Planejamento e definição de escopo',
      'Pesquisa e análise inicial',
      'Desenvolvimento/Execução principal',
      'Testes e validação',
      'Documentação',
      'Revisão e entrega final',
    ];
  }

  private getDefaultProductivityAnalysis(metrics: Metrics): string {
    const completionRate = metrics.tasksPlanned > 0 
      ? Math.round((metrics.tasksCompleted / metrics.tasksPlanned) * 100)
      : 0;

    return `📊 **Análise da sua produtividade:**

✅ Taxa de conclusão: ${completionRate}%
⏱️ Tempo focado: ${metrics.focusTime} minutos
🍅 Pomodoros: ${metrics.pomodoroSessions}
📋 Projetos ativos: ${metrics.projectsActive}

💡 **Insight:** ${
  completionRate > 70 
    ? 'Você está indo muito bem hoje! Continue assim.' 
    : 'Tente focar em uma tarefa por vez para melhorar sua taxa de conclusão.'
}

${metrics.pomodoroSessions < 3 
  ? '🎯 **Dica:** Use mais sessões Pomodoro para manter o foco.' 
  : '🎉 **Parabéns:** Ótimo uso da técnica Pomodoro!'
}`;
  }

  // ===================================
  // Configuration Check
  // ===================================
  isConfigured(): boolean {
    return isOpenAIConfigured();
  }
}

// Export singleton instance
export const aiService = new AIService();