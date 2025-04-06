import DndBoard from "~/intro/DndBoard";
import type { Route } from "./+types/home";
import ContentPlanner from "~/components/content-planner";
import KanbanBoardWrapper from "~/kanban-board";
import KanbanBoard from "~/loveable-kanban/KanbanBoard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  // return <DndBoard />;
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Content Planner</h1>
      {/* <KanbanBoardWrapper /> */}
      {/* <DndBoard /> */}
      <KanbanBoard />
    </main>
  );
}
