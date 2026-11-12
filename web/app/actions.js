"use server";

import { revalidatePath } from "next/cache";

const API = process.env.API_URL ?? "http://localhost:4000";

async function call(path, options) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
}

export async function addTodo(formData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  await call("/api/todos", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
  revalidatePath("/");
}

export async function toggleTodo(id, completed) {
  await call(`/api/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ completed }),
  });
  revalidatePath("/");
}

export async function deleteTodo(id) {
  await call(`/api/todos/${id}`, { method: "DELETE" });
  revalidatePath("/");
}
