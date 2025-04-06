import React, { useContext, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { format, parseISO, isSameDay } from "date-fns";
import CalendarColumn from "./CalendarColumn";
import CalendarCard from "./CalendarCard";
import { CalendarContext } from "./CalendarContext";

const CalendarBoard: React.FC = () => {
  const { tasks, updateTaskDeadline } = useContext(CalendarContext)!;
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Generate columns for the current week (7 days)
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today);
    day.setDate(today.getDate() + i);
    return day;
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveTaskId(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveTaskId(null);
      return;
    }
    // Expected active id format: "task:taskId"
    const taskId = (active.id as string).replace("task:", "");
    // Expected over id format: "day:YYYY-MM-DD"
    if (over.id.toString().startsWith("day:")) {
      const newDate = over.id.toString().replace("day:", "");
      // Here we update the task deadline to the new date (time portion is set to midnight)
      updateTaskDeadline(taskId, new Date(newDate).toISOString());
    }
    setActiveTaskId(null);
  };

  const activeTask = tasks.find((task) => task.id === activeTaskId);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto">
          {days.map((day) => {
            const formatted = format(day, "yyyy-MM-dd");
            // Filter tasks that match this day
            const tasksForDay = tasks.filter((task) =>
              isSameDay(parseISO(task.deadline), day)
            );
            return (
              <CalendarColumn key={formatted} day={day} tasks={tasksForDay} />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <CalendarCard task={activeTask} isOverlay={true} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default CalendarBoard;
