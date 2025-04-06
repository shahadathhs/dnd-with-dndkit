import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Edit2, Trash2, Plus, X, Check } from "lucide-react";
import { TaskCard } from "./task-card";
import { useContentPlannerContext } from "~/others/context/content-planner-context";
import type { TaskColumn as TaskColumnType, Task } from "~/types";

interface TaskColumnProps {
  column: TaskColumnType;
  tasks: Task[];
  overlay?: boolean;
}

export function TaskColumn({
  column,
  tasks,
  overlay = false,
}: TaskColumnProps) {
  const { updateTaskColumn, deleteTaskColumn, addTask } =
    useContentPlannerContext();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);

  const handleSave = () => {
    updateTaskColumn(column.id, { ...column, title });
    setIsEditing(false);
  };

  const handleAddTask = () => {
    addTask(column.id);
  };

  return (
    <Card
      className={`w-64 shrink-0 ${overlay ? "border-2 border-primary" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-8"
                autoFocus
              />
              <Button size="icon" variant="ghost" onClick={handleSave}>
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <CardTitle className="text-sm">{column.title}</CardTitle>
          )}

          {!overlay && !isEditing && (
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
                onClick={() => deleteTaskColumn(column.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}

          {!overlay && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={handleAddTask}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
