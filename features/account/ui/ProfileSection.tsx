"use client";

import { useActionState } from "react";
import { updateName } from "@/features/account/commands/updateName";

export default function ProfileSection({ name }: { name: string }) {
  const [nameState, nameAction, namePending] = useActionState(
    async (_prevState: unknown, formData: FormData) => updateName(formData),
    null
  );

  return (
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
  );
}
