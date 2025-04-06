import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type Task } from "./types";
import { MoreHorizontal, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

interface KanbanCardProps {
  task: Task;
  boardId: string;
  columnId: string;
  updateTask: (
    boardId: string,
    columnId: string,
    taskId: string,
    updatedTask: Partial<Task>
  ) => void;
  deleteTask: (boardId: string, columnId: string, taskId: string) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  boardId,
  columnId,
  updateTask,
  deleteTask,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `task:${task.id}:${columnId}`,
    data: { type: "task", task, columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleSaveTask = () => {
    updateTask(boardId, columnId, task.id, {
      title: editedTask.title,
      description: editedTask.description,
    });
    setIsDialogOpen(false);
  };

  const handleDeleteTask = () => {
    deleteTask(boardId, columnId, task.id);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`kanban-card group`}
        onClick={handleOpenDialog}
      >
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-sm mb-1">{task.title}</h3>
          <Popover>
            <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-48"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTask();
                  }}
                >
                  <Trash2 size={16} className="mr-2" /> Delete Task
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Task title"
                value={editedTask.title}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Add description..."
                value={editedTask.description || ""}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, description: e.target.value })
                }
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTask}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KanbanCard;
