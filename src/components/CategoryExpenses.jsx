import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Pencil,
  Plus,
  Receipt,
  Trash2,
  X,
} from "lucide-react";

import DashboardLayout from "../components/layouts/DashboardLayout";
import ExpenseService from "../services/expenses.service";

const CategoryExpenses = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { category: categoryParam } = useParams();

  const category =
    location.state?.category ||
    decodeURIComponent(categoryParam || "");

  const currentYear =
    location.state?.year || new Date().getFullYear();

  const [year, setYear] = useState(currentYear);

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  const [titleError, setTitleError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  /* ---------------------------------------------
     Format
  --------------------------------------------- */

  const capitalizeWords = (str = "") =>
    str
      .toLowerCase()
      .split(" ")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const formatDate = (dateString) => {
    if (!dateString) return "—";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* ---------------------------------------------
     Load Expenses
  --------------------------------------------- */

  const loadExpenses = async () => {
    try {
      setLoading(true);

      const response =
        await ExpenseService.getExpenseReport();

      if (
        response.status === "success" &&
        response.expenses
      ) {
        const allExpenses = response.expenses.map(
          (item) => ({
            id: item.id,
            amount: Number(item.amount),
            date: item.date,
            category: item.type,
            title: item.title || item.type,
            note: item.note || "",
          })
        );

        const filtered = allExpenses.filter(
          (expense) =>
            expense.category === category &&
            expense.date.startsWith(String(year))
        );

        setExpenses(filtered);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error(
        "Failed to load expenses:",
        error
      );

      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [category, year]);

  /* ---------------------------------------------
     Suggestions
  --------------------------------------------- */

  const loadSuggestions = async () => {
    try {
      const response =
        await ExpenseService.getExpenseReport();

      if (
        response.status === "success" &&
        response.expenses
      ) {
        const titles = response.expenses
          .filter(
            (item) =>
              item.type === category &&
              item.title
          )
          .map((item) => item.title);

        setSuggestions([
          ...new Set(titles),
        ]);
      }
    } catch (error) {
      console.error(
        "Failed to load suggestions",
        error
      );
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [category]);

  /* ---------------------------------------------
     Group By Month
  --------------------------------------------- */

  const groupedExpenses = useMemo(() => {
    const groups = {};

    expenses.forEach((expense) => {
      const [expenseYear, month] =
        expense.date.split("-");

      const key = `${expenseYear}-${month}`;

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(expense);
    });

    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((monthYear) => {
        const monthExpenses = groups[monthYear].sort(
          (a, b) =>
            b.date.localeCompare(a.date)
        );

        return {
          monthYear,
          expenses: monthExpenses,
          total: monthExpenses.reduce(
            (sum, expense) =>
              sum + Number(expense.amount),
            0
          ),
        };
      });
  }, [expenses]);

  const totalForCategory = expenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount),
    0
  );

  const formatMonthYear = (monthYear) => {
    const [expenseYear, month] =
      monthYear.split("-");

    const date = new Date(
      Number(expenseYear),
      Number(month) - 1,
      1
    );

    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  /* ---------------------------------------------
     Modal
  --------------------------------------------- */

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setDate(
      new Date().toISOString().split("T")[0]
    );
    setNote("");

    setTitleError("");
    setAmountError("");

    setEditingExpense(null);
    setShowSuggestions(false);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);

    setTitle(expense.title);
    setAmount(String(expense.amount));
    setDate(expense.date);
    setNote(expense.note || "");

    setTitleError("");
    setAmountError("");
    setShowSuggestions(false);

    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setModalOpen(false);
    resetForm();
  };

  /* ---------------------------------------------
     Title Suggestions
  --------------------------------------------- */

  const handleTitleChange = (value) => {
    setTitle(value);

    if (titleError) {
      setTitleError("");
    }

    if (!value.trim()) {
      setShowSuggestions(true);
      return;
    }

    const filtered = suggestions.filter(
      (item) =>
        item
          .toLowerCase()
          .includes(value.toLowerCase())
    );

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  /* ---------------------------------------------
     Save
  --------------------------------------------- */

  const handleSaveExpense = async () => {
    setTitleError("");
    setAmountError("");

    let valid = true;

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setTitleError("Title is required");
      valid = false;
    }

    const amountNumber = Number(amount);

    if (
      !amount ||
      Number.isNaN(amountNumber) ||
      amountNumber <= 0
    ) {
      setAmountError(
        "Please enter a valid amount"
      );
      valid = false;
    }

    if (!date) {
      valid = false;
    }

    if (!valid) return;

    const formattedTitle = capitalizeWords(
      trimmedTitle
    );

    try {
      setSubmitting(true);

      let response;

      if (editingExpense) {
        response =
          await ExpenseService.updateExpense(
            editingExpense.id,
            {
              title: formattedTitle,
              type: category,
              date,
              amount: amountNumber,
              note: note.trim(),
            }
          );
      } else {
        response =
          await ExpenseService.createExpense({
            title: formattedTitle,
            type: category,
            date,
            amount: amountNumber,
            note: note.trim(),
          });
      }

      if (response.status !== "success") {
        throw new Error(
          response.message ||
            "Operation failed"
        );
      }

      setModalOpen(false);
      resetForm();

      await loadExpenses();
      await loadSuggestions();
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Could not save expense"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------------------------
     Delete
  --------------------------------------------- */

  const deleteExpense = async (expense) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${expense.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response =
        await ExpenseService.deleteExpense(
          expense.id
        );

      if (response.status !== "success") {
        throw new Error(
          response.message ||
            "Delete failed"
        );
      }

      await loadExpenses();
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Could not delete expense"
      );
    }
  };

  /* ---------------------------------------------
     Loading
  --------------------------------------------- */

  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-200" />

            <div className="space-y-2">
              <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-56 animate-pulse rounded bg-slate-200" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />

            {[1, 2, 3].map((item) => (
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

  /* ---------------------------------------------
     Main UI
  --------------------------------------------- */

  return (
    <DashboardLayout>
      <div className="w-full">

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">

          <div className="flex items-center gap-2 text-sm">

            <button
              type="button"
              onClick={() =>
                navigate("/expenses")
              }
              className="
                font-medium
                text-slate-400
                transition
                hover:text-[#0B1E41]
              "
            >
              Expenses
            </button>

            <span className="text-slate-300">
              /
            </span>

            <span className="font-medium text-slate-700">
              {capitalizeWords(category)}
            </span>

          </div>

        </div>

        {/* Category Summary */}
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
          <div className="p-5 sm:p-6">

            <div className="flex items-start justify-between gap-4">

              <div className="flex items-center gap-4">

                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#0B1E41]/10
                    text-[#0B1E41]
                  "
                >
                  <Receipt size={23} />
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Expense Category
                  </p>

                  <h1 className="mt-1 text-xl font-bold text-slate-800">
                    {capitalizeWords(category)}
                  </h1>
                </div>

              </div>

              <button
                type="button"
                onClick={openAddModal}
                className="
                  hidden
                  sm:inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-[#0B1E41]
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#102a59]
                "
              >
                <Plus size={17} />
                Add Expense
              </button>

            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

              <div
                className="
                  rounded-xl
                  border
                  border-slate-100
                  bg-slate-50
                  p-4
                "
              >
                <p className="text-xs font-medium text-slate-400">
                  Total Expenses
                </p>

                <p className="mt-1 text-2xl font-bold text-[#0B1E41]">
                  {formatCurrency(totalForCategory)}
                </p>
              </div>

              <div
                className="
                  rounded-xl
                  border
                  border-slate-100
                  bg-slate-50
                  p-4
                "
              >
                <p className="text-xs font-medium text-slate-400">
                  Year
                </p>

                <div className="mt-1 flex items-center gap-2">

                  <select
                    value={year}
                    onChange={(e) =>
                      setYear(
                        Number(e.target.value)
                      )
                    }
                    className="
                      bg-transparent
                      text-2xl
                      font-bold
                      text-[#0B1E41]
                      outline-none
                    "
                  >
                    {[
                      currentYear - 2,
                      currentYear - 1,
                      currentYear,
                      currentYear + 1,
                    ].map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={18}
                    className="text-slate-400"
                  />

                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Mobile Add */}
        <button
          type="button"
          onClick={openAddModal}
          className="
            mt-4
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#0B1E41]
            px-4
            py-3
            text-sm
            font-semibold
            text-white
            sm:hidden
          "
        >
          <Plus size={18} />
          Add Expense
        </button>

        {/* Expenses */}
        <div className="mt-5 space-y-5">

          {groupedExpenses.length === 0 ? (

            <div
              className="
                flex
                min-h-[350px]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-6
                text-center
                shadow-sm
              "
            >
              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-slate-100
                  text-slate-400
                "
              >
                <CircleDollarSign size={30} />
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-700">
                No expenses found
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-400">
                No expenses recorded for{" "}
                {capitalizeWords(category)} in{" "}
                {year}.
              </p>
            </div>

          ) : (

            groupedExpenses.map((group) => (

              <div
                key={group.monthYear}
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-sm
                "
              >

                {/* Month Header */}
                <div
                  className="
                    flex
                    flex-col
                    gap-2
                    border-b
                    border-slate-100
                    bg-slate-50
                    px-4
                    py-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >

                  <div className="flex items-center gap-3">

                    <div
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-lg
                        bg-white
                        text-[#0B1E41]
                      "
                    >
                      <CalendarDays size={17} />
                    </div>

                    <h2 className="text-sm font-bold text-[#0B1E41]">
                      {formatMonthYear(
                        group.monthYear
                      )}
                    </h2>

                  </div>

                  <p className="text-sm font-semibold text-slate-600">
                    Total:{" "}
                    {formatCurrency(group.total)}
                  </p>

                </div>

                {/* Rows */}
                <div>

                  {group.expenses.map(
                    (expense, index) => (

                      <div
                        key={expense.id}
                        className={`
                          flex
                          flex-col
                          gap-4
                          px-4
                          py-4
                          transition
                          hover:bg-slate-50
                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                          ${
                            index !==
                            group.expenses.length - 1
                              ? "border-b border-slate-100"
                              : ""
                          }
                        `}
                      >

                        <div className="flex min-w-0 items-center gap-3">

                          <div
                            className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              bg-[#0B1E41]/10
                              text-[#0B1E41]
                            "
                          >
                            <CircleDollarSign
                              size={18}
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-slate-700">
                              {capitalizeWords(
                                expense.title
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {formatDate(
                                expense.date
                              )}
                            </p>

                            {expense.note && (
                              <p className="mt-1 truncate text-xs italic text-slate-400">
                                📝{" "}
                                {capitalizeWords(
                                  expense.note
                                )}
                              </p>
                            )}

                          </div>

                        </div>

                        <div className="flex items-center justify-between gap-5 sm:justify-end">

                          <p className="text-sm font-bold text-slate-800">
                            {formatCurrency(
                              expense.amount
                            )}
                          </p>

                          <div className="flex items-center gap-1">

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  expense
                                )
                              }
                              className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                text-slate-500
                                transition
                                hover:bg-slate-100
                                hover:text-[#0B1E41]
                              "
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteExpense(
                                  expense
                                )
                              }
                              className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                text-red-500
                                transition
                                hover:bg-red-50
                              "
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>

                          </div>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

            ))
          )}

        </div>

      </div>

      {/* -----------------------------------------
          ADD / EDIT MODAL
      ----------------------------------------- */}

      {modalOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/50
            p-4
          "
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >

          <div
            className="
              w-full
              max-w-lg
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-2xl
            "
          >

            {/* Modal Header */}
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
                  {editingExpense
                    ? "Update Expense"
                    : "Add Expense"}
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  {capitalizeWords(category)}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
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
                  hover:text-slate-700
                "
              >
                <X size={20} />
              </button>

            </div>

            {/* Body */}
            <div className="max-h-[70vh] overflow-y-auto px-5 py-5">

              {/* Title */}
              <div className="relative mb-4">

                <label className="mb-1.5 block text-sm font-medium text-[#0B1E41]">
                  Title <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    handleTitleChange(
                      e.target.value
                    )
                  }
                  onFocus={() => {
                    if (suggestions.length) {
                      setShowSuggestions(true);
                    }
                  }}
                  placeholder="Enter title"
                  className={`
                    w-full
                    rounded-xl
                    border
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-slate-700
                    outline-none
                    transition
                    focus:border-[#0B1E41]
                    focus:ring-2
                    focus:ring-[#0B1E41]/10
                    ${
                      titleError
                        ? "border-red-500"
                        : "border-slate-200"
                    }
                  `}
                />

                {titleError && (
                  <p className="mt-1 text-xs text-red-500">
                    {titleError}
                  </p>
                )}

                {showSuggestions &&
                  suggestions.length > 0 && (
                    <div
                      className="
                        absolute
                        left-0
                        right-0
                        top-[76px]
                        z-20
                        max-h-44
                        overflow-y-auto
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        shadow-xl
                      "
                    >
                      {suggestions.map(
                        (suggestion, index) => (
                          <button
                            key={`${suggestion}-${index}`}
                            type="button"
                            onMouseDown={() => {
                              setTitle(
                                suggestion
                              );
                              setShowSuggestions(
                                false
                              );
                            }}
                            className="
                              flex
                              w-full
                              items-center
                              gap-2
                              border-b
                              border-slate-100
                              px-4
                              py-2.5
                              text-left
                              text-sm
                              text-slate-600
                              hover:bg-slate-50
                            "
                          >
                            <Receipt
                              size={15}
                              className="text-[#0B1E41]"
                            />
                            {capitalizeWords(
                              suggestion
                            )}
                          </button>
                        )
                      )}
                    </div>
                  )}

              </div>

              {/* Amount */}
              <div className="mb-4">

                <label className="mb-1.5 block text-sm font-medium text-[#0B1E41]">
                  Amount (₹){" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);

                    if (amountError) {
                      setAmountError("");
                    }
                  }}
                  placeholder="Enter amount"
                  className={`
                    w-full
                    rounded-xl
                    border
                    px-4
                    py-3
                    text-sm
                    text-slate-700
                    outline-none
                    focus:border-[#0B1E41]
                    focus:ring-2
                    focus:ring-[#0B1E41]/10
                    ${
                      amountError
                        ? "border-red-500"
                        : "border-slate-200"
                    }
                  `}
                />

                {amountError && (
                  <p className="mt-1 text-xs text-red-500">
                    {amountError}
                  </p>
                )}

              </div>

              {/* Date */}
              <div className="mb-4">

                <label className="mb-1.5 block text-sm font-medium text-[#0B1E41]">
                  Date{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  type="date"
                  value={date}
                  max={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    px-4
                    py-3
                    text-sm
                    text-slate-700
                    outline-none
                    focus:border-[#0B1E41]
                    focus:ring-2
                    focus:ring-[#0B1E41]/10
                  "
                />

              </div>

              {/* Note */}
              <div>

                <label className="mb-1.5 block text-sm font-medium text-[#0B1E41]">
                  Note
                </label>

                <textarea
                  value={note}
                  onChange={(e) =>
                    setNote(e.target.value)
                  }
                  rows={3}
                  placeholder="Add remarks / notes"
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-200
                    px-4
                    py-3
                    text-sm
                    text-slate-700
                    outline-none
                    focus:border-[#0B1E41]
                    focus:ring-2
                    focus:ring-[#0B1E41]/10
                  "
                />

              </div>

            </div>

            {/* Footer */}
            <div
              className="
                flex
                gap-3
                border-t
                border-slate-100
                px-5
                py-4
              "
            >

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="
                  flex-1
                  rounded-xl
                  bg-slate-100
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-slate-600
                  transition
                  hover:bg-slate-200
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveExpense}
                disabled={submitting}
                className="
                  flex-1
                  rounded-xl
                  bg-[#0B1E41]
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-[#102a59]
                  disabled:opacity-50
                "
              >
                {submitting
                  ? "Saving..."
                  : editingExpense
                  ? "Update Expense"
                  : "Add Expense"}
              </button>

            </div>

          </div>

        </div>
      )}

    </DashboardLayout>
  );
};

export default CategoryExpenses;