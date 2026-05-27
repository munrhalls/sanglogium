"use client";

export default function AuthenticatedView() {
  return (
    <div className="flex flex-col items-center">
      <div className="grid place-content-center">
        <div
          style={{ lineHeight: "16px" }}
          className="hidden items-center justify-center sm:flex"
        >
          <p className="mr-1 text-xs text-white md:text-sm">Welcome back,</p>
          <p className="text-xs font-semibold text-white md:text-sm">
            Guest
          </p>
        </div>
      </div>
    </div>
  );
}
