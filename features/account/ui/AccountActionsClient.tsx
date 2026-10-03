"use client";

import { useEffect } from "react";
import { TwoFactorSection } from "@/features/auth";
import ChangePasswordSection from "./ChangePasswordSection";
import ProfileSection from "./ProfileSection";
import EmailSection from "./EmailSection";
import NotificationsSection from "./NotificationsSection";
import SessionsSection from "./SessionsSection";
import DangerZoneSection from "./DangerZoneSection";

export default function AccountActionsClient({
  name,
  email,
  shouldClearMergeFlag = false,
  showEmailChangedBanner = false,
  marketingEmailsOptIn = false,
  twoFactorEnabled = false,
}: {
  name: string;
  email: string;
  shouldClearMergeFlag?: boolean;
  showEmailChangedBanner?: boolean;
  marketingEmailsOptIn?: boolean;
  twoFactorEnabled?: boolean;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!shouldClearMergeFlag && !showEmailChangedBanner) return;

    const url = new URL(window.location.href);
    let changed = false;
    if (url.searchParams.get("merge") === "1") {
      url.searchParams.delete("merge");
      changed = true;
    }
    if (url.searchParams.get("emailChanged") === "true") {
      url.searchParams.delete("emailChanged");
      changed = true;
    }
    if (changed) {
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [shouldClearMergeFlag, showEmailChangedBanner]);

  return (
    <div className="mt-8 space-y-8">
      <ChangePasswordSection />
      <ProfileSection name={name} />
      <EmailSection email={email} showEmailChangedBanner={showEmailChangedBanner} />
      <NotificationsSection marketingEmailsOptIn={marketingEmailsOptIn} />
      <SessionsSection />
      <TwoFactorSection twoFactorEnabled={twoFactorEnabled} />
      <DangerZoneSection />
    </div>
  );
}
