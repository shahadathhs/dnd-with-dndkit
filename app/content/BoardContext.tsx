import React, { createContext, useState, type ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Board, Column, Task } from "./types";
import { initialBoards } from "./constant";

interface BoardContextType {
  boards: Board[];
  setBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  activeTask: (Task & { boardId: string; columnId: string }) | null;
  setActiveTask: React.Dispatch<
    React.SetStateAction<(Task & { boardId: string; columnId: string }) | null>
  >;
  addNewBoard: () => void;
  deleteBoard: (boardId: string) => void;
  addNewColumn: (boardId: string) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
  updateTask: (
    boardId: string,
    columnId: string,
    taskId: string,
    updatedTask: Partial<Task>
  ) => void;
  deleteTask: (boardId: string, columnId: string, taskId: string) => void;
}

export const BoardContext = createContext<BoardContextType | undefined>(
  undefined
);

export const BoardProvider = ({ children }: { children: ReactNode }) => {
  const [boards, setBoards] = useState<Board[]>(initialBoards);
  const [activeTask, setActiveTask] = useState<
    (Task & { boardId: string; columnId: string }) | null
  >(null);

  const addNewBoard = () => {
    const newBoard: Board = {
      id: uuidv4(),
      title: "New Board",
      columns: [
        { id: uuidv4(), title: "To Do", tasks: [] },
        { id: uuidv4(), title: "In Progress", tasks: [] },
        { id: uuidv4(), title: "Done", tasks: [] },
      ],
    };
    setBoards((prev) => [...prev, newBoard]);
  };

  const deleteBoard = (boardId: string) => {
    setBoards((prev) => prev.filter((board) => board.id !== boardId));
  };

  const addNewColumn = (boardId: string) => {
    const newColumn: Column = {
      id: uuidv4(),
      title: "New Column",
      tasks: [],
    };
    setBoards((prev) =>
      prev.map((board) =>
        board.id === boardId
          ? { ...board, columns: [...board.columns, newColumn] }
          : board
      )
    );
  };

  const deleteColumn = (boardId: string, columnId: string) => {
    setBoards((prev) =>
      prev.map((board) =>
        board.id === boardId
          ? {
              ...board,
              columns: board.columns.filter((col) => col.id !== columnId),
            }
          : board
      )
    );
  };

  const updateTask = (
    boardId: string,
    columnId: string,
    taskId: string,
    updatedTask: Partial<Task>
  ) => {
    setBoards((prev) =>
      prev.map((board) => {
        if (board.id === boardId) {
          const updatedColumns = board.columns.map((col) => {
            if (col.id === columnId) {
              return {
                ...col,
                tasks: col.tasks.map((task) =>
                  task.id === taskId ? { ...task, ...updatedTask } : task
                ),
              };
            }
            return col;
          });
          return { ...board, columns: updatedColumns };
        }
        return board;
      })
    );
  };

  const deleteTask = (boardId: string, columnId: string, taskId: string) => {
    setBoards((prev) =>
      prev.map((board) => {
        if (board.id === boardId) {
          const updatedColumns = board.columns.map((col) => {
            if (col.id === columnId) {
              return {
                ...col,
                tasks: col.tasks.filter((task) => task.id !== taskId),
              };
            }
            return col;
          });
          return { ...board, columns: updatedColumns };
        }
        return board;
      })
    );
  };

  return (
    <BoardContext.Provider
      value={{
        boards,
        setBoards,
        activeTask,
        setActiveTask,
        addNewBoard,
        deleteBoard,
        addNewColumn,
        deleteColumn,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};
