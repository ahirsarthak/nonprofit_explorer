export default function Sidebar({ recent, onRerun, loading, columnsInfo }) {
  return (
<aside className="w-96 bg-white rounded-2xl shadow p-4 flex flex-col h-[90vh] overflow-hidden">
<div className="flex-1 min-h-0 mb-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2 text-blue-700">User Activity – Recent Queries</h2>
        <ul className="flex flex-col gap-2">
          {recent.length === 0 && (
            <li className="text-gray-400">No recent queries.</li>
          )}
          {recent.map((item, idx) => (
            <li
              key={item.submission_id || item._id || idx}
              className="border border-blue-200 rounded-md bg-blue-50 mb-3 p-3"
            >
              <button
                onClick={() => onRerun(item.submission_id)}
                disabled={loading}
                className="w-full text-left text-base font-medium text-blue-800 hover:underline focus:underline whitespace-pre-line break-words"
                style={{ wordBreak: "break-word", whiteSpace: "pre-line" }}
                title={item.query}
              >
                {item.query}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 min-h-0 mt-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-2 text-blue-700">Columns Info</h2>
        <ul className="text-xs space-y-1 max-h-80 overflow-y-auto pr-2">
          {columnsInfo && columnsInfo.map((col, i) => (
            <li key={i}>
              <span className="font-semibold">{col.name}:</span> {col.description}
            </li>
          ))}
        </ul>
      </div>



    </aside>
  );
}
