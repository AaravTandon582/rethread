import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Aggregate counters only: no photographs, keys, or visitor identifiers.
export const generationUsage = sqliteTable('generation_usage', {
  day: text('day').primaryKey(),
  attempts: integer('attempts').notNull(),
  minute: integer('minute').notNull(),
  minuteAttempts: integer('minute_attempts').notNull(),
});
