import { Suspense } from "react";
import { addTodo, toggleTodo, deleteTodo } from "./actions";

const API = process.env.API_URL ?? "http://localhost:4000";

async function TodoList() {
  const res = await fetch(`${API}/api/todos`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load todos");
  const todos = await res.json();

  if (todos.length === 0) {
    return <p className="empty">No todos yet.</p>;
  }

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id} className={todo.completed ? "done" : ""}>
          <form action={toggleTodo.bind(null, todo.id, !todo.completed)}>
            <button
              type="submit"
              className="toggle"
              aria-label={todo.completed ? "Mark as not done" : "Mark as done"}
            >
              {todo.completed ? "✓" : "○"}
            </button>
          </form>
          <span>{todo.title}</span>
          <form action={deleteTodo.bind(null, todo.id)}>
            <button type="submit" className="delete">
              Delete
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <main className="container">
      <h1>Todo App</h1>

      <form action={addTodo} className="add">
        <input name="title" placeholder="What needs doing?" required />
        <button type="submit">Add</button>
      </form>

      <Suspense fallback={<p className="empty">Loading…</p>}>
        <TodoList />
      </Suspense>
    </main>
  );
}
