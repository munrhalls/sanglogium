"use client";

import { useAuthHintSync } from "@/features/auth/state/authHint";

export default function AuthHintSync() {
  useAuthHintSync();
  return null;
}
