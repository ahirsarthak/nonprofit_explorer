import { useMemo, useRef, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

export default function ResponseSection({ data, error, loading, onDownload, onClear, sql }) {
  const tableRef = useRef(null);

  // Extract columns dynamically
  const columns = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return Object.keys(data[0]).map((key) => ({
      accessorKey: key,
      header: key,
    }));
  }, [data]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data: Array.isArray(data) ? data : [],
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full bg-white rounded shadow p-6 mt-4">

      {/* Loading */}
      {loading && (
        <div className="text-center text-blue-500 font-semibold">Loading...</div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 text-red-700 p-4 rounded overflow-x-auto mb-4 whitespace-pre-wrap border border-red-200">
          {error.error || JSON.stringify(error, null, 2)}
        </div>
      )}

      {/* Table Display */}
      {Array.isArray(data) && data.length > 0 && (
        <>
          {/* SQL Query shown */}
          {sql && (
            <div className="mb-4 flex items-center gap-2">
              <pre className="bg-gray-100 text-xs text-gray-800 p-2 rounded flex-1 overflow-x-auto whitespace-pre-wrap border border-gray-200">
                {sql}
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(sql)}
                className="ml-2 px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs border border-gray-300"
                title="Copy SQL"
              >
                Copy
              </button>
            </div>
          )}

          {/* Download & Clear Buttons */}
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Results</span>
            <div className="flex gap-2">
              <button
                onClick={onDownload}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
              >
                Download CSV
              </button>
              <button
                onClick={onClear}
                className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded text-sm"
              >
                Clear Table
              </button>
            </div>
          </div>

          {/* Fixed Box + Horizontal Scroll inside */}
          <div className="w-full border border-gray-200 rounded-lg shadow max-h-[30rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table
                ref={tableRef}
                className="min-w-[1000px] w-full text-xs table-auto"
              >
                <thead className="sticky top-0 bg-gray-100 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-3 py-2 border-b border-gray-300 text-left font-semibold text-gray-700 whitespace-nowrap bg-gray-100"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="even:bg-gray-50 hover:bg-blue-50">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-3 py-2 border-b border-gray-100 whitespace-nowrap"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-2 text-xs">
            <div>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* No Data */}
      {!loading && !error && (!Array.isArray(data) || data.length === 0) && (
        <div className="text-center text-gray-400">No results to display.</div>
      )}
    </div>
  );
}
