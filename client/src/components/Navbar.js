import React from "react";
export default function Navbar({ user, setUser }) {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-autumn-orange shadow rounded-b-xl">
      <span className="font-bold text-autumn-brown text-xl">Homi 🍁</span>
      {user ? (
        <button
          className="bg-autumn-brown text-white px-4 py-2 rounded"
          onClick={() => setUser(null)}
        >
          Logout
        </button>
      ) : null}
    </nav>
  );
}
