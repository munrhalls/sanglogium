"use client";
// import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

export default function AuthMenu() {
  // const { user, isLoaded } = useUser();
  // const { signOut } = useClerk();
  const user = null; // DISABLED CLERK
  const isLoaded = true; // DISABLED CLERK
  const signOut = () => {}; // DISABLED CLERK
  const [isOpen, setIsOpen] = useState(false);

  // Handle logout: clear both Clerk session AND Stripe Link session
  const handleSignOut = async () => {
    try {
      // CRITICAL: Clear Stripe Link session data from browser storage
      // Stripe Link stores authentication in localStorage/sessionStorage
      // We need to clear it to prevent saved payment methods from persisting
      if (typeof window !== "undefined") {
        // Clear any Stripe-related storage
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("stripe") || key.includes("Link")) {
            localStorage.removeItem(key);
          }
        });
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith("stripe") || key.includes("Link")) {
            sessionStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error("Error clearing Stripe session:", error);
      // Continue with logout even if storage clearing fails
    } finally {
      // Always sign out from Clerk
      await signOut({ redirectUrl: "/" });
    }
  };

  if (!isLoaded) return <div>Loading...</div>;
  return (
    <>
      {}
      <button
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 rounded-full bg-blue-500 text-black"
      >
        {user?.firstName?.[0] || "G"}
      </button>
      {}
      {isOpen && (
        <div className="fixed right-0 top-0 h-full w-64 bg-white text-black shadow-lg">
          <button onClick={() => setIsOpen(false)}>Close</button>
          <div>
            <p>Welcome, Guest!</p>
            <button className="flex w-full items-center space-x-2 rounded p-2 text-left hover:bg-gray-100">
              <span>Manage Account</span>
            </button>
            <nav>
              <Link href="/orders">Orders</Link>
              <button onClick={() => alert("init chat")}>Open Chat</button>
              <button onClick={handleSignOut}>Sign Out</button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
