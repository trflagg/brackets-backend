import express from "express";
import bodyParser from "body-parser";

import { db } from "./src/db";
import { bracket, Entrant, entrant } from "./src/schema";
import { eq } from "drizzle-orm";
const app = express();
app.use(bodyParser.json());
const port = 3000;

app.get("/brackets", async (req, res) => {
  const result = await db.select().from(bracket);
  res.json({ result });
});

app.get("/bracket/:id", async (req, res) => {
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
    return [];
  }

  const aggregatedResult = {
    id: result?.[0]?.id,
    name: result?.[0]?.name,
    entrants: [] as (Entrant | null)[],
  };
  aggregatedResult.entrants = result.map((r) => r.entrants);

  res.json({ result: aggregatedResult });
});

app.post("/bracket", async (req, res) => {
  const { name, size } = req.body;
  if (!name || !size) {
    return res.sendStatus(400);
  }
  const result = await db.insert(bracket).values({ name, size }).returning();
  res.json({ id: result[0].id });
});

app.post("/entrant", async (req, res) => {
  const { name, seed, bracket } = req.body;
  if (!name || !seed || !bracket) {
    return res.sendStatus(400);
  }
  try {
    const result = await db
      .insert(entrant)
      .values({ name, seed, bracket })
      .returning();
    res.json({ id: result[0].id });
  } catch (e) {
    console.error(e);
    return res.sendStatus(400);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
