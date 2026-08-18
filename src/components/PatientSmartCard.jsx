import React, { useRef, useState } from "react";
import {
  X,
  QrCode,
  Loader2,
  Download,
} from "lucide-react";
import html2canvas from "html2canvas";

import navdant_logo from "../../assets/images/logo/navdant_logo_with_name.png";

const PatientSmartCard = ({
  visible,
  onClose,
  patient,
  qrCode,
  caseNo,
  clinicName = "NAVDANT DENTAL CLINIC",
  clinicAddress = "Opp. Zenith Doctor House, Halar Road, Valsad - 396001",
  clinicContact = "Mo: 6359935612 | Email: navdant0910@gmail.com",
}) => {
  const cardRef = useRef(null);

  const [downloading, setDownloading] = useState(false);

  if (!visible) return null;

  const displayCaseNo =
    caseNo || patient?.case_number || "N/A";

  /* ---------------------------------------------
     Format Date
  --------------------------------------------- */

  const formatDate = (dateString) => {
    if (!dateString) return "NA";

    const parts = dateString.split("-");

    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return dateString;
  };

  /* ---------------------------------------------
     QR CODE
  --------------------------------------------- */

  const getQrCode = (qrCodeData) => {
    if (!qrCodeData) return null;

    if (qrCodeData.startsWith("data:image")) {
      return qrCodeData;
    }

    if (qrCodeData.trim().startsWith("<svg")) {
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
        qrCodeData
      )}`;
    }

    if (
      qrCodeData.startsWith(
        "data:image/svg+xml;base64,"
      )
    ) {
      return qrCodeData;
    }

    if (
      qrCodeData.length > 100 &&
      !qrCodeData.includes(" ")
    ) {
      return `data:image/svg+xml;base64,${qrCodeData}`;
    }

    return null;
  };

  const qrImage = getQrCode(qrCode);

  /* ---------------------------------------------
     DOWNLOAD SMART CARD
  --------------------------------------------- */

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return;

    try {
      setDownloading(true);

      // Give browser a moment to finish rendering images
      await new Promise((resolve) =>
        setTimeout(resolve, 100)
      );

      const canvas = await html2canvas(
        cardRef.current,
        {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#FFFFFF",

          // Important for Tailwind/OKLCH issue
          onclone: (clonedDocument) => {
            const clonedCard =
              clonedDocument.querySelector(
                "[data-smart-card]"
              );

            if (!clonedCard) return;

            // Force the complete captured card to use
            // normal RGB/HEX colors.
            clonedCard.style.backgroundColor =
              "#FFFFFF";

            clonedCard.style.color =
              "#0B1E41";

            // Replace computed OKLCH colors
            const elements =
              clonedCard.querySelectorAll("*");

            elements.forEach((element) => {
              const el = element;

              const computed =
                clonedDocument.defaultView?.getComputedStyle(
                  el
                );

              if (!computed) return;

              const color =
                computed.color;

              const backgroundColor =
                computed.backgroundColor;

              const borderColor =
                computed.borderColor;

              if (
                color &&
                color.includes("oklch")
              ) {
                el.style.color = "#0B1E41";
              }

              if (
                backgroundColor &&
                backgroundColor.includes("oklch")
              ) {
                el.style.backgroundColor =
                  "#FFFFFF";
              }

              if (
                borderColor &&
                borderColor.includes("oklch")
              ) {
                el.style.borderColor =
                  "#CBD5E1";
              }
            });
          },
        }
      );

      const image = canvas.toDataURL(
        "image/png",
        1
      );

      const link =
        document.createElement("a");

      const safeName =
        (patient?.name || "patient")
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();

      link.download = `${safeName}-smart-card.png`;

      link.href = image;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    } catch (error) {
      console.error(
        "Card image creation error:",
        error
      );

      alert(
        "Unable to download the smart card. Please try again."
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-slate-900/50
        p-4
        backdrop-blur-sm
      "
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* MODAL */}
      <div
        className="
          flex
          max-h-[95vh]
          w-full
          max-w-[460px]
          flex-col
          overflow-hidden
          rounded-2xl
          bg-slate-50
          shadow-2xl
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-200
            bg-white
            px-5
            py-4
          "
        >
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Patient Smart ID
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Digital patient identification card
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex h-9 w-9
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

        {/* CARD AREA */}

        <div
          className="
            flex-1
            overflow-y-auto
            px-4
            py-5
          "
        >
          {/* =====================================
              ACTUAL SMART CARD
              IMPORTANT:
              Don't use Tailwind colors here.
          ===================================== */}

          <div
            ref={cardRef}
            data-smart-card
            style={{
              width: "100%",
              maxWidth: "400px",
              margin: "0 auto",
              overflow: "hidden",
              backgroundColor: "#FFFFFF",
              color: "#0B1E41",
              boxShadow:
                "0 4px 12px rgba(15, 23, 42, 0.12)",
              fontFamily:
                "Arial, Helvetica, sans-serif",
            }}
          >
            {/* LOGO */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding:
                  "12px 24px",
              }}
            >
              <img
                src={navdant_logo}
                alt={clinicName}
                crossOrigin="anonymous"
                style={{
                  width: "130px",
                  height: "120px",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>

            {/* DIVIDER */}

            <div
              style={{
                height: "1.5px",
                margin:
                  "0 16px",
                backgroundColor:
                  "#1E293B",
              }}
            />

            {/* QR CODE */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding:
                  "12px 16px",
              }}
            >
              {qrImage ? (
                <img
                  src={qrImage}
                  alt="Patient QR Code"
                  crossOrigin="anonymous"
                  style={{
                    width: "135px",
                    height: "135px",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "135px",
                    height: "135px",
                    display: "flex",
                    flexDirection:
                      "column",
                    alignItems: "center",
                    justifyContent:
                      "center",
                    border:
                      "1px solid #E2E8F0",
                    borderRadius:
                      "12px",
                    color: "#94A3B8",
                  }}
                >
                  <QrCode size={70} />

                  <span
                    style={{
                      marginTop: "8px",
                      fontSize: "12px",
                      color: "#94A3B8",
                    }}
                  >
                    QR Code
                  </span>
                </div>
              )}
            </div>

            {/* PATIENT NAME */}

            <div
              style={{
                padding:
                  "0 16px",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "#0B1E41",
                  fontSize: "20px",
                  lineHeight: "28px",
                  fontWeight: "700",
                  wordBreak:
                    "break-word",
                }}
              >
                {patient?.name?.toUpperCase() ||
                  "N/A"}
              </h3>

              <p
                style={{
                  margin:
                    "4px 0 0",
                  color: "#64748B",
                  fontSize: "12px",
                  lineHeight: "18px",
                  fontWeight: "600",
                }}
              >
                Case No. {displayCaseNo}
              </p>
            </div>

            {/* INFORMATION GRID */}

            <div
              style={{
                margin:
                  "12px 16px 0",
                border:
                  "1px solid #CBD5E1",
              }}
            >
              {/* ROW 1 */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                }}
              >
                <InfoCell
                  label="REG. DATE"
                  value={formatDate(
                    patient?.regDate
                  )}
                  borderRight
                />

                <InfoCell
                  label="AGE / GENDER"
                  value={`${patient?.age || "N/A"} / ${
                    patient?.gender
                      ?.charAt(0)
                      ?.toUpperCase() ||
                    "N/A"
                  }`}
                />
              </div>

              {/* ROW 2 */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  borderTop:
                    "1px solid #CBD5E1",
                }}
              >
                <InfoCell
                  label="CONTACT"
                  value={
                    patient?.phone ||
                    "N/A"
                  }
                  borderRight
                />

                <InfoCell
                  label="ADDRESS"
                  value={
                    patient?.address ||
                    "N/A"
                  }
                />
              </div>
            </div>

            {/* FOOTER */}

            <div
              style={{
                padding:
                  "16px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#64748B",
                  fontSize: "10px",
                  lineHeight: "16px",
                  fontWeight: "500",
                }}
              >
                {clinicAddress}
              </p>

              <p
                style={{
                  margin:
                    "4px 0 0",
                  color: "#94A3B8",
                  fontSize: "9px",
                  lineHeight: "16px",
                }}
              >
                {clinicContact}
              </p>
            </div>
          </div>
        </div>

        {/* ACTIONS */}

        <div
          className="
            flex
            gap-3
            border-t
            border-slate-200
            bg-white
            px-4
            py-4
          "
        >
          {/* CLOSE */}

          <button
            type="button"
            onClick={onClose}
            className="
              flex h-12
              flex-1
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              text-sm
              font-medium
              text-slate-600
              transition
              hover:bg-slate-50
            "
          >
            <X size={19} />
            Close
          </button>

          {/* DOWNLOAD */}

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="
              flex h-12
              flex-1
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#0B1E41]
              text-sm
              font-medium
              text-white
              shadow-sm
              transition
              hover:bg-[#102a59]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {downloading ? (
              <>
                <Loader2
                  size={19}
                  className="animate-spin"
                />
                Downloading...
              </>
            ) : (
              <>
                <Download size={19} />
                Download
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================================================
   INFO CELL
================================================ */

const InfoCell = ({
  label,
  value,
  borderRight = false,
}) => {
  return (
    <div
      style={{
        minHeight: "76px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px 8px",
        textAlign: "center",
        borderRight: borderRight
          ? "1px solid #CBD5E1"
          : "none",
        boxSizing: "border-box",
      }}
    >
      <p
        style={{
          margin: "0 0 4px",
          color: "#64748B",
          fontSize: "10px",
          lineHeight: "14px",
          fontWeight: "600",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </p>

      <p
        style={{
          margin: 0,
          color: "#0B1E41",
          fontSize: "14px",
          lineHeight: "20px",
          fontWeight: "700",
          wordBreak: "break-word",
        }}
      >
        {value}
      </p>
    </div>
  );
};

export default PatientSmartCard;