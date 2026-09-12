import "server-only";
import { sql } from "@vercel/postgres";

// Vercel injects POSTGRES_URL automatically once a Postgres database is
// linked to this project — no manual env var copying needed for this part.
export { sql };
