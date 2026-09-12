"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSessionToken } from "@/lib/auth/jwt";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { sendAndLogEmail } from "@/lib/email";
import type { AppRole } from "@/lib/roles";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_RE.test(email) || password.length < 6) {
    redirect(
      `/signup?error=${encodeURIComponent(
        "Enter a valid email and a password of at least 6 characters.",
      )}`,
    );
  }

  const { rows: existing } = await sql`select id from users where email = ${email}`;
  if (existing.length > 0) {
    redirect(`/signup?error=${encodeURIComponent("An account with that email already exists.")}`);
  }

  const id = randomUUID();
  const passwordHash = await hashPassword(password);

  await sql`
    insert into users (id, email, password_hash, role)
    values (${id}, ${email}, ${passwordHash}, 'member')
  `;

  await sendAndLogEmail(
    email,
    "Welcome to Goodlife Fitness Gym",
    "Thanks for signing up! You can manage your membership, payments, and profile anytime from your member portal.",
    "welcome",
  );

  const token = await createSessionToken({ userId: id, email, role: "member" });
  await setSessionCookie(token);
  redirect("/portal");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const { rows } = await sql`
    select id, email, password_hash, role, is_active from users where email = ${email}
  `;
  const user = rows[0];

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    redirect(`/login?error=${encodeURIComponent("Invalid email or password.")}`);
  }

  if (!user.is_active) {
    redirect(`/login?error=${encodeURIComponent("This account has been suspended. Contact reception.")}`);
  }

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role as AppRole,
  });
  await setSessionCookie(token);
  redirect("/portal");
}

export async function signOut() {
  await clearSessionCookie();
  redirect("/");
}
