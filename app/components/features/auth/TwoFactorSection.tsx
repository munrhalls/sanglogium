"use client";

import { useState, useEffect, useTransition } from "react";
import * as QRCode from "qrcode";
import { authClient } from "@/lib/auth-client";

interface TwoFactorSectionProps {
  twoFactorEnabled: boolean;
}

export function TwoFactorSection({ twoFactorEnabled }: TwoFactorSectionProps) {
  const [isEnabled, setIsEnabled] = useState(twoFactorEnabled);
  const [step, setStep] = useState<"idle" | "setup" | "verify" | "enabled">("idle");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [totpUri, setTotpUri] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [disablePassword, setDisablePassword] = useState("");
  const [disablePending, startDisableTransition] = useTransition();
  const [showDisable, setShowDisable] = useState(false);

  useEffect(() => {
    setIsEnabled(twoFactorEnabled);
  }, [twoFactorEnabled]);

  useEffect(() => {
    if (totpUri) {
      QRCode.toDataURL(totpUri, { width: 200, margin: 2 })
        .then((url) => setQrDataUrl(url))
        .catch(() => setError("Failed to generate QR code."));
    } else {
      setQrDataUrl("");
    }
  }, [totpUri]);

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!password) return;

    startTransition(async () => {
      const result = await (authClient as any).twoFactor.enable({
        password,
        issuer: "Sang Logium",
      });
      if (result.error) {
        setError(result.error.message ?? "Failed to start 2FA setup.");
      } else {
        setTotpUri(result.data.totpURI);
        setBackupCodes(result.data.backupCodes ?? []);
        setStep("verify");
      }
    });
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!code) return;

    startTransition(async () => {
      const result = await (authClient as any).twoFactor.verifyTotp({
        code,
      });
      if (result.error) {
        setError(result.error.message ?? "Invalid code. Please try again.");
      } else {
        setIsEnabled(true);
        setStep("enabled");
        setPassword("");
        setCode("");
      }
    });
  }

  async function handleDisable(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!disablePassword) return;

    startDisableTransition(async () => {
      const result = await (authClient as any).twoFactor.disable({
        password: disablePassword,
      });
      if (result.error) {
        setError(result.error.message ?? "Failed to disable 2FA.");
      } else {
        setIsEnabled(false);
        setShowDisable(false);
        setDisablePassword("");
        setStep("idle");
        setTotpUri("");
        setBackupCodes([]);
      }
    });
  }

  if (isEnabled || step === "enabled") {
    return (
      <section className="max-w-[440px]">
        <h2 className="type-section-hed mb-4">Two-Factor Authentication</h2>

        <div className="mb-4 rounded border border-success-500 bg-success-500/10 p-3 text-success-500 type-caption">
          Two-factor authentication is enabled.
        </div>

        {error && (
          <div className="mb-4 rounded border border-error-500 bg-error-500/10 p-3 text-error-500 type-caption">
            {error}
          </div>
        )}

        {!showDisable ? (
          <button
            type="button"
            onClick={() => setShowDisable(true)}
            className="btn-secondary w-full py-3"
          >
            Disable 2FA
          </button>
        ) : (
          <form onSubmit={handleDisable} className="space-y-4">
            <div>
              <label htmlFor="disablePassword" className="type-caption text-text-caption mb-1 block">
                Current password
              </label>
              <input
                id="disablePassword"
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDisable(false)}
                className="btn-secondary flex-1 py-3"
                disabled={disablePending}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={disablePending}
                className="btn-secondary flex-1 py-3 text-error-500 border-error-500 hover:bg-error-500/10 hover:text-error-500"
              >
                {disablePending ? "Disabling..." : "Disable 2FA"}
              </button>
            </div>
          </form>
        )}
      </section>
    );
  }

  if (step === "idle") {
    return (
      <section className="max-w-[440px]">
        <h2 className="type-section-hed mb-4">Two-Factor Authentication</h2>

        {error && (
          <div className="mb-4 rounded border border-error-500 bg-error-500/10 p-3 text-error-500 type-caption">
            {error}
          </div>
        )}

        <p className="type-body text-secondary mb-4">
          Add an extra layer of security to your account by requiring a code from your authenticator app when you sign in.
        </p>

        <button
          type="button"
          onClick={() => setStep("setup")}
          className="btn-primary w-full py-3"
        >
          Set up 2FA
        </button>
      </section>
    );
  }

  if (step === "setup") {
    return (
      <section className="max-w-[440px]">
        <h2 className="type-section-hed mb-4">Set Up Two-Factor Authentication</h2>

        {error && (
          <div className="mb-4 rounded border border-error-500 bg-error-500/10 p-3 text-error-500 type-caption">
            {error}
          </div>
        )}

        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label htmlFor="setupPassword" className="type-caption text-text-caption mb-1 block">
              Current password
            </label>
            <input
              id="setupPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("idle")}
              className="btn-secondary flex-1 py-3"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary flex-1 py-3"
            >
              {isPending ? "Generating..." : "Generate QR"}
            </button>
          </div>
        </form>
      </section>
    );
  }

  // step === "verify"
  return (
    <section className="max-w-[440px]">
      <h2 className="type-section-hed mb-4">Verify Authenticator App</h2>

      {error && (
        <div className="mb-4 rounded border border-error-500 bg-error-500/10 p-3 text-error-500 type-caption">
          {error}
        </div>
      )}

      {qrDataUrl && (
        <div className="mb-4 flex justify-center">
          <img src={qrDataUrl} alt="TOTP QR code" className="rounded border border-border-primary bg-white p-2" />
        </div>
      )}

      <p className="type-body text-secondary mb-4">
        Scan the QR code with your authenticator app, then enter the code it generates.
      </p>

      {backupCodes.length > 0 && (
        <div className="mb-4 rounded border border-warning-500 bg-warning-500/10 p-3 text-warning-500 type-caption">
          <p className="font-medium mb-2">Save these backup codes somewhere safe:</p>
          <p className="mb-2">You will only see them once. Each code can be used once if you lose access to your authenticator app.</p>
          <ul className="grid grid-cols-2 gap-1 font-mono text-sm">
            {backupCodes.map((bc) => (
              <li key={bc}>{bc}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label htmlFor="totpCode" className="type-caption text-text-caption mb-1 block">
            Authenticator code
          </label>
          <input
            id="totpCode"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            maxLength={8}
            placeholder="000000"
            className="input-field"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep("idle")}
            className="btn-secondary flex-1 py-3"
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary flex-1 py-3"
          >
            {isPending ? "Verifying..." : "Enable 2FA"}
          </button>
        </div>
      </form>
    </section>
  );
}
