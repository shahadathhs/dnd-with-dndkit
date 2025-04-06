import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { SortableTaskColumn } from "./sortable-task-column";
import { TaskCard } from "./task-card";
import { useContentPlannerContext } from "~/others/context/content-planner-context";
import type { Task } from "~/types";

interface TaskBoardProps {
  projectId: string;
}

export function TaskBoard({ projectId }: TaskBoardProps) {
  const { taskColumns, tasks, moveTask, updateTaskColumnOrder, addTaskColumn } =
    useContentPlannerContext();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const projectTaskColumns = taskColumns.filter(
    (column) => column.projectId === projectId
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  function handleDragStart(event: any) {
    const { active } = event;
    setActiveId(active.id);

    // Check if we're dragging a task
    if (active.data.current?.type === "task") {
      setActiveTask(active.data.current.task);
    }
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }

    // Handle column reordering
    if (
      active.data.current?.type === "column" &&
      over.data.current?.type === "column"
    ) {
      if (active.id !== over.id) {
        const oldIndex = projectTaskColumns.findIndex(
          (column) => column.id === active.id
        );
        const newIndex = projectTaskColumns.findIndex(
          (column) => column.id === over.id
        );

        updateTaskColumnOrder(
          projectId,
          arrayMove(projectTaskColumns, oldIndex, newIndex)
        );
      }
    }

    // Handle task moving
    if (
      active.data.current?.type === "task" &&
      over.data.current?.type === "column"
    ) {
      const task = active.data.current.task;
      const targetColumnId = over.id;

      if (task.columnId !== targetColumnId) {
        moveTask(task.id, targetColumnId);
      }
    }

    setActiveId(null);
    setActiveTask(null);
  }

  const handleAddColumn = () => {
    addTaskColumn(projectId);
  };

  // If there are no task columns, show a message and button to add one
  if (projectTaskColumns.length === 0) {
    return (
      <div className="text-center p-6 border rounded-md">
        <p className="text-muted-foreground mb-4">No task board set up yet.</p>
        <Button onClick={handleAddColumn}>
          <Plus className="h-4 w-4 mr-2" />
          Create Task Board
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToHorizontalAxis]}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          <SortableContext
            items={projectTaskColumns.map((column) => column.id)}
            strategy={horizontalListSortingStrategy}
          >
            {projectTaskColumns.map((column) => {
              const columnTasks = tasks.filter(
                (task) => task.columnId === column.id
              );

              return (
                <SortableTaskColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                />
              );
            })}
          </SortableContext>

          <Button
            variant="outline"
            className="h-10 shrink-0 self-start"
            onClick={handleAddColumn}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        </div>

        <DragOverlay>
          {activeId && activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
