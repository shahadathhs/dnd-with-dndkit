import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { v4 as uuidv4 } from "uuid"
import type { KanbanState, Task, Column } from "./types"

// Default state for the Kanban board
const defaultState: KanbanState = {
  tasks: {},
  columns: {
    "column-1": {
      id: "column-1",
      title: "To Do",
      taskIds: [],
    },
    "column-2": {
      id: "column-2",
      title: "In Progress",
      taskIds: [],
    },
    "column-3": {
      id: "column-3",
      title: "Done",
      taskIds: [],
    },
  },
  columnOrder: ["column-1", "column-2", "column-3"],
}

interface KanbanContextType {
  state: KanbanState
  addTask: (columnId: string, title: string, description?: string) => void
  updateTask: (taskId: string, updates: Partial<Omit<Task, "id" | "columnId">>) => void
  deleteTask: (taskId: string) => void
  moveTask: (taskId: string, sourceColumnId: string, destinationColumnId: string, newIndex: number) => void
  reorderTask: (columnId: string, oldIndex: number, newIndex: number) => void
  addColumn: (title: string) => void
  updateColumn: (columnId: string, title: string) => void
  deleteColumn: (columnId: string) => void
  reorderColumn: (oldIndex: number, newIndex: number) => void
  error: string | null
  clearError: () => void
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined)

export function KanbanProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<KanbanState>(defaultState)
  const [error, setError] = useState<string | null>(null)

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const savedState = localStorage.getItem("kanbanState")
      if (savedState) {
        setState(JSON.parse(savedState))
      }
    } catch (err) {
      console.error("Error loading state from localStorage:", err)
      setError("Failed to load your board. Using default board instead.")
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("kanbanState", JSON.stringify(state))
    } catch (err) {
      console.error("Error saving state to localStorage:", err)
      setError("Failed to save your changes. Please try again.")
    }
  }, [state])

  const clearError = () => setError(null)

  // Add a new task to a column
  const addTask = (columnId: string, title: string, description?: string) => {
    try {
      if (!title.trim()) {
        setError("Task title cannot be empty")
        return
      }

      const column = state.columns[columnId]
      if (!column) {
        setError("Column not found")
        return
      }

      const newTaskId = `task-${uuidv4()}`
      const now = new Date().toISOString()

      const newTask: Task = {
        id: newTaskId,
        title,
        description: description || "",
        columnId,
        createdAt: now,
        updatedAt: now,
      }

      setState((prevState) => {
        const updatedTaskIds = [...prevState.columns[columnId].taskIds, newTaskId]

        return {
          ...prevState,
          tasks: {
            ...prevState.tasks,
            [newTaskId]: newTask,
          },
          columns: {
            ...prevState.columns,
            [columnId]: {
              ...prevState.columns[columnId],
              taskIds: updatedTaskIds,
            },
          },
        }
      })
    } catch (err) {
      console.error("Error adding task:", err)
      setError("Failed to add task. Please try again.")
    }
  }

  // Update an existing task
  const updateTask = (taskId: string, updates: Partial<Omit<Task, "id" | "columnId">>) => {
    try {
      if (updates.title && !updates.title.trim()) {
        setError("Task title cannot be empty")
        return
      }

      const task = state.tasks[taskId]
      if (!task) {
        setError("Task not found")
        return
      }

      setState((prevState) => ({
        ...prevState,
        tasks: {
          ...prevState.tasks,
          [taskId]: {
            ...prevState.tasks[taskId],
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        },
      }))
    } catch (err) {
      console.error("Error updating task:", err)
      setError("Failed to update task. Please try again.")
    }
  }

  // Delete a task
  const deleteTask = (taskId: string) => {
    try {
      const task = state.tasks[taskId]
      if (!task) {
        setError("Task not found")
        return
      }

      const { columnId } = task
      const column = state.columns[columnId]
      if (!column) {
        setError("Column not found")
        return
      }

      setState((prevState) => {
        const { [taskId]: deletedTask, ...remainingTasks } = prevState.tasks
        const updatedTaskIds = prevState.columns[columnId].taskIds.filter((id) => id !== taskId)

        return {
          ...prevState,
          tasks: remainingTasks,
          columns: {
            ...prevState.columns,
            [columnId]: {
              ...prevState.columns[columnId],
              taskIds: updatedTaskIds,
            },
          },
        }
      })
    } catch (err) {
      console.error("Error deleting task:", err)
      setError("Failed to delete task. Please try again.")
    }
  }

  // Move a task from one column to another
  const moveTask = (taskId: string, sourceColumnId: string, destinationColumnId: string, newIndex: number) => {
    try {
      const task = state.tasks[taskId]
      if (!task) {
        setError("Task not found")
        return
      }

      const sourceColumn = state.columns[sourceColumnId]
      const destinationColumn = state.columns[destinationColumnId]
      if (!sourceColumn || !destinationColumn) {
        setError("Column not found")
        return
      }

      setState((prevState) => {
        // Remove task from source column
        const sourceTaskIds = [...prevState.columns[sourceColumnId].taskIds]
        const sourceIndex = sourceTaskIds.indexOf(taskId)
        if (sourceIndex === -1) return prevState // Task not found in source column
        sourceTaskIds.splice(sourceIndex, 1)

        // Add task to destination column at the specified index
        const destinationTaskIds = [...prevState.columns[destinationColumnId].taskIds]
        destinationTaskIds.splice(newIndex, 0, taskId)

        return {
          ...prevState,
          tasks: {
            ...prevState.tasks,
            [taskId]: {
              ...prevState.tasks[taskId],
              columnId: destinationColumnId,
              updatedAt: new Date().toISOString(),
            },
          },
          columns: {
            ...prevState.columns,
            [sourceColumnId]: {
              ...prevState.columns[sourceColumnId],
              taskIds: sourceTaskIds,
            },
            [destinationColumnId]: {
              ...prevState.columns[destinationColumnId],
              taskIds: destinationTaskIds,
            },
          },
        }
      })
    } catch (err) {
      console.error("Error moving task:", err)
      setError("Failed to move task. Please try again.")
    }
  }

  // Reorder tasks within a column
  const reorderTask = (columnId: string, oldIndex: number, newIndex: number) => {
    try {
      const column = state.columns[columnId]
      if (!column) {
        setError("Column not found")
        return
      }

      setState((prevState) => {
        const taskIds = [...prevState.columns[columnId].taskIds]
        const [removed] = taskIds.splice(oldIndex, 1)
        taskIds.splice(newIndex, 0, removed)

        return {
          ...prevState,
          columns: {
            ...prevState.columns,
            [columnId]: {
              ...prevState.columns[columnId],
              taskIds,
            },
          },
        }
      })
    } catch (err) {
      console.error("Error reordering task:", err)
      setError("Failed to reorder task. Please try again.")
    }
  }

  // Add a new column
  const addColumn = (title: string) => {
    try {
      if (!title.trim()) {
        setError("Column title cannot be empty")
        return
      }

      const newColumnId = `column-${uuidv4()}`
      const newColumn: Column = {
        id: newColumnId,
        title,
        taskIds: [],
      }

      setState((prevState) => ({
        ...prevState,
        columns: {
          ...prevState.columns,
          [newColumnId]: newColumn,
        },
        columnOrder: [...prevState.columnOrder, newColumnId],
      }))
    } catch (err) {
      console.error("Error adding column:", err)
      setError("Failed to add column. Please try again.")
    }
  }

  // Update a column's title
  const updateColumn = (columnId: string, title: string) => {
    try {
      if (!title.trim()) {
        setError("Column title cannot be empty")
        return
      }

      const column = state.columns[columnId]
      if (!column) {
        setError("Column not found")
        return
      }

      setState((prevState) => ({
        ...prevState,
        columns: {
          ...prevState.columns,
          [columnId]: {
            ...prevState.columns[columnId],
            title,
          },
        },
      }))
    } catch (err) {
      console.error("Error updating column:", err)
      setError("Failed to update column. Please try again.")
    }
  }

  // Delete a column and all its tasks
  const deleteColumn = (columnId: string) => {
    try {
      const column = state.columns[columnId]
      if (!column) {
        setError("Column not found")
        return
      }

      setState((prevState) => {
        // Create a new tasks object without the tasks from the deleted column
        const newTasks = { ...prevState.tasks }
        column.taskIds.forEach((taskId) => {
          delete newTasks[taskId]
        })

        // Create a new columns object without the deleted column
        const { [columnId]: deletedColumn, ...remainingColumns } = prevState.columns

        // Create a new columnOrder array without the deleted column
        const newColumnOrder = prevState.columnOrder.filter((id) => id !== columnId)

        return {
          ...prevState,
          tasks: newTasks,
          columns: remainingColumns,
          columnOrder: newColumnOrder,
        }
      })
    } catch (err) {
      console.error("Error deleting column:", err)
      setError("Failed to delete column. Please try again.")
    }
  }

  // Reorder columns
  const reorderColumn = (oldIndex: number, newIndex: number) => {
    try {
      setState((prevState) => {
        const newColumnOrder = [...prevState.columnOrder]
        const [removed] = newColumnOrder.splice(oldIndex, 1)
        newColumnOrder.splice(newIndex, 0, removed)

        return {
          ...prevState,
          columnOrder: newColumnOrder,
        }
      })
    } catch (err) {
      console.error("Error reordering column:", err)
      setError("Failed to reorder column. Please try again.")
    }
  }

  return (
    <KanbanContext.Provider
      value={{
        state,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        reorderTask,
        addColumn,
        updateColumn,
        deleteColumn,
        reorderColumn,
        error,
        clearError,
      }}
    >
      {children}
    </KanbanContext.Provider>
  )
}

export function useKanban() {
  const context = useContext(KanbanContext)
  if (context === undefined) {
    throw new Error("useKanban must be used within a KanbanProvider")
  }
  return context
}

