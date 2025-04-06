import React, { useState } from "react";
import {
  DndContext,
  type DragEndEvent,
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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id as string;

    // Check if we're dragging a task
    if (id.includes("task:")) {
      // Format: "task:taskId:columnId:boardId"
      const parts = id.replace("task:", "").split(":");
      const taskId = parts[0];
      const columnId = parts[1];
      const boardId = parts[2];

      const board = boards.find((b) => b.id === boardId);
      const column = board?.columns.find((col) => col.id === columnId);
      const task = column?.tasks.find((t) => t.id === taskId);

      if (task) {
        setActiveTask(task);
      }
    } else if (id.includes("column:")) {
      // Format: "column:columnId:boardId"
      const parts = id.replace("column:", "").split(":");
      const columnId = parts[0];
      const boardId = parts[1];

      const board = boards.find((b) => b.id === boardId);
      const column = board?.columns.find((col) => col.id === columnId);

      if (column) {
        setActiveColumn(column);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // For moving tasks between columns
    if (activeId.includes("task:") && overId.includes("column:")) {
      const activeParts = activeId.replace("task:", "").split(":");
      const overParts = overId.replace("column:", "").split(":");
      const activeTaskId = activeParts[0];
      const activeColumnId = activeParts[1];
      const activeBoardId = activeParts[2];
      const overColumnId = overParts[0];
      const overBoardId = overParts[1];

      if (activeColumnId !== overColumnId && activeBoardId === overBoardId) {
        setBoards((prevBoards) => {
          return prevBoards.map((board) => {
            if (board.id !== activeBoardId) return board;

            const taskToMove = board.columns
              .find((col) => col.id === activeColumnId)
              ?.tasks.find((task) => task.id === activeTaskId);

            if (!taskToMove) return board;

            const updatedColumns = board.columns.map((column) => {
              if (column.id === activeColumnId) {
                return {
                  ...column,
                  tasks: column.tasks.filter(
                    (task) => task.id !== activeTaskId
                  ),
                };
              }
              if (column.id === overColumnId) {
                return {
                  ...column,
                  tasks: [...column.tasks, taskToMove],
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

    // For task reordering within the same column
    if (activeId.includes("task:") && overId.includes("task:")) {
      const activeParts = activeId.replace("task:", "").split(":");
      const overParts = overId.replace("task:", "").split(":");

      const activeTaskId = activeParts[0];
      const activeColumnId = activeParts[1];
      const activeBoardId = activeParts[2];
      const overTaskId = overParts[0];
      const overColumnId = overParts[1];
      const overBoardId = overParts[2];

      if (
        activeTaskId !== overTaskId &&
        activeColumnId === overColumnId &&
        activeBoardId === overBoardId
      ) {
        setBoards((prevBoards) => {
          return prevBoards.map((board) => {
            if (board.id !== activeBoardId) return board;

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

    // For moving tasks between boards
    if (!activeId.includes("task:") || activeId === overId) return;

    // Format: "task:taskId:columnId:boardId"
    const activeParts = activeId.replace("task:", "").split(":");
    const activeTaskId = activeParts[0];
    const activeColumnId = activeParts[1];
    const activeBoardId = activeParts[2];

    let overColumnId: string = "",
      overBoardId: string = "";

    // If over a task
    if (overId.includes("task:")) {
      const overParts = overId.replace("task:", "").split(":");
      overColumnId = overParts[1];
      overBoardId = overParts[2];
    }
    // If over a column
    else if (overId.includes("column:")) {
      const overParts = overId.replace("column:", "").split(":");
      overColumnId = overParts[0];
      overBoardId = overParts[1];
    } else {
      return; // Exit if not over a valid target
    }

    // If dropping in the same column, nothing to do in dragOver
    if (activeColumnId === overColumnId && activeBoardId === overBoardId)
      return;

    setBoards((prevBoards) => {
      // Find the active board and column
      const activeBoard = prevBoards.find(
        (board) => board.id === activeBoardId
      );
      const activeColumn = activeBoard?.columns.find(
        (col) => col.id === activeColumnId
      );

      // Find the target board and column
      const overBoard = prevBoards.find((board) => board.id === overBoardId);

      if (!activeColumn || !overBoard) return prevBoards;

      // * if in same board return the same boards
      if (activeBoardId === overBoardId) {
        return prevBoards;
      }

      const overColumn = overBoard?.columns.find(
        (col) => col.id === overColumnId
      );

      if (!activeColumn || !overColumn) return prevBoards;

      // Find the task to move
      const activeTaskIndex = activeColumn.tasks.findIndex(
        (task) => task.id === activeTaskId
      );
      if (activeTaskIndex === -1) return prevBoards;

      const taskToMove = activeColumn.tasks[activeTaskIndex];

      return prevBoards.map((board) => {
        // Handle the source board
        if (board.id === activeBoardId) {
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

            // Add to the over column if in the same board
            if (activeBoardId === overBoardId && column.id === overColumnId) {
              return {
                ...column,
                tasks: [...column.tasks, taskToMove],
              };
            }

            return column;
          });

          return {
            ...board,
            columns: updatedColumns,
          };
        }

        // Handle the target board if it's different
        if (board.id === overBoardId && activeBoardId !== overBoardId) {
          const updatedColumns = board.columns.map((column) => {
            // Add to the over column
            if (column.id === overColumnId) {
              return {
                ...column,
                tasks: [...column.tasks, taskToMove],
              };
            }
            return column;
          });

          return {
            ...board,
            columns: updatedColumns,
          };
        }

        return board;
      });
    });

    setActiveTask(null);
    setActiveColumn(null);
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

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notion-like Kanban Board</h1>
        <Button onClick={addNewBoard} className="flex items-center gap-1">
          <Plus size={16} /> Add Board
        </Button>
      </div>

      {/* Single DndContext wrapping all boards */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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

              <div className="flex gap-4 overflow-x-auto pb-4">
                {board.columns.map((column) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    boardId={board.id}
                    boards={boards}
                    setBoards={setBoards}
                    deleteColumn={(columnId) =>
                      deleteColumn(board.id, columnId)
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
