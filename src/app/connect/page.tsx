import type { Metadata } from "next";
import { BetaIntegrationWorkspace } from "@/features/integrations/beta-integration-workspace";

export const metadata: Metadata = { title: "Connect a Plant" };

export default function Page() {
  return <BetaIntegrationWorkspace />;
}
