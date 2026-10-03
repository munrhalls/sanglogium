"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { signOut } from "@/features/auth";
import { requireFreshSession } from "./requireFreshSession";

export default function DangerZoneSection() {
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
  );
}
