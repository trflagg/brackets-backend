import express from "express";
import { db } from "./src/db";
import { bracket } from "./src/schema";
const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  const result = await db.select().from(bracket);
  res.json({ result });
});

app.get("/new", async (req, res) => {
  const result = await db
    .insert(bracket)
    .values({ name: "New tourney" })
    .returning();
  res.json({ id: result[0].id });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
