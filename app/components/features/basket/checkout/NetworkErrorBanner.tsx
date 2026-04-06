"use client";

interface NetworkErrorBannerProps {
  message?: string;
}

export default function NetworkErrorBanner({ message = "Connection failed" }: NetworkErrorBannerProps) {
  return (
    <div className="bg-error-500/10 border border-error-500 p-3 lg-desktop:p-4 lg-touch:p-4 mb-3 lg-desktop:mb-4 lg-touch:mb-4 rounded-sm">
      <p className="type-caption lg-desktop:type-body lg-touch:type-body text-error-500">{message}</p>
    </div>
  );
}
