import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { auditEvents, scenarios, scenarioStates } from "@/db/schema";
import { getStageAt, SCENARIO_ID, type ReplayState } from "@/lib/scenario";

export async function persistReplayState(state: ReplayState) {
  const db = getDb();
  const [scenario] = await db
    .select({ id: scenarios.id, tenantId: scenarios.tenantId, siteId: scenarios.siteId })
    .from(scenarios)
    .where(eq(scenarios.slug, SCENARIO_ID))
    .limit(1);
  if (!scenario) throw new Error("Scenario fixture is not seeded");
  const stage = getStageAt(state.elapsedMinutes);
  await db.transaction(async (tx) => {
    await tx
      .insert(scenarioStates)
      .values({
        scenarioId: scenario.id,
        status: state.status,
        elapsedMinutes: state.elapsedMinutes,
        speed: state.speed,
        currentStageKey: stage.id,
        lastActor: "demo-user"
      })
      .onConflictDoUpdate({
        target: scenarioStates.scenarioId,
        set: {
          status: state.status,
          elapsedMinutes: state.elapsedMinutes,
          speed: state.speed,
          currentStageKey: stage.id,
          lastActor: "demo-user",
          updatedAt: new Date()
        }
      });
    await tx.insert(auditEvents).values({
      tenantId: scenario.tenantId,
      siteId: scenario.siteId,
      scenarioId: scenario.id,
      actorType: "user",
      actorId: "demo-user",
      eventType: "scenario.state.persisted",
      entityType: "scenario",
      entityId: scenario.id,
      detail: {
        status: state.status,
        elapsedMinutes: state.elapsedMinutes,
        speed: state.speed,
        stage: stage.id
      }
    });
  });
}
