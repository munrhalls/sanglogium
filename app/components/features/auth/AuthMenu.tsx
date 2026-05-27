"use client";
import Link from "next/link";
import { useState } from "react";

export default function AuthMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 rounded-full bg-blue-500 text-black"
      >
        G
      </button>
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
              <button onClick={() => alert("sign out not implemented")}>Sign Out</button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
