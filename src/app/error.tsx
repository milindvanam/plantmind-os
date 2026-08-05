"use client";
import { useEffect } from "react";
import { Button, ErrorState } from "@/components/ui";
export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("PlantMind route error", { message: error.message, digest: error.digest });
  }, [error]);
  return (
    <div className="route-error">
      <ErrorState
        title="This PlantMind view could not be loaded"
        description={`The shared shell remains available. Reference: ${error.digest ?? "local-prototype"}`}
      />
      <Button onClick={reset}>Retry route</Button>
    </div>
  );
}
