import React, { useState, useEffect } from "react";
import {
  FolderOpen,
  Plus,
  ChevronDown,
  ChevronRight,
  Brain,
  Trash2,
  Edit,
  Calendar,
  Target,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAppStore, useProjectsSelector } from "../stores/useAppStore";
import { useAI } from "../hooks/useIA";
import { getCategoryColors, cn } from "../utils/cn";
import type { NewProject, ProjectCategory } from "../types";
import { useConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToastHelpers } from "@/components/ui/Toast";

interface ProjectFormProps {
  onSubmit: (project: NewProject) => void;
  onCancel: () => void;
  initialData?: NewProject;
  isEditing?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing,
}) => {
  const [formData, setFormData] = useState<NewProject>({
    title: initialData?.title || "",
    category: initialData?.category || "trabalho",
    deadline: initialData?.deadline || "",
    description: initialData?.description || "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.deadline) return;

    onSubmit({
      title: formData.title,
      category: formData.category,
      deadline: formData.deadline,
      description: formData.description,
    });

    onCancel();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
      <Input
        value={formData.title}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, title: e.target.value }))
        }
        placeholder="Nome do projeto"
      />

      <select
        value={formData.category}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            category: e.target.value as ProjectCategory,
          }))
        }
        className="px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-gray-100"
      >
        <option value="trabalho">Trabalho</option>
        <option value="faculdade">Faculdade</option>
        <option value="pessoal">Pessoal</option>
      </select>

      <Input
        type="date"
        value={formData.deadline}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, deadline: e.target.value }))
        }
        label="Deadline"
      />

      <Input
        value={formData.description}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, description: e.target.value }))
        }
        placeholder="Descrição"
      />

      <div className="md:col-span-2 flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!formData.title.trim() || !formData.deadline}
          icon={<Plus className="w-4 h-4" />}
          className="flex-1"
        >
          {isEditing ? "Salvar" : "Criar Projeto"}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
};

const Projects: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [newSubtaskInputs, setNewSubtaskInputs] = useState<
    Record<number, string>
  >({});
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);

  const projects = useProjectsSelector();
  const addProject = useAppStore((state) => state.addProject);
  const updateProject = useAppStore((state) => state.updateProject);
  const deleteProject = useAppStore((state) => state.deleteProject);
  const toggleProjectExpanded = useAppStore(
    (state) => state.toggleProjectExpanded
  );
  const addSubtask = useAppStore((state) => state.addSubtask);
  const toggleSubtask = useAppStore((state) => state.toggleSubtask);
  const deleteSubtask = useAppStore((state) => state.deleteSubtask);
  const loadingSubtasks = useAppStore((state) => state.loadingSubtasks);

  const { confirm, ConfirmDialog } = useConfirmDialog();
  const { success, error } = useToastHelpers();

  const { generateSubtasks } = useAI();

  const handleAddProject = (projectData: NewProject) => {
    addProject(projectData);
    setShowForm(false);
  };

  const handleAddSubtask = (projectId: number) => {
    const text = newSubtaskInputs[projectId]?.trim();
    if (!text) return;

    addSubtask(projectId, text);
    setNewSubtaskInputs((prev) => ({ ...prev, [projectId]: "" }));
  };

  const handleUpdateProject = (id: number, data: NewProject) => {
    try {
      updateProject(id, data);
      success("Projeto atualizado!");
    } catch (err) {
      error("Erro ao atualizar projeto: " + (err as Error).message);
    }
  };

  const handleDeleteProject = async (id: number, title: string) => {
    const confirmed = await confirm({
      title: "Deletar Projeto",
      message: `Tem certeza que deseja deletar o projeto "${title}"?`,
      variant: "danger",
      confirmText: "Deletar",
    });

    if (confirmed) {
      try {
        deleteProject(id);
        success("Projeto deletado!");
      } catch (err) {
        error("Erro ao deletar projeto: " + (err as Error).message);
      }
    }
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDeadlineColor = (daysLeft: number) => {
    if (daysLeft < 0) return "bg-red-500/20 text-red-300 border-red-500/30";
    if (daysLeft <= 3)
      return "bg-orange-500/20 text-orange-300 border-orange-500/30";
    return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  };

  const getDeadlineText = (daysLeft: number) => {
    if (daysLeft < 0) return `${Math.abs(daysLeft)} dias atrasado`;
    if (daysLeft === 0) return "Hoje!";
    return `${daysLeft} dias restantes`;
  };

  return (
    <>
    <Card>
      <CardHeader
        title="Projetos"
        subtitle={`${
          projects.filter((p) => p.status === "em_andamento").length
        } em andamento`}
        icon={<FolderOpen className="w-5 h-5" />}
        actions={
          <Button
            onClick={() => setShowForm(!showForm)}
            icon={<Plus className="w-4 h-4" />}
            variant="secondary"
          >
            Novo Projeto
          </Button>
        }
      />

      <CardContent>
        {/* Project Form */}
        {showForm && (
          <ProjectForm
            onSubmit={handleAddProject}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Projects List */}
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum projeto ainda</p>
              <p className="text-sm">Crie seu primeiro projeto acima</p>
            </div>
          ) : (
            projects.map((project) => {
              const daysLeft = getDaysUntilDeadline(project.deadline);

              if (editingProjectId === project.id) {
                return (
                  <div
                    key={project.id}
                    className="border border-gray-600/50 rounded-lg p-4 bg-gray-700/20"
                  >
                    <ProjectForm
                      initialData={{
                        title: project.title,
                        category: project.category,
                        deadline: project.deadline,
                        description: project.description,
                      }}
                      isEditing
                      onSubmit={(data) => {
                        handleUpdateProject(project.id, data);
                        setEditingProjectId(null);
                      }}
                      onCancel={() => setEditingProjectId(null)}
                    />
                  </div>
                );
              }

              return (
                <div
                  key={project.id}
                  className="border border-gray-600/50 rounded-lg p-4 bg-gray-700/20 hover:bg-gray-700/30 transition-colors"
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => toggleProjectExpanded(project.id)}
                        className="text-gray-400 hover:text-gray-300 transition-colors mt-1 p-1"
                      >
                        {project.expanded ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>

                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-100">
                          {project.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {project.description}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs border",
                              getCategoryColors(project.category)
                            )}
                          >
                            {project.category}
                          </span>

                          <div
                            className={cn(
                              "px-2 py-1 rounded-full text-xs border flex items-center gap-1",
                              getDeadlineColor(daysLeft)
                            )}
                          >
                            <Calendar className="w-3 h-3" />
                            {getDeadlineText(daysLeft)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400 flex items-center gap-1">
                        <Target className="w-5 h-5" />
                        {project.progress}%
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(project.deadline).toLocaleDateString("pt-BR")}
                      </div>
                      <div className="flex gap-1 justify-end mt-1">
                        <Button
                          onClick={() => setEditingProjectId(project.id)}
                          variant="ghost"
                          size="sm"
                          icon={<Edit className="w-4 h-4" />}
                          title="Editar projeto"
                        />
                        <Button
                          onClick={() => handleDeleteProject(project.id, project.title)}
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-4 h-4" />}
                          className="text-red-400 hover:text-red-300"
                          title="Deletar projeto"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="bg-gray-600/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Subtasks */}
                  {project.expanded && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-3">
                        <h4 className="font-medium text-gray-300">
                          Subtarefas
                        </h4>
                        <Button
                          onClick={() => generateSubtasks(project.id)}
                          disabled={
                            project.subtasks.length > 0 ||
                            loadingSubtasks[project.id]
                          }
                          loading={loadingSubtasks[project.id]}
                          variant="ghost"
                          size="sm"
                          icon={<Brain className="w-4 h-4" />}
                        >
                          {project.subtasks.length > 0
                            ? "Já criadas"
                            : "Sugerir com IA"}
                        </Button>
                      </div>

                      {/* Subtasks List */}
                      {project.subtasks.map((subtask) => (
                        <div
                          key={subtask.id}
                          className="group flex items-center gap-3 p-2 bg-gray-600/30 rounded-lg hover:bg-gray-600/50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={subtask.completed}
                            onChange={() =>
                              toggleSubtask(project.id, subtask.id)
                            }
                            className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
                          />
                          <span
                            className={cn(
                              "flex-1 text-sm transition-all",
                              subtask.completed
                                ? "line-through text-gray-500"
                                : "text-gray-300"
                            )}
                          >
                            {subtask.text}
                          </span>
                          <button
                            onClick={() =>
                              deleteSubtask(project.id, subtask.id)
                            }
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {/* Add Subtask */}
                      <div className="flex gap-2 mt-3">
                        <Input
                          value={newSubtaskInputs[project.id] || ""}
                          onChange={(e) =>
                            setNewSubtaskInputs((prev) => ({
                              ...prev,
                              [project.id]: e.target.value,
                            }))
                          }
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleAddSubtask(project.id);
                            }
                          }}
                          placeholder="Nova subtarefa..."
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleAddSubtask(project.id)}
                          disabled={!newSubtaskInputs[project.id]?.trim()}
                          icon={<Plus className="w-4 h-4" />}
                          variant="ghost"
                          size="sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
    <ConfirmDialog />
    </>
  );
};

export default Projects;
