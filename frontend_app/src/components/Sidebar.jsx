import { useEffect } from "react";

export default function Sidebar({ recent, onRerun, loading, columnsInfo, onShowColumns }) {
  console.log('[Sidebar] recent:', recent);
  return (
    <aside className="w-80 min-w-[260px] bg-white rounded shadow p-4 flex flex-col gap-6 h-fit sticky top-8">
      <div>
        <h2 className="font-bold text-lg mb-2">Recent Queries</h2>
        <ul className="flex flex-col gap-2">
  {recent.length === 0 && <li className="text-gray-400">No recent queries.</li>}
  {recent.map((item, idx) => (
    <li
      key={item.submission_id || item._id || idx}
      className="border border-blue-200 rounded-md bg-blue-50 mb-3 p-3"
    >
      <button
        className="w-full text-left text-base font-medium text-blue-800 hover:underline focus:underline whitespace-pre-line break-words"
        onClick={() => onRerun(item.submission_id)}
        disabled={loading}
        title={item.query}
        style={{ wordBreak: 'break-word', whiteSpace: 'pre-line' }}
      >
        {item.query}
      </button>
    </li>
  ))}
</ul>
      </div>
      <div>
        <h2 className="font-bold text-lg mb-2">Columns Info</h2>
        <button
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm"
          onClick={onShowColumns}
        >
          Show Columns
        </button>
        {columnsInfo && (
          <div className="mt-2 max-h-40 overflow-y-auto bg-gray-50 border border-gray-200 p-2 rounded text-xs">
            <ul className="list-disc pl-4">
              {columnsInfo.map((col, i) => (
                <li key={i}><span className="font-semibold">{col.name}:</span> {col.description}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
