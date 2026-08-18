import React, { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Plus,
  ChevronRight,
  UserRound,
  X,
} from "lucide-react";

// import DashboardLayout from "../components/DashboardLayout";
import { usePatientPagination } from "../hooks/usePatientPagination";
import { usePatientFilters } from "../hooks/usePatientFilters";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";

const PatientList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const {
    patients,
    loading,
    totalPatients,
    loadingMore,
    hasMore,
    resetAndFetch,
    loadMore,
  } = usePatientPagination();

  const {
    selectedYear,
    selectedMonth,
    activeMonthLabel,
    hasActiveFilters,
    openFilterModal,
    clearYearFilter,
    clearMonthFilter,
  } = usePatientFilters();

  // Initial / filter fetch
  useEffect(() => {
    resetAndFetch(
      searchQuery,
      !!(selectedYear || selectedMonth),
      selectedYear,
      selectedMonth
    );
  }, [selectedYear, selectedMonth]);

  // Search
  useEffect(() => {
    const timer = setTimeout(() => {
      resetAndFetch(
        searchQuery,
        !!(selectedYear || selectedMonth),
        selectedYear,
        selectedMonth
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getInitials = (name) => {
    if (!name) return "?";

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const PatientRow = ({ patient, getInitials }) => {
  return (
    <div
      className="
        group
        grid
        grid-cols-1
        gap-3
        px-5 py-4
        transition
        hover:bg-slate-50
        md:grid-cols-[2fr_1.2fr_1fr_1.5fr_1.4fr_50px]
        md:items-center
        md:gap-4
      "
    >

      {/* Patient */}
      <div className="flex min-w-0 items-center gap-3">

        <div
          className="
            flex h-11 w-11 shrink-0
            items-center justify-center
            rounded-full
            bg-[#0B1E41]
            text-sm font-bold text-white
          "
        >
          {getInitials(patient.name)}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">
            {patient.name}
          </p>
        </div>

      </div>

      {/* Case Number */}
      <div>
        <p className="text-sm font-medium text-slate-700">
          {patient.case_number || "—"}
        </p>

        <p className="text-xs text-slate-400 md:hidden">
          Case Number
        </p>
      </div>

      {/* Gender */}
      <div>
        <span
          className="
            inline-flex rounded-full
            bg-slate-100
            px-2.5 py-1
            text-xs font-medium
            text-slate-600
          "
        >
          {patient.gender || "N/A"}
        </span>
      </div>

      {/* Phone */}
      <div>
        <p className="text-sm text-slate-600">
          {patient.phone || "N/A"}
        </p>
      </div>

      {/* Registration Date */}
      <div>
        <p className="text-sm text-slate-600">
          {patient.registration_date || "—"}
        </p>
      </div>

      {/* Action */}
      <div className="flex justify-end">
        <button
          className="
            flex h-9 w-9
            items-center justify-center
            rounded-lg
            text-slate-400
            transition
            hover:bg-slate-100
            hover:text-[#0B1E41]
          "
          onClick={() => {
            navigate(`/patients/${patient.id}`)
          }}
        >
          <ChevronRight size={19} />
        </button>
      </div>

    </div>
  );
};

  return (
    <DashboardLayout>
      <div className="w-full">

        {/* PAGE HEADER */}
<div className="mb-6 flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold text-slate-800">
      Patient Directory
    </h1>

    <p className="mt-1 text-sm text-slate-500">
      Manage and view all registered patients
    </p>
  </div>

  {/* Total - same position/style as before */}
  <div className="text-right">
    <p className="text-xs font-medium text-slate-500">
      Total
    </p>

    <p className="text-xl font-bold text-[#0B1E41]">
      {totalPatients}
    </p>
  </div>
</div>

        {/* SEARCH + FILTER */}
        <div className="mb-4 flex gap-3">

          <div className="relative flex-1">
            <Search
              size={19}
              className="
                absolute left-3 top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Search patient by name, ID or mobile"
              className="
                h-11 w-full rounded-xl
                border border-slate-200
                bg-white pl-10 pr-10
                text-sm text-slate-700
                outline-none
                transition
                focus:border-[#0B1E41]
                focus:ring-2
                focus:ring-[#0B1E41]/10
              "
            />

            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="
                  absolute right-3 top-1/2
                  -translate-y-1/2
                "
              >
                <X
                  size={18}
                  className="text-slate-400"
                />
              </button>
            )}
          </div>

          <button
            onClick={openFilterModal}
            className={`
              flex h-11 items-center gap-2
              rounded-xl border px-5
              text-sm font-medium
              transition
              ${
                hasActiveFilters
                  ? "border-[#0B1E41] bg-[#0B1E41] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }
            `}
          >
            <SlidersHorizontal size={18} />
            Filter
          </button>
        </div>

        {/* FILTER BADGES */}
        {hasActiveFilters && (
          <div className="mb-5 flex flex-wrap gap-2">

            {selectedYear && (
              <div
                className="
                  flex items-center gap-2
                  rounded-full
                  border border-slate-200
                  bg-slate-100
                  px-3 py-1.5
                "
              >
                <span className="text-xs font-medium text-slate-700">
                  Year: {selectedYear}
                </span>

                <button onClick={clearYearFilter}>
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedMonth &&
              selectedMonth !== "ALL" && (
                <div
                  className="
                    flex items-center gap-2
                    rounded-full
                    border border-slate-200
                    bg-slate-100
                    px-3 py-1.5
                  "
                >
                  <span className="text-xs font-medium text-slate-700">
                    Month: {activeMonthLabel}
                  </span>

                  <button onClick={clearMonthFilter}>
                    <X size={14} />
                  </button>
                </div>
              )}
          </div>
        )}

       {/* PATIENT TABLE */}
<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

  {/* Table Header */}
  <div className="hidden grid-cols-[2fr_1.2fr_1fr_1.5fr_1.4fr_50px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
    <div>Patient</div>
    <div>Case No.</div>
    <div>Gender</div>
    <div>Mobile</div>
    <div>Registration Date</div>
    <div></div>
  </div>

  {/* Loading */}
  {loading && patients.length === 0 ? (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3, 4, 5].map((item) => (
        <PatientTableSkeleton key={item} />
      ))}
    </div>
  ) : patients.length === 0 ? (

    /* Empty */
    <EmptyState searchQuery={searchQuery} />

  ) : (

    /* Rows */
    <div className="divide-y divide-slate-100">
      {patients.map((patient) => (
        <PatientRow
          key={patient.id}
          patient={patient}
          getInitials={getInitials}
        />
      ))}
    </div>
  )}
</div>

        {/* LOAD MORE */}
        {!loading &&
          patients.length > 0 &&
          hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="
                  rounded-xl
                  bg-[#0B1E41]
                  px-6 py-2.5
                  text-sm font-medium
                  text-white
                  hover:bg-[#102955]
                  disabled:opacity-50
                "
              >
                {loadingMore
                  ? "Loading..."
                  : "Load More"}
              </button>
            </div>
          )}

        {/* ADD PATIENT */}
        <button
          onClick={() => {
            // navigate("/patients/register");
          }}
          className="
            fixed bottom-7 right-7
            flex h-14 w-14
            items-center justify-center
            rounded-full
            bg-[#128142]
            text-white
            shadow-lg
            transition
            hover:scale-105
          "
          title="Add Patient"
        >
          <Plus size={25} />
        </button>

      </div>
    </DashboardLayout>
  );
};


/* =========================
   PATIENT CARD
========================= */

const PatientCard = ({ patient, getInitials }) => {
  return (
    <div
      className="
        group flex cursor-pointer
        items-center gap-4
        rounded-2xl
        border border-slate-100
        bg-white p-4
        shadow-sm
        transition
        hover:-translate-y-[1px]
        hover:shadow-md
      "
    >
      {/* Avatar */}
      <div
        className="
          flex h-12 w-12
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-[#0B1E41]
          text-sm font-bold
          text-white
        "
      >
        {getInitials(patient.name)}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">

        <h3 className="truncate text-sm font-bold text-slate-800">
          {patient.name}
        </h3>

        <p className="mt-1 truncate text-xs text-slate-500">
          Case No. {patient.case_number}
          <span className="mx-1.5">•</span>
          {patient.gender || "N/A"}
          <span className="mx-1.5">•</span>
          {patient.registration_date}
        </p>

        <p className="mt-1 text-xs font-medium text-slate-600">
          <span className="mr-1 text-[#128142]">
            ☎
          </span>
          {patient.phone || "N/A"}
        </p>

      </div>

      {/* Arrow */}
      <div
        className="
          flex h-9 w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-slate-50
          group-hover:bg-slate-100
        "
      >
        <ChevronRight
          size={20}
          className="text-slate-400"
        />
      </div>
    </div>
  );
};


/* =========================
   SKELETON
========================= */

const PatientTableSkeleton = () => {
  return (
    <div
      className="
        grid grid-cols-1 gap-4
        px-5 py-4
        md:grid-cols-[2fr_1.2fr_1fr_1.5fr_1.4fr_50px]
        md:items-center
      "
    >
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 animate-pulse rounded-full bg-slate-200" />

        <div className="space-y-2">
          <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-2.5 w-20 animate-pulse rounded bg-slate-200" />
        </div>
      </div>

      <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
      <div className="h-6 w-14 animate-pulse rounded-full bg-slate-200" />
      <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
      <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
      <div className="h-8 w-8 animate-pulse rounded bg-slate-200" />
    </div>
  );
};


/* =========================
   EMPTY
========================= */

const EmptyState = ({ searchQuery }) => (
  <div
    className="
      flex min-h-[350px]
      flex-col items-center
      justify-center
      rounded-2xl
      bg-white
      text-center
    "
  >
    <div
      className="
        mb-4 flex h-16 w-16
        items-center justify-center
        rounded-full bg-slate-100
      "
    >
      <UserRound
        size={30}
        className="text-slate-300"
      />
    </div>

    <h3 className="text-lg font-bold text-slate-800">
      No patients found
    </h3>

    <p className="mt-2 text-sm text-slate-500">
      {searchQuery
        ? "Try adjusting your search or filters."
        : "Add your first patient to get started."}
    </p>
  </div>
);

export default PatientList;