import { type ClassValue } from 'clsx';

/**
 * Utility function to conditionally join classNames together
 * Similar to clsx but lightweight implementation
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string') {
      classes.push(input);
    } else if (Array.isArray(input)) {
      const result = cn(...input);
      if (result) classes.push(result);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.join(' ');
}

/**
 * Utility functions for common class combinations
 */
export const variants = {
  // Card variants
  card: {
    base: 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl',
    hover: 'hover:bg-gray-700/50 transition-colors',
    glass: 'glass',
  },

  // Text variants
  text: {
    primary: 'text-gray-100',
    secondary: 'text-gray-300',
    muted: 'text-gray-400',
    accent: 'text-blue-400',
    success: 'text-emerald-400',
    warning: 'text-orange-400',
    danger: 'text-red-400',
  },

  // Background variants
  bg: {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    success: 'bg-emerald-600',
    warning: 'bg-orange-600',
    danger: 'bg-red-600',
    gradient: 'bg-gradient-to-r from-blue-600 to-purple-600',
  },

  // Border variants
  border: {
    default: 'border border-gray-600/50',
    accent: 'border border-blue-600/30',
    success: 'border border-emerald-600/30',
    warning: 'border border-orange-600/30',
    danger: 'border border-red-600/30',
  },

  // Animation variants
  animation: {
    fadeIn: 'animate-fade-in-up',
    slideIn: 'animate-slide-in',
    bounce: 'animate-bounce',
    pulse: 'animate-pulse',
    spin: 'animate-spin',
  },

  // Focus variants
  focus: {
    ring: 'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-900',
    border: 'focus:border-blue-500',
  },
};

/**
 * Helper function to get category colors
 */
export const getCategoryColors = (category: string) => {
  const colors = {
    trabalho: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
    faculdade: 'bg-emerald-600/20 text-emerald-300 border-emerald-600/30',
    pessoal: 'bg-purple-600/20 text-purple-300 border-purple-600/30',
  };
  return colors[category as keyof typeof colors] || colors.pessoal;
};

/**
 * Helper function to get priority colors
 */
export const getPriorityColors = (priority: string) => {
  const colors = {
    alta: 'border-l-red-500/70',
    media: 'border-l-yellow-500/70',
    baixa: 'border-l-emerald-500/70',
  };
  return colors[priority as keyof typeof colors] || colors.media;
};

/**
 * Helper function to get status colors
 */
export const getStatusColors = (status: string) => {
  const colors = {
    nao_iniciado: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    em_andamento: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    concluido: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };
  return colors[status as keyof typeof colors] || colors.nao_iniciado;
};