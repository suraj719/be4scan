import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchScans } from "../store/slices/scansSlice";
import NewScanModal from "../components/NewScanModal";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { list: scans, loading } = useAppSelector((state) => state.scans);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchScans());
  }, [dispatch]);

  // Get recent scans (last 5)
  const recentScans = [...scans]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const stats = [
    {
      name: "Total Scans",
      value: scans.length,
      change: "All time",
      changeType: "neutral",
    },
    {
      name: "Completed",
      value: scans.filter((s) => s.status === "completed").length,
      change: "Successful scans",
      changeType: "positive",
    },
    {
      name: "Failed",
      value: scans.filter((s) => s.status === "failed").length,
      change: "Need attention",
      changeType: "negative",
    },
  ];

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
            Dashboard
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            onClick={() => setIsModalOpen(true)}
            type="button"
            className="ml-3 inline-flex items-center rounded-md bg-teal-500 px-3 py-2 text-sm font-semibold text-slate-950 shadow-sm hover:bg-teal-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
          >
            New Scan
          </button>
        </div>
      </div>

      {/* Stats */}
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.name}
            className="overflow-hidden rounded-lg bg-slate-900 px-4 py-5 shadow border border-slate-800 sm:p-6"
          >
            <dt className="truncate text-sm font-medium text-slate-400">
              {item.name}
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
              {item.value}
            </dd>
            <dd className="mt-2 text-sm text-slate-500">
              <span
                className={
                  item.changeType === "positive"
                    ? "text-teal-400"
                    : item.changeType === "negative"
                    ? "text-red-400"
                    : "text-slate-400"
                }
              >
                {item.change}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      {/* Recent Scans */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold leading-6 text-white">
            Recent Scans
          </h3>
          <Link
            to="/dashboard/scans"
            className="text-sm font-medium text-teal-400 hover:text-teal-300"
          >
            View all
          </Link>
        </div>
        <div className="mt-4 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-white/5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-900">
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                      >
                        Target
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                      >
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950">
                    {loading && scans.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-4 text-center text-sm text-slate-400"
                        >
                          Loading scans...
                        </td>
                      </tr>
                    ) : recentScans.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-4 text-center text-sm text-slate-400"
                        >
                          No scans found. Start your first scan!
                        </td>
                      </tr>
                    ) : (
                      recentScans.map((scan) => (
                        <tr key={scan.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                            <Link
                              to={`/dashboard/scans/${scan.id}`}
                              className="hover:text-teal-400"
                            >
                              {scan.name}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300">
                            {scan.target}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                scan.status === "completed"
                                  ? "bg-teal-400/10 text-teal-400 ring-teal-400/20"
                                  : scan.status === "failed"
                                  ? "bg-red-400/10 text-red-400 ring-red-400/20"
                                  : scan.status === "running"
                                  ? "bg-blue-400/10 text-blue-400 ring-blue-400/20"
                                  : "bg-slate-400/10 text-slate-400 ring-slate-400/20"
                              }`}
                            >
                              {scan.status.charAt(0).toUpperCase() +
                                scan.status.slice(1)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-400">
                            {new Date(scan.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NewScanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
