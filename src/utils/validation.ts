import type { NewTask, NewProject, NewMeeting } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ===================================
// Task Validation
// ===================================

export const validateTask = (task: NewTask): ValidationResult => {
  const errors: string[] = [];

  // Validar texto
  if (!task.text || !task.text.trim()) {
    errors.push('O texto da tarefa é obrigatório');
  } else if (task.text.trim().length < 3) {
    errors.push('O texto deve ter pelo menos 3 caracteres');
  } else if (task.text.length > 200) {
    errors.push('O texto não pode ter mais de 200 caracteres');
  }

  // Validar tipo
  const validTypes = ['trabalho', 'faculdade', 'pessoal'];
  if (!validTypes.includes(task.type)) {
    errors.push('Tipo de tarefa inválido');
  }

  // Validar prioridade (se fornecida)
  if (task.priority) {
    const validPriorities = ['baixa', 'media', 'alta'];
    if (!validPriorities.includes(task.priority)) {
      errors.push('Prioridade inválida');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ===================================
// Project Validation
// ===================================

export const validateProject = (project: NewProject): ValidationResult => {
  const errors: string[] = [];

  // Validar título
  if (!project.title || !project.title.trim()) {
    errors.push('O título do projeto é obrigatório');
  } else if (project.title.trim().length < 3) {
    errors.push('O título deve ter pelo menos 3 caracteres');
  } else if (project.title.length > 100) {
    errors.push('O título não pode ter mais de 100 caracteres');
  }

  // Validar categoria
  const validCategories = ['trabalho', 'faculdade', 'pessoal'];
  if (!validCategories.includes(project.category)) {
    errors.push('Categoria inválida');
  }

  // Validar deadline
  if (!project.deadline) {
    errors.push('A data limite é obrigatória');
  } else {
    const deadlineDate = new Date(project.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(deadlineDate.getTime())) {
      errors.push('Data limite inválida');
    } else if (deadlineDate < today) {
      errors.push('A data limite deve ser hoje ou no futuro');
    }
    
    // Verificar se não é muito distante (opcional)
    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
    if (deadlineDate > twoYearsFromNow) {
      errors.push('A data limite não pode ser mais de 2 anos no futuro');
    }
  }

  // Validar descrição
  if (project.description && project.description.length > 500) {
    errors.push('A descrição não pode ter mais de 500 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ===================================
// Meeting Validation
// ===================================

export const validateMeeting = (meeting: NewMeeting): ValidationResult => {
  const errors: string[] = [];

  // Validar título
  if (!meeting.title || !meeting.title.trim()) {
    errors.push('O título da reunião é obrigatório');
  } else if (meeting.title.trim().length < 3) {
    errors.push('O título deve ter pelo menos 3 caracteres');
  } else if (meeting.title.length > 100) {
    errors.push('O título não pode ter mais de 100 caracteres');
  }

  // Validar horário de início
  if (!meeting.startTime) {
    errors.push('O horário de início é obrigatório');
  } else {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    if (meeting.startTime < fiveMinutesAgo) {
      errors.push('A reunião não pode ser agendada para o passado');
    }

    // Verificar se não é muito distante
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    if (meeting.startTime > sixMonthsFromNow) {
      errors.push('A reunião não pode ser agendada para mais de 6 meses no futuro');
    }
  }

  // Validar duração
  if (!meeting.duration || meeting.duration <= 0) {
    errors.push('A duração deve ser maior que zero');
  } else if (meeting.duration > 480) { // 8 horas
    errors.push('A duração não pode ser maior que 8 horas');
  } else if (meeting.duration < 5) {
    errors.push('A duração deve ser de pelo menos 5 minutos');
  }

  // Validar plataforma
  const validPlatforms = ['teams', 'meet', 'zoom', 'custom'];
  if (!validPlatforms.includes(meeting.platform)) {
    errors.push('Plataforma inválida');
  }

  // Validar participantes (se fornecidos)
  if (meeting.participants && meeting.participants.length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = meeting.participants.filter(email => 
      email.trim() && !emailRegex.test(email.trim())
    );
    
    if (invalidEmails.length > 0) {
      errors.push(`Emails inválidos: ${invalidEmails.join(', ')}`);
    }

    if (meeting.participants.length > 50) {
      errors.push('Máximo de 50 participantes permitido');
    }
  }

  // Validar descrição
  if (meeting.description && meeting.description.length > 500) {
    errors.push('A descrição não pode ter mais de 500 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ===================================
// Subtask Validation
// ===================================

export const validateSubtask = (text: string): ValidationResult => {
  const errors: string[] = [];

  if (!text || !text.trim()) {
    errors.push('O texto da subtarefa é obrigatório');
  } else if (text.trim().length < 2) {
    errors.push('O texto deve ter pelo menos 2 caracteres');
  } else if (text.length > 150) {
    errors.push('O texto não pode ter mais de 150 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ===================================
// General Utilities
// ===================================

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ');
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const formatValidationErrors = (errors: string[]): string => {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  return `Erros encontrados:\n• ${errors.join('\n• ')}`;
};