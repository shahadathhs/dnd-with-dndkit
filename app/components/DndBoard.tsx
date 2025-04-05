import { useState } from "react";
import { DndContext } from "@dnd-kit/core";

import { Droppable } from "./Droppable";
import { Draggable } from "./Draggable";

export default function DndBoard() {
  const containers = ["A", "B", "C"];
  const [parent, setParent] = useState(null);
  const draggableMarkup = (
    <Draggable id="draggable">
      <div className="mt-4 bg-blue-500 p-2 rounded text-white">Drag me</div>
    </Draggable>
  );

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {parent === null ? draggableMarkup : null}

      <div className="grid grid-cols-3 gap-4 mt-6 container mx-auto">
        {containers.map((id) => (
          // We updated the Droppable component so it would accept an `id`
          // prop and pass it to `useDroppable`
          <Droppable key={id} id={id}>
            <div className="min-h-[200px] border border-dashed rounded shadow p-4 mb-8">
              <p className="font-bold border-b">Drop here</p>

              {parent === id && draggableMarkup}
            </div>
          </Droppable>
        ))}
      </div>
    </DndContext>
  );

  function handleDragEnd(event: any) {
    const { over } = event;

    // If the item is dropped over a container, set it as the parent
    // otherwise reset the parent to `null`
    setParent(over ? over.id : null);
  }
}
