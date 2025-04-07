import React from "react";
import { format, isSameMonth, isToday } from "date-fns";

interface Task {
  id: string;
  title: string;
  deadline: string; // ISO string representation of the deadline
}

interface CalendarCellProps {
  day: Date;
  tasks: Task[];
  updateTaskDeadline?: (taskId: string, newDeadline: string) => void;
}

const CalendarCell: React.FC<CalendarCellProps> = ({ day, tasks, updateTaskDeadline }) => {
  // Format the day number
  const dayNumber = format(day, "d");
  // Determine if the day is part of the current month
  const isCurrentMonth = isSameMonth(day, new Date());
  // Determine if the day is today
  const isTodayDate = isToday(day);

  // Conditional styles for the cell
  const cellStyles = `
    border p-2 h-32 
    ${isCurrentMonth ? "bg-white" : "bg-gray-100"} 
    ${isTodayDate ? "border-blue-500" : "border-gray-300"}
  `;

  return (
    <div className={cellStyles}>
      <div className="flex justify-between">
        <span className={`font-bold ${isTodayDate ? "text-blue-500" : ""}`}>
          {dayNumber}
        </span>
      </div>
      <div className="mt-1 space-y-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="text-xs bg-blue-100 p-1 rounded"
          >
            {task.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarCell;
