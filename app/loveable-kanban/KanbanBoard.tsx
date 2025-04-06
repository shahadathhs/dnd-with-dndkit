import React, { useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import { Plus, Trash2, Edit, Check } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { Board, Column } from "./types";
import type { Task } from "./types";
import { initialBoards } from "./constant";
import SingleBoard from "./SingleBoard";

const KanbanBoard: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>(initialBoards);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingBoardTitle, setEditingBoardTitle] = useState<string>("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent, boardId: string) => {
    const { active } = event;
    const id = active.id as string;

    // Check if we're dragging a task
    if (id.includes("task:")) {
      const taskId = id.replace("task:", "").split(":")[0];
      const columnId = id.split(":")[2];
      const boardColumns = boards.find((b) => b.id === boardId)?.columns || [];
      const column = boardColumns.find((col) => col.id === columnId);
      const task = column?.tasks.find((t) => t.id === taskId);

      if (task) {
        setActiveTask(task);
      }
    } else if (id.includes("column:")) {
      // We're dragging a column
      const columnId = id.replace("column:", "");
      const boardColumns = boards.find((b) => b.id === boardId)?.columns || [];
      const column = boardColumns.find((col) => col.id === columnId);

      if (column) {
        setActiveColumn(column);
      }
    }
  };

  const handleDragOver = (event: DragOverEvent, boardId: string) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If not dragging a task or over nothing/itself, return
    if (!activeId.includes("task:") || activeId === overId) return;

    const activeColumnId = activeId.split(":")[2];
    let overColumnId = overId.split(":")[2];

    // If over a task, extract the column id from the task id
    if (overId.includes("task:")) {
      overColumnId = overId.split(":")[2];
    } else if (overId.includes("column:")) {
      overColumnId = overId.replace("column:", "");
    }

    if (activeColumnId === overColumnId) return;

    setBoards((prevBoards) => {
      return prevBoards.map((board) => {
        if (board.id !== boardId) return board;

        const activeColumn = board.columns.find(
          (col) => col.id === activeColumnId
        );
        const overColumn = board.columns.find((col) => col.id === overColumnId);

        if (!activeColumn || !overColumn) return board;

        const activeTaskIndex = activeColumn.tasks.findIndex(
          (task) => `task:${task.id}:${activeColumnId}` === activeId
        );
        if (activeTaskIndex === -1) return board;

        const task = activeColumn.tasks[activeTaskIndex];

        const updatedColumns = board.columns.map((column) => {
          // Remove from the active column
          if (column.id === activeColumnId) {
            return {
              ...column,
              tasks: column.tasks.filter(
                (_, index) => index !== activeTaskIndex
              ),
            };
          }

          // Add to the over column
          if (column.id === overColumnId) {
            return {
              ...column,
              tasks: [...column.tasks, task],
            };
          }

          return column;
        });

        return {
          ...board,
          columns: updatedColumns,
        };
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent, boardId: string) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // For column reordering
    if (activeId.includes("column:") && overId.includes("column:")) {
      const activeColumnId = activeId.replace("column:", "");
      const overColumnId = overId.replace("column:", "");

      if (activeColumnId !== overColumnId) {
        setBoards((prevBoards) => {
          return prevBoards.map((board) => {
            if (board.id !== boardId) return board;

            const activeColumnIndex = board.columns.findIndex(
              (col) => col.id === activeColumnId
            );
            const overColumnIndex = board.columns.findIndex(
              (col) => col.id === overColumnId
            );

            return {
              ...board,
              columns: arrayMove(
                board.columns,
                activeColumnIndex,
                overColumnIndex
              ),
            };
          });
        });
      }
    }

    // For task reordering within the same column
    if (activeId.includes("task:") && overId.includes("task:")) {
      const activeTaskId = activeId.split(":")[1];
      const overTaskId = overId.split(":")[1];
      const activeColumnId = activeId.split(":")[2];
      const overColumnId = overId.split(":")[2];

      if (activeTaskId !== overTaskId && activeColumnId === overColumnId) {
        setBoards((prevBoards) => {
          return prevBoards.map((board) => {
            if (board.id !== boardId) return board;

            const updatedColumns = board.columns.map((column) => {
              if (column.id === activeColumnId) {
                const activeTaskIndex = column.tasks.findIndex(
                  (task) => task.id === activeTaskId
                );
                const overTaskIndex = column.tasks.findIndex(
                  (task) => task.id === overTaskId
                );

                return {
                  ...column,
                  tasks: arrayMove(
                    column.tasks,
                    activeTaskIndex,
                    overTaskIndex
                  ),
                };
              }
              return column;
            });

            return {
              ...board,
              columns: updatedColumns,
            };
          });
        });
      }
    }

    setActiveTask(null);
    setActiveColumn(null);
  };

  const addNewColumn = (boardId: string) => {
    const newColumn: Column = {
      id: uuidv4(),
      title: "New Column",
      tasks: [],
    };

    setBoards((prevBoards) => {
      return prevBoards.map((board) => {
        if (board.id === boardId) {
          return {
            ...board,
            columns: [...board.columns, newColumn],
          };
        }
        return board;
      });
    });
  };

  const addNewTask = (boardId: string, columnId: string) => {
    const newTask: Task = {
      id: uuidv4(),
      title: "New Task",
      description: "Add description here",
    };

    setBoards((prevBoards) => {
      return prevBoards.map((board) => {
        if (board.id === boardId) {
          const updatedColumns = board.columns.map((column) =>
            column.id === columnId
              ? { ...column, tasks: [...column.tasks, newTask] }
              : column
          );

          return {
            ...board,
            columns: updatedColumns,
          };
        }
        return board;
      });
    });
  };

  const updateColumnTitle = (
    boardId: string,
    columnId: string,
    newTitle: string
  ) => {
    setBoards((prevBoards) => {
      return prevBoards.map((board) => {
        if (board.id === boardId) {
          const updatedColumns = board.columns.map((column) =>
            column.id === columnId ? { ...column, title: newTitle } : column
          );

          return {
            ...board,
            columns: updatedColumns,
          };
        }
        return board;
      });
    });
  };

  const updateTask = (
    boardId: string,
    columnId: string,
    taskId: string,
    updatedTask: Partial<Task>
  ) => {
    setBoards((prevBoards) => {
      return prevBoards.map((board) => {
        if (board.id === boardId) {
          const updatedColumns = board.columns.map((column) =>
            column.id === columnId
              ? {
                  ...column,
                  tasks: column.tasks.map((task) =>
                    task.id === taskId ? { ...task, ...updatedTask } : task
                  ),
                }
              : column
          );

          return {
            ...board,
            columns: updatedColumns,
          };
        }
        return board;
      });
    });
  };

  const deleteTask = (boardId: string, columnId: string, taskId: string) => {
    setBoards((prevBoards) => {
      return prevBoards.map((board) => {
        if (board.id === boardId) {
          const updatedColumns = board.columns.map((column) =>
            column.id === columnId
              ? {
                  ...column,
                  tasks: column.tasks.filter((task) => task.id !== taskId),
                }
              : column
          );

          return {
            ...board,
            columns: updatedColumns,
          };
        }
        return board;
      });
    });
  };

  const deleteColumn = (boardId: string, columnId: string) => {
    setBoards((prevBoards) => {
      return prevBoards.map((board) => {
        if (board.id === boardId) {
          return {
            ...board,
            columns: board.columns.filter((column) => column.id !== columnId),
          };
        }
        return board;
      });
    });
  };

  const addNewBoard = () => {
    const newBoard: Board = {
      id: uuidv4(),
      title: "New Board",
      columns: [
        {
          id: uuidv4(),
          title: "To Do",
          tasks: [],
        },
        {
          id: uuidv4(),
          title: "In Progress",
          tasks: [],
        },
        {
          id: uuidv4(),
          title: "Done",
          tasks: [],
        },
      ],
    };

    setBoards([...boards, newBoard]);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notion-like Kanban Board</h1>
        <Button onClick={addNewBoard} className="flex items-center gap-1">
          <Plus size={16} /> Add Board
        </Button>
      </div>

      <div className="flex flex-col gap-8">
        {boards.map((board) => (
          <SingleBoard
            key={board.id}
            board={board}
            boards={boards}
            setBoards={setBoards}
            handleDragEnd={handleDragEnd}
            handleDragOver={handleDragOver}
            handleDragStart={handleDragStart}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
