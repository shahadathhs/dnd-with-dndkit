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
import { SortableLayer } from "./sortable-layer";
import { ProjectCard } from "./project-card";
import { useContentPlannerContext } from "~/others/context/content-planner-context";
import type { Stage, Project } from "~/types";

interface StageBoardProps {
  stage: Stage;
}

export function StageBoard({ stage }: StageBoardProps) {
  const { layers, projects, moveProject, updateLayerOrder } =
    useContentPlannerContext();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const stageLayers = layers.filter((layer) => layer.stageId === stage.id);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  function handleDragStart(event: any) {
    const { active } = event;
    setActiveId(active.id);

    // Check if we're dragging a project
    if (active.data.current?.type === "project") {
      setActiveProject(active.data.current.project);
    }
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveProject(null);
      return;
    }

    // Handle layer reordering
    if (
      active.data.current?.type === "layer" &&
      over.data.current?.type === "layer"
    ) {
      if (active.id !== over.id) {
        const oldIndex = stageLayers.findIndex(
          (layer) => layer.id === active.id
        );
        const newIndex = stageLayers.findIndex((layer) => layer.id === over.id);

        updateLayerOrder(stage.id, arrayMove(stageLayers, oldIndex, newIndex));
      }
    }

    // Handle project moving
    if (
      active.data.current?.type === "project" &&
      over.data.current?.type === "layer"
    ) {
      const project = active.data.current.project;
      const targetLayerId = over.id;

      if (project.layerId !== targetLayerId) {
        moveProject(project.id, targetLayerId);
      }
    }

    setActiveId(null);
    setActiveProject(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToHorizontalAxis]}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        <SortableContext
          items={stageLayers.map((layer) => layer.id)}
          strategy={horizontalListSortingStrategy}
        >
          {stageLayers.map((layer) => {
            const layerProjects = projects.filter(
              (project) => project.layerId === layer.id
            );

            return (
              <SortableLayer
                key={layer.id}
                layer={layer}
                projects={layerProjects}
              />
            );
          })}
        </SortableContext>
      </div>

      <DragOverlay>
        {activeId && activeProject ? (
          <ProjectCard project={activeProject} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
