import React, { useEffect, useState } from "react";
import {
  X,
  ChevronLeft,
  Share2,
  Download,
  FileText,
  Loader2,
  Calendar,
} from "lucide-react";

import PatientService from "../services/patients.service";
import { useDialog } from "./CustomDialog";

const MedicalCertificate = ({
  visible,
  onClose,
  patient,
  doctors = [],
}) => {
  const [certificateDate, setCertificateDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [reason, setReason] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState(
    patient?.doctor_id || ""
  );

  const [loading, setLoading] = useState(false);
  const [pdfPath, setPdfPath] = useState("");
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const [reasonError, setReasonError] = useState("");

  const { showDialog } = useDialog();

  // =====================================================
  // RESET WHEN PATIENT / MODAL CHANGES
  // =====================================================

  useEffect(() => {
    if (visible && patient) {
      setCertificateDate(
        new Date().toISOString().split("T")[0]
      );

      setReason("");

      setSelectedDoctorId(
        patient?.doctor_id || ""
      );

      setPdfPath("");
      setShowPdfViewer(false);
      setReasonError("");
    }
  }, [visible, patient]);

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDisplayDate = (date) => {
    if (!date) return "";

    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;
  };

  // =====================================================
  // CLOSE MAIN MODAL
  // =====================================================

  const handleCloseMainModal = () => {
    if (loading) return;

    setReason("");
    setCertificateDate(
      new Date().toISOString().split("T")[0]
    );
    setSelectedDoctorId(
      patient?.doctor_id || ""
    );
    setReasonError("");

    onClose();
  };

  // =====================================================
  // CLOSE PDF VIEWER
  // =====================================================

  const handleClosePdfViewer = () => {
    setShowPdfViewer(false);

    if (pdfPath) {
      URL.revokeObjectURL(pdfPath);
    }

    setPdfPath("");
  };

  // =====================================================
  // CONVERT RESPONSE TO BLOB
  // =====================================================

  const normalizePdfBlob = async (response) => {
    // Axios response with responseType blob
    if (response instanceof Blob) {
      return response;
    }

    // Axios response.data
    if (response?.data instanceof Blob) {
      return response.data;
    }

    // ArrayBuffer
    if (response instanceof ArrayBuffer) {
      return new Blob([response], {
        type: "application/pdf",
      });
    }

    if (response?.data instanceof ArrayBuffer) {
      return new Blob([response.data], {
        type: "application/pdf",
      });
    }

    // Base64 response
    if (typeof response === "string") {
      return base64ToBlob(response);
    }

    if (
      typeof response?.data === "string"
    ) {
      return base64ToBlob(response.data);
    }

    throw new Error(
      "Invalid PDF response received from server."
    );
  };

  // =====================================================
  // BASE64 -> BLOB
  // =====================================================

  const base64ToBlob = (base64) => {
    let cleanBase64 = base64;

    if (base64.includes(",")) {
      cleanBase64 = base64.split(",")[1];
    }

    const byteCharacters = atob(cleanBase64);

    const byteArrays = [];

    for (
      let offset = 0;
      offset < byteCharacters.length;
      offset += 1024
    ) {
      const slice = byteCharacters.slice(
        offset,
        offset + 1024
      );

      const byteNumbers = new Array(
        slice.length
      );

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] =
          slice.charCodeAt(i);
      }

      byteArrays.push(
        new Uint8Array(byteNumbers)
      );
    }

    return new Blob(byteArrays, {
      type: "application/pdf",
    });
  };

  // =====================================================
  // GENERATE CERTIFICATE
  // =====================================================

  const handleGenerateCertificate = async () => {
    setReasonError("");

    if (!reason.trim()) {
      setReasonError(
        "Reason / Diagnosis is required"
      );
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const params = {
        date: certificateDate,
        reason: reason.trim(),
      };

      if (
        selectedDoctorId &&
        Number(selectedDoctorId) > 0
      ) {
        params.doctor_id =
          Number(selectedDoctorId);
      }

      const pdfResponse =
        await PatientService.getMedicalCertificate(
          patient.id,
          params
        );

      const pdfBlob =
        await normalizePdfBlob(pdfResponse);

      const generatedPdfUrl =
        URL.createObjectURL(pdfBlob);

      setPdfPath(generatedPdfUrl);

      setShowPdfViewer(true);
    } catch (error) {
      console.error(
        "Generate certificate error:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to generate medical certificate.";

      showDialog({
        title: "Error",
        message,
        showCancel: false,
        confirmText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DOWNLOAD PDF
  // =====================================================

  const handleDownload = async () => {
    if (!pdfPath || downloading) return;

    setDownloading(true);

    try {
      const displayName =
        `Certificate_${patient?.name || "Patient"}_${certificateDate}.pdf`
          .replace(/\s+/g, "_");

      const link =
        document.createElement("a");

      link.href = pdfPath;
      link.download = displayName;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      showDialog({
        title: "Certificate Downloaded",
        message:
          "Medical certificate has been downloaded successfully.",
        showCancel: false,
        confirmText: "OK",
      });
    } catch (error) {
      console.error(
        "Download error:",
        error
      );

      showDialog({
        title: "Download Failed",
        message:
          error?.message ||
          "Unable to download certificate.",
        showCancel: false,
        confirmText: "OK",
      });
    } finally {
      setDownloading(false);
    }
  };

  // =====================================================
  // SHARE PDF
  // =====================================================

  const handleShare = async () => {
    if (!pdfPath || sharing) return;

    setSharing(true);

    try {
      const displayName =
        `Certificate_${patient?.name || "Patient"}_${certificateDate}.pdf`
          .replace(/\s+/g, "_");

      // Convert object URL to Blob
      const response = await fetch(pdfPath);

      const blob = await response.blob();

      const file = new File(
        [blob],
        displayName,
        {
          type: "application/pdf",
        }
      );

      // Web Share API
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [file],
        })
      ) {
        await navigator.share({
          title:
            "Medical Certificate",
          text:
            `Medical Certificate - ${patient?.name || ""}`,
          files: [file],
        });

        return;
      }

      // Fallback
      const whatsappText =
        `Medical Certificate for ${patient?.name || "Patient"}`;

      const whatsappUrl =
        `https://wa.me/?text=${encodeURIComponent(
          whatsappText
        )}`;

      window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer"
      );

      showDialog({
        title: "Share",
        message:
          "Your browser does not support direct file sharing. The sharing option has been opened instead.",
        showCancel: false,
        confirmText: "OK",
      });
    } catch (error) {
      // User cancelled native share
      if (
        error?.name === "AbortError"
      ) {
        return;
      }

      console.error(
        "Share error:",
        error
      );

      showDialog({
        title: "Share Failed",
        message:
          error?.message ||
          "Unable to share certificate.",
        showCancel: false,
        confirmText: "OK",
      });
    } finally {
      setSharing(false);
    }
  };

  // =====================================================
  // DON'T RENDER
  // =====================================================

  if (!visible || !patient) {
    return null;
  }

  // =====================================================
  // PDF VIEWER
  // =====================================================

  if (showPdfViewer && pdfPath) {
    return (
      <div className="fixed inset-0 z-[300] flex flex-col bg-white">

        {/* PDF HEADER */}
        <div className="flex h-16 shrink-0 items-center border-b border-slate-200 bg-white px-4 shadow-sm">

          {/* Back */}
          <button
            type="button"
            onClick={
              handleClosePdfViewer
            }
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#0B1E41] transition hover:bg-slate-100"
          >
            <ChevronLeft size={22} />

            <span>Back</span>
          </button>

          {/* Title */}
          <div className="flex flex-1 items-center justify-center gap-2">

            <FileText
              size={20}
              className="text-[#0B1E41]"
            />

            <h2 className="text-base font-bold text-[#0B1E41]">
              Medical Certificate
            </h2>

          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              disabled={sharing}
              className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[#0B1E41] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sharing ? (
                <Loader2
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <Share2 size={19} />
              )}

              <span className="hidden sm:inline">
                Share
              </span>
            </button>

            {/* Download */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex h-10 items-center gap-2 rounded-lg bg-[#0B1E41] px-4 text-sm font-semibold text-white transition hover:bg-[#102a59] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {downloading ? (
                <Loader2
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <Download size={19} />
              )}

              <span className="hidden sm:inline">
                Download
              </span>
            </button>

          </div>
        </div>

        {/* PDF */}
        <div className="relative flex-1 bg-slate-100">

          <iframe
            src={pdfPath}
            title="Medical Certificate"
            className="h-full w-full border-0"
          />

        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN MODAL
  // =====================================================

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          handleCloseMainModal();
        }
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-[650px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <FileText
                size={22}
                className="text-[#0B1E41]"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#0B1E41]">
                Medical Certificate
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Generate medical certificate
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={
              handleCloseMainModal
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>

        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="flex-1 overflow-y-auto p-5">

          {/* PATIENT INFORMATION */}

          <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

            <h3 className="mb-3 text-sm font-bold text-[#0B1E41]">
              Patient Information
            </h3>

            <div className="space-y-2">

              <div className="flex">

                <span className="w-28 shrink-0 text-sm font-medium text-slate-500">
                  Name:
                </span>

                <span className="text-sm font-medium text-slate-800">
                  {patient.name}
                </span>

              </div>

              <div className="flex">

                <span className="w-28 shrink-0 text-sm font-medium text-slate-500">
                  Age/Gender:
                </span>

                <span className="text-sm font-medium text-slate-800">
                  {patient.age} yrs /{" "}
                  {patient.gender}
                </span>

              </div>

              <div className="flex">

                <span className="w-28 shrink-0 text-sm font-medium text-slate-500">
                  Phone:
                </span>

                <span className="text-sm font-medium text-slate-800">
                  {patient.phone}
                </span>

              </div>

              <div className="flex">

                <span className="w-28 shrink-0 text-sm font-medium text-slate-500">
                  Reg Date:
                </span>

                <span className="text-sm font-medium text-slate-800">
                  {patient.regDate}
                </span>

              </div>

            </div>
          </div>

          {/* =================================================
              DATE
          ================================================= */}

          <div className="mb-5">

            <label
              htmlFor="certificate-date"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Certificate Date *
            </label>

            <div className="relative">

              <input
                id="certificate-date"
                type="date"
                value={
                  certificateDate
                }
                max={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                onChange={(event) =>
                  setCertificateDate(
                    event.target.value
                  )
                }
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-11 text-sm text-slate-800 outline-none transition focus:border-[#0B1E41] focus:ring-2 focus:ring-[#0B1E41]/10"
              />

              <Calendar
                size={19}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

            </div>

            {certificateDate && (
              <p className="mt-1.5 text-xs text-slate-400">
                Selected:{" "}
                {formatDisplayDate(
                  certificateDate
                )}
              </p>
            )}

          </div>

          {/* =================================================
              DOCTOR
          ================================================= */}

          {doctors.length > 0 && (
            <div className="mb-5">

              <label
                htmlFor="doctor"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Doctor
              </label>

              <select
                id="doctor"
                value={
                  selectedDoctorId
                }
                onChange={(event) =>
                  setSelectedDoctorId(
                    event.target.value
                  )
                }
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none focus:border-[#0B1E41] focus:ring-2 focus:ring-[#0B1E41]/10"
              >
                <option value="">
                  Select Doctor
                </option>

                {doctors.map(
                  (doctor) => (
                    <option
                      key={doctor.id}
                      value={doctor.id}
                    >
                      {doctor.name}
                      {doctor.degree
                        ? ` - ${doctor.degree}`
                        : ""}
                    </option>
                  )
                )}
              </select>

            </div>
          )}

          {/* =================================================
              REASON
          ================================================= */}

          <div className="mb-5">

            <label
              htmlFor="reason"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Reason / Diagnosis *
            </label>

            <textarea
              id="reason"
              rows={5}
              maxLength={500}
              value={reason}
              onChange={(event) => {
                setReason(
                  event.target.value
                );

                if (
                  reasonError
                ) {
                  setReasonError("");
                }
              }}
              placeholder="Enter clinical diagnosis"
              className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                reasonError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                  : "border-slate-200 focus:border-[#0B1E41] focus:ring-[#0B1E41]/10"
              }`}
            />

            <div className="mt-1 flex items-center justify-between">

              {reasonError ? (
                <p className="text-xs text-red-600">
                  {reasonError}
                </p>
              ) : (
                <span />
              )}

              <span className="text-xs text-slate-400">
                {reason.length}/500
              </span>

            </div>

          </div>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="flex gap-3 border-t border-slate-200 bg-white px-5 py-4">

          <button
            type="button"
            onClick={
              handleCloseMainModal
            }
            disabled={loading}
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              handleGenerateCertificate
            }
            disabled={loading}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0B1E41] text-sm font-semibold text-white transition hover:bg-[#102a59] disabled:cursor-not-allowed disabled:opacity-60"
          >

            {loading ? (
              <>
                <Loader2
                  size={20}
                  className="animate-spin"
                />

                Generating...
              </>
            ) : (
              <>
                <FileText size={19} />

                Generate Certificate
              </>
            )}

          </button>

        </div>

      </div>
    </div>
  );
};

export default MedicalCertificate;