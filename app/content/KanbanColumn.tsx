// KanbanColumn.tsx
import React, { useState, useContext } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { Column, Task } from "./types";
import KanbanCard from "./KanbanCard";
import { Plus, MoreHorizontal, Trash2 } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { v4 as uuidv4 } from "uuid";
import { BoardContext } from "./BoardContext";

interface KanbanColumnProps {
  column: Column;
  boardId: string;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, boardId }) => {
  const { setBoards, deleteColumn, updateTask, deleteTask } = useContext(BoardContext)!;
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);

  const { isOver, setNodeRef } = useDroppable({
    id: `column:${column.id}:${boardId}`,
    data: { type: "column", column },
  });

  const style = { opacity: isOver ? 0.8 : 1 };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    if (title.trim()) {
      setBoards((prev) =>
        prev.map((board) => {
          if (board.id === boardId) {
            return {
              ...board,
              columns: board.columns.map((col) =>
                col.id === column.id ? { ...col, title } : col
              ),
            };
          }
          return board;
        })
      );
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
    deleteColumn(boardId, column.id);
  };

  const addNewTask = () => {
    const newTask: Task = {
      id: uuidv4(),
      title: "New Task",
      description: "Add description here",
    };
    setBoards((prev) =>
      prev.map((board) => {
        if (board.id === boardId) {
          return {
            ...board,
            columns: board.columns.map((col) =>
              col.id === column.id ? { ...col, tasks: [...col.tasks, newTask] } : col
            ),
          };
        }
        return board;
      })
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="kanban-column flex flex-col w-72 rounded-md bg-secondary overflow-hidden"
    >
      <div className="kanban-column-header">
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
          <span className="text-xs text-muted-foreground mr-2">{column.tasks.length}</span>
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
            boardId={boardId}
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
          onClick={addNewTask}
        >
          <Plus size={16} className="mr-1" /> Add Task
        </Button>
      </div>
    </div>
  );
};

export default KanbanColumn;
