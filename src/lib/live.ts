import { connection } from "next/server";

export async function live() {
  await connection();
}
