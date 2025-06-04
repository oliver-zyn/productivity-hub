# 📁 Estrutura do Projeto - Productivity Hub

Esta documentação descreve a organização completa do projeto Productivity Hub.

## 🏗️ Estrutura Principal

```
productivity-hub/
├── 📄 README.md                    # Documentação principal
├── ⚙️ package.json                 # Dependências e scripts
├── 🔧 vite.config.ts               # Configuração Vite + Tailwind
├── 📝 tsconfig.json                # Configuração TypeScript
├── 🎨 tailwind.config.js           # Configuração Tailwind CSS
├── 🚫 .gitignore                   # Arquivos ignorados pelo Git
├── 📋 .env.example                 # Exemplo de variáveis de ambiente
├── 🌐 index.html                   # HTML principal
│
├── 📁 src/                         # Código fonte principal
│   ├── 🎯 App.tsx                  # Componente raiz
│   ├── 🚀 main.tsx                 # Ponto de entrada
│   │
│   ├── 📁 components/              # Componentes React
│   │   ├── 📁 ui/                  # Componentes base reutilizáveis
│   │   │   ├── Button.tsx          # Botão customizado
│   │   │   ├── Input.tsx           # Input customizado
│   │   │   └── Card.tsx            # Card e variações
│   │   │
│   │   ├── Header.tsx              # Cabeçalho principal
│   │   ├── Dashboard.tsx           # Métricas e overview
│   │   ├── Tasks.tsx               # Gerenciamento de tarefas
│   │   ├── Projects.tsx            # Projetos e subtarefas
│   │   ├── TeamsIntegration.tsx    # Integração Microsoft Teams
│   │   ├── PomodoroTimer.tsx       # Timer Pomodoro
│   │   ├── AIChat.tsx              # Chat com IA
│   │   └── ConfigModal.tsx         # Modal de configuração
│   │
│   ├── 📁 hooks/                   # Custom React Hooks
│   │   ├── usePomodoro.ts          # Lógica do timer Pomodoro
│   │   ├── useTeamsIntegration.ts  # Integração Teams
│   │   └── useAI.ts                # Integração OpenAI
│   │
│   ├── 📁 services/                # Serviços e APIs
│   │   ├── teamsService.ts         # Microsoft Graph API
│   │   └── aiService.ts            # OpenAI API
│   │
│   ├── 📁 stores/                  # Estado global (Zustand)
│   │   └── useAppStore.ts          # Store principal da aplicação
│   │
│   ├── 📁 types/                   # Definições TypeScript
│   │   └── index.ts                # Todos os tipos da aplicação
│   │
│   ├── 📁 utils/                   # Funções utilitárias
│   │   └── cn.ts                   # Utility para classNames
│   │
│   ├── 📁 config/                  # Configurações
│   │   └── index.ts                # Configuração da aplicação
│   │
│   └── 📁 styles/                  # Estilos CSS
│       └── main.css                # Tailwind + estilos customizados
│
├── 📁 public/                      # Assets públicos
│   ├── 📱 manifest.json            # Configuração PWA
│   ├── 🖼️ og-image.png             # Imagem para redes sociais
│   ├── 📁 icons/                   # Ícones PWA
│   └── 📁 screenshots/             # Screenshots da aplicação
│
├── 📁 scripts/                     # Scripts de automação
│   ├── setup.js                   # Script de configuração inicial
│   └── deploy.js                  # Script de deploy automatizado
│
└── 📁 docs/                        # Documentação
    └── STRUCTURE.md                # Este arquivo
```

## 🎯 Componentes por Responsabilidade

### 🧩 Componentes UI Base (`src/components/ui/`)

```
ui/
├── Button.tsx         # Botão reutilizável com variantes
├── Input.tsx          # Input com label e validação
└── Card.tsx           # Card, CardHeader, CardContent, CardFooter
```

### 📱 Componentes Principais (`src/components/`)

```
components/
├── Header.tsx          # Navegação e ações principais
├── Dashboard.tsx       # Métricas e visão geral
├── Tasks.tsx           # Lista e criação de tarefas
├── Projects.tsx        # Projetos com subtarefas
├── TeamsIntegration.tsx # Microsoft Teams
├── PomodoroTimer.tsx   # Timer com estatísticas
├── AIChat.tsx          # Interface do chat IA
└── ConfigModal.tsx     # Configuração de APIs
```

## 🪝 Custom Hooks

### `usePomodoro.ts`

```typescript
// Gerencia estado e lógica do timer Pomodoro
- Timer logic (start/pause/reset)
- Session tracking
- Notifications
- Progress calculation
```

### `useTeamsIntegration.ts`

```typescript
// Integração com Microsoft Teams
- Authentication with MSAL
- Meeting sync
- Meeting creation
- Error handling
```

### `useAI.ts`

```typescript
// Integração com OpenAI
- Chat management
- Command processing
- Subtask generation
- Context management
```

## 🔧 Serviços

### `teamsService.ts`

```typescript
// Microsoft Graph API
class TeamsService {
  - authenticate()
  - getMeetings()
  - createMeeting()
  - formatMeetingTime()
}
```

### `aiService.ts`

```typescript
// OpenAI API Integration
class AIService {
  - sendMessage()
  - generateSubtasks()
  - analyzeProductivity()
  - parseAICommand()
}
```

## 🗄️ Estado Global (Zustand)

### `useAppStore.ts`

```typescript
// Store principal com todas as actions
interface AppStore {
  // Tasks
  tasks: Task[];
  addTask;
  toggleTask;
  deleteTask;

  // Projects
  projects: Project[];
  addProject;
  updateProject;
  addSubtask;

  // Teams
  teamsIntegration: TeamsIntegration;
  setTeamsIntegration;
  addMeeting;

  // Pomodoro
  pomodoro: PomodoroState;
  startPomodoro;
  pausePomodoro;
  resetPomodoro;

  // AI
  aiChat: AIChat;
  setAIChat;
  addAIMessage;

  // Metrics & UI
  metrics: Metrics;
  showConfig;
  loadingSubtasks;
}
```

## 📊 Tipos TypeScript

### Principais Interfaces

```typescript
// Core entities
interface Task { id, text, type, completed, priority }
interface Project { id, title, category, deadline, subtasks }
interface Meeting { id, title, time, attendees, link }
interface AIMessage { id, type, content, timestamp }

// State management
interface PomodoroState { minutes, seconds, isActive, mode }
interface TeamsIntegration { connected, meetings, error }
interface Metrics { tasksCompleted, focusTime, ... }
```

## ⚙️ Configuração

### Variáveis de Ambiente

```bash
# Microsoft Teams
VITE_TEAMS_CLIENT_ID=...
VITE_TEAMS_TENANT_ID=...

# OpenAI
VITE_OPENAI_API_KEY=...
VITE_OPENAI_MODEL=...
```

### Configurações da App

```typescript
// src/config/index.ts
export const CONFIG = {
  TEAMS: { CLIENT_ID, TENANT_ID, SCOPES },
  OPENAI: { API_KEY, MODEL, BASE_URL },
};

export const APP_CONSTANTS = {
  POMODORO: { WORK_MINUTES: 25 },
  STORAGE_KEYS: { TASKS: "productivity-hub-tasks" },
  UI: { ANIMATION_DURATION: 300 },
};
```

## 🎨 Styling

### Tailwind CSS

```css
/* src/styles/main.css */
@import "tailwindcss";

/* Custom animations */
@keyframes fadeInUp {
  ...;
}

/* Glassmorphism */
.glass {
  background: rgba(255, 255, 255, 0.05);
}

/* Focus states */
.focus-ring {
  @apply focus:ring-2 focus:ring-blue-500/50;
}
```

### Utility Functions

```typescript
// src/utils/cn.ts
export function cn(...inputs) // Conditional classNames
export const getCategoryColors = (category) => // Dynamic colors
export const getPriorityColors = (priority) => // Priority styling
```

## 📱 PWA Configuration

### `public/manifest.json`

```json
{
  "name": "Productivity Hub",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1f2937",
  "icons": [...],
  "shortcuts": [...]
}
```

## 🚀 Scripts de Automação

### Setup Script (`scripts/setup.js`)

- ✅ Verifica Node.js version
- ✅ Instala dependências
- ✅ Configura .env
- ✅ Inicializa Git
- ✅ Testa build

### Deploy Script (`scripts/deploy.js`)

- 🚀 Vercel deployment
- 🚀 Netlify deployment
- 🚀 GitHub Pages deployment
- ✅ Environment validation
- ✅ Build verification

## 🔍 Padrões de Desenvolvimento

### Naming Conventions

```
- Componentes: PascalCase (TaskList.tsx)
- Hooks: camelCase com 'use' (usePomodoro.ts)
- Types: PascalCase (Task, Project)
- Functions: camelCase (addTask, toggleProject)
- Constants: UPPER_SNAKE_CASE (APP_CONSTANTS)
```

### File Organization

```
- Um componente por arquivo
- Types co-localizados quando específicos
- Hooks separados por responsabilidade
- Services para integrações externas
- Utils para funções puras
```

### Import Structure

```typescript
// 1. React/external libraries
import React from "react";
import { Button } from "@/components/ui";

// 2. Internal hooks/services
import { usePomodoro } from "@/hooks";
import { aiService } from "@/services";

// 3. Types and utilities
import type { Task } from "@/types";
import { cn } from "@/utils";
```

---

## 📖 Guias Relacionados

- 📄 [README.md](../README.md) - Documentação principal
- ⚙️ [.env.example](../.env.example) - Configuração de ambiente
- 🚀 [scripts/setup.js](../scripts/setup.js) - Configuração inicial
- 🌐 [scripts/deploy.js](../scripts/deploy.js) - Deploy automatizado

---

<div align="center">

**Estrutura otimizada para produtividade e manutenibilidade** ⚡

</div>
