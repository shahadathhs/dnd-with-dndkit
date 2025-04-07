import { Link } from "react-router";
import type { Route } from "./+types/home";
import { Button } from "~/components/ui/button";
import ContentPlanner from "~/content/ContentPlanner";
import CalendarBoardMonth from "~/calendar/CalendarBoardMonth";
import { CalendarProvider } from "~/calendar/CalendarContext";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <CalendarProvider>
        <CalendarBoardMonth />
      </CalendarProvider>

      <hr className="my-4" />

      <ContentPlanner />
    </main>
  );
}
