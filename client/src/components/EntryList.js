import React from "react";

export default function EntryList({ entries }) {
  if (!entries.length) return <div className="text-center text-autumn-brown">No entries yet.</div>;
  return (
    <div className="space-y-4">
      {entries.map(entry => (
        <div key={entry._id} className="p-4 bg-autumn-light rounded shadow">
          <div className="text-autumn-brown mb-2">{new Date(entry.date).toLocaleString()}</div>
          <div className="text-lg">{entry.text}</div>
          {entry.aiFeedback && (
            <div className="mt-2 text-autumn-red italic">Homi: {entry.aiFeedback}</div>
          )}
        </div>
      ))}
    </div>
  );
}
