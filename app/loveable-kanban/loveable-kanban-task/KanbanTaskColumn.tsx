import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type Column, type Task } from "./KanbanTaskBoard";
import KanbanCard from "./KanbanTaskCard";
import { Plus, MoreHorizontal, Trash2 } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

interface KanbanColumnProps {
  column: Column;
  addNewTask: (columnId: string) => void;
  updateColumnTitle: (columnId: string, title: string) => void;
  updateTask: (
    columnId: string,
    taskId: string,
    updatedTask: Partial<Task>
  ) => void;
  deleteTask: (columnId: string, taskId: string) => void;
  deleteColumn: (columnId: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  addNewTask,
  updateColumnTitle,
  updateTask,
  deleteTask,
  deleteColumn,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `column:${column.id}`,
    data: { type: "column", column },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    if (title.trim()) {
      updateColumnTitle(column.id, title);
    } else {
      setTitle(column.title);
    }
    setIsEditing(false);
  };

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTitleBlur();
  };

  const handleDeleteColumn = () => {
    deleteColumn(column.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`kanban-column flex flex-col w-72 rounded-md bg-secondary overflow-hidden`}
    >
      <div className="kanban-column-header" {...attributes} {...listeners}>
        {isEditing ? (
          <form onSubmit={handleTitleSubmit} className="w-full">
            <Input
              autoFocus
              value={title}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              className="h-7 py-1"
            />
          </form>
        ) : (
          <div
            className="font-medium text-sm flex-1 cursor-pointer hover:text-primary"
            onClick={() => setIsEditing(true)}
          >
            {column.title}
          </div>
        )}
        <div className="flex items-center">
          <span className="text-xs text-muted-foreground mr-2">
            {column.tasks.length}
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-destructive"
                  onClick={handleDeleteColumn}
                >
                  <Trash2 size={16} className="mr-2" /> Delete Column
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="kanban-column-content flex-grow p-2">
        {column.tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            columnId={column.id}
            updateTask={updateTask}
            deleteTask={deleteTask}
          />
        ))}
      </div>

      <div className="p-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
          onClick={() => addNewTask(column.id)}
        >
          <Plus size={16} className="mr-1" /> Add Task
        </Button>
      </div>
    </div>
  );
};

export default KanbanColumn;
