import "server-only";
import { sql } from "@/lib/db";

export type Trainer = {
  id: string;
  name: string;
  specialty: string;
  bio: string | null;
};

export async function getActiveTrainers(): Promise<Trainer[]> {
  const { rows } = await sql`
    select id, name, specialty, bio from trainers
    where is_active = true
    order by created_at
  `;
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    bio: row.bio,
  }));
}
