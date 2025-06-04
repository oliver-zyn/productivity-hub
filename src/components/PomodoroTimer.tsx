import React from "react";
import { Target, Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { usePomodoro } from "@/hooks/usePomodoro";
import { cn } from "@/utils/cn";

const PomodoroTimer: React.FC = () => {
  const {
    pomodoro,
    toggle,
    reset,
    skip,
    formattedTime,
    progress,
    modeText,
    nextModeText,
    isWorking,
  } = usePomodoro();

  const getModeColors = () => {
    if (isWorking) {
      return {
        text: "text-red-600",
        bg: "from-red-500/20 to-red-600/10",
        border: "border-red-500/30",
        button: "bg-red-600 hover:bg-red-500",
      };
    } else {
      return {
        text: "text-emerald-400",
        bg: "from-emerald-500/20 to-emerald-600/10",
        border: "border-emerald-500/30",
        button: "bg-emerald-600 hover:bg-emerald-500",
      };
    }
  };

  const colors = getModeColors();

  return (
    <Card>
      <CardHeader
        title="Pomodoro Timer"
        subtitle={`Sessão ${pomodoro.sessions + 1} • Próximo: ${nextModeText}`}
        icon={<Target className="w-5 h-5" />}
      />

      <CardContent>
        <div className="text-center">
          {/* Mode Indicator */}
          <div className="mb-4">
            <div
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full border",
                `bg-gradient-to-r ${colors.bg} ${colors.border}`
              )}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  colors.text.replace("text-", "bg-")
                )}
              />
              <span className={cn("font-medium", colors.text)}>{modeText}</span>
            </div>
          </div>

          {/* Timer Display */}
          <div className={cn("text-6xl font-mono font-bold mb-6", colors.text)}>
            {formattedTime}
          </div>

          {/* Progress Circle */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg
              className="w-32 h-32 transform -rotate-90"
              viewBox="0 0 120 120"
            >
              {/* Background Circle */}
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-700"
              />
              {/* Progress Circle */}
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                className={cn("transition-all duration-300", colors.text)}
                strokeLinecap="round"
              />
            </svg>

            {/* Progress Percentage */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn("text-xl font-bold", colors.text)}>
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-3 mb-4">
            {/* Play/Pause Button */}
            <Button
              onClick={toggle}
              variant={pomodoro.isActive ? "danger" : "success"}
              size="lg"
              icon={
                pomodoro.isActive ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )
              }
            >
              {pomodoro.isActive ? "Pausar" : "Iniciar"}
            </Button>

            {/* Reset Button */}
            <Button
              onClick={reset}
              variant="ghost"
              size="lg"
              icon={<RotateCcw className="w-5 h-5" />}
              title="Resetar timer"
            />

            {/* Skip Button */}
            <Button
              onClick={skip}
              variant="ghost"
              size="lg"
              icon={<SkipForward className="w-5 h-5" />}
              title="Pular para próxima sessão"
            />
          </div>

          {/* Session Info */}
          <div className="text-sm text-gray-400 space-y-1">
            <div>Sessões completadas: {pomodoro.sessions}</div>
            <div>
              {isWorking ? "🍅" : "☕"}{" "}
              {isWorking ? "Hora de focar!" : "Tempo de descansar"}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            💡 Dicas do Pomodoro
          </h4>
          {isWorking ? (
            <div className="text-xs text-gray-400 space-y-1">
              <p>• Elimine distrações (celular, notificações)</p>
              <p>• Foque em uma única tarefa</p>
              <p>• Mantenha água por perto</p>
            </div>
          ) : (
            <div className="text-xs text-gray-400 space-y-1">
              <p>• Levante-se e alongue-se</p>
              <p>• Hidrate-se</p>
              <p>• Relaxe os olhos</p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-700/20 rounded-lg">
            <div className="text-lg font-bold text-blue-400">
              {pomodoro.sessions * 25}min
            </div>
            <div className="text-xs text-gray-400">Tempo Total</div>
          </div>
          <div className="text-center p-3 bg-gray-700/20 rounded-lg">
            <div className="text-lg font-bold text-emerald-400">
              {Math.floor(pomodoro.sessions / 4)}
            </div>
            <div className="text-xs text-gray-400">Ciclos Completos</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PomodoroTimer;
