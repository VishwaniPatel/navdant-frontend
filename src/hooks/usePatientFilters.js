import { useMemo, useState } from "react";

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export const usePatientFilters = () => {
  const currentYear = new Date().getFullYear();

  const years = useMemo(() => {
    const result = [];

    for (let year = 2018; year <= currentYear; year++) {
      result.push(String(year));
    }

    return result.reverse();
  }, [currentYear]);

  // Applied filters
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Temporary filters inside modal
  const [tempYear, setTempYear] = useState(null);
  const [tempMonth, setTempMonth] = useState("ALL");

  const [filterModalVisible, setFilterModalVisible] =
    useState(false);

  const activeMonthLabel = useMemo(() => {
    if (!selectedMonth || selectedMonth === "ALL") {
      return "All Months";
    }

    return (
      MONTHS.find(
        (month) => month.value === selectedMonth
      )?.label || selectedMonth
    );
  }, [selectedMonth]);

  const hasActiveFilters =
    !!selectedYear || !!selectedMonth;

  // =========================
  // OPEN MODAL
  // =========================

  const openFilterModal = () => {
    setTempYear(selectedYear);
    setTempMonth(selectedMonth || "ALL");
    setFilterModalVisible(true);
  };

  // =========================
  // CLOSE MODAL
  // =========================

  const closeFilterModal = () => {
    setFilterModalVisible(false);
  };

  // =========================
  // APPLY
  // =========================

  const applyFilters = () => {
    let finalYear = tempYear || null;
    let finalMonth = tempMonth || "ALL";

    // If month selected without year,
    // automatically use current year.
    if (finalMonth !== "ALL" && !finalYear) {
      finalYear = String(currentYear);
    }

    setSelectedYear(finalYear);

    setSelectedMonth(
      finalMonth === "ALL" ? null : finalMonth
    );

    setFilterModalVisible(false);
  };

  // =========================
  // RESET
  // =========================

  const resetFilters = () => {
    setTempYear(null);
    setTempMonth("ALL");

    setSelectedYear(null);
    setSelectedMonth(null);

    setFilterModalVisible(false);
  };

  // =========================
  // CLEAR YEAR
  // =========================

  const clearYearFilter = () => {
    setSelectedYear(null);
    setSelectedMonth(null);

    setTempYear(null);
    setTempMonth("ALL");
  };

  // =========================
  // CLEAR MONTH
  // =========================

  const clearMonthFilter = () => {
    setSelectedMonth(null);

    setTempMonth("ALL");
  };

  return {
    selectedYear,
    selectedMonth,

    tempYear,
    tempMonth,

    setTempYear,
    setTempMonth,

    years,
    months: MONTHS,

    activeMonthLabel,
    hasActiveFilters,

    filterModalVisible,

    openFilterModal,
    closeFilterModal,

    applyFilters,
    resetFilters,

    clearYearFilter,
    clearMonthFilter,
  };
};