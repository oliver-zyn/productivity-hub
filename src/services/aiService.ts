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
  // Command Processing
  // ===================================
  parseAICommand(response: string): AICommand | null {
    const lowerResponse = response.toLowerCase();
    
    // Meeting creation command
    if (lowerResponse.includes('ação:create_meeting') || 
        (lowerResponse.includes('reunião') && /\d{1,2}[h:]\d{0,2}/.test(lowerResponse))) {
      
      const titleMatch = response.match(/título:(.+)/i);
      const timeMatch = response.match(/(\d{1,2})[h:](\d{0,2})/);
      const durationMatch = response.match(/duração:(\d+)/i) || response.match(/(\d+)\s*min/);
      
      if (timeMatch) {
        return {
          type: 'CREATE_MEETING',
          data: {
            title: titleMatch?.[1]?.trim() || 'Reunião',
            hour: parseInt(timeMatch[1]),
            minute: parseInt(timeMatch[2] || '0'),
            duration: durationMatch ? parseInt(durationMatch[1]) : 60,
          },
        };
      }
    }
    
    // Project creation command
    if (lowerResponse.includes('ação:create_project') || 
        lowerResponse.includes('criar projeto')) {
      
      const titleMatch = response.match(/título:(.+)/i);
      const categoryMatch = response.match(/categoria:(.+)/i);
      const subtasksMatch = response.match(/subtarefas:(.+)/i);
      
      return {
        type: 'CREATE_PROJECT',
        data: {
          title: titleMatch?.[1]?.trim() || 'Novo Projeto',
          category: categoryMatch?.[1]?.trim() || 'pessoal',
          subtasks: subtasksMatch?.[1]?.split('|').map(s => s.trim()) || [],
        },
      };
    }
    
    // Productivity analysis command
    if (lowerResponse.includes('produtividade') || 
        lowerResponse.includes('análise') ||
        lowerResponse.includes('como estou')) {
      
      return {
        type: 'ANALYZE_PRODUCTIVITY',
        data: {},
      };
    }
    
    return null;
  }

  // ===================================
  // Helper Methods
  // ===================================
  private buildSystemPrompt(context?: AIContext): string {
    const basePrompt = `Você é um assistente de produtividade pessoal integrado a um hub de tarefas e projetos.

SUAS CAPACIDADES:
1. CRIAR REUNIÕES: Se o usuário mencionar "reunião" + horário + tema, responda no formato:
   AÇÃO:CREATE_MEETING
   TÍTULO:[título da reunião]
   HORÁRIO:[HH:MM]
   DURAÇÃO:[minutos]

2. CRIAR PROJETOS: Se o usuário quiser um projeto, responda no formato:
   AÇÃO:CREATE_PROJECT
   TÍTULO:[título do projeto]
   CATEGORIA:[trabalho/faculdade/pessoal]
   SUBTAREFAS:[lista de subtarefas separadas por |]

3. ANÁLISE: Analise a produtividade baseado no contexto fornecido

Seja conversacional, útil e direto. Use emojis quando apropriado. Mantenha respostas concisas (máximo 150 palavras).`;

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