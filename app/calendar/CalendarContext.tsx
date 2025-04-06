import React, { createContext, useState, type ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO string
}

interface CalendarContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  updateTaskDeadline: (taskId: string, newDeadline: string) => void;
  updateTask: (taskId: string, updatedFields: Partial<Omit<Task, "id">>) => void;
}

export const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  // Sample tasks with deadlines
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: uuidv4(),
      title: "Task One",
      description: "Description for task one",
      deadline: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: "Task Two",
      description: "Description for task two",
      deadline: new Date(new Date().getTime() + 86400000).toISOString(), // +1 day
    },
  ]);

  const updateTaskDeadline = (taskId: string, newDeadline: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, deadline: newDeadline } : task
      )
    );
  };

  const updateTask = (
    taskId: string,
    updatedFields: Partial<Omit<Task, "id">>
  ) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, ...updatedFields } : task
      )
    );
  };

  return (
    <CalendarContext.Provider
      value={{ tasks, setTasks, updateTaskDeadline, updateTask }}
    >
      {children}
    </CalendarContext.Provider>
  );
};
