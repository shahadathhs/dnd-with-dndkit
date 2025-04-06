import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";
import { Stage } from "./stage";
import { SortableStage } from "./sortable-stage";
import { useContentPlannerContext } from "../context/content-planner-context";

export default function ContentPlanner() {
  const { stages, setStages, addStage } = useContentPlannerContext();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: any) {
    const { active } = event;
    setActiveId(active.id);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = stages.findIndex((stage) => stage.id === active.id);
      const newIndex = stages.findIndex((stage) => stage.id === over.id);

      setStages(arrayMove(stages, oldIndex, newIndex));
    }

    setActiveId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Stages</h2>
        <Button onClick={addStage} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Stage
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={stages.map((stage) => stage.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {stages.map((stage) => (
              <SortableStage key={stage.id} stage={stage} />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div className="opacity-80">
              <Stage
                stage={stages.find((stage) => stage.id === activeId)!}
                overlay
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
