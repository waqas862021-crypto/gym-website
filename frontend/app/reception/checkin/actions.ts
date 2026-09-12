"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { verifyAttendanceToken } from "@/lib/auth/jwt";
import { recordAttendance, type CheckInResult } from "@/lib/attendance";
import { RECEPTION_ROLES } from "@/lib/roles";

async function requireReception() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!RECEPTION_ROLES.has(session.role)) redirect("/portal");
  return session;
}

const FAILURE_MESSAGES: Record<Exclude<CheckInResult, { ok: true }>["reason"], string> = {
  not_found: "Member not found.",
  inactive: "This account has been suspended.",
  no_membership: "No membership on file for this member.",
  expired: "This membership has expired.",
  already_checked_in: "Already checked in today.",
};

function resultRedirect(result: CheckInResult): string {
  if (result.ok) {
    return `/reception/checkin?success=${encodeURIComponent(`${result.label} checked in.`)}`;
  }
  return `/reception/checkin?error=${encodeURIComponent(FAILURE_MESSAGES[result.reason])}`;
}

export async function checkInByToken(formData: FormData) {
  await requireReception();

  const token = String(formData.get("token") ?? "").trim();
  const payload = await verifyAttendanceToken(token);
  if (!payload) {
    redirect(`/reception/checkin?error=${encodeURIComponent("Invalid QR code.")}`);
  }

  const result = await recordAttendance(payload.userId, "qr");
  revalidatePath("/reception/checkin");
  redirect(resultRedirect(result));
}

export async function checkInByUserId(formData: FormData) {
  await requireReception();

  const userId = String(formData.get("userId") ?? "");
  const result = await recordAttendance(userId, "manual");
  revalidatePath("/reception/checkin");
  redirect(resultRedirect(result));
}
