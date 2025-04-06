import { useState } from "react";
import { useKanban } from "./kanban-context";
import { TaskCard } from "./task-card";
import { SortableTaskCard } from "./sortable-task-card";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Edit2, Trash2, Plus, X, Check } from "lucide-react";
import type { Column as ColumnType, Task } from "./types";
import { cn } from "~/lib/utils";

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  isOverlay?: boolean;
  isDragging?: boolean;
}

export function Column({
  column,
  tasks,
  isOverlay = false,
  isDragging = false,
}: ColumnProps) {
  const { addTask, updateColumn, deleteColumn } = useKanban();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleUpdateColumn = () => {
    if (title.trim()) {
      updateColumn(column.id, title);
      setIsEditing(false);
    }
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(column.id, newTaskTitle);
      setNewTaskTitle("");
      setIsAddingTask(false);
    }
  };

  const handleDeleteColumn = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the column "${column.title}" and all its tasks?`
      )
    ) {
      deleteColumn(column.id);
    }
  };

  return (
    <Card
      className={cn(
        "w-80 shrink-0 flex flex-col max-h-full",
        isOverlay ? "opacity-70" : "",
        isDragging ? "border-2 border-primary" : ""
      )}
    >
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-center">
          {isEditing ? (
            <div className="flex items-center gap-2 w-full">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-8"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUpdateColumn();
                  } else if (e.key === "Escape") {
                    setIsEditing(false);
                    setTitle(column.title);
                  }
                }}
              />
              <Button size="icon" variant="ghost" onClick={handleUpdateColumn}>
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setTitle(column.title);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex justify-between items-center w-full">
              <h3 className="font-medium text-sm">{column.title}</h3>
              {!isOverlay && (
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleDeleteColumn}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </div>
      </CardHeader>

      <CardContent className="p-3 flex-1 overflow-y-auto">
        {!isOverlay && (
          <SortableContext
            items={tasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {tasks.map((task) => (
                <SortableTaskCard key={task.id} task={task} />
              ))}
            </div>
          </SortableContext>
        )}

        {isOverlay && (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-3 pt-0">
        {!isOverlay && !isAddingTask ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setIsAddingTask(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        ) : !isOverlay && isAddingTask ? (
          <div className="w-full space-y-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title"
              className="w-full"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddTask();
                } else if (e.key === "Escape") {
                  setIsAddingTask(false);
                  setNewTaskTitle("");
                }
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={handleAddTask}>
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </CardFooter>
    </Card>
  );
}
