import Link from "next/link";
import { EmptyState } from "@/components/ui";
export default function NotFound() {
  return (
    <div className="route-error">
      <EmptyState
        title="Route not found"
        description="This prototype exposes only the six founder-approved product routes."
      />
      <Link className="button button-primary" href="/command">
        Return to Executive Command
      </Link>
    </div>
  );
}
