import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  IndianRupee,
  Users,
  Receipt,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  WalletCards,
  Download,
  FileText,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import DashboardLayout from "../components/layouts/DashboardLayout";
import PatientService from "../services/patients.service";
import ExpenseService from "../services/expenses.service";

/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(number);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat("en-IN").format(
    Number(value || 0)
  );
};

const formatDate = (date) => {
  if (!date) return "";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return date;
  }

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateForAPI = (date) => {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getFirstValue = (
  obj,
  keys,
  fallback = 0
) => {
  if (!obj) return fallback;

  for (const key of keys) {
    if (
      obj[key] !== undefined &&
      obj[key] !== null
    ) {
      return obj[key];
    }
  }

  return fallback;
};

/* =========================================================
   GET PATIENTS FROM RESPONSE
========================================================= */

const getPatientsFromResponse = (
  response
) => {
  if (
    Array.isArray(response?.patients)
  ) {
    return response.patients;
  }

  if (
    Array.isArray(
      response?.data?.patients
    )
  ) {
    return response.data.patients;
  }

  return [];
};

/* =========================================================
   REMOVE DUPLICATE PATIENTS
========================================================= */

const uniquePatients = (patients) => {
  return Array.from(
    new Map(
      patients.map((patient, index) => {
        const key =
          patient?.id ??
          patient?.patient_id ??
          patient?.case_number ??
          `${patient?.name || "patient"}-${
            patient?.phone ||
            patient?.mobile ||
            ""
          }-${index}`;

        return [String(key), patient];
      })
    ).values()
  );
};

/* =========================================================
   REPORT CARD
========================================================= */

const ReportCard = ({
  title,
  value,
  icon: Icon,
  iconClass,
  bgClass,
}) => {
  return (
    <div
      className="
        rounded-2xl border border-slate-200
        bg-white p-5 shadow-sm
        transition hover:shadow-md
      "
    >
      <div
        className={`
          flex h-11 w-11 items-center justify-center
          rounded-xl ${bgClass}
        `}
      >
        <Icon
          size={21}
          className={iconClass}
        />
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-slate-400">
          {title}
        </p>

        <p className="mt-1 text-2xl font-bold text-[#0B1E41]">
          {value}
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   TOOLTIP
========================================================= */

const CustomTooltip = ({
  active,
  payload,
  label,
}) => {
  if (
    !active ||
    !payload ||
    !payload.length
  ) {
    return null;
  }

  return (
    <div
      className="
        rounded-xl border border-slate-200
        bg-white px-4 py-3 shadow-xl
      "
    >
      <p className="mb-2 text-xs font-semibold text-slate-500">
        {label}
      </p>

      {payload.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-5"
        >
          <span className="text-xs text-slate-500">
            {item.name}
          </span>

          <span className="text-sm font-bold text-[#0B1E41]">
            {item.name
              ?.toLowerCase()
              .includes("collection") ||
            item.name
              ?.toLowerCase()
              .includes("expense")
              ? formatCurrency(
                  item.value
                )
              : formatNumber(
                  item.value
                )}
          </span>
        </div>
      ))}
    </div>
  );
};

/* =========================================================
   REPORTS
========================================================= */

const Reports = () => {
  const [loading, setLoading] =
    useState(true);

  const [pdfLoading, setPdfLoading] =
    useState(false);

  /*
   * Available:
   *
   * last_7_days
   * this_month
   * last_month
   * specific_month
   * this_year
   * specific_year
   * specific_period
   * all
   */

  const [period, setPeriod] =
    useState("this_month");

  const [selectedMonth, setSelectedMonth] =
    useState(() => {
      const today = new Date();

      return `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}`;
    });

  const [selectedYear, setSelectedYear] =
    useState(
      new Date().getFullYear()
    );

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [patientReport, setPatientReport] =
    useState(null);

  const [expenseReport, setExpenseReport] =
    useState(null);

  const [error, setError] =
    useState("");

  /* =======================================================
     PERIOD LABEL
  ======================================================= */

  const periodLabel = useMemo(() => {
    switch (period) {
      case "last_7_days":
        return "Last 7 Days";

      case "this_month":
        return "This Month";

      case "last_month":
        return "Last Month";

      case "specific_month": {
        if (!selectedMonth) {
          return "Specific Month";
        }

        const [year, month] =
          selectedMonth.split("-");

        const date = new Date(
          Number(year),
          Number(month) - 1,
          1
        );

        return date.toLocaleDateString(
          "en-IN",
          {
            month: "long",
            year: "numeric",
          }
        );
      }

      case "this_year":
        return "This Year";

      case "specific_year":
        return `Year ${selectedYear}`;

      case "specific_period":
        if (
          startDate &&
          endDate
        ) {
          return `${formatDate(
            startDate
          )} - ${formatDate(endDate)}`;
        }

        return "Specific Period";

      case "all":
        return "All Patients";

      default:
        return "This Month";
    }
  }, [
    period,
    selectedMonth,
    selectedYear,
    startDate,
    endDate,
  ]);

  /* =======================================================
     PATIENT FILTERS
  ======================================================= */

  const getPatientFilters =
    useCallback(() => {
      const today = new Date();

      switch (period) {
        /* =====================================
           THIS MONTH
        ===================================== */

        case "this_month":
          return {
            registration_month:
              `${today.getFullYear()}-${String(
                today.getMonth() + 1
              ).padStart(2, "0")}`,
          };

        /* =====================================
           LAST MONTH
        ===================================== */

        case "last_month": {
          const lastMonth =
            new Date(
              today.getFullYear(),
              today.getMonth() - 1,
              1
            );

          return {
            registration_month:
              `${lastMonth.getFullYear()}-${String(
                lastMonth.getMonth() + 1
              ).padStart(2, "0")}`,
          };
        }

        /* =====================================
           SPECIFIC MONTH
        ===================================== */

        case "specific_month":
          return selectedMonth
            ? {
                registration_month:
                  selectedMonth,
              }
            : {};

        /* =====================================
           THIS YEAR
        ===================================== */

        case "this_year":
          return {
            registration_year:
              today.getFullYear(),
          };

        /* =====================================
           SPECIFIC YEAR
        ===================================== */

        case "specific_year":
          return {
            registration_year:
              Number(selectedYear),
          };

        /* =====================================
           ALL
        ===================================== */

        case "all":
          return {};

        /* =====================================
           HANDLED SEPARATELY
        ===================================== */

        case "last_7_days":
        case "specific_period":
        default:
          return {};
      }
    }, [
      period,
      selectedMonth,
      selectedYear,
    ]);

  /* =======================================================
     LAST 7 DAYS PATIENT REPORT
  ======================================================= */

  const getLast7DaysPatients =
    useCallback(async () => {
      const today = new Date();

      const requests = [];

      for (let i = 0; i < 7; i++) {
        const date = new Date(
          today
        );

        date.setDate(
          today.getDate() - i
        );

        const dateString =
          formatDateForAPI(date);

        requests.push(
          PatientService.getPatientReport(
            {
              registration_date:
                dateString,
            }
          )
        );
      }

      const responses =
        await Promise.all(
          requests
        );

      const patients = [];

      responses.forEach(
        (response) => {
          patients.push(
            ...getPatientsFromResponse(
              response
            )
          );
        }
      );

      const finalPatients =
        uniquePatients(
          patients
        );

      return {
        status: "success",
        total:
          finalPatients.length,
        patients:
          finalPatients,
      };
    }, []);

  /* =======================================================
     SPECIFIC PERIOD PATIENT REPORT
     
     API does not currently support:
     
     start_date
     end_date
     
     So we request each date separately.
  ======================================================= */

  const getPatientsByDateRange =
    useCallback(async () => {
      if (
        !startDate ||
        !endDate
      ) {
        return {
          status: "success",
          total: 0,
          patients: [],
        };
      }

      const start = new Date(
        `${startDate}T00:00:00`
      );

      const end = new Date(
        `${endDate}T00:00:00`
      );

      if (start > end) {
        throw new Error(
          "Start date cannot be after end date."
        );
      }

      const requests = [];

      const current = new Date(
        start
      );

      while (current <= end) {
        const dateString =
          formatDateForAPI(
            current
          );

        requests.push(
          PatientService.getPatientReport(
            {
              registration_date:
                dateString,
            }
          )
        );

        current.setDate(
          current.getDate() + 1
        );
      }

      const responses =
        await Promise.all(
          requests
        );

      const patients = [];

      responses.forEach(
        (response) => {
          patients.push(
            ...getPatientsFromResponse(
              response
            )
          );
        }
      );

      const finalPatients =
        uniquePatients(
          patients
        );

      return {
        status: "success",
        total:
          finalPatients.length,
        patients:
          finalPatients,
      };
    }, [
      startDate,
      endDate,
    ]);

  /* =======================================================
     FETCH REPORTS
  ======================================================= */

  const fetchReports =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        let patientResponse;

        /* =====================================
           LAST 7 DAYS
        ===================================== */

        if (
          period === "last_7_days"
        ) {
          patientResponse =
            await getLast7DaysPatients();
        }

        /* =====================================
           SPECIFIC PERIOD
        ===================================== */

        else if (
          period === "specific_period"
        ) {
          if (
            !startDate ||
            !endDate
          ) {
            setPatientReport({
              status: "success",
              total: 0,
              patients: [],
            });

            setLoading(false);

            return;
          }

          patientResponse =
            await getPatientsByDateRange();
        }

        /* =====================================
           MONTH / YEAR / ALL
        ===================================== */

        else {
          const filters =
            getPatientFilters();

          console.log(
            "PATIENT FILTERS:",
            filters
          );

          patientResponse =
            await PatientService.getPatientReport(
              filters
            );
        }

        /* =====================================
           EXPENSE REPORT
           
           Keep this separate for now.
           
           Your Expense API structure has not
           been provided yet.
        ===================================== */

        const expenseResponse =
          await ExpenseService.getExpenseReport(
            {}
          );

        console.log(
          "PATIENT REPORT:",
          patientResponse
        );

        console.log(
          "EXPENSE REPORT:",
          expenseResponse
        );

        setPatientReport(
          patientResponse
        );

        setExpenseReport(
          expenseResponse
        );
      } catch (err) {
        console.error(
          "Report fetch error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load reports."
        );

        setPatientReport(null);
        setExpenseReport(null);
      } finally {
        setLoading(false);
      }
    }, [
      period,
      startDate,
      endDate,
      getPatientFilters,
      getLast7DaysPatients,
      getPatientsByDateRange,
    ]);

  /* =======================================================
     FETCH ON FILTER CHANGE
  ======================================================= */

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  /* =======================================================
     NORMALIZE REPORT
  ======================================================= */

  const reportData = useMemo(() => {
    const patient =
      patientReport?.data ||
      patientReport ||
      {};

    const expense =
      expenseReport?.data ||
      expenseReport ||
      {};

    const patients =
      getPatientsFromResponse(
        patientReport
      );

    const totalPatients =
      patients.length > 0
        ? patients.length
        : getFirstValue(
            patient,
            [
              "total_patients",
              "totalPatients",
              "patients_count",
              "patient_count",
              "total",
              "count",
            ]
          );

    const newPatients =
      getFirstValue(
        patient,
        [
          "new_patients",
          "newPatients",
          "new_patient_count",
        ],
        totalPatients
      );

    const totalCollection =
      getFirstValue(
        patient,
        [
          "total_collection",
          "totalCollection",
          "total_payment",
          "total_payments",
          "collection",
        ]
      );

    const totalExpenses =
      getFirstValue(
        expense,
        [
          "total_amount",
          "total_expenses",
          "totalExpenses",
          "total",
          "amount",
        ]
      );

    const netIncome =
      Number(
        totalCollection || 0
      ) -
      Number(
        totalExpenses || 0
      );

    return {
      totalPatients,
      newPatients,
      totalCollection,
      totalExpenses,
      netIncome,
      patient,
      expense,
    };
  }, [
    patientReport,
    expenseReport,
  ]);

  /* =======================================================
     PATIENT CHART
  ======================================================= */

  const patientChartData =
    useMemo(() => {
      const patient =
        reportData.patient || {};

      const source =
        patient.daily ||
        patient.daily_data ||
        patient.chart ||
        patient.chart_data ||
        patient.trend ||
        [];

      if (!Array.isArray(source)) {
        return [];
      }

      return source.map(
        (item) => ({
          date:
            item.date ||
            item.label ||
            item.day ||
            "",

          Patients: Number(
            item.patients ||
              item.patient_count ||
              item.count ||
              0
          ),
        })
      );
    }, [
      reportData.patient,
    ]);

  /* =======================================================
     EXPENSE CHART
  ======================================================= */

  const expenseChartData =
    useMemo(() => {
      const expense =
        reportData.expense || {};

      const source =
        expense.categories ||
        expense.expense_categories ||
        expense.breakdown ||
        [];

      if (!Array.isArray(source)) {
        return [];
      }

      return source.map(
        (item) => ({
          name:
            item.name ||
            item.category ||
            "Other",

          amount: Number(
            item.amount ||
              item.total ||
              0
          ),
        })
      );
    }, [
      reportData.expense,
    ]);

  /* =======================================================
     DOWNLOAD PATIENT PDF
  ======================================================= */

  const handleDownloadPatientPDF =
    async () => {
      try {
        setPdfLoading(true);
        setError("");

        let response;

        /* =====================================
           LAST 7 DAYS
        ===================================== */

        if (
          period === "last_7_days"
        ) {
          response =
            await getLast7DaysPatients();
        }

        /* =====================================
           SPECIFIC PERIOD
        ===================================== */

        else if (
          period === "specific_period"
        ) {
          if (
            !startDate ||
            !endDate
          ) {
            setError(
              "Please select both start date and end date."
            );

            return;
          }

          response =
            await getPatientsByDateRange();
        }

        /* =====================================
           OTHER FILTERS
        ===================================== */

        else {
          const filters =
            getPatientFilters();

          console.log(
            "PDF PATIENT FILTERS:",
            filters
          );

          response =
            await PatientService.getPatientReport(
              filters
            );
        }

        console.log(
          "PDF PATIENT RESPONSE:",
          response
        );

        const patients =
          getPatientsFromResponse(
            response
          );

        console.log(
          "PDF PATIENT COUNT:",
          patients.length
        );

        if (!patients.length) {
          setError(
            `No patient records found for ${periodLabel.toLowerCase()}.`
          );

          return;
        }

        /* =====================================
           PDF
        ===================================== */

        const doc = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });

        /* =====================================
           HEADER
        ===================================== */

        doc.setFillColor(
          11,
          30,
          65
        );

        doc.rect(
          0,
          0,
          297,
          32,
          "F"
        );

        doc.setTextColor(
          255,
          255,
          255
        );

        doc.setFontSize(18);

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.text(
          "NAVDANT DENTAL CLINIC",
          14,
          13
        );

        doc.setFontSize(10);

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.text(
          "Patient Report",
          14,
          21
        );

        doc.text(
          `Period: ${periodLabel}`,
          14,
          27
        );

        /* =====================================
           SUMMARY
        ===================================== */

        doc.setTextColor(
          11,
          30,
          65
        );

        doc.setFontSize(11);

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.text(
          `Total Patients: ${patients.length}`,
          14,
          42
        );

        doc.setFont(
          "helvetica",
          "normal"
        );

        doc.setFontSize(9);

        doc.setTextColor(
          100,
          116,
          139
        );

        doc.text(
          `Generated on: ${formatDate(
            new Date()
          )}`,
          14,
          48
        );

        /* =====================================
           PATIENT TABLE
        ===================================== */

        const rows =
          patients.map(
            (
              patient,
              index
            ) => {
              const name =
                patient.name ||
                patient.full_name ||
                patient.patient_name ||
                [
                  patient.first_name,
                  patient.last_name,
                ]
                  .filter(Boolean)
                  .join(" ") ||
                "-";

              const phone =
                patient.phone ||
                patient.mobile ||
                patient.mobile_number ||
                patient.contact_number ||
                "-";

              const gender =
                patient.gender ||
                "-";

              const date =
                patient.created_at ||
                patient.createdAt ||
                patient.registration_date ||
                patient.registered_date ||
                patient.date ||
                patient.created_on;

              const patientId =
                patient.case_number ||
                "-";

              return [
                index + 1,
                patientId,
                name,
                phone,
                gender,
                date
                  ? formatDate(
                      date
                    )
                  : "-",
              ];
            }
          );

        autoTable(doc, {
          startY: 55,

          head: [
            [
              "#",
              "Patient Case No.",
              "Patient Name",
              "Mobile",
              "Gender",
              "Registered Date",
            ],
          ],

          body: rows,

          theme: "grid",

          tableWidth: "auto",

          styles: {
            fontSize: 9,
            cellPadding: 3,
            textColor: [
              30,
              41,
              59,
            ],
            valign: "middle",
          },

          headStyles: {
            fillColor: [
              11,
              30,
              65,
            ],

            textColor: [
              255,
              255,
              255,
            ],

            fontStyle:
              "bold",

            halign:
              "center",
          },

          alternateRowStyles: {
            fillColor: [
              248,
              250,
              252,
            ],
          },

          /*
           * KEEPING YOUR UPDATED
           * CELL WIDTH
           */

          columnStyles: {
            /* # */
            0: {
              cellWidth: 20,
              halign: "center",
            },

            /* Patient ID */
            1: {
              cellWidth: 25,
              halign: "center",
            },

            /* Patient Name */
            2: {
              cellWidth: 80,
            },

            /* Mobile */
            3: {
              cellWidth: 40,
              halign: "center",
            },

            /* Gender */
            4: {
              cellWidth: 25,
              halign: "center",
            },

            /* Registered Date */
            5: {
              cellWidth: 40,
              halign: "center",
            },
          },

          margin: {
            left: 14,
            right: 14,
          },

          didDrawPage: () => {
            const pageHeight =
              doc.internal
                .pageSize
                .height;

            doc.setFontSize(8);

            doc.setTextColor(
              100,
              116,
              139
            );

            doc.text(
              "Navdant Dental Clinic • Patient Report",
              14,
              pageHeight - 8
            );
          },
        });

        /* =====================================
           PAGE NUMBERS
        ===================================== */

        const pageCount =
          doc.internal.getNumberOfPages();

        for (
          let i = 1;
          i <= pageCount;
          i++
        ) {
          doc.setPage(i);

          const pageHeight =
            doc.internal
              .pageSize
              .height;

          doc.setFontSize(8);

          doc.setTextColor(
            100,
            116,
            139
          );

          doc.text(
            `Page ${i} of ${pageCount}`,
            260,
            pageHeight - 8
          );
        }

        /* =====================================
           DOWNLOAD
        ===================================== */

        const fileName =
          `Navdant_Patient_Report_${period
            .replace(/_/g, "-")}.pdf`;

        doc.save(fileName);
      } catch (err) {
        console.error(
          "Patient PDF error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to generate patient PDF."
        );
      } finally {
        setPdfLoading(false);
      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full">
          <div className="mb-6">
            <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />

            <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="mb-6 h-16 animate-pulse rounded-2xl bg-slate-200" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-36 animate-pulse rounded-2xl bg-slate-200"
                />
              )
            )}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="h-80 animate-pulse rounded-2xl bg-slate-200 lg:col-span-2" />

            <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <DashboardLayout>
      <div className="w-full">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">

          <div className="flex items-center gap-3">

            <div
              className="
                flex h-11 w-11
                items-center justify-center
                rounded-xl bg-[#0B1E41]/10
              "
            >
              <BarChart3
                size={22}
                className="text-[#0B1E41]"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#0B1E41]">
                Clinic Reports
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Track your clinic performance
                and finances
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={fetchReports}
            className="
              inline-flex items-center gap-2
              rounded-xl border border-slate-200
              bg-white px-4 py-2.5
              text-sm font-semibold
              text-slate-600 shadow-sm
              transition hover:bg-slate-50
            "
          >
            <RefreshCw size={16} />
            Refresh
          </button>

        </div>

        {/* =================================================
            FILTER
        ================================================= */}

        <div
          className="
            mb-6 flex flex-wrap
            items-center justify-between
            gap-4 rounded-2xl
            border border-slate-200
            bg-white px-5 py-4
            shadow-sm
          "
        >

          <div className="flex items-center gap-3">

            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl bg-blue-50
                text-blue-600
              "
            >
              <CalendarDays size={19} />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-400">
                Report Period
              </p>

              <p className="mt-0.5 text-sm font-semibold text-[#0B1E41]">
                {periodLabel}
              </p>
            </div>

          </div>

          <div className="flex flex-wrap items-center gap-3">

            {/* =============================================
                PERIOD SELECT
            ============================================= */}

            <div className="relative">

              <select
                value={period}
                onChange={(e) => {
                  setPeriod(
                    e.target.value
                  );

                  setError("");
                }}
                className="
                  min-w-[190px]
                  appearance-none
                  rounded-xl
                  border border-slate-200
                  bg-white
                  py-2.5 pl-4 pr-10
                  text-sm font-medium
                  text-slate-700
                  outline-none
                  focus:border-[#0B1E41]
                  focus:ring-2
                  focus:ring-[#0B1E41]/10
                "
              >

                <option value="last_7_days">
                  Last 7 Days
                </option>

                <option value="this_month">
                  This Month
                </option>

                <option value="last_month">
                  Last Month
                </option>

                <option value="specific_month">
                  Specific Month
                </option>

                <option value="this_year">
                  This Year
                </option>

                <option value="specific_year">
                  Specific Year
                </option>

                <option value="specific_period">
                  Specific Period
                </option>

                <option value="all">
                  All Patients
                </option>

              </select>

              <ChevronDown
                size={16}
                className="
                  pointer-events-none
                  absolute right-3 top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

            </div>

            {/* =============================================
                SPECIFIC MONTH
            ============================================= */}

            {period ===
              "specific_month" && (
              <input
                type="month"
                value={
                  selectedMonth
                }
                onChange={(e) => {
                  setSelectedMonth(
                    e.target.value
                  );
                }}
                className="
                  rounded-xl
                  border border-slate-200
                  bg-white
                  px-4 py-2.5
                  text-sm font-medium
                  text-slate-700
                  outline-none
                  focus:border-[#0B1E41]
                  focus:ring-2
                  focus:ring-[#0B1E41]/10
                "
              />
            )}

            {/* =============================================
                SPECIFIC YEAR
            ============================================= */}

            {period ===
              "specific_year" && (
              <select
                value={
                  selectedYear
                }
                onChange={(e) =>
                  setSelectedYear(
                    Number(
                      e.target.value
                    )
                  )
                }
                className="
                  min-w-[130px]
                  rounded-xl
                  border border-slate-200
                  bg-white
                  px-4 py-2.5
                  text-sm font-medium
                  text-slate-700
                  outline-none
                  focus:border-[#0B1E41]
                  focus:ring-2
                  focus:ring-[#0B1E41]/10
                "
              >
                {Array.from(
                  {
                    length: 10,
                  },
                  (
                    _,
                    index
                  ) => {
                    const year =
                      new Date().getFullYear() -
                      index;

                    return (
                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>
                    );
                  }
                )}
              </select>
            )}

            {/* =============================================
                SPECIFIC PERIOD
            ============================================= */}

            {period ===
              "specific_period" && (
              <div className="flex flex-wrap items-center gap-2">

                <input
                  type="date"
                  value={
                    startDate
                  }
                  max={
                    endDate ||
                    undefined
                  }
                  onChange={(e) => {
                    setStartDate(
                      e.target.value
                    );
                  }}
                  className="
                    rounded-xl
                    border border-slate-200
                    bg-white
                    px-4 py-2.5
                    text-sm font-medium
                    text-slate-700
                    outline-none
                    focus:border-[#0B1E41]
                    focus:ring-2
                    focus:ring-[#0B1E41]/10
                  "
                />

                <span className="text-sm text-slate-400">
                  to
                </span>

                <input
                  type="date"
                  value={
                    endDate
                  }
                  min={
                    startDate ||
                    undefined
                  }
                  onChange={(e) => {
                    setEndDate(
                      e.target.value
                    );
                  }}
                  className="
                    rounded-xl
                    border border-slate-200
                    bg-white
                    px-4 py-2.5
                    text-sm font-medium
                    text-slate-700
                    outline-none
                    focus:border-[#0B1E41]
                    focus:ring-2
                    focus:ring-[#0B1E41]/10
                  "
                />

              </div>
            )}

            {/* =============================================
                PATIENT PDF
            ============================================= */}

            <button
              type="button"
              onClick={
                handleDownloadPatientPDF
              }
              disabled={
                pdfLoading
              }
              className="
                inline-flex items-center
                justify-center gap-2
                rounded-xl
                bg-[#0B1E41]
                px-4 py-2.5
                text-sm font-semibold
                text-white
                shadow-sm transition
                hover:bg-[#162D59]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >

              {pdfLoading ? (
                <RefreshCw
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Download size={16} />
              )}

              {pdfLoading
                ? "Generating..."
                : "Patient PDF"}

            </button>

          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className="
              mb-5 flex items-center
              justify-between gap-3
              rounded-xl border
              border-red-100
              bg-red-50 px-4 py-3
              text-sm text-red-600
            "
          >

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="font-bold"
            >
              ×
            </button>

          </div>
        )}

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div
          className="
            grid grid-cols-1 gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >

          <ReportCard
            title="Total Patients"
            value={formatNumber(
              reportData.totalPatients
            )}
            icon={Users}
            bgClass="bg-blue-50"
            iconClass="text-blue-600"
          />

          <ReportCard
            title="New Patients"
            value={formatNumber(
              reportData.newPatients
            )}
            icon={Users}
            bgClass="bg-indigo-50"
            iconClass="text-indigo-600"
          />

          <ReportCard
            title="Total Collection"
            value={formatCurrency(
              reportData.totalCollection
            )}
            icon={IndianRupee}
            bgClass="bg-green-50"
            iconClass="text-green-600"
          />

          <ReportCard
            title="Total Expenses"
            value={formatCurrency(
              reportData.totalExpenses
            )}
            icon={Receipt}
            bgClass="bg-red-50"
            iconClass="text-red-600"
          />

        </div>

        {/* =================================================
            NET INCOME
        ================================================= */}

        <div className="mt-4">

          <div
            className="
              flex items-center
              justify-between
              rounded-2xl
              border border-slate-200
              bg-white px-5 py-4
              shadow-sm
            "
          >

            <div className="flex items-center gap-3">

              <div
                className={`
                  flex h-11 w-11
                  items-center justify-center
                  rounded-xl
                  ${
                    reportData.netIncome >=
                    0
                      ? "bg-green-50"
                      : "bg-red-50"
                  }
                `}
              >

                {reportData.netIncome >=
                0 ? (
                  <TrendingUp
                    size={19}
                    className="text-green-600"
                  />
                ) : (
                  <TrendingDown
                    size={19}
                    className="text-red-600"
                  />
                )}

              </div>

              <div>

                <p className="text-xs text-slate-400">
                  Net Income
                </p>

                <p
                  className={`
                    mt-1 text-xl font-bold
                    ${
                      reportData.netIncome >=
                      0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  `}
                >
                  {formatCurrency(
                    reportData.netIncome
                  )}
                </p>

              </div>

            </div>

            <span
              className={`
                rounded-lg
                px-3 py-1.5
                text-xs font-semibold
                ${
                  reportData.netIncome >=
                  0
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-600"
                }
              `}
            >
              {reportData.netIncome >=
              0
                ? "Profit"
                : "Loss"}
            </span>

          </div>

        </div>

        {/* =================================================
            CHARTS
        ================================================= */}

        <div
          className="
            mt-5 grid
            grid-cols-1 gap-5
            lg:grid-cols-3
          "
        >

          {/* ===============================================
              PATIENT TREND
          =============================================== */}

          <div
            className="
              rounded-2xl
              border border-slate-200
              bg-white p-5 shadow-sm
              lg:col-span-2
            "
          >

            <div className="mb-5">

              <h2 className="text-base font-bold text-[#0B1E41]">
                Patient Registration Trend
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                New patient registrations
                during the selected period
              </p>

            </div>

            <div className="h-[280px]">

              {patientChartData.length >
              0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <AreaChart
                    data={
                      patientChartData
                    }
                    margin={{
                      top: 5,
                      right: 5,
                      left: -20,
                      bottom: 0,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="date"
                      tick={{
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      content={
                        <CustomTooltip />
                      }
                    />

                    <Area
                      type="monotone"
                      dataKey="Patients"
                      name="Patients"
                      stroke="#0B1E41"
                      fill="#0B1E41"
                      fillOpacity={0.08}
                      strokeWidth={2}
                    />

                  </AreaChart>

                </ResponsiveContainer>
              ) : (
                <EmptyChart
                  icon={Users}
                  text="No patient registration data available"
                />
              )}

            </div>
          </div>

          {/* ===============================================
              FINANCIAL SUMMARY
          =============================================== */}

          <div
            className="
              rounded-2xl
              border border-slate-200
              bg-white p-5 shadow-sm
            "
          >

            <div className="mb-6">

              <h2 className="text-base font-bold text-[#0B1E41]">
                Financial Summary
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Income and expenses
              </p>

            </div>

            <div className="space-y-5">

              <FinancialRow
                icon={IndianRupee}
                title="Collection"
                value={formatCurrency(
                  reportData.totalCollection
                )}
                bgClass="bg-green-50"
                iconClass="text-green-600"
              />

              <FinancialRow
                icon={Receipt}
                title="Expenses"
                value={formatCurrency(
                  reportData.totalExpenses
                )}
                bgClass="bg-red-50"
                iconClass="text-red-600"
              />

              <div className="border-t border-slate-100 pt-5">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs text-slate-400">
                      Net Income
                    </p>

                    <p
                      className={`
                        mt-1 text-xl font-bold
                        ${
                          reportData.netIncome >=
                          0
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      `}
                    >
                      {formatCurrency(
                        reportData.netIncome
                      )}
                    </p>

                  </div>

                  <div
                    className={`
                      flex h-11 w-11
                      items-center justify-center
                      rounded-xl
                      ${
                        reportData.netIncome >=
                        0
                          ? "bg-green-50"
                          : "bg-red-50"
                      }
                    `}
                  >

                    <WalletCards
                      size={20}
                      className={
                        reportData.netIncome >=
                        0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    />

                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>

        {/* =================================================
            EXPENSE BREAKDOWN
        ================================================= */}

        <div
          className="
            mt-5 rounded-2xl
            border border-slate-200
            bg-white p-5 shadow-sm
          "
        >

          <div className="mb-5">

            <h2 className="text-base font-bold text-[#0B1E41]">
              Expense Overview
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Breakdown of clinic expenses
            </p>

          </div>

          <div className="h-[280px]">

            {expenseChartData.length >
            0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={
                    expenseChartData
                  }
                  margin={{
                    top: 5,
                    right: 10,
                    left: -10,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(
                      value
                    ) =>
                      `₹${value}`
                    }
                  />

                  <Tooltip
                    content={
                      <CustomTooltip />
                    }
                  />

                  <Bar
                    dataKey="amount"
                    name="Expense"
                    fill="#0B1E41"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                    barSize={42}
                  />

                </BarChart>

              </ResponsiveContainer>
            ) : (
              <EmptyChart
                icon={Receipt}
                text="No expense breakdown available"
              />
            )}

          </div>
        </div>

        {/* =================================================
            PATIENT PDF CARD
        ================================================= */}

        <div
          className="
            mt-5 flex flex-col
            gap-4 rounded-2xl
            border border-slate-200
            bg-white p-5
            shadow-sm
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div className="flex items-center gap-4">

            <div
              className="
                flex h-11 w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#0B1E41]/10
              "
            >
              <FileText
                size={21}
                className="text-[#0B1E41]"
              />
            </div>

            <div>

              <h2 className="text-sm font-bold text-[#0B1E41]">
                Patient Report
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Download the patient list
                for{" "}
                {periodLabel.toLowerCase()}.
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={
              handleDownloadPatientPDF
            }
            disabled={
              pdfLoading
            }
            className="
              inline-flex shrink-0
              items-center
              justify-center gap-2
              rounded-xl
              border border-[#0B1E41]
              bg-white px-4 py-2.5
              text-sm font-semibold
              text-[#0B1E41]
              transition
              hover:bg-[#0B1E41]
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >

            {pdfLoading ? (
              <RefreshCw
                size={16}
                className="animate-spin"
              />
            ) : (
              <Download size={16} />
            )}

            Download Patient PDF

          </button>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div
          className="
            mt-5 flex items-center
            gap-3 rounded-xl
            border border-blue-100
            bg-blue-50 px-4 py-3
          "
        >

          <BarChart3
            size={18}
            className="shrink-0 text-blue-600"
          />

          <p className="text-xs text-blue-700">
            Reports are generated from your
            patient, payment, and expense
            data for the selected period.
          </p>

        </div>

      </div>
    </DashboardLayout>
  );
};

/* =========================================================
   FINANCIAL ROW
========================================================= */

const FinancialRow = ({
  icon: Icon,
  title,
  value,
  bgClass,
  iconClass,
}) => {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div
          className={`
            flex h-10 w-10
            items-center justify-center
            rounded-xl ${bgClass}
          `}
        >

          <Icon
            size={18}
            className={iconClass}
          />

        </div>

        <div>

          <p className="text-xs text-slate-400">
            {title}
          </p>

          <p className="mt-0.5 text-sm font-bold text-[#0B1E41]">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
};

/* =========================================================
   EMPTY CHART
========================================================= */

const EmptyChart = ({
  icon: Icon,
  text,
}) => {
  return (
    <div
      className="
        flex h-full
        flex-col items-center
        justify-center
      "
    >

      <div
        className="
          flex h-12 w-12
          items-center justify-center
          rounded-xl bg-slate-100
          text-slate-400
        "
      >
        <Icon size={21} />
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {text}
      </p>

    </div>
  );
};

export default Reports;