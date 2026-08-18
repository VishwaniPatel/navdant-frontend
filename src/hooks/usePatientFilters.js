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
  const currentYear =
    new Date().getFullYear();

  const currentMonth =
    new Date().getMonth() + 1;

  const years = useMemo(() => {
    const result = [];

    // Same basic range as mobile:
    // oldest year -> current year
    for (let year = 2018; year <= currentYear; year++) {
      result.push(String(year));
    }

    return result.reverse();
  }, [currentYear]);

  const [selectedYear, setSelectedYear] =
    useState(null);

  const [selectedMonth, setSelectedMonth] =
    useState(null);

  const activeMonthLabel = useMemo(() => {
    if (
      !selectedMonth ||
      selectedMonth === "ALL"
    ) {
      return "All Months";
    }

    return (
      MONTHS.find(
        (month) =>
          month.value === selectedMonth
      )?.label || selectedMonth
    );
  }, [selectedMonth]);

  const applyFilters = (
    year,
    month
  ) => {
    let finalYear = year || null;
    let finalMonth = month || "ALL";

    if (
      finalMonth !== "ALL" &&
      !finalYear
    ) {
      finalYear =
        String(currentYear);
    }

    setSelectedYear(finalYear);
    setSelectedMonth(
      finalMonth === "ALL"
        ? null
        : finalMonth
    );

    return {
      selectedYear: finalYear,
      selectedMonth:
        finalMonth === "ALL"
          ? null
          : finalMonth,
    };
  };

  const clearFilters = (type) => {
    if (!type) {
      setSelectedYear(null);
      setSelectedMonth(null);

      return {
        selectedYear: null,
        selectedMonth: null,
      };
    }

    if (type === "year") {
      setSelectedYear(null);
      setSelectedMonth(null);

      return {
        selectedYear: null,
        selectedMonth: null,
      };
    }

    if (type === "month") {
      setSelectedMonth(null);

      return {
        selectedYear,
        selectedMonth: null,
      };
    }

    return {
      selectedYear,
      selectedMonth,
    };
  };

  return {
    selectedYear,
    selectedMonth,

    years,
    months: MONTHS,

    activeMonthLabel,

    applyFilters,
    clearFilters,
  };
};