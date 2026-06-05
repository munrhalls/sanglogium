"use client";

import { useActionState } from "react";
import { authClient } from "@/lib/auth-client";

async function requireFreshSession(): Promise<boolean> {
  const session = await authClient.getSession();
  if (!session.data?.session) {
    window.location.href = "/sign-in";
    return false;
  }
  // Better Auth computes `fresh` server-side based on freshAge (5 min).
  // Runtime property exists but client types omit it.
  const isFresh = (session.data.session as { fresh?: boolean }).fresh;
  if (!isFresh) {
    window.location.href = "/sign-in";
    return false;
  }
  return true;
}

export default function AccountActionsClient() {
  const [changeState, changeAction, changePending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const fresh = await requireFreshSession();
      if (!fresh) return { error: "Redirecting to sign in..." };

      const currentPassword = formData.get("currentPassword") as string;
      const newPassword = formData.get("newPassword") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      if (newPassword !== confirmPassword) {
        return { error: "New passwords do not match." };
      }

      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (result.error) {
        return { error: result.error.message };
      }

      return { success: true };
    },
    null
  );

  async function handleSignOut() {
    const result = await authClient.signOut();
    if (result.error) {
      alert(`Failed to sign out: ${result.error.message}`);
    } else {
      window.location.href = "/sign-in";
    }
  }

  async function handleSignOutAllDevices() {
    const fresh = await requireFreshSession();
    if (!fresh) return;

    const result = await authClient.revokeSessions();
    if (result.error) {
      alert(`Failed to sign out all devices: ${result.error.message}`);
    } else {
      window.location.href = "/sign-in";
    }
  }

  return (
    <div className="mt-8 space-y-8">
      <section>
        <h2 className="type-section-hed mb-4">Change Password</h2>

        {changeState?.error && (
          <div className="mb-4 rounded border border-error-500 bg-error-500/10 p-3 text-error-500 type-caption">
            {changeState.error}
          </div>
        )}

        {changeState?.success && (
          <div className="mb-4 rounded border border-success-500 bg-success-500/10 p-3 text-success-500 type-caption">
            Password changed successfully. All other devices have been signed out.
          </div>
        )}

        <form action={changeAction} className="space-y-4 max-w-[440px]">
          <div>
            <label htmlFor="currentPassword" className="type-caption text-text-caption mb-1 block">
              Current Password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="type-caption text-text-caption mb-1 block">
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={8}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="type-caption text-text-caption mb-1 block">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={changePending}
            className="btn-primary w-full py-3"
          >
            {changePending ? "Changing..." : "Change Password"}
          </button>
        </form>
      </section>

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
    </div>
  );
}
