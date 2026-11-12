import express from "express";
import { pool } from "./db.js";

const app = express();
app.use(express.json());

const parseId = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

app.get("/health", async (_req, res) => {
  await pool.query("SELECT 1");
  res.json({ status: "ok" });
});

app.get("/api/todos", async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM todos ORDER BY id");
  res.json(rows);
});

app.post("/api/todos", async (req, res) => {
  const title = req.body?.title;
  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "title is required" });
  }
  const {
    rows,
  } = await pool.query("INSERT INTO todos (title) VALUES ($1) RETURNING *", [
    title.trim(),
  ]);
  res.status(201).json(rows[0]);
});

app.patch("/api/todos/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "invalid id" });

  const { title, completed } = req.body ?? {};
  if (
    title !== undefined &&
    (typeof title !== "string" || title.trim() === "")
  ) {
    return res.status(400).json({ error: "title must be a non-empty string" });
  }
  if (completed !== undefined && typeof completed !== "boolean") {
    return res.status(400).json({ error: "completed must be a boolean" });
  }

  const { rows } = await pool.query(
    `UPDATE todos
     SET title = COALESCE($1, title),
         completed = COALESCE($2, completed)
     WHERE id = $3
     RETURNING *`,
    [title?.trim() ?? null, completed ?? null, id],
  );
  if (rows.length === 0)
    return res.status(404).json({ error: "todo not found" });
  res.json(rows[0]);
});

app.delete("/api/todos/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: "invalid id" });

  const { rowCount } = await pool.query("DELETE FROM todos WHERE id = $1", [
    id,
  ]);
  if (rowCount === 0) return res.status(404).json({ error: "todo not found" });
  res.status(204).end();
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "internal server error" });
});

const port = process.env.PORT ?? 4000;
app.listen(port, () =>
  console.log(`API listening on http://localhost:${port}`),
);
