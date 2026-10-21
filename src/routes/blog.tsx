import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  component: () => <Navigate to="/" replace />,
});
