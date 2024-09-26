import { serial, varchar, pgTable } from "drizzle-orm/pg-core";

export const bracket = pgTable("bracket", {
  id: serial("id").primaryKey(),
  name: varchar("name"),
});
