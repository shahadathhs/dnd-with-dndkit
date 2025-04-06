import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Button } from "~/components/ui/button";
import ContentPlanner from "~/content/ContentPlanner";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <div className="flex gap-4">
        <Link to="/content">
          <Button>Content Planner</Button>
        </Link>

        <Link to="/calendar">
          <Button>Calendar</Button>
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-center">Home</h1>
      <ContentPlanner />
    </main>
  );
}
