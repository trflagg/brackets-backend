import express from "express";
import { eq } from "drizzle-orm";

import { db } from "../db";
import { bracket, Entrant, entrant, match } from "../schema";

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

function highestPowerOfTwo(size: number): number {
  if (size < 1) return 0;
  let power = 1;
  // Keep multiplying power by 2 until it exceeds size
  while (power * 2 <= size) {
    power *= 2;
  }
  return power;
}

bracketRoutes.post("/:id/start", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.sendStatus(400);
  }
  if (isNaN(+id)) {
    return res.sendStatus(400);
  }
  // get bracket
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
  const foundBracket = result[0];
  if (foundBracket.status !== "not started") {
    console.error(`bracket is already started`);
    return res.sendStatus(500);
  }
  if (!foundBracket.size) {
    console.error(`bracket ${foundBracket.id} size is null`);
    return res.sendStatus(500);
  }

  // start a new bracket:
  // take power of 2 < size -> new size
  const newSize = highestPowerOfTwo(foundBracket.size);
  let entrants = result.map((r) => r.entrants);
  // make sure we have enough entrants
  if (entrants.length < newSize) {
    console.error(
      `not enough entrants for bracket ${id}. Need at least ${newSize}`,
    );
    return res.sendStatus(500);
  }

  // update bracket status
  await db
    .update(bracket)
    .set({ status: "in progress", size: newSize })
    .where(eq(bracket.id, new Number(id) as number));

  // sort entrants by seed,
  entrants.sort((a, b) => (a?.seed || 0) - (b?.seed || 0));

  // make matches
  // use pointers to track which seeded entrants go into which matches
  // e.g. 1 plays 8 in first match, 2 plays 7, etc.
  // topPointer starts at low seed and moves up
  // bottomPointer starts at high seed and moves down
  let topPointer = 0;
  let bottomPointer = entrants.length - 1;
  for (let i = 1; i <= newSize - 1; i++) {
    if (foundBracket?.id) {
      let topEntrantId = null;
      let bottomEntrantId = null;
      // only set entrants for first newSize / 2 matches
      if (topPointer < bottomPointer) {
        topEntrantId = entrants[topPointer]?.id;
        bottomEntrantId = entrants[bottomPointer]?.id;
      }
      await db.insert(match).values({
        number: i,
        bracket: foundBracket.id,
        topEntrant: topEntrantId,
        bottomEntrant: bottomEntrantId,
      });
    }
    topPointer++;
    bottomPointer--;
  }

  return res.sendStatus(200);
});
