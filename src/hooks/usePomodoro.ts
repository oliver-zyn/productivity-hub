import { useEffect, useCallback } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { APP_CONSTANTS } from '../config';

export const usePomodoro = () => {
  const pomodoro = useAppStore((state) => state.pomodoro);
  const setPomodoroState = useAppStore((state) => state.setPomodoroState);
  const startPomodoro = useAppStore((state) => state.startPomodoro);
  const pausePomodoro = useAppStore((state) => state.pausePomodoro);
  const resetPomodoro = useAppStore((state) => state.resetPomodoro);
  const updateMetrics = useAppStore((state) => state.updateMetrics);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (pomodoro.isActive && (pomodoro.minutes > 0 || pomodoro.seconds > 0)) {
      interval = setInterval(() => {
        setPomodoroState({
          minutes: pomodoro.seconds > 0 ? pomodoro.minutes : pomodoro.minutes - 1,
          seconds: pomodoro.seconds > 0 ? pomodoro.seconds - 1 : 59,
          isActive: pomodoro.seconds > 0 || pomodoro.minutes > 0,
          mode: pomodoro.mode,
          sessions: (!pomodoro.seconds && !pomodoro.minutes) ? pomodoro.sessions + 1 : pomodoro.sessions
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomodoro.isActive, pomodoro.minutes, pomodoro.mode, pomodoro.seconds, pomodoro.sessions, setPomodoroState]);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    const newSessions = pomodoro.sessions + 1;
    
    // Update focus time if it was a work session
    if (pomodoro.mode === 'work') {
      // This would typically update metrics in the store
      updateMetrics();
    }

    // Determine next mode
    let nextMode: 'work' | 'shortBreak' | 'longBreak' = 'work';
    let nextMinutes = APP_CONSTANTS.POMODORO.WORK_MINUTES;

    if (pomodoro.mode === 'work') {
      if (newSessions % APP_CONSTANTS.POMODORO.SESSIONS_UNTIL_LONG_BREAK === 0) {
        nextMode = 'longBreak';
        nextMinutes = APP_CONSTANTS.POMODORO.LONG_BREAK_MINUTES;
      } else {
        nextMode = 'shortBreak';
        nextMinutes = APP_CONSTANTS.POMODORO.SHORT_BREAK_MINUTES;
      }
    }

    // Set up next session
    setPomodoroState({
      mode: nextMode,
      minutes: nextMinutes,
      seconds: 0,
    });

    // Show notification (if supported)
    showNotification();
  }, [pomodoro.mode, pomodoro.sessions, setPomodoroState, updateMetrics]);

  // Show browser notification
  const showNotification = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const isBreak = pomodoro.mode === 'work';
      const title = isBreak ? '🎉 Pausa!' : '💪 Hora de trabalhar!';
      const body = isBreak 
        ? 'Tempo de fazer uma pausa. Você merece!'
        : 'Pausa acabou! Vamos continuar produtivos.';

      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  }, [pomodoro.mode]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Toggle timer
  const toggle = useCallback(() => {
    if (pomodoro.isActive) {
      pausePomodoro();
    } else {
      startPomodoro();
      requestNotificationPermission();
    }
  }, [pomodoro.isActive, startPomodoro, pausePomodoro, requestNotificationPermission]);

  // Reset to current mode default
  const reset = useCallback(() => {
    resetPomodoro();
  }, [resetPomodoro]);

  // Skip to next phase
  const skip = useCallback(() => {
    handleTimerComplete();
  }, [handleTimerComplete]);

  // Get formatted time string
  const getFormattedTime = useCallback(() => {
    const minutes = String(pomodoro.minutes).padStart(2, '0');
    const seconds = String(pomodoro.seconds).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [pomodoro.minutes, pomodoro.seconds]);

  // Get progress percentage
  const getProgress = useCallback(() => {
    const totalMinutes = pomodoro.mode === 'work' 
      ? APP_CONSTANTS.POMODORO.WORK_MINUTES
      : pomodoro.mode === 'shortBreak'
      ? APP_CONSTANTS.POMODORO.SHORT_BREAK_MINUTES
      : APP_CONSTANTS.POMODORO.LONG_BREAK_MINUTES;
    
    const totalSeconds = totalMinutes * 60;
    const currentSeconds = pomodoro.minutes * 60 + pomodoro.seconds;
    const elapsedSeconds = totalSeconds - currentSeconds;
    
    return (elapsedSeconds / totalSeconds) * 100;
  }, [pomodoro.minutes, pomodoro.seconds, pomodoro.mode]);

  // Get mode display text
  const getModeText = useCallback(() => {
    switch (pomodoro.mode) {
      case 'work':
        return 'Foco';
      case 'shortBreak':
        return 'Pausa Curta';
      case 'longBreak':
        return 'Pausa Longa';
      default:
        return 'Foco';
    }
  }, [pomodoro.mode]);

  // Get next mode text
  const getNextModeText = useCallback(() => {
    if (pomodoro.mode === 'work') {
      const nextSession = pomodoro.sessions + 1;
      return nextSession % APP_CONSTANTS.POMODORO.SESSIONS_UNTIL_LONG_BREAK === 0 
        ? 'Pausa Longa' 
        : 'Pausa Curta';
    }
    return 'Foco';
  }, [pomodoro.mode, pomodoro.sessions]);

  return {
    // State
    pomodoro,
    
    // Actions
    toggle,
    reset,
    skip,
    
    // Computed values
    formattedTime: getFormattedTime(),
    progress: getProgress(),
    modeText: getModeText(),
    nextModeText: getNextModeText(),
    
    // Status
    isWorking: pomodoro.mode === 'work',
    isBreaking: pomodoro.mode !== 'work',
    canStart: !pomodoro.isActive,
    canPause: pomodoro.isActive,
  };
};