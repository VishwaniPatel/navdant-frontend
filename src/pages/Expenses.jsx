import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  Pill,
  Zap,
  FlaskConical,
  FileText,
  UserRound,
  Wrench,
  MoreHorizontal,
  Receipt,
  Search,
  X,
  CalendarDays,
  ReceiptIndianRupee,
} from "lucide-react";

import DashboardLayout from "../components/layouts/DashboardLayout";
import ExpenseService from "../services/expenses.service";

const CATEGORIES = [
  "Medicines",
  "Electricity Bills",
  "Dental Materials",
  "Dental Lab Bills",
  "Form 16 / IT Returns",
  "Staff Salary",
  "Equipment",
  "Other",
];

const CATEGORY_CONFIG = {
  Medicines: {
    icon: Pill,
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },

  "Electricity Bills": {
    icon: Zap,
    bg: "bg-orange-50",
    iconColor: "text-orange-600",
  },

  "Dental Materials": {
    icon: FlaskConical,
    bg: "bg-green-50",
    iconColor: "text-green-600",
  },

  "Dental Lab Bills": {
    icon: ReceiptIndianRupee,
    bg: "bg-pink-50",
    iconColor: "text-pink-600",
  },

  "Form 16 / IT Returns": {
    icon: FileText,
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
  },

  "Staff Salary": {
    icon: UserRound,
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
  },

  Equipment: {
    icon: Wrench,
    bg: "bg-teal-50",
    iconColor: "text-teal-600",
  },

  Other: {
    icon: MoreHorizontal,
    bg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
};

const ExpenseTracker = () => {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  );

  const [loading, setLoading] = useState(true);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [showTotal, setShowTotal] = useState(false);

  // Add / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [form, setForm] = useState({
    title: "",
    type: "Medicines",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    note: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete
  const [deleteLoading, setDeleteLoading] = useState(null);

  /* =====================================================
     LOAD EXPENSES
  ===================================================== */

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);

      const response = await ExpenseService.getExpenseReport();

      if (response.status === "success" && response.expenses) {
        const mappedExpenses = response.expenses.map((item) => ({
          id: item.id,
          title: item.title || "",
          amount: Number(item.amount || 0),
          date: item.date,
          category: item.type,
          note: item.note || "",
        }));

        setExpenses(mappedExpenses);

        let years = [
          ...new Set(
            mappedExpenses
              .map((expense) => Number(expense.date?.split("-")[0]))
              .filter(Boolean)
          ),
        ].sort((a, b) => b - a);

        if (years.length === 0) {
          years = [new Date().getFullYear()];
        }

        setAvailableYears(years);

        if (!years.includes(selectedYear)) {
          setSelectedYear(years[0]);
        }
      } else {
        setExpenses([]);

        const currentYear = new Date().getFullYear();

        setAvailableYears([currentYear]);
        setSelectedYear(currentYear);
      }
    } catch (error) {
      console.error("Failed to load expenses:", error);

      setExpenses([]);

      const currentYear = new Date().getFullYear();

      setAvailableYears([currentYear]);
      setSelectedYear(currentYear);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  /* =====================================================
     YEAR EXPENSES
  ===================================================== */

  const yearExpenses = useMemo(() => {
    return expenses.filter((expense) =>
      expense.date?.startsWith(String(selectedYear))
    );
  }, [expenses, selectedYear]);

  const totalForYear = useMemo(() => {
    return yearExpenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0
    );
  }, [yearExpenses]);

  /* =====================================================
     CATEGORY TOTAL
  ===================================================== */

  const categoryTotals = useMemo(() => {
    const totals = {};

    CATEGORIES.forEach((category) => {
      totals[category] = 0;
    });

    yearExpenses.forEach((expense) => {
      if (!totals[expense.category]) {
        totals[expense.category] = 0;
      }

      totals[expense.category] += Number(expense.amount || 0);
    });

    return totals;
  }, [yearExpenses]);

  /* =====================================================
     OPEN ADD
  ===================================================== */

  const handleAddExpense = () => {
    setEditingExpense(null);

    setForm({
      title: "",
      type: "Medicines",
      date: new Date().toISOString().split("T")[0],
      amount: "",
      note: "",
    });

    setFormErrors({});
    setModalOpen(true);
  };

  /* =====================================================
     OPEN EDIT
  ===================================================== */

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);

    setForm({
      title: expense.title || "",
      type: expense.category || "Other",
      date: expense.date || "",
      amount: String(expense.amount || ""),
      note: expense.note || "",
    });

    setFormErrors({});
    setModalOpen(true);
  };

  /* =====================================================
     FORM CHANGE
  ===================================================== */

  const handleFormChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateForm = () => {
    const errors = {};

    if (!form.title.trim()) {
      errors.title = "Title is required";
    }

    if (!form.date) {
      errors.date = "Date is required";
    }

    if (!form.amount || Number(form.amount) <= 0) {
      errors.amount = "Please enter a valid amount";
    }

    if (!form.type) {
      errors.type = "Category is required";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* =====================================================
     SAVE EXPENSE
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title: form.title.trim(),
        type: form.type,
        date: form.date,
        amount: Number(form.amount),
        note: form.note.trim(),
      };

      if (editingExpense) {
        await ExpenseService.updateExpense(
          editingExpense.id,
          payload
        );
      } else {
        await ExpenseService.createExpense(payload);
      }

      setModalOpen(false);

      await loadExpenses();
    } catch (error) {
      console.error("Save expense error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to save expense."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete = async (expense) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${expense.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(expense.id);

      await ExpenseService.deleteExpense(expense.id);

      await loadExpenses();
    } catch (error) {
      console.error("Delete expense error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to delete expense."
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-GB");
  };

  const handleCategoryClick = (category) => {
  navigate(`/expenses/category/${encodeURIComponent(category)}`, {
    state: {
      category,
      year: new Date().getFullYear(),
    },
  });
};
  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full">
          <div className="mb-6 flex items-center gap-3">
            {/* <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" /> */}

            <div className="space-y-2">
              <div className="h-6 w-44 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-64 animate-pulse rounded bg-slate-200" />
            </div>
          </div>

          <div className="mb-5 h-32 animate-pulse rounded-2xl bg-slate-200" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <DashboardLayout>
      <div className="w-full">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

          <div className="flex items-center gap-3">



            <div>
              <h1 className="text-2xl font-bold text-slate-800">
               Manage and Track Clinic Expenses
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Keep track of expenses and maintain a clear view of your clinic spending
              </p>
            </div>

          </div>

          {/* Add Expense */}

          <button
            type="button"
            onClick={handleAddExpense}
            className="
              inline-flex items-center gap-2
              rounded-xl bg-[#0B1E41]
              px-4 py-2.5
              text-sm font-semibold text-white
              shadow-sm transition
              hover:bg-[#102a59]
            "
          >
            <Plus size={18} />
            Add Expense
          </button>

        </div>

        {/* =================================================
            YEAR + TOTAL SUMMARY
        ================================================= */}

        <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">

          {/* Year */}

          <div className="
            rounded-2xl border border-slate-200
            bg-white p-5 shadow-sm
          ">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Selected Year
                </p>

                <p className="mt-1 text-2xl font-bold text-[#0B1E41]">
                  {selectedYear}
                </p>
              </div>

              <div className="relative">

                <button
                  type="button"
                  onClick={() =>
                    setYearDropdownOpen((prev) => !prev)
                  }
                  className="
                    flex items-center gap-2
                    rounded-xl border border-slate-200
                    bg-slate-50 px-3 py-2
                    text-sm font-medium text-slate-700
                    hover:bg-slate-100
                  "
                >
                  Change Year
                  <ChevronDown size={16} />
                </button>

                {yearDropdownOpen && (
                  <div className="
                    absolute right-0 top-11 z-30
                    w-36 overflow-hidden
                    rounded-xl border border-slate-200
                    bg-white py-1 shadow-xl
                  ">
                    {availableYears.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => {
                          setSelectedYear(year);
                          setYearDropdownOpen(false);
                        }}
                        className={`
                          flex w-full items-center
                          px-4 py-2.5 text-left text-sm
                          transition hover:bg-slate-50
                          ${
                            year === selectedYear
                              ? "font-semibold text-[#0B1E41] bg-slate-50"
                              : "text-slate-600"
                          }
                        `}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}

              </div>

            </div>

          </div>

          {/* Total */}

          <div className="
            lg:col-span-2
            overflow-hidden rounded-2xl
            border border-slate-200
            bg-white shadow-sm
          ">

            <button
              type="button"
              onClick={() => setShowTotal((prev) => !prev)}
              className="
                flex w-full items-center
                justify-between p-5
                text-left transition
                hover:bg-slate-50
              "
            >

              <div className="flex items-center gap-3">

                <div className="
                  flex h-11 w-11 items-center justify-center
                  rounded-xl bg-green-50 text-green-600
                ">
                  <Receipt size={20} />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Total Expenses
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    Expenses for {selectedYear}
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-3">

                <span className="text-xl font-bold text-[#376D0E]">
                  ₹{totalForYear.toLocaleString("en-IN")}
                </span>

                {showTotal ? (
                  <ChevronUp
                    size={19}
                    className="text-slate-400"
                  />
                ) : (
                  <ChevronDown
                    size={19}
                    className="text-slate-400"
                  />
                )}

              </div>

            </button>

            {showTotal && (
              <div className="
                border-t border-slate-100
                bg-slate-50 px-5 py-4
              ">

                <div className="flex items-center justify-between">

                  <span className="text-sm text-slate-500">
                    Total records
                  </span>

                  <span className="text-sm font-semibold text-slate-700">
                    {yearExpenses.length}
                  </span>

                </div>

              </div>
            )}

          </div>

        </div>

        {/* =================================================
            CATEGORY CARDS
        ================================================= */}

        <div className="mb-5 flex items-center justify-between">

          <div>
            <h2 className="text-base font-bold text-slate-800">
              Expense Categories
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Expenses recorded in {selectedYear}
            </p>
          </div>

          <span className="text-xs font-medium text-slate-400">
            {yearExpenses.length} records
          </span>

        </div>

        <div className="
          grid grid-cols-1 gap-4
          sm:grid-cols-2
          lg:grid-cols-4
        ">

          {CATEGORIES.map((category) => {
            const config = CATEGORY_CONFIG[category];

            const CategoryIcon = config.icon;

            return (
              <div
                key={category}
                onClick={() => handleCategoryClick(category)}
                className="
                  group relative cursor-pointer
                  rounded-2xl
                  border border-slate-200
                  bg-white p-5
                  shadow-sm
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-md
                "
              >

                <div className="flex items-start justify-between">

                  <div
                    className={`
                      flex h-12 w-12
                      items-center justify-center
                      rounded-xl
                      ${config.bg}
                      ${config.iconColor}
                    `}
                  >
                    <CategoryIcon size={22} />
                  </div>

                  <span className="
                    rounded-lg
                    bg-slate-50
                    px-2 py-1
                    text-[11px]
                    font-medium text-slate-400
                  ">
                    {selectedYear}
                  </span>

                </div>

                <p className="
                  mt-4
                  text-sm
                  font-semibold
                  text-slate-700
                ">
                  {category}
                </p>

                <p className="
                  mt-2
                  text-xl
                  font-bold
                  text-[#0B1E41]
                ">
                  ₹
                  {(
                    categoryTotals[category] || 0
                  ).toLocaleString("en-IN")}
                </p>

              </div>
            );
          })}

        </div>


      </div>

      {/* ===================================================
          ADD / EDIT EXPENSE MODAL
      =================================================== */}

      {modalOpen && (
        <div className="
          fixed inset-0 z-[100]
          flex items-center justify-center
          bg-black/50
          px-4
          py-6
        ">

          <div className="
            w-full max-w-lg
            overflow-hidden
            rounded-2xl
            bg-white
            shadow-2xl
          ">

            {/* Modal Header */}

            <div className="
              flex items-center justify-between
              border-b border-slate-100
              px-5 py-4
            ">

              <div>

                <h2 className="
                  text-lg font-bold
                  text-slate-800
                ">
                  {editingExpense
                    ? "Update Expense"
                    : "Add Expense"}
                </h2>

                <p className="
                  mt-1 text-xs
                  text-slate-400
                ">
                  {editingExpense
                    ? "Update expense details"
                    : "Add a new clinic expense"}
                </p>

              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-lg
                  text-slate-400
                  hover:bg-slate-100
                  hover:text-slate-700
                "
              >
                <X size={19} />
              </button>

            </div>

            {/* Form */}

            <form onSubmit={handleSubmit}>

              <div className="space-y-4 px-5 py-5">

                {/* Title */}

                <FormField
                  label="Expense Title"
                  required
                  error={formErrors.title}
                >
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      handleFormChange(
                        "title",
                        e.target.value
                      )
                    }
                    placeholder="Enter expense title"
                    className={`
                      w-full rounded-xl
                      border bg-white
                      px-3.5 py-2.5
                      text-sm text-slate-700
                      outline-none
                      transition
                      focus:border-[#0B1E41]
                      focus:ring-2
                      focus:ring-[#0B1E41]/10
                      ${
                        formErrors.title
                          ? "border-red-400"
                          : "border-slate-200"
                      }
                    `}
                  />
                </FormField>

                {/* Category */}

                <FormField
                  label="Category"
                  required
                  error={formErrors.type}
                >
                  <select
                    value={form.type}
                    onChange={(e) =>
                      handleFormChange(
                        "type",
                        e.target.value
                      )
                    }
                    className="
                      w-full rounded-xl
                      border border-slate-200
                      bg-white
                      px-3.5 py-2.5
                      text-sm text-slate-700
                      outline-none
                      focus:border-[#0B1E41]
                      focus:ring-2
                      focus:ring-[#0B1E41]/10
                    "
                  >
                    {CATEGORIES.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </FormField>

                {/* Date + Amount */}

                <div className="
                  grid grid-cols-1
                  gap-4 sm:grid-cols-2
                ">

                  <FormField
                    label="Date"
                    required
                    error={formErrors.date}
                  >
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        handleFormChange(
                          "date",
                          e.target.value
                        )
                      }
                      className="
                        w-full rounded-xl
                        border border-slate-200
                        bg-white
                        px-3.5 py-2.5
                        text-sm text-slate-700
                        outline-none
                        focus:border-[#0B1E41]
                        focus:ring-2
                        focus:ring-[#0B1E41]/10
                      "
                    />
                  </FormField>

                  <FormField
                    label="Amount (₹)"
                    required
                    error={formErrors.amount}
                  >
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) =>
                        handleFormChange(
                          "amount",
                          e.target.value
                        )
                      }
                      placeholder="Enter amount"
                      className={`
                        w-full rounded-xl
                        border bg-white
                        px-3.5 py-2.5
                        text-sm text-slate-700
                        outline-none
                        focus:border-[#0B1E41]
                        focus:ring-2
                        focus:ring-[#0B1E41]/10
                        ${
                          formErrors.amount
                            ? "border-red-400"
                            : "border-slate-200"
                        }
                      `}
                    />
                  </FormField>

                </div>

                {/* Note */}

                <FormField
                  label="Note"
                  optional
                >
                  <textarea
                    rows={3}
                    value={form.note}
                    onChange={(e) =>
                      handleFormChange(
                        "note",
                        e.target.value
                      )
                    }
                    placeholder="Add a note..."
                    className="
                      w-full resize-none
                      rounded-xl
                      border border-slate-200
                      bg-white
                      px-3.5 py-2.5
                      text-sm text-slate-700
                      outline-none
                      focus:border-[#0B1E41]
                      focus:ring-2
                      focus:ring-[#0B1E41]/10
                    "
                  />
                </FormField>

              </div>

              {/* Footer */}

              <div className="
                flex gap-3
                border-t border-slate-100
                bg-slate-50
                px-5 py-4
              ">

                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="
                    flex-1 rounded-xl
                    bg-white
                    border border-slate-200
                    px-4 py-2.5
                    text-sm font-semibold
                    text-slate-600
                    transition
                    hover:bg-slate-100
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="
                    flex flex-1
                    items-center justify-center
                    gap-2
                    rounded-xl
                    bg-[#0B1E41]
                    px-4 py-2.5
                    text-sm font-semibold
                    text-white
                    transition
                    hover:bg-[#102a59]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {submitting && (
                    <span className="
                      h-4 w-4 animate-spin
                      rounded-full
                      border-2 border-white/30
                      border-t-white
                    " />
                  )}

                  {editingExpense
                    ? "Update Expense"
                    : "Add Expense"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </DashboardLayout>
  );
};

/* ========================================================
   FORM FIELD
======================================================== */

const FormField = ({
  label,
  required,
  optional,
  error,
  children,
}) => {
  return (
    <div>

      <div className="mb-1.5 flex items-center gap-1">

        <label className="
          text-xs font-semibold
          text-slate-700
        ">
          {label}
        </label>

        {required && (
          <span className="text-red-500">*</span>
        )}

        {optional && (
          <span className="
            ml-1 text-[10px]
            text-slate-400
          ">
            Optional
          </span>
        )}

      </div>

      {children}

      {error && (
        <p className="
          mt-1 text-xs
          text-red-500
        ">
          {error}
        </p>
      )}

    </div>
  );
};

export default ExpenseTracker;