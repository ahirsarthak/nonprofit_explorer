import { useState, useEffect } from "react";

// Helper to get user's public IP address
async function getUserIP() {
  try {
    const res = await fetch("https://api64.ipify.org?format=json");
    const data = await res.json();
    return data.ip;
  } catch {
    return null;
  }
}
import QuerySection from "./components/QuerySection.jsx";
import AboutThisToolModal from "./components/AboutThisToolModal";
import ResponseSection from "./components/ResponseSection.jsx";
import Sidebar from "./components/Sidebar.jsx";
import { COLUMN_INFO } from "./components/columnInfo";
import Leftbar from "./components/Leftbar.jsx";
import ColumnsModal from "./components/ColumnsModal.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import ContactDevModal from "./components/ContactDevModal.jsx";

const baseButton = "min-w-[120px] px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm font-semibold shadow text-center";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function App() {
  const [showContact, setShowContact] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handleContactSubmit = async (form) => {
    setSubmittingFeedback(true);
    setFeedbackError(null);
    setFeedbackSuccess(false);
    try {
      const res = await fetch(`${API_BASE}/feedback/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackSuccess(true);
      } else {
        setFeedbackError(data.error || "An error occurred.");
      }
    } catch (err) {
      setFeedbackError("Network error. Please try again.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState([]);
  const [sql, setSql] = useState("");
  const [error, setError] = useState(null);
  const [recent, setRecent] = useState([]);
  const [columnsInfo, setColumnsInfo] = useState(null);
  const [showColumnsModal, setShowColumnsModal] = useState(false);

  const fetchRecent = async () => {
    try {
      const res = await fetch(`${API_BASE}/recent/`);
      const data = await res.json();
      setRecent(Array.isArray(data.recent_queries) ? data.recent_queries : []);
    } catch (err) {
      console.error("[fetchRecent] Error:", err);
      setRecent([]);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const handleQuerySubmit = async (query) => {
    setLoading(true);
    setError(null);
    setResponse([]);
    setSql("");

    try {
      const ip_address = await getUserIP();
      const payload = { query, ip_address };
      const res = await fetch(`${API_BASE}/query/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && Array.isArray(data.results)) {
        setResponse(data.results);
        setSql(data.sql || "");
        setError(null);
      } else {
        setError(data);
        setResponse([]);
      }
    } catch (err) {
      console.error("[handleQuerySubmit] Error:", err);
      setError({ error: err.message });
      setResponse([]);
    } finally {
      setLoading(false);
      fetchRecent();
    }
  };

  const handleRerun = async (submission_id) => {
    setLoading(true);
    setError(null);
    setResponse([]);
    setSql("");

    try {
      const res = await fetch(`${API_BASE}/rerun_submission/${submission_id}/`);
      const data = await res.json();

      if (res.ok && Array.isArray(data.results)) {
        setResponse(data.results);
        setSql(data.sql || "");
        setError(null);
      } else {
        setError(data);
        setResponse([]);
      }
    } catch (err) {
      console.error("[handleRerun] Error:", err);
      setError({ error: err.message });
      setResponse([]);
    } finally {
      setLoading(false);
      fetchRecent();
    }
  };

  const handleDownload = () => {
    if (!Array.isArray(response) || response.length === 0) return;

    const columns = Object.keys(response[0]);
    const csv = [columns.join(",")]
      .concat(
        response.map((row) =>
          columns.map((col) => JSON.stringify(row[col] ?? "")).join(",")
        )
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "results.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setResponse([]);
    setSql("");
    setError(null);
  };

  const fetchColumnsInfo = async () => {
    setColumnsInfo([
      { name: "ein", description: "Employer Identification Number" },
      { name: "name", description: "Nonprofit Name" },
      { name: "city", description: "City of Nonprofit" },
      { name: "state", description: "State Abbreviation" },
      { name: "revenue", description: "Total Revenue (USD)" },
    ]);
    setShowColumnsModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">

      {/* Header */}
      <header className="w-full py-4 px-6 bg-white shadow flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-blue-700">Nonprofit BMO Explorer</h1>
        </div>
        <div className="flex items-center gap-4">
        <AboutThisToolModal buttonClass={baseButton} />
        <button
  className={baseButton}
  onClick={() => {
    setShowContact(true);
    setFeedbackSuccess(false);
    setFeedbackError(null);
  }}
>
  Contact Dev
</button>

        </div>
      </header>

      {/* Main Layout */}
      <main className="flex flex-row gap-6 px-4 py-4 w-full flex-1 overflow-hidden items-stretch">
      {/* Main Content - now takes more space */}
        <div className="flex-1 flex flex-col min-w-0">
          <QuerySection onSubmit={handleQuerySubmit} loading={loading} />
          {loading ? (
            <LoadingSpinner />
          ) : (
            <ResponseSection
              data={response}
              error={error}
              loading={loading}
              onDownload={handleDownload}
              onClear={handleClear}
              sql={sql}
            />
          )}
        </div>

        {/* Sidebar: Recent Queries + Columns Info */}
        <Sidebar
          recent={recent}
          onRerun={handleRerun}
          loading={loading}
          columnsInfo={COLUMN_INFO}
        />
      </main>

      {/* Columns Info Modal */}
      {/* (No longer used: columns info always shown in Leftbar) */}
      {/* Contact Dev Modal */}
      <ContactDevModal
        open={showContact}
        onClose={() => setShowContact(false)}
        onSubmit={handleContactSubmit}
        submitting={submittingFeedback}
        error={feedbackError}
        success={feedbackSuccess}
      />
    </div>
  );
}
