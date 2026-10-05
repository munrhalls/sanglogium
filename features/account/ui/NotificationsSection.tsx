"use client";

import { useActionState } from "react";
import { updatePreferences } from "@/features/account/commands/updatePreferences";

export default function NotificationsSection({
  marketingEmailsOptIn = false,
}: {
  marketingEmailsOptIn?: boolean;
}) {
  const [preferenceState, preferenceAction, preferencePending] = useActionState(
    async (_prevState: unknown, formData: FormData) => updatePreferences(formData),
    null
  );

  return (
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
  );
}
