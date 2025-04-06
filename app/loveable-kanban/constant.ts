import type { Board } from "./types";

export const initialBoards: Board[] = [
  {
    id: "board-1",
    title: "Development Board",
    columns: [
      {
        id: "todo",
        title: "To Do",
        tasks: [
          { id: "task-1", title: "Task 1", description: "Description 1" },
        ],
      },
      {
        id: "in-progress",
        title: "In Progress",
        tasks: [
          {
            id: "task-2",
            title: "Task 2",
            description: "Description 2",
          },
          { id: "task-3", title: "Task 3", description: "Description 3" },
        ],
      },

      {
        id: "done",
        title: "Done",
        tasks: [
          { id: "task-4", title: "Task 4", description: "Description 4" },
        ],
      },
    ],
  },
  {
    id: "board-2",
    title: "Marketing Board",
    columns: [
      {
        id: "todo",
        title: "To Do",
        tasks: [{ id: "task-1", title: "Task 1", description: "Description 1" }],
      },
      {
        id: "in-progress",
        title: "In Progress",
        tasks: [
          {
            id: "task-2",
            title: "Task 2",
            description: "Description 2",
          },
          { id: "task-3", title: "Task 3", description: "Description 3" },
        ],
      },
    ],
  },
];
