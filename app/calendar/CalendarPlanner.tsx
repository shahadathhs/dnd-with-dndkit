import CalendarBoard from "./CalendarBoard";
import { CalendarProvider } from "./CalendarContext";

export default function CalendarPlanner() {
  return (
    <CalendarProvider>
      <CalendarBoard />
    </CalendarProvider>
  );
}
