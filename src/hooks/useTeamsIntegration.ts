import { useCallback } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { teamsService } from '../services/teamsService';
import { isTeamsConfigured } from '../config';
import type { Meeting } from '../types';

export const useTeamsIntegration = () => {
  const teamsIntegration = useAppStore((state) => state.teamsIntegration);
  const setTeamsIntegration = useAppStore((state) => state.setTeamsIntegration);
  const addMeeting = useAppStore((state) => state.addMeeting);

  // Connect to Teams
  const connect = useCallback(async () => {
    if (!isTeamsConfigured()) {
      setTeamsIntegration({
        error: 'Teams não configurado. Adicione suas credenciais no arquivo .env',
        loading: false,
      });
      return false;
    }

    setTeamsIntegration({ loading: true, error: null });

    try {
      const authResult = await teamsService.authenticate();
      
      if (!authResult.success) {
        setTeamsIntegration({
          loading: false,
          error: authResult.error || 'Falha na autenticação',
        });
        return false;
      }

      // Fetch initial meetings
      const meetingsResult = await teamsService.getMeetings();
      
      if (meetingsResult.success && meetingsResult.data) {
        setTeamsIntegration({
          connected: true,
          loading: false,
          meetings: meetingsResult.data,
          lastSync: new Date(),
          error: null,
        });
      } else {
        setTeamsIntegration({
          connected: true,
          loading: false,
          error: meetingsResult.error || 'Falha ao carregar reuniões',
          lastSync: new Date(),
        });
      }

      return true;
    } catch (error) {
      setTeamsIntegration({
        loading: false,
        error: (error as Error).message || 'Erro inesperado',
      });
      return false;
    }
  }, [setTeamsIntegration]);

  // Sync meetings
  const syncMeetings = useCallback(async () => {
    if (!teamsIntegration.connected) {
      return false;
    }

    try {
      const result = await teamsService.getMeetings();
      
      if (result.success && result.data) {
        setTeamsIntegration({
          meetings: result.data,
          lastSync: new Date(),
          error: null,
        });
        return true;
      } else {
        setTeamsIntegration({
          error: result.error || 'Falha ao sincronizar reuniões',
        });
        return false;
      }
    } catch (error) {
      setTeamsIntegration({
        error: (error as Error).message || 'Erro ao sincronizar',
      });
      return false;
    }
  }, [teamsIntegration.connected, setTeamsIntegration]);

  // Create meeting
  const createMeeting = useCallback(async (
    title: string,
    startTime: Date,
    endTime: Date,
    description?: string
  ) => {
    if (!teamsIntegration.connected) {
      // Create local meeting if not connected
      const localMeeting: Meeting = {
        id: Date.now(),
        title,
        time: `${startTime.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })} - ${endTime.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        attendees: 1,
        link: 'Reunião local',
        type: 'criada_ia',
        startTime,
        endTime,
        description,
      };

      addMeeting(localMeeting);
      return { success: true, data: localMeeting };
    }

    try {
      const result = await teamsService.createMeeting(title, startTime, endTime, description);
      
      if (result.success && result.data) {
        addMeeting(result.data);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message || 'Erro ao criar reunião',
      };
    }
  }, [teamsIntegration.connected, addMeeting]);

  // Disconnect
  const disconnect = useCallback(async () => {
    try {
      await teamsService.logout();
      setTeamsIntegration({
        connected: false,
        loading: false,
        meetings: [],
        lastSync: null,
        error: null,
      });
    } catch (error) {
      console.error('Error disconnecting from Teams:', error);
    }
  }, [setTeamsIntegration]);

  // Get meeting by ID
  const getMeetingById = useCallback((id: string | number) => {
    return teamsIntegration.meetings.find(meeting => meeting.id === id);
  }, [teamsIntegration.meetings]);

  // Get today's meetings
  const getTodaysMeetings = useCallback(() => {
    const today = new Date();
    const todayString = today.toDateString();
    
    return teamsIntegration.meetings.filter(meeting => {
      if (!meeting.startTime) return true; // Include meetings without specific dates
      return meeting.startTime.toDateString() === todayString;
    });
  }, [teamsIntegration.meetings]);

  // Get upcoming meetings (next 2 hours)
  const getUpcomingMeetings = useCallback(() => {
    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    return teamsIntegration.meetings.filter(meeting => {
      if (!meeting.startTime) return false;
      return meeting.startTime >= now && meeting.startTime <= twoHoursLater;
    });
  }, [teamsIntegration.meetings]);

  // Format last sync time
  const getLastSyncText = useCallback(() => {
    if (!teamsIntegration.lastSync) return 'Nunca';
    
    const now = new Date();
    const diff = now.getTime() - teamsIntegration.lastSync.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes === 0) return 'Agora';
    if (minutes === 1) return 'Há 1 minuto';
    if (minutes < 60) return `Há ${minutes} minutos`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return 'Há 1 hora';
    return `Há ${hours} horas`;
  }, [teamsIntegration.lastSync]);

  return {
    // State
    teamsIntegration,
    
    // Actions
    connect,
    disconnect,
    syncMeetings,
    createMeeting,
    
    // Queries
    getMeetingById,
    getTodaysMeetings,
    getUpcomingMeetings,
    
    // Computed
    lastSyncText: getLastSyncText(),
    isConfigured: isTeamsConfigured(),
    canConnect: isTeamsConfigured() && !teamsIntegration.loading,
    needsConfiguration: !isTeamsConfigured(),
  };
};