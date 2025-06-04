import React, { useState } from "react";
import { CheckSquare, Plus, Trash2 } from "lucide-react";
import { Card, CardHeader, CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAppStore, useTasksSelector } from "../stores/useAppStore";
import { getCategoryColors, getPriorityColors, cn } from "../utils/cn";
import type { TaskType } from "../types";

const Tasks: React.FC = () => {
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskType, setNewTaskType] = useState<TaskType>("trabalho");

  const tasks = useTasksSelector();
  const addTask = useAppStore((state) => state.addTask);
  const toggleTask = useAppStore((state) => state.toggleTask);
  const deleteTask = useAppStore((state) => state.deleteTask);

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;

    addTask({
      text: newTaskText,
      type: newTaskType,
      priority: "media",
    });

    setNewTaskText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  return (
    <Card>
      <CardHeader
        title="Tarefas Rápidas"
        subtitle={`${tasks.filter((t) => !t.completed).length} pendentes`}
        icon={<CheckSquare className="w-5 h-5" />}
      />

      <CardContent>
        {/* Add New Task */}
        <div className="flex gap-2 mb-4">
          <Input
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nova tarefa..."
            className="flex-1"
          />

          <select
            value={newTaskType}
            onChange={(e) => setNewTaskType(e.target.value as TaskType)}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-100"
          >
            <option value="trabalho">Trabalho</option>
            <option value="faculdade">Faculdade</option>
            <option value="pessoal">Pessoal</option>
          </select>

          <Button
            onClick={handleAddTask}
            icon={<Plus className="w-4 h-4" />}
            disabled={!newTaskText.trim()}
          />
        </div>

        {/* Tasks List */}
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma tarefa ainda</p>
              <p className="text-sm">Adicione sua primeira tarefa acima</p>
            </div>
          ) : (
            tasks.map((task) => (
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
                  onChange={() => toggleTask(task.id)}
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
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all duration-200 p-1 rounded"
                  title="Deletar tarefa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {tasks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex justify-between text-sm text-gray-400">
              <span>{tasks.filter((t) => t.completed).length} concluídas</span>
              <span>{tasks.filter((t) => !t.completed).length} pendentes</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Tasks;
