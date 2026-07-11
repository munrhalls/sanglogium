"use client";

import { useState } from "react";
import { addAddress, removeAddress, updateAddress } from "./actions";
import type { Address } from "@/app/checkout/checkout.types";

const REGIONS = [
  { code: "PL", label: "Poland" },
  { code: "GB", label: "United Kingdom" },
] as const;

interface AddressesClientProps {
  addresses: (Address & { _key: string })[];
}

export default function AddressesClient({ addresses }: AddressesClientProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [addFormKey, setAddFormKey] = useState("add");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const editingAddress = addresses.find((a) => a._key === editingKey);

  async function handleSave(formData: FormData) {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    const addressKey = (formData.get("addressKey") as string) || "";
    const result = addressKey
      ? await updateAddress(addressKey, formData)
      : await addAddress(formData);

    if ("error" in result && result.error) {
      setSaveError(result.error);
    } else {
      setSaveSuccess(addressKey ? "Address updated." : "Address added.");
      if (addressKey) {
        setEditingKey(null);
      } else {
        setAddFormKey(`add-${Date.now()}`);
      }
    }

    setIsSaving(false);
  }

  async function handleRemove(formData: FormData) {
    const addressKey = (formData.get("addressKey") as string) || "";
    if (!addressKey) return;

    setRemoveError(null);
    setRemovingKey(addressKey);

    const result = await removeAddress(addressKey);
    if (result.error) {
      setRemoveError(result.error);
    }

    setRemovingKey(null);
  }

  return (
    <div className="space-y-8">
      {saveError && (
        <div className="mb-4 rounded border border-error-500 bg-error-500/10 p-3 text-error-500 type-caption">
          {saveError}
        </div>
      )}

      {saveSuccess && (
        <div className="mb-4 rounded border border-success-500 bg-success-500/10 p-3 text-success-500 type-caption">
          {saveSuccess}
        </div>
      )}

      {removeError && (
        <div className="mb-4 rounded border border-error-500 bg-error-500/10 p-3 text-error-500 type-caption">
          {removeError}
        </div>
      )}

      <section>
        <h2 className="type-section-hed mb-4">
          {editingKey ? "Edit Address" : "Add New Address"}
        </h2>

        <form
          key={editingKey ?? addFormKey}
          action={handleSave}
          className="space-y-4 max-w-[440px]"
        >
          {editingKey && (
            <input type="hidden" name="addressKey" value={editingKey} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="type-caption text-text-caption mb-1 block">
                First Name
              </label>
              <input
                name="firstName"
                type="text"
                defaultValue={editingAddress?.firstName || ""}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="type-caption text-text-caption mb-1 block">
                Last Name
              </label>
              <input
                name="lastName"
                type="text"
                defaultValue={editingAddress?.lastName || ""}
                required
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="type-caption text-text-caption mb-1 block">
              Phone Number
            </label>
            <input
              name="phone"
              type="tel"
              defaultValue={editingAddress?.phone || ""}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="type-caption text-text-caption mb-1 block">
              Country
            </label>
            <select
              name="regionCode"
              defaultValue={editingAddress?.regionCode || ""}
              required
              className="input-select w-full"
            >
              <option value="" disabled>
                Select country
              </option>
              {REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="type-caption text-text-caption mb-1 block">
              City
            </label>
            <input
              name="city"
              type="text"
              defaultValue={editingAddress?.city || ""}
              required
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
            <div>
              <label className="type-caption text-text-caption mb-1 block">
                Street
              </label>
              <input
                name="street"
                type="text"
                defaultValue={editingAddress?.street || ""}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="type-caption text-text-caption mb-1 block">
                Number
              </label>
              <input
                name="streetNumber"
                type="text"
                defaultValue={editingAddress?.streetNumber || ""}
                required
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="type-caption text-text-caption mb-1 block">
              Postal Code
            </label>
            <input
              name="postalCode"
              type="text"
              defaultValue={editingAddress?.postalCode || ""}
              required
              className="input-field"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary flex-1 py-3"
            >
              {isSaving
                ? editingKey
                  ? "Saving..."
                  : "Adding..."
                : editingKey
                ? "Update Address"
                : "Add Address"}
            </button>

            {editingKey && (
              <button
                type="button"
                onClick={() => {
                  setEditingKey(null);
                  setSaveError(null);
                  setSaveSuccess(null);
                }}
                className="btn-secondary py-3 px-4"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <h2 className="type-section-hed mb-4">Saved Addresses</h2>

        {addresses.length === 0 ? (
          <p className="text-gray-500">No saved addresses yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div key={address._key} className="card-base p-4">
                <p className="font-medium">
                  {address.firstName} {address.lastName}
                </p>
                <p className="text-sm text-gray-600">{address.phone}</p>
                <p className="text-sm text-gray-600">
                  {address.street} {address.streetNumber}
                </p>
                <p className="text-sm text-gray-600">
                  {address.postalCode} {address.city}
                </p>
                <p className="text-sm text-gray-600">
                  {REGIONS.find((r) => r.code === address.regionCode)?.label ||
                    address.regionCode}
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingKey(address._key);
                      setSaveError(null);
                      setSaveSuccess(null);
                    }}
                    className="btn-secondary py-2 px-4"
                  >
                    Edit
                  </button>

                  <form action={handleRemove} className="inline">
                    <input type="hidden" name="addressKey" value={address._key} />
                    <button
                      type="submit"
                      disabled={removingKey === address._key}
                      className="btn-secondary py-2 px-4"
                    >
                      {removingKey === address._key ? "Removing..." : "Remove"}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
