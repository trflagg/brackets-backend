import express from "express";
import bodyParser from "body-parser";

import { db } from "./src/db";
import { bracket, Entrant, entrant } from "./src/schema";
import { eq } from "drizzle-orm";
import { bracketRoutes } from "./src/routes/bracket";
const app = express();
app.use(bodyParser.json());
const port = 3000;

app.use("/bracket", bracketRoutes);

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
