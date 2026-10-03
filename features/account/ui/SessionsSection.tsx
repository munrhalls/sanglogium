"use client";

import { signOut, signOutAllDevices } from "@/features/auth";

export default function SessionsSection() {
  async function handleSignOut() {
    await signOut();
  }

  async function handleSignOutAllDevices() {
    await signOutAllDevices();
  }

  return (
    <section>
      <h2 className="type-section-hed mb-4">Session Management</h2>
      <div className="space-y-3 max-w-[440px]">
        <button
          type="button"
          onClick={handleSignOut}
          className="btn-secondary w-full py-3"
        >
          Sign Out
        </button>
        <button
          type="button"
          onClick={handleSignOutAllDevices}
          className="btn-secondary w-full py-3"
        >
          Sign Out All Devices
        </button>
      </div>
    </section>
  );
}
