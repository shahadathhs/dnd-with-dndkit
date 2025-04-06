export interface Task {
  id: string
  title: string
  description?: string
  columnId: string
  createdAt: string
  updatedAt: string
}

export interface Column {
  id: string
  title: string
  taskIds: string[]
}

export interface KanbanState {
  tasks: Record<string, Task>
  columns: Record<string, Column>
  columnOrder: string[]
}

export type DragItemType = "column" | "task"

export interface DragItem {
  id: string
  type: DragItemType
  columnId?: string
}

