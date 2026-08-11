import type { Metadata } from "next";
import { ConnectPage } from "@/features/vision/vision-pages";
export const metadata: Metadata = { title: "Connect" };
export default function Page() {
  return <ConnectPage />;
}
