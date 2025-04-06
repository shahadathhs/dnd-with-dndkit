import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/content", "routes/content.tsx"),
  route("/calendar", "routes/calendar.tsx"),
] satisfies RouteConfig;
