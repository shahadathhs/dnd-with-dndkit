import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { format } from "date-fns";
import type { Task } from "./CalendarContext";
import CalendarCard from "./CalendarCard";

interface CalendarColumnProps {
  day: Date;
  tasks: Task[];
}

const CalendarColumn: React.FC<CalendarColumnProps> = ({ day, tasks }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `day:${format(day, "yyyy-MM-dd")}`,
  });

  return (
    <div
      ref={setNodeRef}
      className="min-w-[250px] p-2 border rounded"
      style={{ background: isOver ? "#f0f8ff" : "white" }}
    >
      <h2 className="text-lg font-semibold mb-2">{format(day, "EEEE, MMM d")}</h2>
      <div className="space-y-2">
        {tasks.map((task) => (
          <CalendarCard key={task.id} task={task} isOverlay={false} />
        ))}
      </div>
    </div>
  );
};

export default CalendarColumn;
