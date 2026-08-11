import { notFound } from "next/navigation";
import { SectorJourneyView } from "@/features/vision/vision-components";
import { sectorJourneys } from "@/features/vision/vision-data";
export function generateStaticParams() {
  return sectorJourneys.map(({ slug }) => ({ sector: slug }));
}
export default async function Page({ params }: { params: Promise<{ sector: string }> }) {
  const { sector } = await params;
  const journey = sectorJourneys.find((item) => item.slug === sector);
  if (!journey) notFound();
  return <SectorJourneyView journey={journey} />;
}
