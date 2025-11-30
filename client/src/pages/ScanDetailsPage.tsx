import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchScanDetails,
  fetchScanFindings,
  clearCurrentScan,
} from "../store/slices/scansSlice";
import { api } from "../lib/api";

export default function ScanDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const {
    currentScan: scan,
    findings,
    loading,
    error,
  } = useAppSelector((state) => state.scans);
  const [downloading, setDownloading] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearCurrentScan());
    };
  }, [dispatch]);

  // Fetch scan details
  useEffect(() => {
    const fetchData = () => {
      if (id) {
        dispatch(fetchScanDetails(id));
        dispatch(fetchScanFindings(id));
      }
    };

    // Initial fetch if we don't have the scan or if it's a different scan
    if (!scan || scan.id !== id) {
      fetchData();
    }
  }, [dispatch, id, scan]);

  const handleDownloadArtifact = async () => {
    if (!id) return;
    try {
      setDownloading(true);
      const blob = await api.downloadArtifact(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scan-${id}-nuclei.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download artifact:", error);
      alert("Failed to download artifact");
    } finally {
      setDownloading(false);
    }
  };

  if (loading && !scan) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-slate-400">Loading scan details...</div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-red-400">{error || "Scan not found"}</div>
        <Link
          to="/dashboard/scans"
          className="text-teal-400 hover:text-teal-300 font-medium"
        >
          &larr; Back to Scans
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          to="/dashboard/scans"
          className="text-sm font-medium text-slate-400 hover:text-white mb-4 inline-block"
        >
          &larr; Back to Scans
        </Link>
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
              {scan.name}
            </h2>
            <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-slate-400">
                <span className="font-medium text-slate-300 mr-2">Target:</span>
                {scan.target}
              </div>
              <div className="mt-2 flex items-center text-sm text-slate-400">
                <span className="font-medium text-slate-300 mr-2">Type:</span>
                {scan.type}
              </div>
              <div className="mt-2 flex items-center text-sm text-slate-400">
                <span className="font-medium text-slate-300 mr-2">Date:</span>
                {new Date(scan.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            {scan.status === "completed" && (
              <button
                onClick={handleDownloadArtifact}
                disabled={downloading}
                type="button"
                className="inline-flex items-center rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-slate-700 hover:bg-slate-700 disabled:opacity-50"
              >
                {downloading ? "Downloading..." : "Download Artifact"}
              </button>
            )}
            <span
              className={`ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ring-1 ring-inset ${scan.status === "completed"
                ? "bg-teal-400/10 text-teal-400 ring-teal-400/20"
                : scan.status === "failed"
                  ? "bg-red-400/10 text-red-400 ring-red-400/20"
                  : scan.status === "running"
                    ? "bg-blue-400/10 text-blue-400 ring-blue-400/20"
                    : "bg-slate-400/10 text-slate-400 ring-slate-400/20"
                }`}
            >
              {scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Findings Section */}
      <div className="mt-8">
        <h3 className="text-base font-semibold leading-6 text-white mb-4">
          Findings ({findings.length})
        </h3>
        <div className="overflow-hidden shadow ring-1 ring-white/5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6"
                >
                  Severity
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                >
                  Resource
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                >
                  Description
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Expand</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950">
              {findings.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-sm text-slate-400"
                  >
                    No findings detected.
                  </td>
                </tr>
              ) : (
                findings.map((finding) => (
                  <FindingRow key={finding.id} finding={finding} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FindingRow({ finding }: { finding: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer hover:bg-slate-900/50 transition-colors"
      >
        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
          <span
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${finding.severity === "critical"
              ? "bg-red-500/10 text-red-400 ring-red-500/20"
              : finding.severity === "high"
                ? "bg-orange-500/10 text-orange-400 ring-orange-500/20"
                : finding.severity === "medium"
                  ? "bg-yellow-500/10 text-yellow-400 ring-yellow-500/20"
                  : finding.severity === "low"
                    ? "bg-blue-500/10 text-blue-400 ring-blue-500/20"
                    : "bg-slate-500/10 text-slate-400 ring-slate-500/20"
              }`}
          >
            {finding.severity.toUpperCase()}
          </span>
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-white">
          {finding.title}
        </td>
        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300">
          {finding.resource}
        </td>
        <td className="px-3 py-4 text-sm text-slate-400 max-w-md truncate">
          {finding.description}
        </td>
        <td className="px-3 py-4 text-sm text-slate-400 text-right">
          {expanded ? "▲" : "▼"}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-900/30">
          <td colSpan={5} className="px-4 py-4 sm:px-6">
            <div className="text-sm text-slate-300 space-y-2">
              <div>
                <span className="font-semibold text-white">Description:</span>
                <p className="mt-1 whitespace-pre-wrap text-slate-400">
                  {finding.description || "No description available."}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
