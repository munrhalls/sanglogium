"use client";

import { useActionState } from "react";
import { changeEmail, requireFreshSession } from "@/features/auth";

export default function EmailSection({
  email,
  showEmailChangedBanner = false,
}: {
  email: string;
  showEmailChangedBanner?: boolean;
}) {
  const [emailState, emailAction, emailPending] = useActionState(
    async (_prevState: unknown, formData: FormData) => {
      const fresh = await requireFreshSession();
      if (!fresh) return { error: "Redirecting to sign in..." };

      const newEmail = (formData.get("newEmail") as string)?.trim();
      if (!newEmail) return { error: "Email cannot be empty." };

      const result = await changeEmail({
        newEmail,
        callbackURL: "/account?emailChanged=true",
      });

      if (result.error) {
        return { error: result.error.message };
      }

      return { success: true };
    },
    null
  );

  return (
    <section>
      <h2 className="type-section-hed mb-4">Email Address</h2>

      {showEmailChangedBanner && (
        <div className="mb-4 rounded border border-success-500 bg-success-500/10 p-3 text-success-500 type-caption">
          Your email address has been updated.
        </div>
      )}

      {emailState?.error && (
        <div className="mb-4 rounded border border-error-500 bg-error-500/10 p-3 text-error-500 type-caption">
          {emailState.error}
        </div>
      )}

      {emailState?.success && (
        <div className="mb-4 rounded border border-success-500 bg-success-500/10 p-3 text-success-500 type-caption">
          Check your new inbox to confirm the change. Your email won&apos;t update until you click the confirmation link.
        </div>
      )}

      <p className="type-body text-text-caption mb-4">Current: {email}</p>

      <form action={emailAction} className="space-y-4 max-w-[440px]">
        <div>
          <label htmlFor="newEmail" className="type-caption text-text-caption mb-1 block">
            New Email
          </label>
          <input
            id="newEmail"
            name="newEmail"
            type="email"
            required
            className="input-field"
          />
        </div>

        <button
          type="submit"
          disabled={emailPending}
          className="btn-primary w-full py-3"
        >
          {emailPending ? "Requesting..." : "Change Email"}
        </button>
      </form>
    </section>
  );
}
