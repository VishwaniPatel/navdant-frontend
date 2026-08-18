import React, { useEffect, useState } from "react";
import {
  Calendar,
  X,
} from "lucide-react";

import PatientService from "../services/patients.service";
import { SAFE_TEXT_REGEX } from "../utils/validators";
import PatientInfoCard from "./PatientInfoCard";
import VisitTimeline from "./VisitTimeline";

const PatientVisitsSection = ({
  patientId,
  patientName,
}) => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] =
    useState(false);

  const [editingVisit, setEditingVisit] =
    useState(null);

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [title, setTitle] = useState("");
  const [result, setResult] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [titleError, setTitleError] =
    useState("");

  const [error, setError] = useState("");

  const toProperCase = (str) => {
    if (!str) return "";

    return str
      .toLowerCase()
      .split(" ")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  const fetchVisits = async () => {
    try {
      setLoading(true);
      setError("");

      const res =
        await PatientService.getPatientVisits(
          patientId
        );

      if (res.status === "success") {
        setVisits(res.visits || []);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Could not load visits";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchVisits();
    }
  }, [patientId]);

  /* ---------------- ADD ---------------- */

  const openAddModal = () => {
    setEditingVisit(null);
    setTitle("");
    setResult("");
    setDate(
      new Date().toISOString().split("T")[0]
    );
    setTitleError("");
    setModalVisible(true);
  };

  /* ---------------- EDIT ---------------- */

  const openEditModal = (visit) => {
    setEditingVisit(visit);
    setTitle(visit.title || "");
    setResult(visit.result || "");

    setDate(
      new Date(visit.date)
        .toISOString()
        .split("T")[0]
    );

    setTitleError("");
    setModalVisible(true);
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async (visitId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this visit?"
    );

    if (!confirmed) return;

    try {
      await PatientService.deletePatientVisit(
        visitId
      );

      await fetchVisits();

      window.alert(
        "Visit deleted successfully"
      );
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete visit";

      window.alert(message);
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTitleError("");

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setTitleError("Title is required");
      return;
    }

    if (!SAFE_TEXT_REGEX.test(trimmedTitle)) {
      setTitleError(
        "Title contains invalid characters"
      );
      return;
    }

    if (!date) {
      return;
    }

    const formattedTitle =
      toProperCase(trimmedTitle);

    setSubmitting(true);

    try {
      const payload = {
        date,
        title: formattedTitle,
        result: result.trim() || undefined,
      };

      if (editingVisit) {
        await PatientService.updatePatientVisit(
          editingVisit.id,
          payload
        );
      } else {
        await PatientService.addPatientVisit(
          patientId,
          payload
        );
      }

      setModalVisible(false);

      await fetchVisits();

      window.alert(
        editingVisit
          ? "Visit updated successfully"
          : "Visit added successfully"
      );
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save visit";

      window.alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-4">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <VisitTimeline
        patientId={patientId}
        visits={visits}
        isLoading={loading}
        onRefresh={fetchVisits}
        onAddVisit={openAddModal}
        onEditVisit={openEditModal}
        onDeleteVisit={handleDelete}
      />

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[500px] overflow-visible rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-bold text-[#0B1E41]">
                {editingVisit
                  ? "Update Visit"
                  : "Add Visit"}
              </h2>

              <button
                type="button"
                onClick={() =>
                  setModalVisible(false)
                }
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
                    Visit Date *
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
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 pr-10 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />

                    <Calendar
                      size={20}
                      className="pointer-events-none absolute right-3 top-3 text-slate-500"
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0B1E41]">
                    Title *
                  </label>

                  <input
                    type="text"
                    placeholder="Enter visit title"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);

                      if (titleError) {
                        setTitleError("");
                      }
                    }}
                    onBlur={() => {
                      if (title.trim()) {
                        setTitle(
                          toProperCase(title)
                        );
                      }
                    }}
                    className={`w-full rounded-lg border px-3 py-3 text-sm outline-none ${
                      titleError
                        ? "border-red-500"
                        : "border-slate-200 focus:border-blue-500"
                    }`}
                  />

                  {titleError && (
                    <p className="mt-1 text-xs text-red-600">
                      {titleError}
                    </p>
                  )}
                </div>

                {/* Result */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#0B1E41]">
                    Result / Notes
                  </label>

                  <textarea
                    rows={3}
                    placeholder="Add result or notes"
                    value={result}
                    onChange={(e) =>
                      setResult(e.target.value)
                    }
                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 border-t border-slate-100 p-5">
                <button
                  type="button"
                  onClick={() =>
                    setModalVisible(false)
                  }
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
                  ) : editingVisit ? (
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
    </div>
  );
};

export default PatientVisitsSection;