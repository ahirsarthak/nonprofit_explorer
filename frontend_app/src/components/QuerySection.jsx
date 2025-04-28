import { useState } from "react";

export default function QuerySection({ onSubmit, loading }) {
  const [query, setQuery] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) onSubmit(query);
  }

  return (
    <form
      className="w-full flex flex-col items-center gap-4 bg-white p-6 rounded shadow mb-4"
      onSubmit={handleSubmit}
    >
      <textarea
        className="w-full max-w-2xl min-h-[64px] border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y bg-gray-50"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Type your SQL or natural language query..."
        disabled={loading}
      />
      <button
        type="submit"
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow disabled:opacity-50"
        disabled={loading || !query.trim()}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
