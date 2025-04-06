import KanbanBoard from "./KanbanBoard";
import { BoardProvider } from "./BoardContext";

export default function ContentPlanner() {
  return (
    <BoardProvider>
      <KanbanBoard />
    </BoardProvider>
  );
}
