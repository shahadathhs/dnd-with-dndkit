import { Button } from "~/components/ui/button";
import type { Board, Column } from "./types";
import { Check, Edit, Plus, Trash2 } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import KanbanColumn from "./KanbanColumn";
import { Input } from "~/components/ui/input";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function SingleBoard({
  board,
  boards,
  setBoards,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
}: {
  board: Board;
  boards: Board[];
  setBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  handleDragStart: (event: DragStartEvent, boardId: string) => void;
  handleDragOver: (event: DragOverEvent, boardId: string) => void;
  handleDragEnd: (event: DragEndEvent, boardId: string) => void;
}) {
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingBoardTitle, setEditingBoardTitle] = useState<string>("");
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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
              boardId={board.id}
              boards={boards}
              setBoards={setBoards}
              deleteColumn={(columnId) => deleteColumn(board.id, columnId)}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
