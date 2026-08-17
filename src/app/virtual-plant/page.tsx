import type { Metadata } from "next";
import { VirtualFactory } from "@/features/pm01/ui/virtual-factory";

export const metadata: Metadata = { title: "PM-01 Virtual Factory" };

export default function Page() {
  return <VirtualFactory />;
}
