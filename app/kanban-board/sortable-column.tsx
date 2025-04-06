import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Column } from "./column"
import type { Column as ColumnType, Task } from "./types"

interface SortableColumnProps {
  column: ColumnType
  tasks: Task[]
}

export function SortableColumn({ column, tasks }: SortableColumnProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
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
      <Column column={column} tasks={tasks} isDragging={isDragging} />
    </div>
  )
}

