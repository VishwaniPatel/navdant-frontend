import React, { useEffect, useState } from "react";
import {
  Banknote,
  Calendar,
  ChevronDown,
  ChevronUp,
  Pencil,
  PlusCircle,
  Trash2,
  X,
} from "lucide-react";

import PatientService from "../services/patients.service";
import PatientInfoCard from "./PatientInfoCard";

const PAYMENT_MODES = [
  "Cash",
  "UPI",
  "Card",
  "Cheque",
  "Bank Transfer",
  "Other",
];

const PatientPaymentsSection = ({
  patientId,
}) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] =
    useState(false);

  const [editingPayment, setEditingPayment] =
    useState(null);

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("Cash");

  const [submitting, setSubmitting] =
    useState(false);

  const [listExpanded, setListExpanded] =
    useState(false);

  const [modeDropdownVisible, setModeDropdownVisible] =
    useState(false);

  const [amountError, setAmountError] =
    useState("");

  const [modeError, setModeError] =
    useState("");

  const [error, setError] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const res =
        await PatientService.getPatientPayments(
          patientId
        );

      if (res.status === "success") {
        setPayments(res.payments || []);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Could not load payments";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchPayments();
    }
  }, [patientId]);

  /* ---------------- ADD ---------------- */

  const handleAdd = () => {
    setEditingPayment(null);
    setAmount("");
    setMode("Cash");
    setModeDropdownVisible(false);

    setDate(
      new Date().toISOString().split("T")[0]
    );

    setAmountError("");
    setModeError("");
    setModalVisible(true);
  };

  /* ---------------- EDIT ---------------- */

  const handleEdit = (payment) => {
    setEditingPayment(payment);

    setAmount(
      payment.amount?.toString() || ""
    );

    setMode(payment.mode || "Cash");

    setModeDropdownVisible(false);

    setDate(
      new Date(payment.date)
        .toISOString()
        .split("T")[0]
    );

    setAmountError("");
    setModeError("");
    setModalVisible(true);
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async (paymentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payment?"
    );

    if (!confirmed) return;

    try {
      await PatientService.deletePatientPayment(
        paymentId
      );

      await fetchPayments();

      window.alert(
        "Payment deleted successfully"
      );
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete payment";

      window.alert(message);
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setAmountError("");
    setModeError("");

    const amt = parseFloat(amount);

    let isValid = true;

    if (isNaN(amt) || amt <= 0) {
      setAmountError(
        "Please enter a valid amount"
      );
      isValid = false;
    }

    if (!mode.trim()) {
      setModeError(
        "Payment mode is required"
      );
      isValid = false;
    }

    if (!isValid) return;

    setSubmitting(true);

    try {
      const payload = {
        date,
        amount: amt,
        mode: mode.trim(),
      };

      if (editingPayment) {
        await PatientService.updatePatientPayment(
          editingPayment.id,
          payload
        );
      } else {
        await PatientService.addPatientPayment(
          patientId,
          payload
        );
      }

      setModalVisible(false);

      await fetchPayments();

      window.alert(
        editingPayment
          ? "Payment updated successfully"
          : "Payment added successfully"
      );
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save payment";

      window.alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = payments.reduce(
    (sum, payment) =>
      sum + Number(payment.amount || 0),
    0
  );

  if (loading) {
    return (
      <div className="mx-4">
        <PatientInfoCard
          icon={Banknote}
          iconColor="#128142"
          title="Payments"
        >
          <div className="flex items-center justify-center gap-2 py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />

            <span className="text-sm text-slate-500">
              Loading payments...
            </span>
          </div>
        </PatientInfoCard>
      </div>
    );
  }

  return (
    <div className="mx-4">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <PatientInfoCard
        icon={Banknote}
        iconColor="#128142"
        title="Payments"
        rightElement={
          <button
            type="button"
            onClick={handleAdd}
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
          onClick={() =>
            setListExpanded((prev) => !prev)
          }
          className="flex w-full items-center justify-between rounded-lg py-2 text-left hover:bg-slate-50"
        >
          <span className="text-base font-bold text-[#0B1E41]">
            Total: ₹{totalAmount.toFixed(2)}
          </span>

          {listExpanded ? (
            <ChevronUp
              size={20}
              className="text-slate-500"
            />
          ) : (
            <ChevronDown
              size={20}
              className="text-slate-500"
            />
          )}
        </button>

        {/* Payment list */}
        {listExpanded && (
          <div className="mt-2">
            {payments.length === 0 ? (
              <div className="flex items-center gap-3 py-4">
                <Banknote
                  size={24}
                  className="text-slate-400"
                />

                <span className="text-sm font-medium text-slate-400">
                  No payments yet
                </span>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                {payments.map((payment, index) => (
                  <div key={payment.id}>
                    <div className="flex items-center justify-between py-2">
                      {/* Payment info */}
                      <div className="flex min-w-0 flex-1 items-center">
                        <Banknote
                          size={16}
                          className="mr-2 shrink-0 text-green-700"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#0B1E41]">
                            ₹
                            {Number(
                              payment.amount || 0
                            ).toFixed(2)}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {new Date(
                              payment.date
                            ).toLocaleDateString(
                              "en-GB"
                            )}{" "}
                            · {payment.mode}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="ml-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(payment)
                          }
                          className="rounded-md p-1.5 hover:bg-slate-100"
                        >
                          <Pencil
                            size={16}
                            className="text-slate-500"
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(payment.id)
                          }
                          className="rounded-md p-1.5 hover:bg-red-50"
                        >
                          <Trash2
                            size={16}
                            className="text-red-500"
                          />
                        </button>
                      </div>
                    </div>

                    {index < payments.length - 1 && (
                      <div className="h-px bg-slate-100" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {modalVisible && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-[500px] overflow-visible rounded-2xl bg-white shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-lg font-bold text-[#0B1E41]">
                  {editingPayment
                    ? "Update Payment"
                    : "Add Payment"}
                </h2>

                <button
                  type="button"
                  onClick={() => {
                    setModeDropdownVisible(false);
                    setModalVisible(false);
                  }}
                  className="rounded-full p-1 hover:bg-slate-100"
                >
                  <X
                    size={24}
                    className="text-slate-500"
                  />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Body */}
                <div className="space-y-4 p-5">
                  {/* Date */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#0B1E41]">
                      Payment Date *
                    </label>

                    <div className="relative">
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
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />

                      <Calendar
                        size={20}
                        className="pointer-events-none absolute right-3 top-3 text-slate-500"
                      />
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#0B1E41]">
                      Amount (₹) *
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);

                        if (amountError) {
                          setAmountError("");
                        }
                      }}
                      className={`w-full rounded-lg border px-3 py-3 text-sm outline-none ${
                        amountError
                          ? "border-red-500"
                          : "border-slate-200 focus:border-blue-500"
                      }`}
                    />

                    {amountError && (
                      <p className="mt-1 text-xs text-red-600">
                        {amountError}
                      </p>
                    )}
                  </div>

                  {/* Payment Mode */}
                  <div className="relative">
                    <label className="mb-1.5 block text-sm font-medium text-[#0B1E41]">
                      Payment Mode *
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setModeDropdownVisible(
                          (prev) => !prev
                        )
                      }
                      className={`flex w-full items-center justify-between rounded-lg border bg-white px-3 py-3 text-left text-sm ${
                        modeError
                          ? "border-red-500"
                          : "border-slate-200"
                      }`}
                    >
                      <span>{mode}</span>

                      <ChevronDown
                        size={20}
                        className="text-slate-500"
                      />
                    </button>

                    {modeDropdownVisible && (
                      <div className="absolute left-0 right-0 top-full z-[10000] mt-1 max-h-[250px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                        {PAYMENT_MODES.map(
                          (item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                setMode(item);
                                setModeDropdownVisible(
                                  false
                                );
                                setModeError("");
                              }}
                              className={`block w-full border-b border-slate-100 px-3 py-3 text-left text-sm last:border-0 hover:bg-slate-50 ${
                                mode === item
                                  ? "bg-blue-50 text-blue-600"
                                  : "text-slate-700"
                              }`}
                            >
                              {item}
                            </button>
                          )
                        )}
                      </div>
                    )}

                    {modeError && (
                      <p className="mt-1 text-xs text-red-600">
                        {modeError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 border-t border-slate-100 p-5">
                  <button
                    type="button"
                    onClick={() => {
                      setModeDropdownVisible(
                        false
                      );
                      setModalVisible(false);
                    }}
                    className="flex-1 rounded-lg bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : editingPayment ? (
                      "Update"
                    ) : (
                      "Add"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </PatientInfoCard>
    </div>
  );
};

export default PatientPaymentsSection;