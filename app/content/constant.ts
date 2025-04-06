import type { Board } from "./types";

export const initialBoards: Board[] = [
  {
    id: "board-1",
    title: "Development Board",
    columns: [
      {
        id: "backlog",
        title: "Backlog",
        tasks: [
          {
            id: "task-1",
            title: "Set up project repo",
            description: "Initialize GitHub repo and project structure.",
          },
          {
            id: "task-2",
            title: "Choose tech stack",
            description: "Finalize tech stack for frontend and backend.",
          },
        ],
      },
      {
        id: "todo",
        title: "To Do",
        tasks: [
          {
            id: "task-3",
            title: "Implement auth system",
            description: "Add login/signup using JWT.",
          },
          {
            id: "task-4",
            title: "Database schema design",
            description: "Design MongoDB schemas for users and tasks.",
          },
        ],
      },
      {
        id: "in-progress",
        title: "In Progress",
        tasks: [
          {
            id: "task-5",
            title: "Build API endpoints",
            description: "Create RESTful routes for tasks.",
          },
          {
            id: "task-6",
            title: "Create UI for task board",
            description: "Develop drag-and-drop interface with DnD Kit.",
          },
        ],
      },
      {
        id: "review",
        title: "In Review",
        tasks: [
          {
            id: "task-7",
            title: "Code review for auth",
            description: "Peer review for the auth implementation.",
          },
        ],
      },
      {
        id: "done",
        title: "Done",
        tasks: [
          {
            id: "task-8",
            title: "Project setup",
            description: "Installed dependencies and setup ESLint/Prettier.",
          },
        ],
      },
      {
        id: "blocked",
        title: "Blocked",
        tasks: [
          {
            id: "task-9",
            title: "Integrate CI/CD",
            description: "Blocked due to missing deployment secrets.",
          },
        ],
      },
    ],
  },
  {
    id: "board-2",
    title: "Design Board",
    columns: [
      {
        id: "backlog",
        title: "Backlog",
        tasks: [
          {
            id: "task-10",
            title: "Gather inspiration",
            description: "Collect references for modern UI trends.",
          },
        ],
      },
      {
        id: "todo",
        title: "To Do",
        tasks: [
          {
            id: "task-11",
            title: "Design wireframes",
            description: "Create low-fidelity wireframes for dashboard.",
          },
          {
            id: "task-12",
            title: "Define color palette",
            description: "Choose consistent brand colors.",
          },
        ],
      },
      {
        id: "in-progress",
        title: "In Progress",
        tasks: [
          {
            id: "task-13",
            title: "Design mobile layout",
            description: "Responsive design for smaller screens.",
          },
        ],
      },
      {
        id: "review",
        title: "In Review",
        tasks: [
          {
            id: "task-14",
            title: "Review desktop mockups",
            description: "Get feedback from team on high-fidelity designs.",
          },
        ],
      },
      {
        id: "done",
        title: "Done",
        tasks: [
          {
            id: "task-15",
            title: "Logo design",
            description: "Finalized logo and favicon.",
          },
          {
            id: "task-16",
            title: "Typography system",
            description: "Set up font scale and hierarchy.",
          },
        ],
      },
    ],
  },
];
