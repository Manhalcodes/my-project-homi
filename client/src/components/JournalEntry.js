import React, { useState } from "react";

export default function JournalEntry({ user, onNewEntry }) {
  const [text, setText] = useState("");
  const [aiFeedback, setAIFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`${process.env.REACT_APP_API_URL}/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setAIFeedback(data.aiFeedback);
    onNewEntry(data.entry);
    setText("");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 bg-autumn-cream p-6 rounded-lg shadow">
      <textarea
        className="w-full p-3 rounded border border-autumn-yellow focus:outline-none focus:ring-2 focus:ring-autumn-orange"
        rows={5}
        placeholder="How are you feeling today? 🍂"
        value={text}
        onChange={e => setText(e.target.value)}
        required
      />
      <button
        type="submit"
        className="mt-3 bg-autumn-orange text-white px-6 py-2 rounded hover:bg-autumn-brown transition"
        disabled={loading}
      >
        {loading ? "Reflecting..." : "Add Entry"}
      </button>
      {aiFeedback && (
        <div className="mt-4 p-4 bg-autumn-yellow rounded text-autumn-brown shadow">
          <strong>Homi says:</strong> {aiFeedback}
        </div>
      )}
    </form>
  );
}
