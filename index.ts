import express from "express";
import { db } from "./src/db";
import { bracket } from "./src/schema";
import { eq } from "drizzle-orm";
const app = express();
const port = 3000;

app.get("/brackets", async (req, res) => {
  const result = await db.select().from(bracket);
  res.json({ result });
});

app.get("/bracket/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.send(400);
  }
  if (isNaN(+id)) {
    return res.send(400);
  }
  const result = await db
    .select({
      id: bracket.id,
      name: bracket.name,
    })
    .from(bracket)
    .where(eq(bracket.id, new Number(id) as number));
  res.json({ result });
});

app.post("/bracket", async (req, res) => {
  const result = await db
    .insert(bracket)
    .values({ name: "New bracket" })
    .returning();
  res.json({ id: result[0].id });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
