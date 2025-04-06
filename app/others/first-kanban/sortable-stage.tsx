import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Stage } from "./stage";
import type { Stage as StageType } from "~/types";

interface SortableStageProps {
  stage: StageType;
}

export function SortableStage({ stage }: SortableStageProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Stage stage={stage} />
    </div>
  );
}
