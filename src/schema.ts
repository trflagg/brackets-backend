import {
  serial,
  varchar,
  integer,
  unique,
  pgTable,
  pgEnum,
} from "drizzle-orm/pg-core";

export const bracketStatus = pgEnum("bracketStatus", [
  "not started",
  "in progress",
  "paused",
  "complete",
]);

export const bracket = pgTable("bracket", {
  id: serial("id").primaryKey(),
  name: varchar("name"),
  status: bracketStatus("status").notNull().default("not started"),
});

export type Bracket = typeof bracket.$inferSelect;

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

export type Entrant = typeof entrant.$inferSelect;

export const winningSide = pgEnum("winningSide", ["top", "bottom"]);

export const match = pgTable("match", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull(),
  bracket: integer("bracket")
    .notNull()
    .references(() => bracket.id),
  topEntrant: integer("topEntrant").references(() => entrant.id),
  bottomEntrant: integer("bottomEntrant").references(() => entrant.id),
  topScore: integer("topScore"),
  bottomScore: integer("bottomScore"),
  winner: winningSide("winner"),
});

export type Match = typeof entrant.$inferSelect;
