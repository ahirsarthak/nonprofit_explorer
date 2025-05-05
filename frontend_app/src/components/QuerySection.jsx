import { useState } from "react";
import QuerySuggestions from "./QuerySuggestions";

export default function QuerySection({ onSubmit, loading }) {
  const [query, setQuery] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query);
      setQuery(""); 
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-2 bg-white p-4 rounded-xl shadow-lg border border-gray-200 mb-2"
    >
      <QuerySuggestions onPick={(q) => setQuery(q)} />

      <div className="w-full flex flex-row gap-2">
        <textarea
          className="flex-1 min-h-[64px] border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y bg-gray-50"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe the nonprofit data you want to see…"
          disabled={loading}
        />
        <button
          type="submit"
          className="px-5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow disabled:opacity-50 whitespace-nowrap"
          disabled={loading || !query.trim()}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
}
