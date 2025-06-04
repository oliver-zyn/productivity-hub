import { useState, useMemo, useCallback } from 'react';
import React from 'react';

export interface SearchOptions<T> {
  searchKeys: (keyof T)[];
  filters?: Record<string, string | string[] | number | boolean | null>;
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
  caseSensitive?: boolean;
  exactMatch?: boolean;
}

export interface UseSearchReturn<T> {
  filteredItems: T[];
  query: string;
  setQuery: (query: string) => void;
  filters: Record<string, string | string[] | number | boolean | null>;
  setFilters: (filters: Record<string, string | string[] | number | boolean | null>) => void;
  setFilter: (key: string, value: string | string[] | number | boolean | null) => void;
  clearFilters: () => void;
  sortBy: string | null;
  sortOrder: 'asc' | 'desc';
  setSorting: (key: string | null, order?: 'asc' | 'desc') => void;
  resultCount: number;
  hasActiveFilters: boolean;
  hasActiveSearch: boolean;
}

export const useSearch = <T extends { [K in keyof T]: string | string[] | number | boolean | null | Date | object | undefined }>(
  items: T[],
  options: SearchOptions<T>
): UseSearchReturn<T> => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string | string[] | number | boolean | null>>(options.filters || {});
  const [sortBy, setSortBy] = useState<string | null>(options.sortBy ? String(options.sortBy) : null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(options.sortOrder || 'asc');

  const {
    searchKeys,
    caseSensitive = false,
    exactMatch = false
  } = options;

  // Função para filtrar itens
  const filterItems = useCallback((items: T[], filters: Record<string, string | string[] | number | boolean | null>): T[] => {
    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined || value === '') return true;
        
        const itemValue = item[key as keyof T];
        
        // Handle array filters (multiple selection)
        if (Array.isArray(value)) {
          return value.length === 0 || value.includes(String(itemValue));
        }
        
        // Handle date range filters
        if (key.includes('Date') || key.includes('date') || key.includes('Time') || key.includes('time')) {
          if (typeof value === 'object' && value !== null) {
            const dateRange = value as { from: string; to: string };
            if ('from' in dateRange && 'to' in dateRange) {
              const itemDate = new Date(String(itemValue));
              const fromDate = new Date(dateRange.from);
              const toDate = new Date(dateRange.to);
              return itemDate >= fromDate && itemDate <= toDate;
            }
          }
        }
        
        // Handle boolean filters
        if (typeof value === 'boolean') {
          return itemValue === value;
        }
        
        // Handle string/number equality
        return itemValue === value;
      });
    });
  }, []);

  // Função para buscar itens
  const searchItems = useCallback((items: T[], query: string): T[] => {
    if (!query.trim()) return items;
    
    const searchTerm = caseSensitive ? query : query.toLowerCase();
    
    return items.filter(item => {
      return searchKeys.some(key => {
        const value = item[key as keyof T];
        if (value === null || value === undefined) return false;
        
        const stringValue = caseSensitive ? String(value) : String(value).toLowerCase();
        if (exactMatch) {
          return stringValue === searchTerm;
        }
        
        return stringValue.includes(searchTerm);
      });
    });
  }, [searchKeys, caseSensitive, exactMatch]);

  // Função para ordenar itens
  const sortItems = useCallback((items: T[], sortBy: string | null, sortOrder: 'asc' | 'desc'): T[] => {
    if (!sortBy) return items;
    return [...items].sort((a, b) => {
      const aValue = (a as Record<string, string | string[] | number | boolean | null>)[sortBy];
      const bValue = (b as Record<string, string | string[] | number | boolean | null>)[sortBy];
      
      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return sortOrder === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined) return sortOrder === 'asc' ? -1 : 1;
      
      // Handle dates
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortOrder === 'asc' 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      
      // Handle strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue, 'pt-BR', { numeric: true });
        return sortOrder === 'asc' ? comparison : -comparison;
      }
      
      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle booleans
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortOrder === 'asc' 
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }
      
      // Fallback to string comparison
      const aStr = String(aValue);
      const bStr = String(bValue);
      const comparison = aStr.localeCompare(bStr);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, []);

  // Processed items
  const filteredItems = useMemo(() => {
    let result = items;
    
    // Apply filters
    result = filterItems(result, filters);
    
    // Apply search
    result = searchItems(result, query);
    
    // Apply sorting
    result = sortItems(result, sortBy, sortOrder);
    
    return result;
  }, [items, filters, query, sortBy, sortOrder, filterItems, searchItems, sortItems]);

  // Helper functions
  const setFilter = useCallback((key: string, value: string | string[] | number | boolean | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const setSorting = useCallback((key: string | null, order: 'asc' | 'desc' = 'asc') => {
    setSortBy(key);
    setSortOrder(order);
  }, []);

  // Computed values
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    });
  }, [filters]);

  const hasActiveSearch = useMemo(() => {
    return query.trim().length > 0;
  }, [query]);

  return {
    filteredItems,
    query,
    setQuery,
    filters,
    setFilters,
    setFilter,
    clearFilters,
    sortBy,
    sortOrder,
    setSorting,
    resultCount: filteredItems.length,
    hasActiveFilters,
    hasActiveSearch,
  };
};

// ===================================
// Specialized search hooks
// ===================================

import type { Task, Project, Meeting } from '../types';
export const useTaskSearch = (tasks: Task[]) => {
  return useSearch(tasks, {
    searchKeys: ['text'],
    filters: {
      type: '',
      priority: '',
      completed: null,
    },
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
};

export const useProjectSearch = (projects: Project[]) => {
  return useSearch(projects , {
    searchKeys: ['title', 'description'],
    filters: {
      category: '',
      status: '',
    },
    sortBy: 'deadline',
    sortOrder: 'asc',
  });
};

export const useMeetingSearch = (meetings: Meeting[]) => {
  return useSearch(meetings, {
    searchKeys: ['title', 'description'],
    filters: {
      platform: '',
      type: '',
      isRecurring: null,
    },
    sortBy: 'startTime',
    sortOrder: 'asc',
  });
};

// ===================================
// Search utilities
// ===================================

export const highlightSearchTerm = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) 
      ? React.createElement('span', {
          key: index,
          className: "bg-yellow-400/30 text-yellow-200 px-1 rounded"
        }, part)
      : part
  );
};

export const getSearchSuggestions = <T extends { [K in keyof T]: string | string[] | number | boolean | null | Date | object | undefined }>(
  items: T[],
  searchKey: keyof T,
  limit: number = 5
): string[] => {
  const suggestions = new Set<string>();
  
  items.forEach(item => {
    const value = item[searchKey];
    if (typeof value === 'string' && value.trim()) {
      // Add whole value
      suggestions.add(value.trim());
      
      // Add words from value
      value.split(' ').forEach((word: string) => {
        if (word.length > 2) {
          suggestions.add(word.trim());
        }
      });
    }
  });
  
  return Array.from(suggestions).slice(0, limit);
};