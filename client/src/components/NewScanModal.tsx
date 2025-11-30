import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useAppDispatch } from "../store/hooks";
import { createScan } from "../store/slices/scansSlice";

interface NewScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewScanModal({ isOpen, onClose }: NewScanModalProps) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [type, setType] = useState("nuclei");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await dispatch(createScan({ name, target, type })).unwrap();
      onClose();
      // Reset form
      setName("");
      setTarget("");
      setType("nuclei");
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-slate-900 border border-slate-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-slate-900 text-slate-400 hover:text-slate-300 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-white"
                    >
                      Start New Scan
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-slate-400">
                        Configure your scan parameters below. The scan will be
                        queued and executed by available workers.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      {error && (
                        <div className="rounded-md bg-red-900/50 p-3 text-sm text-red-200 border border-red-900">
                          {error}
                        </div>
                      )}

                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium leading-6 text-white"
                        >
                          Scan Name
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="block w-full rounded-md border-0 bg-slate-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-teal-500 sm:text-sm sm:leading-6"
                            placeholder="e.g., Weekly Production Scan"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="target"
                          className="block text-sm font-medium leading-6 text-white"
                        >
                          Target URL
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            name="target"
                            id="target"
                            required
                            className="block w-full rounded-md border-0 bg-slate-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-teal-500 sm:text-sm sm:leading-6"
                            placeholder="https://example.com"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="type"
                          className="block text-sm font-medium leading-6 text-white"
                        >
                          Scan Type
                        </label>
                        <div className="mt-2">
                          <select
                            id="type"
                            name="type"
                            className="block w-full rounded-md border-0 bg-slate-800 py-1.5 text-white shadow-sm ring-1 ring-inset ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-teal-500 sm:text-sm sm:leading-6"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                          >
                            <option value="nuclei">Nuclei (Web Scanner)</option>
                            <option value="zap" disabled>
                              OWASP ZAP (Coming Soon)
                            </option>
                            <option value="nmap" disabled>
                              Nmap (Coming Soon)
                            </option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex w-full justify-center rounded-md bg-teal-500 px-3 py-2 text-sm font-semibold text-slate-950 shadow-sm hover:bg-teal-400 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? "Starting..." : "Start Scan"}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-slate-700 hover:bg-slate-700 sm:mt-0 sm:w-auto"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
