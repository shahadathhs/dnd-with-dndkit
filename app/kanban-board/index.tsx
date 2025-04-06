import { KanbanBoard } from "./kanban-board"
import { KanbanProvider } from "./kanban-context"

export default function KanbanBoardWrapper() {
  return (
    <KanbanProvider>
      <KanbanBoard />
    </KanbanProvider>
  )
}

export { KanbanBoard } from "./kanban-board"
export { KanbanProvider, useKanban } from "./kanban-context"
export * from "./types"

