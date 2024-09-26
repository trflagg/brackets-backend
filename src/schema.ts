import { serial, varchar, integer, unique, pgTable } from "drizzle-orm/pg-core";

export const bracket = pgTable("bracket", {
  id: serial("id").primaryKey(),
  name: varchar("name"),
});

export const entrant = pgTable(
  "entrant",
  {
    id: serial("id").primaryKey(),
    name: varchar("name").notNull(),
    seed: integer("seed").notNull(),
    bracket: integer("bracket")
      .notNull()
      .references(() => bracket.id),
  },
  (t) => ({
    seed_per_bracket: unique("seed_per_bracket").on(t.seed, t.bracket),
  }),
);
