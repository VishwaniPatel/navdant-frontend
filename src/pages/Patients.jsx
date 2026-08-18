import React, { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Plus,
  ChevronRight,
  UserRound,
  X,
  CalendarDays,
} from "lucide-react";

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

    tempYear,
    tempMonth,

    setTempYear,
    setTempMonth,

    years,
    months,

    activeMonthLabel,
    hasActiveFilters,

    filterModalVisible,

    openFilterModal,
    closeFilterModal,

    applyFilters,
    resetFilters,

    clearYearFilter,
    clearMonthFilter,
  } = usePatientFilters();

  // =========================
  // FETCH ON FILTER CHANGE
  // =========================

  useEffect(() => {
    resetAndFetch(
      searchQuery,
      selectedYear,
      selectedMonth
    );
  }, [selectedYear, selectedMonth]);

  // =========================
  // SEARCH
  // =========================

  useEffect(() => {
    const timer = setTimeout(() => {
      resetAndFetch(
        searchQuery,
        selectedYear,
        selectedMonth
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // =========================
  // INITIALS
  // =========================

  const getInitials = (name) => {
    if (!name) return "?";

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <DashboardLayout>
      <div className="w-full">

        {/* =========================================
            PAGE HEADER
        ========================================= */}

        <div className="mb-6 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Manage Patient Records
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage and view all registered patients
            </p>
          </div>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-5">

            {/* TOTAL */}

            <div className="text-right">
              <p className="text-xs font-medium text-slate-500">
                Total
              </p>

              <p className="text-xl font-bold text-[#0B1E41]">
                {totalPatients}
              </p>
            </div>

            {/* ADD PATIENT */}

            <button
              type="button"
              onClick={() =>
                navigate("/patients/register")
              }
              className="
                flex
                h-11
                items-center
                gap-2
                rounded-xl
                bg-[#128142]
                px-4
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-[#0f7139]
                hover:shadow-md
              "
            >
              <Plus size={18} />

              <span>Add Patient</span>
            </button>

          </div>
        </div>

        {/* =========================================
            SEARCH + FILTER
        ========================================= */}

        <div className="mb-4 flex gap-3">

          {/* SEARCH */}

          <div className="relative flex-1">

            <Search
              size={19}
              className="
                absolute
                left-3
                top-1/2
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
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                pl-10
                pr-10
                text-sm
                text-slate-700
                outline-none
                transition
                focus:border-[#0B1E41]
                focus:ring-2
                focus:ring-[#0B1E41]/10
              "
            />

            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="
                  absolute
                  right-3
                  top-1/2
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

          {/* FILTER */}

          <button
            type="button"
            onClick={openFilterModal}
            className={`
              flex
              h-11
              items-center
              gap-2
              rounded-xl
              border
              px-5
              text-sm
              font-medium
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

        {/* =========================================
            FILTER BADGES
        ========================================= */}

        {hasActiveFilters && (
          <div className="mb-5 flex flex-wrap gap-2">

            {selectedYear && (
              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-slate-200
                  bg-slate-100
                  px-3
                  py-1.5
                "
              >
                <span className="text-xs font-medium text-slate-700">
                  Year: {selectedYear}
                </span>

                <button
                  type="button"
                  onClick={clearYearFilter}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {selectedMonth &&
              selectedMonth !== "ALL" && (
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-slate-200
                    bg-slate-100
                    px-3
                    py-1.5
                  "
                >
                  <span className="text-xs font-medium text-slate-700">
                    Month: {activeMonthLabel}
                  </span>

                  <button
                    type="button"
                    onClick={clearMonthFilter}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

          </div>
        )}

        {/* =========================================
            PATIENT TABLE
        ========================================= */}

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >

          {/* TABLE HEADER */}

          <div
            className="
              hidden
              grid-cols-[2fr_1.2fr_1fr_1.5fr_1.4fr_50px]
              gap-4
              border-b
              border-slate-200
              bg-slate-50
              px-5
              py-3.5
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-slate-500
              md:grid
            "
          >
            <div>Patient</div>
            <div>Case No.</div>
            <div>Gender</div>
            <div>Mobile</div>
            <div>Registration Date</div>
            <div></div>
          </div>

          {/* LOADING */}

          {loading && patients.length === 0 ? (
            <div className="divide-y divide-slate-100">

              {[1, 2, 3, 4, 5].map((item) => (
                <PatientTableSkeleton
                  key={item}
                />
              ))}

            </div>

          ) : patients.length === 0 ? (

            <EmptyState
              searchQuery={searchQuery}
            />

          ) : (

            <div className="divide-y divide-slate-100">

              {patients.map((patient) => (
                <PatientRow
                  key={patient.id}
                  patient={patient}
                  getInitials={getInitials}
                  navigate={navigate}
                />
              ))}

            </div>
          )}

        </div>

        {/* =========================================
            LOAD MORE
        ========================================= */}

        {!loading &&
          patients.length > 0 &&
          hasMore && (

            <div className="mt-6 flex justify-center">

              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="
                  rounded-xl
                  bg-[#0B1E41]
                  px-6
                  py-2.5
                  text-sm
                  font-medium
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

        {/* =========================================
            FILTER MODAL
        ========================================= */}

        {filterModalVisible && (
          <FilterModal
            tempYear={tempYear}
            tempMonth={tempMonth}
            setTempYear={setTempYear}
            setTempMonth={setTempMonth}
            years={years}
            months={months}
            onClose={closeFilterModal}
            onApply={applyFilters}
            onReset={resetFilters}
          />
        )}

      </div>
    </DashboardLayout>
  );
};


/* =================================================
   PATIENT ROW
================================================= */

const PatientRow = ({
  patient,
  getInitials,
  navigate,
}) => {
  return (
    <div
      className="
        group
        grid
        grid-cols-1
        gap-3
        px-5
        py-4
        transition
        hover:bg-slate-50
        md:grid-cols-[2fr_1.2fr_1fr_1.5fr_1.4fr_50px]
        md:items-center
        md:gap-4
      "
    >

      {/* PATIENT */}

      <div className="flex min-w-0 items-center gap-3">

        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[#0B1E41]
            text-sm
            font-bold
            text-white
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

      {/* CASE NUMBER */}

      <div>

        <p className="text-sm font-medium text-slate-700">
          {patient.case_number || "—"}
        </p>

        <p className="text-xs text-slate-400 md:hidden">
          Case Number
        </p>

      </div>

      {/* GENDER */}

      <div>

        <span
          className="
            inline-flex
            rounded-full
            bg-slate-100
            px-2.5
            py-1
            text-xs
            font-medium
            text-slate-600
          "
        >
          {patient.gender || "N/A"}
        </span>

      </div>

      {/* PHONE */}

      <div>

        <p className="text-sm text-slate-600">
          {patient.phone || "N/A"}
        </p>

      </div>

      {/* DATE */}

      <div>

        <p className="text-sm text-slate-600">
          {patient.registration_date || "—"}
        </p>

      </div>

      {/* ACTION */}

      <div className="flex justify-end">

        <button
          type="button"
          onClick={() =>
            navigate(`/patients/${patient.id}`)
          }
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            text-slate-400
            transition
            hover:bg-slate-100
            hover:text-[#0B1E41]
          "
        >
          <ChevronRight size={19} />
        </button>

      </div>

    </div>
  );
};


/* =================================================
   FILTER MODAL
================================================= */

const FilterModal = ({
  tempYear,
  tempMonth,
  setTempYear,
  setTempMonth,
  years,
  months,
  onClose,
  onApply,
  onReset,
}) => {
  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/40
        p-4
      "
      onMouseDown={onClose}
    >

      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          bg-white
          shadow-2xl
        "
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >

        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-100
            px-5
            py-4
          "
        >

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
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-slate-400
              hover:bg-slate-100
              hover:text-slate-700
            "
          >
            <X size={19} />
          </button>

        </div>

        {/* BODY */}

        <div className="space-y-5 p-5">

          {/* YEAR */}

          <div>

            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Year
            </label>

            <div className="relative">

              <CalendarDays
                size={17}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <select
                value={tempYear || ""}
                onChange={(e) =>
                  setTempYear(
                    e.target.value || null
                  )
                }
                className="
                  h-11
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  pl-10
                  pr-4
                  text-sm
                  text-slate-700
                  outline-none
                  focus:border-[#0B1E41]
                  focus:ring-2
                  focus:ring-[#0B1E41]/10
                "
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

          </div>

          {/* MONTH */}

          <div>

            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-slate-700
              "
            >
              Month
            </label>

            <select
              value={tempMonth || "ALL"}
              onChange={(e) =>
                setTempMonth(e.target.value)
              }
              className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                text-sm
                text-slate-700
                outline-none
                focus:border-[#0B1E41]
                focus:ring-2
                focus:ring-[#0B1E41]/10
              "
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

        {/* FOOTER */}

        <div
          className="
            flex
            items-center
            justify-between
            border-t
            border-slate-100
            px-5
            py-4
          "
        >

          <button
            type="button"
            onClick={onReset}
            className="
              rounded-xl
              px-4
              py-2.5
              text-sm
              font-medium
              text-slate-600
              hover:bg-slate-100
            "
          >
            Reset
          </button>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={onClose}
              className="
                rounded-xl
                border
                border-slate-200
                px-4
                py-2.5
                text-sm
                font-medium
                text-slate-600
                hover:bg-slate-50
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onApply}
              className="
                rounded-xl
                bg-[#0B1E41]
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                hover:bg-[#102955]
              "
            >
              Apply Filter
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};


/* =================================================
   SKELETON
================================================= */

const PatientTableSkeleton = () => {
  return (
    <div
      className="
        grid
        grid-cols-1
        gap-4
        px-5
        py-4
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


/* =================================================
   EMPTY
================================================= */

const EmptyState = ({ searchQuery }) => (
  <div
    className="
      flex
      min-h-[350px]
      flex-col
      items-center
      justify-center
      rounded-2xl
      bg-white
      text-center
    "
  >

    <div
      className="
        mb-4
        flex
        h-16
        w-16
        items-center
        justify-center
        rounded-full
        bg-slate-100
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