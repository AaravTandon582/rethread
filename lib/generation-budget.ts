export const DAILY_GENERATION_LIMIT = 25;
export const MINUTE_GENERATION_LIMIT = 3;

/** A single atomic D1 statement enforces the shared budget across all Workers. */
export async function reserveGeneration(db: D1Database, now = new Date()): Promise<boolean> {
  const day = now.toISOString().slice(0, 10);
  const minute = Math.floor(now.getTime() / 60_000);
  const reservation = await db.prepare(`
    INSERT INTO generation_usage (day, attempts, minute, minute_attempts)
    VALUES (?, 1, ?, 1)
    ON CONFLICT(day) DO UPDATE SET
      attempts = generation_usage.attempts + 1,
      minute = excluded.minute,
      minute_attempts = CASE WHEN generation_usage.minute = excluded.minute
        THEN generation_usage.minute_attempts + 1 ELSE 1 END
    WHERE generation_usage.attempts < ?
      AND (generation_usage.minute != excluded.minute OR generation_usage.minute_attempts < ?)
    RETURNING day
  `).bind(day, minute, DAILY_GENERATION_LIMIT, MINUTE_GENERATION_LIMIT).first();
  return Boolean(reservation);
}
