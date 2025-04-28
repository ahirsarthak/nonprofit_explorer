import { useState, useEffect } from "react";
import QuerySection from "./components/QuerySection";
import ResponseSection from "./components/ResponseSection";
import Sidebar from "./components/Sidebar";
import ColumnsModal from "./components/ColumnsModal";
import LoadingSpinner from "./components/LoadingSpinner";
import { saveAs } from "file-saver";
import { unparse } from "papaparse";

const API_BASE = "http://127.0.0.1:8000/api";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState([]);
  const [sql, setSql] = useState("");
  const [error, setError] = useState(null);
  const [recent, setRecent] = useState([]);
  const [columnsInfo, setColumnsInfo] = useState(null);
  const [showColumnsModal, setShowColumnsModal] = useState(false);

  // Fetch recent queries
  const fetchRecent = async () => {
    try {
      const res = await fetch(`${API_BASE}/recent/`);
      const data = await res.json();
      setRecent(Array.isArray(data.recent_queries) ? data.recent_queries : []);
      //setRecent(Array.isArray(data) ? data : (data.results || []));
      console.log("[fetchRecent] Recent queries:", data);
    } catch (err) {
      setRecent([]);
      console.error("[fetchRecent] Error: ", err);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  // Fetch columns info (dummy for now, replace with API if available)
  const fetchColumnsInfo = async () => {
    // Example: fetch from /api/columns/ if you have such an endpoint
    // For now, use static example
    setColumnsInfo([
      { name: "ein", description: "Employer Identification Number" },
      { name: "name", description: "Nonprofit Name" },
      { name: "city", description: "City" },
      { name: "state", description: "State" },
      { name: "revenue", description: "Total Revenue" },
    ]);
    setShowColumnsModal(true);
  };

  // Submit a new query
  const handleQuerySubmit = async (query) => {
    setLoading(true);
    setError(null);
    setResponse([]);
    console.log("[handleQuerySubmit] Submitting query:", query);
    try {
      const payload = { query };
      console.log("[handleQuerySubmit] Payload:", payload);
      const res = await fetch(`${API_BASE}/query/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("[handleQuerySubmit] Response status:", res.status);
      const data = await res.json();
      console.log("[handleQuerySubmit] Response data:", data);
      if (res.ok && Array.isArray(data.results)) {
        setResponse(data.results);
        setError(null);
      } else if (data && data.error) {
        setError(data);
        setResponse([]);
      } else {
        setError({ error: "Unknown response from server." });
        setResponse([]);
      }
      await fetchRecent(); // Auto-refresh recent queries
    } catch (err) {
      setError({ error: err.message });
      setResponse([]);
      console.error("[handleQuerySubmit] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Rerun a previous query
  const handleRerun = async (submission_id) => {
    setLoading(true);
    setError(null);
    setResponse([]);
    console.log("[handleRerun] Rerunning submission:", submission_id);
    try {
      const res = await fetch(`${API_BASE}/rerun_submission/${submission_id}/`);
      console.log("[handleRerun] Response status:", res.status);
      const data = await res.json();
      console.log("[handleRerun] Response data:", data);
      if (res.ok && Array.isArray(data.results)) {
        setResponse(data.results);
        setError(null);
      } else if (data && data.error) {
        setError(data);
        setResponse([]);
      } else {
        setError({ error: "Unknown response from server." });
        setResponse([]);
      }
      await fetchRecent(); // Auto-refresh recent queries
    } catch (err) {
      setError({ error: err.message });
      setResponse([]);
      console.error("[handleRerun] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Download CSV
  const handleDownload = () => {
    if (!Array.isArray(response) || response.length === 0) return;
    const csv = unparse(response);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "results.csv");
  };
  
  
  

  // Clear table
  const handleClear = () => {
    setResponse([]);
    setSql("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="w-full py-4 px-6 bg-white shadow flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-700">Nonprofit Explorer</h1>
        <span className="text-xs text-gray-400">Powered by React + Tailwind + Vite</span>
      </header>
      <main className="flex-1 flex flex-row gap-8 px-4 py-8 max-w-7xl mx-auto w-full">
        <div className="flex-1 flex flex-col">
          <QuerySection onSubmit={handleQuerySubmit} loading={loading} />
          <ResponseSection
            data={response}
            error={error}
            loading={loading}
            onDownload={handleDownload}
            onClear={handleClear}
            sql={sql}
          />
        </div>
        <Sidebar
          recent={recent}
          onRerun={handleRerun}
          loading={loading}
          columnsInfo={columnsInfo}
          onShowColumns={fetchColumnsInfo}
        />
      </main>
      {showColumnsModal && (
        <ColumnsModal columnsInfo={columnsInfo || []} onClose={() => setShowColumnsModal(false)} />
      )}
    </div>
  );
}
