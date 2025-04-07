import React, { useContext, useState } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  isSameMonth,
  isSameDay,
  addDays,
  parseISO,
} from "date-fns";
import { CalendarContext } from "./CalendarContext";
import CalendarCell from "./CalendarCell";

const CalendarBoardMonth: React.FC = () => {
  const { tasks, updateTaskDeadline } = useContext(CalendarContext)!;
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Determine the start and end dates to fill the calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Generate calendar rows
  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    // Create a week row (7 days)
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(day, "yyyy-MM-dd");
      // Filter tasks for the current day
      const dayTasks = tasks.filter((task) =>
        isSameDay(parseISO(task.deadline), day)
      );
      days.push(
        <CalendarCell
          key={formattedDate}
          day={day}
          tasks={dayTasks}
          // Optionally, pass the updateTaskDeadline handler if you want drag-and-drop support here
          updateTaskDeadline={updateTaskDeadline}
        />
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div key={day.toISOString()} className="grid grid-cols-7">
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="p-4">
      {/* Header with month navigation */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-2 border rounded">
          &lt;
        </button>
        <h1 className="text-xl font-bold">
          {format(currentMonth, "MMMM yyyy")}
        </h1>
        <button onClick={handleNextMonth} className="p-2 border rounded">
          &gt;
        </button>
      </div>
      {/* Weekday header */}
      <div className="grid grid-cols-7 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
          <div key={dayName} className="text-center font-semibold">
            {dayName}
          </div>
        ))}
      </div>
      {/* Calendar grid */}
      <div>{rows}</div>
    </div>
  );
};

export default CalendarBoardMonth;
