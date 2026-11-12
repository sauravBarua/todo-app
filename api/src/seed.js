import { pool } from "./db.js";

const todos = [
  { title: "Set up PostgreSQL with Docker", completed: true },
  { title: "Build the Express API", completed: true },
  { title: "Add seed data", completed: true },
  { title: "Build the Next.js frontend", completed: false },
  { title: "Write Dockerfiles", completed: false },
  { title: "Set up GitHub Actions", completed: false },
  { title: "Deploy to the VPS", completed: false },
  { title: "Buy groceries", completed: false },
];

const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("TRUNCATE todos RESTART IDENTITY");
  for (const todo of todos) {
    await client.query("INSERT INTO todos (title, completed) VALUES ($1, $2)", [
      todo.title,
      todo.completed,
    ]);
  }
  await client.query("COMMIT");
  console.log(`Seeded ${todos.length} todos`);
} catch (err) {
  await client.query("ROLLBACK");
  console.error("Seeding failed:", err);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
