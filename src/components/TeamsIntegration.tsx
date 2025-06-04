import React from "react";
import { Users, ExternalLink, RefreshCw, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useTeamsIntegration } from "@/hooks/useTeamsIntegration";
import { cn } from "@/utils/cn";
import type { Meeting } from "../types";

interface MeetingItemProps {
  meeting: Meeting;
}

const MeetingItem: React.FC<MeetingItemProps> = ({ meeting }) => {
  const getMeetingTypeColor = (type: Meeting["type"]) => {
    switch (type) {
      case "criada_ia":
        return "bg-purple-400";
      case "recorrente":
        return "bg-blue-400";
      case "unica":
        return "bg-emerald-400";
      default:
        return "bg-gray-400";
    }
  };

  const getMeetingTypeLabel = (type: Meeting["type"]) => {
    switch (type) {
      case "criada_ia":
        return "Criada por IA";
      case "recorrente":
        return "Recorrente";
      case "unica":
        return "Única";
      default:
        return "";
    }
  };

  const handleJoinMeeting = () => {
    if (meeting.link && meeting.link !== "Reunião local") {
      window.open(meeting.link, "_blank");
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-3 h-3 rounded-full",
            getMeetingTypeColor(meeting.type)
          )}
        />

        <div>
          <div className="font-medium text-gray-200">{meeting.title}</div>
          <div className="text-sm text-gray-400 flex items-center gap-3">
            <span>{meeting.time}</span>
            <span>
              {meeting.attendees} participante
              {meeting.attendees !== 1 ? "s" : ""}
            </span>
            {meeting.type === "criada_ia" && (
              <span className="text-purple-400 text-xs">
                {getMeetingTypeLabel(meeting.type)}
              </span>
            )}
          </div>
        </div>
      </div>

      {meeting.link && meeting.link !== "Reunião local" && (
        <Button
          onClick={handleJoinMeeting}
          variant="ghost"
          size="sm"
          icon={<ExternalLink className="w-4 h-4" />}
          title="Participar da reunião"
        />
      )}
    </div>
  );
};

const TeamsIntegration: React.FC = () => {
  const {
    teamsIntegration,
    connect,
    syncMeetings,
    lastSyncText,
    isConfigured,
    canConnect,
    needsConfiguration,
  } = useTeamsIntegration();

  return (
    <Card>
      <CardHeader
        title="Microsoft Teams"
        subtitle={
          teamsIntegration.connected
            ? `Última sincronização: ${lastSyncText}`
            : "Não conectado"
        }
        icon={<Users className="w-5 h-5" />}
        actions={
          <div className="flex items-center gap-3">
            {teamsIntegration.connected ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span className="text-sm text-emerald-400">Conectado</span>
                <Button
                  onClick={syncMeetings}
                  variant="ghost"
                  size="sm"
                  icon={<RefreshCw className="w-4 h-4" />}
                  title="Sincronizar reuniões"
                />
              </div>
            ) : (
              <Button
                onClick={connect}
                disabled={!canConnect}
                loading={teamsIntegration.loading}
                variant="secondary"
                size="sm"
                icon={<ExternalLink className="w-4 h-4" />}
              >
                {teamsIntegration.loading ? "Conectando..." : "Conectar"}
              </Button>
            )}
          </div>
        }
      />

      <CardContent>
        {/* Configuration Warning */}
        {needsConfiguration && (
          <div className="mb-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-orange-300 font-medium">
                Teams não configurado
              </p>
              <p className="text-orange-400/80 text-sm">
                Configure suas credenciais do Azure para conectar com o
                Microsoft Teams.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {teamsIntegration.error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">{teamsIntegration.error}</p>
          </div>
        )}

        {/* Meetings List */}
        <div className="space-y-3">
          {teamsIntegration.meetings.length > 0 ? (
            teamsIntegration.meetings.map((meeting: Meeting) => (
              <MeetingItem key={meeting.id} meeting={meeting} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>
                {teamsIntegration.connected
                  ? "Nenhuma reunião hoje"
                  : "Conecte-se para ver suas reuniões"}
              </p>
              {!teamsIntegration.connected && (
                <p className="text-sm mt-1">
                  Conecte com o Microsoft Teams para sincronizar automaticamente
                  suas reuniões
                </p>
              )}
            </div>
          )}
        </div>

        {/* Connection Info */}
        {teamsIntegration.connected && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>Reuniões sincronizadas</span>
              <span>{teamsIntegration.meetings.length}</span>
            </div>
          </div>
        )}

        {/* Teams Features Info */}
        {!teamsIntegration.connected && isConfigured && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-blue-300 font-medium mb-1">
              Recursos do Teams
            </h4>
            <ul className="text-blue-400/80 text-sm space-y-1">
              <li>• Sincronização automática de reuniões</li>
              <li>• Criação de reuniões via IA</li>
              <li>• Links diretos para participar</li>
              <li>• Notificações de próximas reuniões</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamsIntegration;
