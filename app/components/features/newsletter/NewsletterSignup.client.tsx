"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    // TODO: wire to newsletter API when available
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="Your email address"
          aria-label="Email address"
          className="input-base w-64"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "submitting"}
        />
        <button
          type="submit"
          className="btn-primary px-6 py-2"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "..." : "Subscribe"}
        </button>
      </div>
      {status === "success" && (
        <p className="type-caption text-brand-400 mt-2">Thanks for subscribing!</p>
      )}
    </form>
  );
}
