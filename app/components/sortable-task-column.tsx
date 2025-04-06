import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { TaskColumn } from "~/components/task-column"
import type { TaskColumn as TaskColumnType, Task } from "~/types"

interface SortableTaskColumnProps {
  column: TaskColumnType
  tasks: Task[]
}

export function SortableTaskColumn({ column, tasks }: SortableTaskColumnProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: column.id,
    data: {
      type: "column",
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskColumn column={column} tasks={tasks} />
    </div>
  )
}

