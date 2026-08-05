import type { Metadata } from "next";
import { PrototypePage } from "@/components/prototype-page";
export const metadata: Metadata = { title: "Investigation · INV-204" };
export default function Page() {
  return <PrototypePage kind="investigation" />;
}
