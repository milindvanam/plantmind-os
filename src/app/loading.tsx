import { Skeleton } from "@/components/ui";
export default function Loading() {
  return (
    <div className="page-stack" aria-label="Loading page">
      <Skeleton width="18%" />
      <Skeleton width="52%" />
      <div className="kpi-grid">
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
      <Skeleton />
    </div>
  );
}
