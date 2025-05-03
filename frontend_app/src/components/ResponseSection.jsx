import { useState, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { TextField, Select, MenuItem, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

export default function ResponseSection({ data, error, loading, onDownload, onClear, sql }) {
  const [page, setPage] = useState(0); // page number (starting from 0)
  const [pageSize, setPageSize] = useState(25); // rows per page
  const [searchText, setSearchText] = useState("");

  const columns = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return Object.keys(data[0]).map((key) => ({
      field: key,
      headerName: key.toUpperCase(),
      width: 180,
    }));
  }, [data]);

  const rows = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map((row, index) => ({
      id: index,
      ...row,
    }));
  }, [data]);

  // Search filter
  const filteredRows = rows.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  // Paginated rows
  const paginatedRows = filteredRows.slice(page * pageSize, page * pageSize + pageSize);

  const totalPages = Math.ceil(filteredRows.length / pageSize);

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

      {/* Main Content */}
      {Array.isArray(data) && data.length > 0 && (
        <>
          {/* SQL View */}
          {sql && (
            <div className="mb-4 flex items-center gap-2">
              <pre className="bg-gray-100 text-xs text-gray-800 p-2 rounded flex-1 overflow-x-auto whitespace-pre-wrap border border-gray-200">
                {sql}
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(sql)}
                className="ml-2 px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs border border-gray-300"
              >
                Copy
              </button>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between items-center mb-4">
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

          {/* Search */}
          <div className="mb-4">
            <TextField
              label="Search Table"
              variant="outlined"
              size="small"
              fullWidth
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPage(0); // reset to first page when search changes
              }}
            />
          </div>

          {/* Table */}
          <div className="overflow-auto max-h-[calc(100vh-290px)] border border-gray-200 rounded-lg">
      
              <div style={{ minWidth: 1500 }}>
                <div style={{ height: 400, width: "100%" }}>
                <div className="h-[400px]">

                  <DataGrid
                    rows={paginatedRows}
                    columns={columns}
                    disableVirtualization
                    pagination={false}
                    hideFooter // 👈 ADD THIS LINE
                                      disableSelectionOnClick
                    density="compact"
                    autoHeight={false}
                    sx={{
                      "& .MuiDataGrid-columnHeaders": {
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#f9fafb",
                        zIndex: 10,
                        boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.12)",
                      },
                      "& .MuiDataGrid-cell": {
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      },
                    }}
                  />
                </div>
              </div>
            </div>
            </div>
          {/* Custom Pagination */}
          <div className="w-full flex justify-between items-center mt-2 bg-white px-4 py-2 border border-gray-200 rounded-b-2xl shadow-sm">
            <div className="text-sm text-gray-600">
              Showing {Math.min((page * pageSize) + 1, filteredRows.length)} - {Math.min((page + 1) * pageSize, filteredRows.length)} of {filteredRows.length} results
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(0);
                }}
                size="small"
              >
                {[10, 25, 50, 100].map((size) => (
                  <MenuItem key={size} value={size}>{size} rows</MenuItem>
                ))}
              </Select>
              <IconButton
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                disabled={page === 0}
              >
                <ChevronLeft />
              </IconButton>
              <div className="text-sm">{page + 1} / {totalPages}</div>
              <IconButton
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight />
              </IconButton>
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
