# 🚀 Productivity Hub

Um hub de produtividade moderno e inteligente com assistente IA e técnica Pomodoro.

![Productivity Hub](./public/og-image.png)

## ✨ Funcionalidades

### 🎯 **Gerenciamento de Tarefas**

- ✅ Tarefas rápidas com categorização (trabalho, faculdade, pessoal)
- 📋 Sistema de projetos com subtarefas
- 🎨 Interface moderna inspirada no Notion
- 📊 Métricas de produtividade em tempo real

### 🤖 **Assistente IA Integrado**

- 💬 Chat contextual com acesso a todos seus dados
- 🧠 Sugestões automáticas de subtarefas
- 📅 Criação de reuniões por comando de voz
- 📈 Análise inteligente de produtividade

### 🍅 **Timer Pomodoro Avançado**

- ⏱️ Timer 25/5/15 minutos personalizável
- 📊 Tracking de sessões e tempo focado
- 🔔 Notificações de navegador
- 📈 Estatísticas de produtividade

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Glassmorphism
- **State**: Zustand + Custom Hooks
- **Icons**: Lucide React
- **Integrations**:
  - OpenAI API (GPT-3.5/4)

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- API Key OpenAI

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/productivity-hub.git
cd productivity-hub

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Inicie o servidor de desenvolvimento
npm run dev
```

### Configuração Rápida

1. **OpenAI API** (recomendado começar por aqui):

   ```bash
   # No arquivo .env
   VITE_OPENAI_API_KEY=sk-sua_chave_aqui
   ```

## 📁 Estrutura do Projeto

```
productivity-hub/
├── src/
│   ├── components/         # Componentes React
│   │   ├── ui/             # Componentes base (Button, Input, Card)
│   │   ├── Dashboard.tsx   # Métricas e overview
│   │   ├── Tasks.tsx       # Gerenciamento de tarefas
│   │   ├── Projects.tsx    # Projetos e subtarefas
│   │   ├── Meetings.tsx    # Reuniões
│   │   ├── PomodoroTimer.tsx     # Timer Pomodoro
│   │   ├── AIChat.tsx      # Chat com IA
│   │   └── ConfigModal.tsx # Configurações
│   ├── hooks/              # Custom hooks
│   │   ├── usePomodoro.ts  # Lógica do Pomodoro
│   │   └── useIA.ts        # OpenAI integration
│   ├── services/           # Serviços e APIs
│   │   └── aiService.ts    # OpenAI API
│   ├── stores/             # Estado global (Zustand)
│   │   └── useAppStore.ts  # Store principal
│   ├── types/              # Definições TypeScript
│   │   └── index.ts        # Todos os tipos
│   ├── utils/              # Utilitários
│   │   └── cn.ts           # Class name utility
│   ├── config/             # Configurações
│   │   └── index.ts        # Configuração da app
│   └── styles/             # Estilos
│       └── main.css        # Tailwind + custom styles
├── public/                 # Assets públicos
├── .env.example           # Exemplo de variáveis de ambiente
├── vite.config.ts         # Configuração Vite
├── tailwind.config.js     # Configuração Tailwind
└── tsconfig.json          # Configuração TypeScript
```

## 🔧 Configuração Detalhada

### OpenAI API

1. **Obter API Key**:

   ```
   Portal: https://platform.openai.com/api-keys
   → Create new secret key
   ```

2. **Configurar modelo**:
   ```bash
   VITE_OPENAI_API_KEY=sk-...
   VITE_OPENAI_MODEL=gpt-3.5-turbo  # ou gpt-4
   ```

## 🎮 Como Usar

### Chat IA

O assistente IA entende comandos naturais:

```
"reunião às 15h sobre revisão do projeto"
→ Cria reunião automaticamente

"criar projeto sobre machine learning"
→ Gera projeto com subtarefas

"como está minha produtividade?"
→ Análise detalhada com insights
```

### Projetos

1. **Criar projeto**: Clique em "Novo Projeto"
2. **Subtarefas IA**: Use "Sugerir com IA" para gerar subtarefas automaticamente
3. **Progresso**: O progresso é calculado automaticamente baseado nas subtarefas

### Pomodoro

1. **Iniciar sessão**: Clique em "Iniciar" (25 min foco)
2. **Pausa automática**: Sistema alterna automaticamente
3. **Notificações**: Receba alertas no navegador

## 📱 PWA Support

O app funciona como Progressive Web App:

- ✅ Instalável no dispositivo
- ✅ Funciona offline (básico)
- ✅ Notificações push
- ✅ Ícones e splash screen

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variáveis de ambiente no dashboard
```

### Netlify

```bash
# Build
npm run build

# Deploy pasta dist/
# Configurar variáveis no painel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🔒 Segurança

### Produção

- ✅ Use variáveis de ambiente do servidor
- ✅ Configure CORS adequadamente
- ✅ Nunca exponha API keys no frontend
- ✅ Considere implementar backend para APIs sensíveis

### Desenvolvimento

- ✅ Arquivo `.env` adicionado ao `.gitignore`
- ✅ Validação de configurações no app
- ✅ Error boundaries para capturar erros

## 🐛 Troubleshooting

### Problemas Comuns

**IA não responde**:

- ✅ Verifique a API key OpenAI
- ✅ Confirme se há créditos na conta
- ✅ Reinicie o servidor após alterar .env

**Build falha**:

- ✅ Node.js 18+
- ✅ Limpe node_modules: `rm -rf node_modules && npm install`
- ✅ Verifique se todas as deps estão instaladas

## 🔄 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Linting do código
npm run type-check   # Verificação de tipos TS
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [React](https://reactjs.org/) - Framework principal
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide](https://lucide.dev/) - Ícones
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [OpenAI](https://openai.com/) - IA integration

---

<div align="center">

**Feito com ❤️ para aumentar sua produtividade**

[🌟 Star no GitHub](https://github.com/seu-usuario/productivity-hub) • [🐛 Reportar Bug](https://github.com/seu-usuario/productivity-hub/issues) • [💡 Sugerir Feature](https://github.com/seu-usuario/productivity-hub/issues)

</div>
