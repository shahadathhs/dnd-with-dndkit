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

  const deleteBoard = (boardId: string) => {
    setBoards((prevBoards) =>
      prevBoards.filter((board) => board.id !== boardId)
    );
  };

  const startEditingBoardTitle = (board: Board) => {
    setEditingBoardId(board.id);
    setEditingBoardTitle(board.title);
  };

  const saveEditingBoardTitle = () => {
    if (!editingBoardId) return;

    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.id === editingBoardId
          ? { ...board, title: editingBoardTitle }
          : board
      )
    );

    setEditingBoardId(null);
    setEditingBoardTitle("");
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
          <div key={board.id} className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              {editingBoardId === board.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editingBoardTitle}
                    onChange={(e) => setEditingBoardTitle(e.target.value)}
                    className="text-xl font-semibold w-64"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        saveEditingBoardTitle();
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={saveEditingBoardTitle}
                    className="p-1"
                  >
                    <Check size={16} />
                  </Button>
                </div>
              ) : (
                <div
                  className="text-xl font-semibold flex items-center gap-2 cursor-pointer"
                  onClick={() => startEditingBoardTitle(board)}
                >
                  <span>{board.title}</span>
                  <Edit size={14} className="text-gray-500" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => addNewColumn(board.id)}
                  className="flex items-center gap-1"
                >
                  <Plus size={16} /> Add Column
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500"
                  onClick={() => deleteBoard(board.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>

            <DndContext
              sensors={sensors}
              onDragStart={(event) => handleDragStart(event, board.id)}
              onDragOver={(event) => handleDragOver(event, board.id)}
              onDragEnd={(event) => handleDragEnd(event, board.id)}
            >
              <div className="flex gap-4 overflow-x-auto pb-4">
                {board.columns.map((column) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    addNewTask={(columnId) => addNewTask(board.id, columnId)}
                    updateColumnTitle={(columnId, title) =>
                      updateColumnTitle(board.id, columnId, title)
                    }
                    updateTask={(columnId, taskId, task) =>
                      updateTask(board.id, columnId, taskId, task)
                    }
                    deleteTask={(columnId, taskId) =>
                      deleteTask(board.id, columnId, taskId)
                    }
                    deleteColumn={(columnId) =>
                      deleteColumn(board.id, columnId)
                    }
                  />
                ))}
              </div>
            </DndContext>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
