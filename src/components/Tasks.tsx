import React, { useState } from "react";
import { CheckSquare, Plus, Trash2, Search, Filter } from "lucide-react";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { LoadingSpinner, SkeletonTask } from "@/components/ui/Loading"; // ADICIONADO
import { useConfirmDialog } from "@/components/ui/ConfirmDialog"; // ADICIONADO
import { useToastHelpers } from "@/components/ui/Toast"; // ADICIONADO
import { useTaskSearch } from "@/hooks/useSearch"; // ADICIONADO
import { validateTask } from "@/utils/validation"; // ADICIONADO
import { useAppStore, useTasksSelector } from "../stores/useAppStore";
import { getCategoryColors, getPriorityColors, cn } from "../utils/cn";
import type { TaskType } from "../types";

const Tasks: React.FC = () => {
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskType, setNewTaskType] = useState<TaskType>("trabalho");
  const [isLoading, setIsLoading] = useState(false); // ADICIONADO
  const [showFilters, setShowFilters] = useState(false); // ADICIONADO

  const tasks = useTasksSelector();
  const addTask = useAppStore((state) => state.addTask);
  const toggleTask = useAppStore((state) => state.toggleTask);
  const deleteTask = useAppStore((state) => state.deleteTask);

  // ADICIONADO: Hooks para funcionalidades novas
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const { success, error } = useToastHelpers();
  const {
    filteredItems: filteredTasks,
    query,
    setQuery,
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters,
    hasActiveSearch,
    resultCount,
  } = useTaskSearch(tasks);

  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;

    setIsLoading(true);

    try {
      // ADICIONADO: Validação antes de adicionar
      const validation = validateTask({
        text: newTaskText,
        type: newTaskType,
        priority: "media",
      });

      if (!validation.isValid) {
        error(validation.errors[0]);
        return;
      }

      await addTask({
        text: newTaskText,
        type: newTaskType,
        priority: "media",
      });

      setNewTaskText("");
      success("Tarefa adicionada com sucesso!");
    } catch (err) {
      error((err as Error).message || "Erro ao adicionar tarefa");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleAddTask();
    }
  };

  // ADICIONADO: Função para deletar com confirmação
  const handleDeleteTask = async (taskId: number, taskText: string) => {
    const confirmed = await confirm({
      title: "Deletar Tarefa",
      message: `Tem certeza que deseja deletar a tarefa "${taskText}"?`,
      variant: "danger",
      confirmText: "Deletar",
    });

    if (confirmed) {
      try {
        deleteTask(taskId);
        success("Tarefa deletada com sucesso!");
      } catch (err) {
        error("Erro ao deletar tarefa: " + (err as Error).message);
      }
    }
  };

  // ADICIONADO: Toggle tarefa com feedback
  const handleToggleTask = (taskId: number) => {
    try {
      toggleTask(taskId);
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        if (task.completed) {
          success("Tarefa marcada como pendente!");
        } else {
          success("Tarefa concluída! 🎉");
        }
      }
    } catch (err) {
      error("Erro ao atualizar tarefa: " + (err as Error).message);
    }
  };

  return (
    <>
      <Card>
        <CardHeader
          title="Tarefas Rápidas"
          subtitle={`${
            filteredTasks.filter((t) => !t.completed).length
          } pendentes${
            hasActiveSearch || hasActiveFilters
              ? ` (${resultCount} filtradas)`
              : ""
          }`}
          icon={<CheckSquare className="w-5 h-5" />}
          actions={
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant={hasActiveFilters ? "primary" : "ghost"}
                size="sm"
                icon={<Filter className="w-4 h-4" />}
                title="Filtros"
              />
              {(hasActiveFilters || hasActiveSearch) && (
                <Button
                  onClick={() => {
                    setQuery("");
                    clearFilters();
                  }}
                  variant="ghost"
                  size="sm"
                  title="Limpar filtros"
                >
                  Limpar
                </Button>
              )}
            </div>
          }
        />

        <CardContent>
          {/* ADICIONADO: Busca e Filtros */}
          <div className="space-y-3 mb-4">
            {/* Busca */}
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar tarefas..."
              icon={<Search className="w-4 h-4" />}
              iconPosition="left"
            />

            {/* Filtros */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                <select
                  value={String(filters.type || "")}
                  onChange={(e) => setFilter("type", e.target.value)}
                  className="px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-100"
                >
                  <option value="">Todos os tipos</option>
                  <option value="trabalho">Trabalho</option>
                  <option value="faculdade">Faculdade</option>
                  <option value="pessoal">Pessoal</option>
                </select>

                <select
                  value={String(filters.priority || "")}
                  onChange={(e) => setFilter("priority", e.target.value)}
                  className="px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-100"
                >
                  <option value="">Todas as prioridades</option>
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>

                <select
                  value={
                    filters.completed === null ? "" : String(filters.completed)
                  }
                  onChange={(e) =>
                    setFilter(
                      "completed",
                      e.target.value === "" ? null : e.target.value === "true"
                    )
                  }
                  className="px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-100"
                >
                  <option value="">Todas</option>
                  <option value="false">Pendentes</option>
                  <option value="true">Concluídas</option>
                </select>
              </div>
            )}
          </div>

          {/* Add New Task */}
          <div className="flex gap-2 mb-4">
            <Input
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nova tarefa..."
              className="flex-1"
              disabled={isLoading}
            />

            <select
              value={newTaskType}
              onChange={(e) => setNewTaskType(e.target.value as TaskType)}
              disabled={isLoading}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-100 disabled:opacity-50"
            >
              <option value="trabalho">Trabalho</option>
              <option value="faculdade">Faculdade</option>
              <option value="pessoal">Pessoal</option>
            </select>

            <Button
              onClick={handleAddTask}
              icon={
                isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Plus className="w-4 h-4" />
                )
              }
              disabled={!newTaskText.trim() || isLoading}
              loading={isLoading}
            />
          </div>

          {/* Tasks List */}
          <div className="space-y-2">
            {isLoading && (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonTask key={i} />
                ))}
              </div>
            )}

            {!isLoading && filteredTasks.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                {hasActiveSearch || hasActiveFilters ? (
                  <div>
                    <p>Nenhuma tarefa encontrada</p>
                    <p className="text-sm">Tente ajustar os filtros ou busca</p>
                  </div>
                ) : (
                  <div>
                    <p>Nenhuma tarefa ainda</p>
                    <p className="text-sm">
                      Adicione sua primeira tarefa acima
                    </p>
                  </div>
                )}
              </div>
            )}

            {!isLoading &&
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "group flex items-center gap-3 p-3 border-l-4 bg-gray-700/30 rounded-r-lg hover:bg-gray-700/50 transition-all duration-200",
                    getPriorityColors(task.priority),
                    task.completed && "opacity-60"
                  )}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 transition-colors"
                  />

                  {/* Task Text */}
                  <span
                    className={cn(
                      "flex-1 transition-all duration-200",
                      task.completed
                        ? "line-through text-gray-500"
                        : "text-gray-200"
                    )}
                  >
                    {task.text}
                  </span>

                  {/* Category Badge */}
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs border",
                      getCategoryColors(task.type)
                    )}
                  >
                    {task.type}
                  </span>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteTask(task.id, task.text)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all duration-200 p-1 rounded"
                    title="Deletar tarefa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>

          {/* Summary */}
          {filteredTasks.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              <div className="flex justify-between text-sm text-gray-400">
                <span>
                  {filteredTasks.filter((t) => t.completed).length} concluídas
                </span>
                <span>
                  {filteredTasks.filter((t) => !t.completed).length} pendentes
                </span>
              </div>
              {(hasActiveSearch || hasActiveFilters) && (
                <div className="text-center text-xs text-gray-500 mt-1">
                  Mostrando {filteredTasks.length} de {tasks.length} tarefas
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ADICIONADO: Dialog de confirmação */}
      <ConfirmDialog />
    </>
  );
};

export default Tasks;
