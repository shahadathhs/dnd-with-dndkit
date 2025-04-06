export interface Task {
  id: string;
  title: string;
  description?: string;
  status?: string;
  columnId?: string;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  boardId?: string;
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
}