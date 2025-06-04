import React from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { useMetricsSelector } from "../stores/useAppStore";
import { cn } from "../utils/cn";

interface MetricCardProps {
  title: string;
  value: number | string;
  gradient: string;
  textColor: string;
  borderColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  gradient,
  textColor,
  borderColor,
}) => {
  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-all duration-200 hover:scale-105",
        gradient,
        borderColor
      )}
    >
      <div className={cn("text-2xl font-bold", textColor)}>{value}</div>
      <div className={cn("text-sm opacity-70", textColor)}>{title}</div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const metrics = useMetricsSelector();

  const metricCards = [
    {
      title: "Tarefas Hoje",
      value: metrics.tasksCompleted,
      gradient: "bg-gradient-to-br from-blue-600/20 to-blue-700/10",
      textColor: "text-blue-400",
      borderColor: "border-blue-600/20",
    },
    {
      title: "Projetos Ativos",
      value: metrics.projectsActive,
      gradient: "bg-gradient-to-br from-emerald-600/20 to-emerald-700/10",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-600/20",
    },
    {
      title: "Pomodoros",
      value: metrics.pomodoroSessions,
      gradient: "bg-gradient-to-br from-purple-600/20 to-purple-700/10",
      textColor: "text-purple-400",
      borderColor: "border-purple-600/20",
    },
    {
      title: "Tempo Focado",
      value: `${metrics.focusTime}min`,
      gradient: "bg-gradient-to-br from-orange-600/20 to-orange-700/10",
      textColor: "text-orange-400",
      borderColor: "border-orange-600/20",
    },
    {
      title: "Reuniões Hoje",
      value: metrics.meetingsToday,
      gradient: "bg-gradient-to-br from-indigo-600/20 to-indigo-700/10",
      textColor: "text-indigo-400",
      borderColor: "border-indigo-600/20",
    },
  ];

  // Calculate completion rate
  const completionRate =
    metrics.tasksPlanned > 0
      ? Math.round((metrics.tasksCompleted / metrics.tasksPlanned) * 100)
      : 0;

  return (
    <Card>
      <CardHeader
        title="Dashboard"
        subtitle={`Taxa de conclusão: ${completionRate}%`}
        icon={<TrendingUp className="w-5 h-5" />}
      />

      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {metricCards.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              gradient={metric.gradient}
              textColor={metric.textColor}
              borderColor={metric.borderColor}
            />
          ))}
        </div>

        {/* Progress Summary */}
        <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Progresso do Dia
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-600/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(completionRate, 100)}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-300 min-w-[3rem]">
              {completionRate}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {metrics.tasksCompleted} de {metrics.tasksPlanned} tarefas
            concluídas
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-700/20 rounded-lg">
            <div className="text-lg font-bold text-blue-400">
              {metrics.pomodoroSessions * 25}min
            </div>
            <div className="text-xs text-gray-400">Tempo Total Focado</div>
          </div>
          <div className="text-center p-3 bg-gray-700/20 rounded-lg">
            <div className="text-lg font-bold text-emerald-400">
              {metrics.projectsActive > 0 ? "✓" : "—"}
            </div>
            <div className="text-xs text-gray-400">Projetos Em Andamento</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
