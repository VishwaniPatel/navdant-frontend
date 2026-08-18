import { X } from "lucide-react";

const FilterModal = ({
  visible,
  onClose,

  years,
  months,

  tempYear,
  tempMonth,

  setTempYear,
  setTempMonth,

  onReset,
  onApply,
}) => {
  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[100] bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-[110] w-[calc(100%-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

          <div>
            <h2 className="text-lg font-bold text-[#0B1E41]">
              Filter Patients
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Filter patients by registration date
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>

        </div>

        {/* Content */}
        <div className="space-y-5 p-5">

          {/* Year */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Year
            </label>

            <select
              value={tempYear || ""}
              onChange={(e) =>
                setTempYear(
                  e.target.value || null
                )
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#0B1E41] focus:ring-2 focus:ring-[#0B1E41]/10"
            >
              <option value="">
                All Years
              </option>

              {years.map((year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Month
            </label>

            <select
              value={tempMonth || "ALL"}
              onChange={(e) =>
                setTempMonth(e.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#0B1E41] focus:ring-2 focus:ring-[#0B1E41]/10"
            >
              <option value="ALL">
                All Months
              </option>

              {months.map((month) => (
                <option
                  key={month.value}
                  value={month.value}
                >
                  {month.label}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-4">

          <button
            type="button"
            onClick={onReset}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-[#0B1E41]"
          >
            Reset
          </button>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onApply}
              className="rounded-xl bg-[#0B1E41] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#102955]"
            >
              Apply Filters
            </button>

          </div>

        </div>

      </div>
    </>
  );
};

export default FilterModal;