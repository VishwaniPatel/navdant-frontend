import React, { useState } from "react";
import {
  CalendarCheck,
  CalendarClock,
  CalendarX,
  ChevronDown,
  ChevronUp,
  Pencil,
  PlusCircle,
  Trash2,
} from "lucide-react";

import PatientInfoCard from "./PatientInfoCard";

const VisitTimeline = ({
  visits = [],
  isLoading = false,
  onAddVisit,
  onEditVisit,
  onDeleteVisit,
}) => {
  const [listExpanded, setListExpanded] = useState(false);

  if (isLoading) {
    return (
      <PatientInfoCard
        icon={CalendarClock}
        iconColor="#2563EB"
        title="Visits"
      >
        <div className="flex items-center justify-center gap-2 py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />

          <span className="text-sm text-slate-500">
            Loading visits...
          </span>
        </div>
      </PatientInfoCard>
    );
  }

  const totalVisits = visits.length;

  return (
    <PatientInfoCard
      icon={CalendarClock}
      iconColor="#FF6B6B"
      title="Visits"
      rightElement={
        <button
          type="button"
          onClick={onAddVisit}
          className="rounded-full p-1 hover:bg-slate-100"
        >
          <PlusCircle
            size={24}
            className="text-blue-600"
          />
        </button>
      }
    >
      {/* Total */}
      <button
        type="button"
        onClick={() => setListExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-lg py-2 text-left hover:bg-slate-50"
      >
        <span className="text-base font-bold text-[#0B1E41]">
          Total: {totalVisits}{" "}
          {totalVisits === 1 ? "visit" : "visits"}
        </span>

        {listExpanded ? (
          <ChevronUp size={20} className="text-slate-500" />
        ) : (
          <ChevronDown size={20} className="text-slate-500" />
        )}
      </button>

      {/* List */}
      {listExpanded && (
        <div className="mt-2">
          {totalVisits === 0 ? (
            <div className="flex items-center gap-3 py-4">
              <CalendarX
                size={24}
                className="text-slate-400"
              />

              <span className="text-sm font-medium text-slate-400">
                No visits yet
              </span>
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {visits.map((visit, index) => (
                <div key={visit.id}>
                  <div className="flex items-center justify-between py-2">
                    {/* Visit info */}
                    <div className="flex min-w-0 flex-1 items-start">
                      <CalendarCheck
                        size={16}
                        className="mr-2 mt-1 shrink-0 text-blue-600"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#0B1E41]">
                          {visit.title}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {new Date(
                            visit.date
                          ).toLocaleDateString("en-GB")}
                        </p>

                        {visit.result && (
                          <p className="mt-0.5 break-words text-xs italic text-slate-600">
                            {visit.result}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEditVisit(visit)}
                        className="rounded-md p-1.5 hover:bg-slate-100"
                        title="Edit"
                      >
                        <Pencil
                          size={16}
                          className="text-slate-500"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onDeleteVisit(visit.id)
                        }
                        className="rounded-md p-1.5 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2
                          size={16}
                          className="text-red-500"
                        />
                      </button>
                    </div>
                  </div>

                  {index < visits.length - 1 && (
                    <div className="h-px bg-slate-100" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PatientInfoCard>
  );
};

export default VisitTimeline;