"use client";

import { useActionState, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { TwoFactorSection } from "@/app/components/features/auth/TwoFactorSection";
import { updateName, updatePreferences } from "./actions";
import { signOut, signOutAllDevices } from "@/app/hooks/useSignOut";

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

export default function AccountActionsClient({
  name,
  shouldClearMergeFlag = false,
  marketingEmailsOptIn = false,
  twoFactorEnabled = false,
}: {
  name: string;
  shouldClearMergeFlag?: boolean;
  marketingEmailsOptIn?: boolean;
  twoFactorEnabled?: boolean;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!shouldClearMergeFlag) return;

    const url = new URL(window.location.href);
    if (url.searchParams.get("merge") === "1") {
      url.searchParams.delete("merge");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [shouldClearMergeFlag]);

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

  const [nameState, nameAction, namePending] = useActionState(
    async (_prevState: unknown, formData: FormData) => updateName(formData),
    null
  );
  const [preferenceState, preferenceAction, preferencePending] = useActionState(
    async (_prevState: unknown, formData: FormData) => updatePreferences(formData),
    null
  );

  async function handleSignOut() {
    await signOut();
  }

  async function handleSignOutAllDevices() {
    await signOutAllDevices();
  }

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDeleteClick() {
    const fresh = await requireFreshSession();
    if (!fresh) return;
    setShowDeleteConfirm(true);
    setDeleteError(null);
  }

  async function handleDeleteSubmit(formData: FormData) {
    setIsDeleting(true);
    setDeleteError(null);

    const fresh = await requireFreshSession();
    if (!fresh) {
      setIsDeleting(false);
      return;
    }

    const password = formData.get("password") as string;

    const result = await authClient.deleteUser({ password });

    if (result.error) {
      setDeleteError(result.error.message ?? null);
      setIsDeleting(false);
      return;
    }

    await signOut();
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
        <h2 className="type-section-hed mb-4">Profile</h2>

        {nameState?.error && (
          <div className="mb-4 rounded border border-error-500 bg-error-500/10 p-3 text-error-500 type-caption">
            {nameState.error}
          </div>
        )}

        {nameState?.success && (
          <div className="mb-4 rounded border border-success-500 bg-success-500/10 p-3 text-success-500 type-caption">
            Name updated successfully.
          </div>
        )}

        <form action={nameAction} className="space-y-4 max-w-[440px]">
          <div>
            <label htmlFor="name" className="type-caption text-text-caption mb-1 block">
              Display Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={nameState?.name ?? name}
              required
              className="input-field"
              key={nameState?.name ?? name}
            />
          </div>

          <button
            type="submit"
            disabled={namePending}
            className="btn-primary w-full py-3"
          >
            {namePending ? "Saving..." : "Update Name"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="type-section-hed mb-4">Notifications</h2>

        {preferenceState?.error && (
          <div className="mb-4 rounded border border-error-500 bg-error-500/10 p-3 text-error-500 type-caption">
            {preferenceState.error}
          </div>
        )}

        {preferenceState?.success && (
          <div className="mb-4 rounded border border-success-500 bg-success-500/10 p-3 text-success-500 type-caption">
            Notification preferences saved.
          </div>
        )}

        <form action={preferenceAction} className="space-y-4 max-w-[440px]">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="marketingEmailsOptIn"
              value="on"
              defaultChecked={preferenceState?.marketingEmailsOptIn ?? marketingEmailsOptIn}
              key={String(preferenceState?.marketingEmailsOptIn ?? marketingEmailsOptIn)}
              className="mt-1 h-5 w-5 rounded border-border-primary bg-surface-elevated text-brand-400 focus:ring-brand-400 focus:ring-offset-0"
            />
            <span className="type-body">
              Send me marketing emails about new products, offers, and promotions
            </span>
          </label>

          <button
            type="submit"
            disabled={preferencePending}
            className="btn-primary w-full py-3"
          >
            {preferencePending ? "Saving..." : "Save Preferences"}
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

      <TwoFactorSection twoFactorEnabled={twoFactorEnabled} />

      <section className="border border-error-500 rounded p-4 max-w-[440px]">
        <h2 className="type-section-hed mb-4 text-error-500">Danger Zone</h2>

        <div className="space-y-4">
          <a
            href="/api/account/export"
            download="sang-logium-export.json"
            className="btn-secondary w-full py-3 block text-center"
          >
            Export my data
          </a>

          <div>
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="btn-secondary w-full py-3 text-error-500 border-error-500 hover:bg-error-500/10 hover:text-error-500"
              >
                Delete my account
              </button>
            ) : (
              <form action={handleDeleteSubmit} className="space-y-4">
                <p className="text-sm text-error-500">
                  This action cannot be undone. Enter your password to confirm.
                </p>

                {deleteError && (
                  <div className="rounded border border-error-500 bg-error-500/10 p-3 text-error-500 type-caption">
                    {deleteError}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="deletePassword"
                    className="type-caption text-text-caption mb-1 block"
                  >
                    Password
                  </label>
                  <input
                    id="deletePassword"
                    name="password"
                    type="password"
                    required
                    className="input-field"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="btn-secondary flex-1 py-3"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeleting}
                    className="btn-secondary flex-1 py-3 bg-error-500 text-white border-error-500 hover:bg-error-700 hover:text-white"
                  >
                    {isDeleting ? "Deleting..." : "Delete account"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
