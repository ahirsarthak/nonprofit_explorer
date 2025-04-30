export default function ColumnsModal({ columnsInfo, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>
        <h2 className="text-lg font-bold mb-4">Columns Information</h2>
        <div className="max-h-80 overflow-y-auto">
          <ul className="list-disc pl-4">
            {columnsInfo.map((col, i) => (
              <li key={i} className="mb-2">
                <span className="font-semibold">{col.name}:</span> {col.description}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
