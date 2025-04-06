import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useKanban } from "./kanban-context";
import { Column } from "./column";
import { SortableColumn } from "./sortable-column";
import { TaskCard } from "./task-card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Plus, X, AlertCircle } from "lucide-react";
import type { DragItem } from "./types";

export function KanbanBoard() {
  const {
    state,
    addColumn,
    reorderColumn,
    moveTask,
    reorderTask,
    error,
    clearError,
  } = useKanban();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<DragItem | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id as string);

    // Store the active item data
    const itemType = active.data.current?.type;
    if (itemType) {
      setActiveItem({
        id: active.id as string,
        type: itemType,
        columnId: active.data.current?.columnId,
      });
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;

    if (!over || !active.data.current || !over.data.current) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // If the active item is not a task or we're not over a column, return
    if (
      active.data.current.type !== "task" ||
      over.data.current.type !== "column"
    )
      return;

    // If we're already in the correct column, return
    if (active.data.current.columnId === overId) return;

    // Get the source column and destination column
    const sourceColumnId = active.data.current.columnId;
    const destinationColumnId = overId;

    // Move the task to the new column at the end
    const destinationColumn = state.columns[destinationColumnId];
    if (destinationColumn) {
      moveTask(
        activeId,
        sourceColumnId,
        destinationColumnId,
        destinationColumn.taskIds.length
      );
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveItem(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle column reordering
    if (
      active.data.current?.type === "column" &&
      over.data.current?.type === "column"
    ) {
      const oldIndex = state.columnOrder.indexOf(activeId);
      const newIndex = state.columnOrder.indexOf(overId);

      if (oldIndex !== newIndex) {
        reorderColumn(oldIndex, newIndex);
      }
    }

    // Handle task reordering within the same column
    if (
      active.data.current?.type === "task" &&
      over.data.current?.type === "task"
    ) {
      const sourceColumnId = active.data.current.columnId;
      const destinationColumnId = over.data.current.columnId;

      // If the task is moved within the same column
      if (sourceColumnId === destinationColumnId) {
        const column = state.columns[sourceColumnId];
        const oldIndex = column.taskIds.indexOf(activeId);
        const newIndex = column.taskIds.indexOf(overId);

        if (oldIndex !== newIndex) {
          reorderTask(sourceColumnId, oldIndex, newIndex);
        }
      }
      // If the task is moved to a different column
      else {
        const sourceColumn = state.columns[sourceColumnId];
        const destinationColumn = state.columns[destinationColumnId];

        const oldIndex = sourceColumn.taskIds.indexOf(activeId);
        const newIndex = destinationColumn.taskIds.indexOf(overId);

        moveTask(activeId, sourceColumnId, destinationColumnId, newIndex);
      }
    }

    setActiveId(null);
    setActiveItem(null);
  }

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle);
      setNewColumnTitle("");
      setIsAddingColumn(false);
    }
  };

  return (
    <div className="p-4 h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        {!isAddingColumn ? (
          <Button onClick={() => setIsAddingColumn(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder="Column title"
              className="w-48"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddColumn();
                } else if (e.key === "Escape") {
                  setIsAddingColumn(false);
                  setNewColumnTitle("");
                }
              }}
              autoFocus
            />
            <Button onClick={handleAddColumn}>Add</Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsAddingColumn(false);
                setNewColumnTitle("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={clearError}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-200px)]">
          <SortableContext
            items={state.columnOrder}
            strategy={horizontalListSortingStrategy}
          >
            {state.columnOrder.map((columnId) => {
              const column = state.columns[columnId];
              const tasks = column.taskIds.map((taskId) => state.tasks[taskId]);

              return (
                <SortableColumn key={columnId} column={column} tasks={tasks} />
              );
            })}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeId && activeItem ? (
            activeItem.type === "column" ? (
              <Column
                column={state.columns[activeId]}
                tasks={state.columns[activeId].taskIds.map(
                  (taskId) => state.tasks[taskId]
                )}
                isOverlay
              />
            ) : (
              <TaskCard task={state.tasks[activeId]} isOverlay />
            )
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
