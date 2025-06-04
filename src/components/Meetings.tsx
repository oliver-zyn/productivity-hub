import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Download,
  Trash2,
  Users,
  ExternalLink,
  Zap,
  Copy,
  Edit,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToastHelpers } from "@/components/ui/Toast";
import type {
  Meeting,
  MeetingTemplate,
  NewMeeting,
  MeetingPlatform,
} from "../types";

// Mock hook - você vai substituir pelos dados reais do store
const useMeetings = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [templates] = useState<MeetingTemplate[]>([
    {
      id: 1,
      name: "Daily Standup",
      duration: 30,
      description: "Reunião diária da equipe",
      platform: "teams",
      defaultParticipants: ["equipe@empresa.com"],
      isRecurring: true,
      category: "trabalho",
    },
    {
      id: 2,
      name: "1:1 Meeting",
      duration: 60,
      description: "Reunião individual",
      platform: "meet",
      defaultParticipants: [],
      isRecurring: false,
      category: "trabalho",
    },
    {
      id: 3,
      name: "Review de Sprint",
      duration: 90,
      description: "Revisão dos resultados do sprint",
      platform: "zoom",
      defaultParticipants: ["dev-team@empresa.com"],
      isRecurring: false,
      category: "trabalho",
    },
  ]);

  const addMeeting = (meeting: NewMeeting) => {
    const newMeeting: Meeting = {
      id: Date.now(),
      title: meeting.title,
      time: `${meeting.startTime.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${new Date(
        meeting.startTime.getTime() + meeting.duration * 60000
      ).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      duration: meeting.duration,
      platform: meeting.platform,
      link: generateMeetingLink(meeting.platform),
      type: meeting.templateId ? "template" : "unica",
      startTime: meeting.startTime,
      endTime: new Date(meeting.startTime.getTime() + meeting.duration * 60000),
      description: meeting.description || "",
      participants: meeting.participants || [],
      templateId: meeting.templateId,
      isRecurring: meeting.isRecurring || false,
    };
    setMeetings((prev) => [...prev, newMeeting]);
  };

  const deleteMeeting = (id: number) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMeeting = (id: number, data: NewMeeting) => {
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              ...data,
              time: `${data.startTime.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })} - ${new Date(
                data.startTime.getTime() + data.duration * 60000
              ).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}`,
              startTime: data.startTime,
              endTime: new Date(data.startTime.getTime() + data.duration * 60000),
            }
          : m
      )
    );
  };

  return { meetings, templates, addMeeting, deleteMeeting, updateMeeting };
};

// Gerar links automaticamente baseado na plataforma
const generateMeetingLink = (platform: MeetingPlatform): string => {
  const meetingId = Math.random().toString(36).substring(2, 15);

  switch (platform) {
    case "meet":
      return `https://meet.google.com/${meetingId}`;
    case "zoom":
      return `https://zoom.us/j/${meetingId}`;
    case "teams":
      return `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${meetingId}`;
    case "custom":
      return "Link personalizado";
    default:
      return "#";
  }
};

// Gerar arquivo .ics para export
const generateICS = (meeting: Meeting): string => {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Productivity Hub//Meeting//PT
BEGIN:VEVENT
DTSTART:${formatDate(meeting.startTime)}
DTEND:${formatDate(meeting.endTime)}
SUMMARY:${meeting.title}
DESCRIPTION:${meeting.description}${
    meeting.link ? `\\n\\nLink: ${meeting.link}` : ""
  }
LOCATION:${
    meeting.platform === "custom" ? "Local personalizado" : meeting.platform
  }
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
};

// Exportar reunião como arquivo .ics
const exportMeeting = (meeting: Meeting) => {
  const icsContent = generateICS(meeting);
  const blob = new Blob([icsContent], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${meeting.title.replace(/\s+/g, "_")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
};

// Copiar link da reunião
const copyMeetingLink = async (link: string) => {
  try {
    await navigator.clipboard.writeText(link);
    // Aqui você pode adicionar uma notificação de sucesso
  } catch (err) {
    console.error("Erro ao copiar link:", err);
  }
};

const PlatformIcon = ({ platform }: { platform: MeetingPlatform }) => {
  const icons = {
    teams: "🔷",
    meet: "🟢",
    zoom: "🟦",
    custom: "🔗",
  };
  return <span>{icons[platform]}</span>;
};

interface QuickMeetingFormProps {
  onSubmit: (meeting: NewMeeting) => void;
  onCancel: () => void;
  template?: MeetingTemplate;
  initialMeeting?: Meeting;
}

const QuickMeetingForm: React.FC<QuickMeetingFormProps> = ({
  onSubmit,
  onCancel,
  template,
  initialMeeting,
}) => {
  const [formData, setFormData] = useState({
    title: initialMeeting?.title || template?.name || "",
    duration: initialMeeting?.duration || template?.duration || 60,
    platform: initialMeeting?.platform || template?.platform || ("meet" as MeetingPlatform),
    description: initialMeeting?.description || template?.description || "",
    participants:
      (initialMeeting?.participants && initialMeeting.participants.join(", ")) ||
      template?.defaultParticipants.join(", ") ||
      "",
    startTime: initialMeeting?.startTime || new Date(Date.now() + 30 * 60000),
  });

  useEffect(() => {
    if (initialMeeting) {
      setFormData({
        title: initialMeeting.title,
        duration: initialMeeting.duration,
        platform: initialMeeting.platform,
        description: initialMeeting.description || "",
        participants: initialMeeting.participants.join(", "),
        startTime: initialMeeting.startTime,
      });
    }
  }, [initialMeeting]);

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    const meeting: NewMeeting = {
      title: formData.title,
      startTime: formData.startTime,
      duration: formData.duration,
      platform: formData.platform,
      description: formData.description,
      participants: formData.participants
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      templateId: template?.id,
    };

    onSubmit(meeting);
    onCancel();
  };

  return (
    <div className="space-y-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Título da reunião"
        />

        <div className="flex gap-2">
          <Input
            type="number"
            value={formData.duration}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                duration: parseInt(e.target.value) || 60,
              }))
            }
            placeholder="Duração"
            className="w-24"
          />
          <span className="flex items-center text-sm text-gray-400">min</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          type="datetime-local"
          value={formData.startTime.toISOString().slice(0, 16)}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              startTime: new Date(e.target.value),
            }))
          }
        />

        <select
          value={formData.platform}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              platform: e.target.value as MeetingPlatform,
            }))
          }
          className="px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-100"
        >
          <option value="meet">Google Meet</option>
          <option value="zoom">Zoom</option>
          <option value="teams">Microsoft Teams</option>
          <option value="custom">Personalizado</option>
        </select>
      </div>

      <Input
        value={formData.description}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, description: e.target.value }))
        }
        placeholder="Descrição (opcional)"
      />

      <Input
        value={formData.participants}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, participants: e.target.value }))
        }
        placeholder="Participantes (emails separados por vírgula)"
      />

      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!formData.title.trim()}
          icon={<Plus className="w-4 h-4" />}
          className="flex-1"
        >
          Criar Reunião
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
};

const MeetingItem: React.FC<{
  meeting: Meeting;
  onDelete: (id: number) => void;
  onEdit: (meeting: Meeting) => void;
}> = ({ meeting, onDelete, onEdit }) => {
  return (
    <div className="group flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <PlatformIcon platform={meeting.platform} />

        <div className="flex-1">
          <div className="font-medium text-gray-200 flex items-center gap-2">
            {meeting.title}
            {meeting.isRecurring && (
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                Recorrente
              </span>
            )}
          </div>
          <div className="text-sm text-gray-400 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {meeting.time}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {meeting.participants.length || 1} pessoa
              {meeting.participants.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {meeting.link && meeting.link !== "#" && (
          <>
            <Button
              onClick={() => copyMeetingLink(meeting.link!)}
              variant="ghost"
              size="sm"
              icon={<Copy className="w-3 h-3" />}
              title="Copiar link"
            />
            <Button
              onClick={() => window.open(meeting.link, "_blank")}
              variant="ghost"
              size="sm"
              icon={<ExternalLink className="w-3 h-3" />}
              title="Abrir reunião"
            />
          </>
        )}

        <Button
          onClick={() => exportMeeting(meeting)}
          variant="ghost"
          size="sm"
          icon={<Download className="w-3 h-3" />}
          title="Exportar .ics"
        />

        <Button
          onClick={() => onEdit(meeting)}
          variant="ghost"
          size="sm"
          icon={<Edit className="w-3 h-3" />}
          title="Editar reunião"
        />

        <Button
          onClick={() => onDelete(meeting.id)}
          variant="ghost"
          size="sm"
          icon={<Trash2 className="w-3 h-3" />}
          title="Deletar reunião"
          className="text-red-400 hover:text-red-300"
        />
      </div>
    </div>
  );
};

const Meetings: React.FC = () => {
  const { meetings, templates, addMeeting, deleteMeeting, updateMeeting } = useMeetings();
  const [showForm, setShowForm] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<
    MeetingTemplate | undefined
  >();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const { success, error } = useToastHelpers();

  // Quick actions para criar reuniões rapidamente
  const quickActions = [
    { label: "Em 30min", minutes: 30, icon: "⚡" },
    { label: "Em 1h", minutes: 60, icon: "🕐" },
    { label: "Amanhã 9h", minutes: -1, icon: "📅" }, // -1 = custom logic
  ];

  const handleQuickMeeting = (minutes: number) => {
    const startTime =
      minutes === -1
        ? (() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);
            return tomorrow;
          })()
        : new Date(Date.now() + minutes * 60000);

    const meeting: NewMeeting = {
      title: "Reunião Rápida",
      startTime,
      duration: 60,
      platform: "meet",
      description: "Reunião criada via ação rápida",
    };

    addMeeting(meeting);
  };

  const handleTemplateClick = (template: MeetingTemplate) => {
    setSelectedTemplate(template);
    setShowForm(true);
  };

  const handleUpdateMeeting = (id: number, data: NewMeeting) => {
    try {
      updateMeeting(id, data);
      success("Reunião atualizada!");
    } catch (err) {
      error("Erro ao atualizar reunião: " + (err as Error).message);
    }
  };

  const handleDeleteMeeting = async (id: number, title: string) => {
    const confirmed = await confirm({
      title: "Deletar Reunião",
      message: `Tem certeza que deseja deletar a reunião "${title}"?`,
      variant: "danger",
      confirmText: "Deletar",
    });

    if (confirmed) {
      try {
        deleteMeeting(id);
        success("Reunião deletada!");
      } catch (err) {
        error("Erro ao deletar reunião: " + (err as Error).message);
      }
    }
  };

  const todaysMeetings = meetings.filter((m) => {
    const today = new Date().toDateString();
    return m.startTime.toDateString() === today;
  });

  return (
    <>
    <Card>
      <CardHeader
        title="Reuniões"
        subtitle={`${todaysMeetings.length} reuniões hoje`}
        icon={<Calendar className="w-5 h-5" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowForm(!showForm)}
              icon={<Plus className="w-4 h-4" />}
              variant="secondary"
              size="sm"
            >
              Nova Reunião
            </Button>
          </div>
        }
      />

      <CardContent>
        {/* Quick Actions */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Ações Rápidas
          </h4>
          <div className="flex gap-2 flex-wrap">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                onClick={() => handleQuickMeeting(action.minutes)}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                {action.icon} {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Templates */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Templates
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateClick(template)}
                className="text-left p-3 bg-gray-600/30 hover:bg-gray-600/50 rounded-lg transition-colors border border-gray-600/50"
              >
                <div className="flex items-center gap-2 mb-1">
                  <PlatformIcon platform={template.platform} />
                  <span className="font-medium text-sm text-gray-200">
                    {template.name}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {template.duration}min • {template.platform}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Meeting Form */}
        {showForm && (
          <div className="mb-4">
            <QuickMeetingForm
              onSubmit={addMeeting}
              onCancel={() => {
                setShowForm(false);
                setSelectedTemplate(undefined);
              }}
              template={selectedTemplate}
            />
          </div>
        )}

        {/* Meetings List */}
        <div className="space-y-2">
          {meetings.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma reunião agendada</p>
              <p className="text-sm">Use as ações rápidas ou templates acima</p>
            </div>
          ) : (
            meetings.map((meeting) => (
              editingMeetingId === meeting.id ? (
                <div key={meeting.id} className="mb-2">
                  <QuickMeetingForm
                    onSubmit={(data) => {
                      handleUpdateMeeting(meeting.id, data);
                      setEditingMeetingId(null);
                    }}
                    onCancel={() => setEditingMeetingId(null)}
                    initialMeeting={meeting}
                  />
                </div>
              ) : (
                <MeetingItem
                  key={meeting.id}
                  meeting={meeting}
                  onDelete={(id) => handleDeleteMeeting(id, meeting.title)}
                  onEdit={() => setEditingMeetingId(meeting.id)}
                />
              )
            ))
          )}
        </div>

        {/* Summary */}
        {meetings.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-gray-700/20 rounded-lg">
                <div className="text-lg font-bold text-blue-400">
                  {todaysMeetings.length}
                </div>
                <div className="text-xs text-gray-400">Hoje</div>
              </div>
              <div className="p-3 bg-gray-700/20 rounded-lg">
                <div className="text-lg font-bold text-emerald-400">
                  {meetings.filter((m) => m.startTime > new Date()).length}
                </div>
                <div className="text-xs text-gray-400">Próximas</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    <ConfirmDialog />
    </>
  );
};

export default Meetings;
