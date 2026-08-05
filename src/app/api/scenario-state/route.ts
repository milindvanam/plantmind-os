import { z } from "zod";
import { persistReplayState } from "@/db/replay-repository";
import { REPLAY_SPEEDS, SCENARIO_DURATION_MINUTES, SCENARIO_ID } from "@/lib/scenario";

const bodySchema = z.object({
  scenarioId: z.literal(SCENARIO_ID),
  status: z.enum(["idle", "running", "paused", "complete"]),
  elapsedMinutes: z.number().min(0).max(SCENARIO_DURATION_MINUTES),
  speed: z.union([
    z.literal(REPLAY_SPEEDS[0]),
    z.literal(REPLAY_SPEEDS[1]),
    z.literal(REPLAY_SPEEDS[2]),
    z.literal(REPLAY_SPEEDS[3])
  ]),
  updatedAt: z.string()
});

export async function PUT(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ ok: false, error: "Invalid replay state" }, { status: 400 });
  try {
    await persistReplayState(parsed.data);
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      {
        ok: false,
        persistence: "unavailable",
        message: "Replay remains available using local prototype persistence."
      },
      { status: 503 }
    );
  }
}
