import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchScans } from "../store/slices/scansSlice";
import NewScanModal from "../components/NewScanModal";

export default function ScansPage() {
  const dispatch = useAppDispatch();
  const { list: scans, loading } = useAppSelector((state) => state.scans);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchScans());
  }, [dispatch]);

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-white">Scans</h1>
          <p className="mt-2 text-sm text-slate-400">
            A list of all your security scans including their target, status, and
            creation date.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => setIsModalOpen(true)}
            type="button"
            className="block rounded-md bg-teal-500 px-3 py-2 text-center text-sm font-semibold text-slate-950 shadow-sm hover:bg-teal-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
          >
            New Scan
          </button>
        </div>
      </div>
      <div className="mt-8 flow-root">
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
                      Type
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
                      Findings
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950">
                  {loading && scans.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-10 text-center text-sm text-slate-400"
                      >
                        Loading scans...
                      </td>
                    </tr>
                  ) : scans.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-10 text-center text-sm text-slate-400"
                      >
                        No scans found. Start your first scan!
                      </td>
                    </tr>
                  ) : (
                    scans.map((scan) => (
                      <tr key={scan.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                          {scan.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300">
                          {scan.target}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300">
                          {scan.type}
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
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-300">
                          {scan.findingsCount}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-400">
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                            to={`/dashboard/scans/${scan.id}`}
                            className="text-teal-400 hover:text-teal-300"
                          >
                            View<span className="sr-only">, {scan.name}</span>
                          </Link>
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

      <NewScanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
