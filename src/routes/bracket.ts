import express from "express";
import { eq } from "drizzle-orm";

import { db } from "../db";
import { bracket, Entrant, entrant } from "../schema";

export const bracketRoutes = express.Router();

bracketRoutes.get("/", async (_req, res) => {
  const result = await db.select().from(bracket);
  res.json({ result });
});

bracketRoutes.post("/", async (req, res) => {
  const { name, size } = req.body;
  if (!name || !size) {
    return res.sendStatus(400);
  }
  const result = await db.insert(bracket).values({ name, size }).returning();
  res.json({ id: result[0].id });
});

bracketRoutes.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.sendStatus(400);
  }
  if (isNaN(+id)) {
    return res.sendStatus(400);
  }
  const result = await db
    .select({
      id: bracket.id,
      name: bracket.name,
      size: bracket.size,
      status: bracket.status,
      entrants: {
        id: entrant.id,
        name: entrant.name,
        seed: entrant.seed,
        bracket: entrant.bracket,
      },
    })
    .from(bracket)
    .where(eq(bracket.id, new Number(id) as number))
    .fullJoin(entrant, eq(bracket.id, entrant.bracket));

  if (result.length < 1) {
    return res.json([]);
  }

  const aggregatedResult = {
    id: result?.[0]?.id,
    name: result?.[0]?.name,
    size: result?.[0]?.size,
    status: result?.[0]?.status,
    entrants: [] as (Entrant | null)[],
  };
  aggregatedResult.entrants = result.map((r) => r.entrants);

  res.json({ result: aggregatedResult });
});
//
// start a new bracket:
// take power of 2 < size -> new size
// sort entrants by seed,
// make sure we have enough entrants
// take top size number of entrants
// reseed to make sure seeds are 1-size
// make matches
// place entrants into correct sides of matches
