"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { bookClass, cancelBooking, type BookClassResult } from "@/lib/bookings";
import { sendAndLogEmail } from "@/lib/email";

const FAILURE_MESSAGES: Record<Exclude<BookClassResult, { ok: true }>["reason"], string> = {
  not_found: "Account not found.",
  inactive: "This account has been suspended.",
  no_membership: "You need an active membership to book a class.",
  expired: "Your membership has expired. Renew to book a class.",
  class_not_found: "That class no longer exists.",
  class_full: "That class is fully booked.",
  already_booked: "You've already booked this class.",
};

export async function bookClassAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const classId = String(formData.get("classId") ?? "");
  const result = await bookClass(session.userId, classId);
  revalidatePath("/portal");

  if (!result.ok) {
    redirect(`/portal?error=${encodeURIComponent(FAILURE_MESSAGES[result.reason])}`);
  }

  await sendAndLogEmail(
    session.email,
    "Class booked — Goodlife Fitness Gym",
    `You're booked into ${result.className}. See you there!`,
    "booking_confirmation",
  );

  redirect(`/portal?booked=${encodeURIComponent(result.className)}`);
}

export async function cancelBookingAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const classId = String(formData.get("classId") ?? "");
  await cancelBooking(session.userId, classId);
  revalidatePath("/portal");
}
