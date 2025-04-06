import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Layer } from "./layer";
import type { Layer as LayerType, Project } from "~/types";

interface SortableLayerProps {
  layer: LayerType;
  projects: Project[];
}

export function SortableLayer({ layer, projects }: SortableLayerProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: layer.id,
      data: {
        type: "layer",
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Layer layer={layer} projects={projects} />
    </div>
  );
}
