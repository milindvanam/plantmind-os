import type { Metadata } from "next";
import { PrototypePage } from "@/components/prototype-page";
export const metadata: Metadata = { title: "Executive Command" };
export default function Page() {
  return <PrototypePage kind="command" />;
}
