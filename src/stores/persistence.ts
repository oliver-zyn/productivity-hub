import { APP_CONSTANTS } from '../config';

export interface StorageData<T> {
  data: T;
  timestamp: number;
  version: string;
}

export class PersistenceManager {
  private static instance: PersistenceManager;
  private readonly VERSION = '1.0.0';

  static getInstance(): PersistenceManager {
    if (!PersistenceManager.instance) {
      PersistenceManager.instance = new PersistenceManager();
    }
    return PersistenceManager.instance;
  }

  saveToStorage<T>(key: string, data: T): void {
    try {
      const storageData: StorageData<T> = {
        data,
        timestamp: Date.now(),
        version: this.VERSION,
      };
      localStorage.setItem(key, JSON.stringify(storageData));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }

  // CORRIGIDO: Deserializar datas automaticamente
  loadFromStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const storageData: StorageData<T> = JSON.parse(item);
      
      // Verificar versão (para migrações futuras)
      if (storageData.version !== this.VERSION) {
        console.warn(`Versão incompatível para ${key}. Limpando dados.`);
        this.removeFromStorage(key);
        return null;
      }

      // DESERIALIZAR DATAS AUTOMATICAMENTE
      const deserializedData = this.deserializeDates(storageData.data);
      return deserializedData as T | null;
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
      return null;
    }
  }
  // NOVA FUNÇÃO: Deserializar datas automaticamente
  private deserializeDates<T>(obj: T | null | undefined): T {
    if (obj === null || obj === undefined) {
      return obj as T;
    }

    if (typeof obj === 'string') {
      // Tentar detectar se é uma data ISO string
      if (this.isISODateString(obj)) {
        return new Date(obj) as T;
      }
      return obj as T;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deserializeDates(item)) as T;
    }

    if (typeof obj === 'object') {
      const result: T = {} as T;
      for (const [key, value] of Object.entries(obj)) {
        // Campos que sabemos que são datas
        if (this.isDateField(key) && typeof value === 'string') {
          result[key as keyof T] = new Date(value) as T[keyof T];
        } else {
          result[key as keyof T] = this.deserializeDates(value) as T[keyof T];
        }
      }
      return result;
    }

    return obj;
  }

  // Detectar se uma string é uma data ISO
  private isISODateString(str: string): boolean {
    if (typeof str !== 'string') return false;
    
    // Regex para detectar data ISO (YYYY-MM-DDTHH:mm:ss.sssZ ou YYYY-MM-DD)
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
    
    if (!isoDateRegex.test(str)) return false;
    
    // Verificar se é uma data válida
    const date = new Date(str);
    return !isNaN(date.getTime()) && date.toISOString().startsWith(str.slice(0, 10));
  }

  // Detectar campos que devem ser datas
  private isDateField(fieldName: string): boolean {
    const dateFields = [
      'createdAt', 'updatedAt', 'completedAt', 
      'startTime', 'endTime', 'timestamp'
    ];
    return dateFields.includes(fieldName);
  }

  removeFromStorage(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Erro ao remover do localStorage:', error);
    }
  }

  clearAllData(): void {
    try {
      Object.values(APP_CONSTANTS.STORAGE_KEYS).forEach(key => {
        this.removeFromStorage(key);
      });
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  }

  getStorageInfo(): { used: number; available: number } {
    try {
      let used = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          used += localStorage.getItem(key)?.length || 0;
        }
      }
      
      return {
        used: Math.round(used / 1024), // KB
        available: Math.round((5 * 1024 * 1024 - used) / 1024), // KB disponível (5MB limite típico)
      };
    } catch (error) {
      console.error('Erro ao obter informações do localStorage:', error);
      return { used: 0, available: 0 };
    }
  }
}