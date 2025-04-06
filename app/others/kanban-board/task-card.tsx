import type React from "react";
import { useState } from "react";
import { useKanban } from "./kanban-context";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Edit2, Trash2 } from "lucide-react";
import type { Task } from "./types";
import { cn } from "~/lib/utils";
import { format } from "date-fns";

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

export function TaskCard({ task, isOverlay = false }: TaskCardProps) {
  const { updateTask, deleteTask } = useKanban();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");

  const handleUpdateTask = () => {
    if (title.trim()) {
      updateTask(task.id, { title, description });
      setIsEditing(false);
    }
  };

  const handleDeleteTask = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the task "${task.title}"?`
      )
    ) {
      deleteTask(task.id);
      setIsDialogOpen(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent opening dialog when clicking on buttons
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    setIsDialogOpen(true);
  };

  return (
    <>
      <Card
        className={cn(
          "cursor-pointer hover:shadow-md transition-shadow",
          isOverlay ? "opacity-70" : ""
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-3">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-sm">{task.title}</h4>
            {!isOverlay && (
              <div className="flex items-center gap-1 ml-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDialogOpen(true);
                    setIsEditing(true);
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTask();
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="text-xs text-muted-foreground mt-2">
            Updated {format(new Date(task.updatedAt), "MMM d, h:mm a")}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl font-semibold"
                  placeholder="Task title"
                  autoFocus
                />
              ) : (
                task.title
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Description</h3>
              {isEditing ? (
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  className="min-h-[100px]"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {task.description || "No description provided."}
                </p>
              )}
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <div>
                Created:{" "}
                {format(new Date(task.createdAt), "MMM d, yyyy h:mm a")}
              </div>
              <div>
                Updated:{" "}
                {format(new Date(task.updatedAt), "MMM d, yyyy h:mm a")}
              </div>
            </div>
          </div>

          <DialogFooter>
            {isEditing ? (
              <div className="flex gap-2">
                <Button onClick={handleUpdateTask}>Save</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setTitle(task.title);
                    setDescription(task.description || "");
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => setIsEditing(true)}>Edit</Button>
                <Button variant="destructive" onClick={handleDeleteTask}>
                  Delete
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
