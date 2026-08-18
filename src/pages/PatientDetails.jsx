import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MoreVertical,
  Pencil,
  Trash2,
  CreditCard,
  FileText,
  FileBadge,
  AlertCircle,
  UserRound,
  RefreshCw,
  MapPin,
  Phone,
  CalendarDays,
} from "lucide-react";

import PatientService from "../services/patients.service";

import DashboardLayout from "../components/layouts/DashboardLayout";
import PatientHeader from "../components/PatientHeader";
import PatientDetailsSection from "../components/PatientDetailsSection";
import PatientVisitsSection from "../components/PatientVisitsSection";
import PatientPaymentsSection from "../components/PatientPaymentsSection";
import PatientImagesSection from "../components/PatientImagesSection";

import ConsentPdfSection from "../components/ConsentPdfSection";
import MedicalCertificate from "../components/MedicalCertificate";
import PatientSmartCard from "../components/PatientSmartCard";

const PatientDetails = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState("none");

  const [menuOpen, setMenuOpen] = useState(false);

  const [smartCardVisible, setSmartCardVisible] = useState(false);
  const [consentPdfVisible, setConsentPdfVisible] = useState(false);
  const [medicalCertificateVisible, setMedicalCertificateVisible] =
    useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ---------------------------------------------
     Calculate Age
  --------------------------------------------- */

  const calculateAge = (dob) => {
    if (!dob) return 0;

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  /* ---------------------------------------------
     Fetch Patient
  --------------------------------------------- */

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      setErrorType("none");

      const response = await PatientService.getPatientById(patientId);

      if (response.status === "success" && response.patient) {
        const apiPatient = response.patient;

        setPatient({
          id: apiPatient.id,
          name: apiPatient.name,
          case_number: apiPatient.case_number,

          age: calculateAge(apiPatient.dob),

          gender: apiPatient.gender || "N/A",
          phone: apiPatient.phone || "N/A",

          regDate:
            apiPatient.registration_date ||
            apiPatient.created_at?.split(" ")[0] ||
            new Date().toISOString().split("T")[0],

          address: apiPatient.address || "Address not provided",

          email: apiPatient.email || "",

          dob: apiPatient.dob,

          qr_code: response.qr_code || null,

          registration_date: apiPatient.registration_date,

          medical_history: apiPatient.medical_history,

          has_bp: apiPatient.has_bp,
          has_diabetes: apiPatient.has_diabetes,
          has_heart_disease: apiPatient.has_heart_disease,
          has_thyroid: apiPatient.has_thyroid,
          has_kidney_disease: apiPatient.has_kidney_disease,
          has_liver_disease: apiPatient.has_liver_disease,
          has_respiratory: apiPatient.has_respiratory,
          has_epilepsy: apiPatient.has_epilepsy,
          has_bleeding_disorder: apiPatient.has_bleeding_disorder,
          has_past_surgery: apiPatient.has_past_surgery,
          has_pregnancy: apiPatient.has_pregnancy,
          has_other_medical: apiPatient.has_other_medical,

          past_surgery_details: apiPatient.past_surgery_details,

          habit_tobacco: apiPatient.habit_tobacco,
          habit_smoking: apiPatient.habit_smoking,
          habit_sopari: apiPatient.habit_sopari,
          habit_teeth_grinding: apiPatient.habit_teeth_grinding,

          drug_allergies: apiPatient.drug_allergies,
          drug_acidity: apiPatient.drug_acidity,
          blood_thinner_issues: apiPatient.blood_thinner_issues,
          current_medications: apiPatient.current_medications,
        });
      } else {
        setErrorType("notfound");
      }
    } catch (error) {
      console.error("Error fetching patient:", error);

      if (error?.response?.status === 404) {
        setErrorType("notfound");
      } else if (error?.response?.status === 500) {
        setErrorType("server");
      } else if (
        error?.message === "Network Error" ||
        !error?.response
      ) {
        setErrorType("network");
      } else {
        setErrorType("server");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------
     Initial Load
  --------------------------------------------- */

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails();
    }
  }, [patientId]);

  /* ---------------------------------------------
     Edit
  --------------------------------------------- */

  const handleEditPatient = () => {
    if (!patient) return;

    setMenuOpen(false);

    navigate(`/patients/edit/${patient.id}`, {
      state: {
        patientId: patient.id,
        patientData: patient,
      },
    });
  };

  /* ---------------------------------------------
     Delete
  --------------------------------------------- */

  const handleDeletePatient = async () => {
    if (!patient) return;

    setMenuOpen(false);

    const confirmed = window.confirm(
      "Are you sure you want to delete this patient?\n\nThis action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(true);

      await PatientService.deletePatient(patient.id);

      alert("Patient deleted successfully.");

      navigate("/patients");
    } catch (error) {
      console.error("Error deleting patient:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to delete patient."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ---------------------------------------------
     Back
  --------------------------------------------- */

  const handleBack = () => {
    navigate("/patients");
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
              <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-56 animate-pulse rounded bg-slate-200" />
            </div>
          </div>

          <div className="space-y-5">
            <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-12 animate-pulse rounded-xl bg-slate-200"
                />
              ))}
            </div>

            <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ---------------------------------------------
     Error
  --------------------------------------------- */

  if (!patient) {
    let title = "Patient Not Found";
    let message = "Unable to load patient details.";
    let icon = <AlertCircle size={58} />;
    let showRetry = false;

    if (errorType === "notfound") {
      title = "Patient Not Found";
      message =
        "The patient you are looking for does not exist.";

      icon = <UserRound size={58} />;
    }

    if (errorType === "server") {
      title = "Server Error";
      message =
        "Something went wrong on our server. Please try again later.";

      showRetry = true;
    }

    if (errorType === "network") {
      title = "Network Error";
      message =
        "Please check your internet connection and try again.";

      showRetry = true;
    }

    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="flex max-w-md flex-col items-center text-center">
            <div
              className={`mb-5 rounded-full p-5 ${
                errorType === "notfound"
                  ? "bg-slate-100 text-slate-500"
                  : "bg-red-50 text-red-500"
              }`}
            >
              {icon}
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              {title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {message}
            </p>

            <div className="mt-6 flex gap-3">
              {showRetry && (
                <button
                  type="button"
                  onClick={fetchPatientDetails}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0B1E41] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#102a59]"
                >
                  <RefreshCw size={16} />
                  Retry
                </button>
              )}

              <button
                type="button"
                onClick={handleBack}
                className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                Go Back
              </button>
            </div>
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

        {/* -----------------------------------------
            BREADCRUMB
        ----------------------------------------- */}

       {/* -----------------------------------------
    BREADCRUMB + MENU
----------------------------------------- */}

<div className="mb-6 flex items-center justify-between">

  {/* Breadcrumbs */}
  <div className="flex items-center gap-2 text-sm">

    <button
      type="button"
      onClick={handleBack}
      className="
        font-medium
        text-slate-400
        transition
        hover:text-[#0B1E41]
      "
    >
      Patients
    </button>

    <span className="text-slate-300">
      /
    </span>

    <span className="font-medium text-slate-700">
      Patient Details
    </span>

  </div>

  {/* Menu */}
  <div className="relative">

    <button
      type="button"
      onClick={() => setMenuOpen((prev) => !prev)}
      className="
        flex h-10 w-10
        items-center justify-center
        rounded-xl
        border border-slate-200
        bg-white
        text-slate-500
        shadow-sm
        transition
        hover:bg-slate-50
        hover:text-[#0B1E41]
      "
    >
      <MoreVertical size={21} />
    </button>

    {menuOpen && (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
        />

        {/* Dropdown */}
        <div
          className="
            absolute right-0 top-12 z-50
            w-44
            overflow-hidden
            rounded-xl
            border border-slate-200
            bg-white
            py-1
            shadow-xl
          "
        >

          {/* Update */}
          <button
            type="button"
            onClick={handleEditPatient}
            className="
              flex w-full
              items-center gap-3
              px-4 py-3
              text-left text-sm
              text-slate-700
              transition
              hover:bg-slate-50
            "
          >
            <Pencil
              size={17}
              className="text-[#0B1E41]"
            />

            <span>
              Update
            </span>
          </button>

          <div className="h-px bg-slate-100" />

          {/* Delete */}
          <button
            type="button"
            disabled={deleteLoading}
            onClick={handleDeletePatient}
            className="
              flex w-full
              items-center gap-3
              px-4 py-3
              text-left text-sm
              text-red-600
              transition
              hover:bg-red-50
              disabled:opacity-50
            "
          >
            <Trash2 size={17} />

            <span>
              {deleteLoading
                ? "Deleting..."
                : "Delete"}
            </span>
          </button>

        </div>
      </>
    )}

  </div>

</div>


        {/* -----------------------------------------
            PATIENT SUMMARY
        ----------------------------------------- */}

        <div className="
          overflow-hidden
          rounded-2xl
          border border-slate-200
          bg-white
          shadow-sm
        ">
          <PatientHeader patient={patient} />
        </div>

        {/* -----------------------------------------
            QUICK INFORMATION
        ----------------------------------------- */}

        <div className="
          mt-5
          grid grid-cols-1
          gap-3
          sm:grid-cols-2
          lg:grid-cols-3
        ">

          {/* PHONE */}

          <InfoCard
            icon={<Phone size={17} />}
            iconClass="bg-blue-50 text-blue-600"
            label="Phone"
            value={patient.phone}
          />

          {/* CASE NUMBER */}

          <InfoCard
            icon={<FileText size={17} />}
            iconClass="bg-indigo-50 text-indigo-600"
            label="Case Number"
            value={patient.case_number}
          />

          {/* REGISTRATION */}

          <InfoCard
            icon={<CalendarDays size={17} />}
            iconClass="bg-green-50 text-green-600"
            label="Registration Date"
            value={patient.regDate}
          />

        </div>

        {/* -----------------------------------------
            ADDRESS
        ----------------------------------------- */}

        <div className="
          mt-3
          rounded-2xl
          border border-slate-200
          bg-white
          p-4
          shadow-sm
        ">

          <div className="flex items-start gap-3">

            <div className="
              flex h-10 w-10
              shrink-0
              items-center justify-center
              rounded-xl
              bg-orange-50
              text-orange-600
            ">
              <MapPin size={18} />
            </div>

            <div className="min-w-0 flex-1">

              <p className="text-xs font-medium text-slate-400">
                Address
              </p>

              <p className="
                mt-1
                text-sm
                leading-6
                font-medium
                text-slate-700
                break-words
              ">
                {patient.address || "Address not provided"}
              </p>

            </div>

          </div>
        </div>

        {/* -----------------------------------------
            ACTIONS
        ----------------------------------------- */}

        <div className="
          mt-5
          grid grid-cols-1
          gap-3
          sm:grid-cols-2
          lg:grid-cols-3
        ">

          <ActionButton
            icon={<CreditCard size={19} />}
            label="Generate Smart ID"
            className="bg-[#0B1E41] hover:bg-[#102a59]"
            onClick={() => setSmartCardVisible(true)}
          />

          <ActionButton
            icon={<FileText size={19} />}
            label="Consent Form PDF"
            className="bg-[#376D0E] hover:bg-[#2d5b0b]"
            onClick={() => setConsentPdfVisible(true)}
          />

          <ActionButton
            icon={<FileBadge size={19} />}
            label="Medical Certificate"
            className="bg-[#1378F4] hover:bg-[#0969d7]"
            onClick={() =>
              setMedicalCertificateVisible(true)
            }
          />

        </div>

        {/* -----------------------------------------
            PATIENT DETAILS
        ----------------------------------------- */}

        <section className="mt-5">
          <PatientDetailsSection patient={patient} />
        </section>

        {/* -----------------------------------------
            VISITS
        ----------------------------------------- */}

        <section className="mt-5">
          <PatientVisitsSection
            patientId={patient.id}
            patientName={patient.name}
          />
        </section>

        {/* -----------------------------------------
            PAYMENTS
        ----------------------------------------- */}

        <section className="mt-5">
          <PatientPaymentsSection
            patientId={patient.id}
            patientName={patient.name}
          />
        </section>

        {/* -----------------------------------------
            IMAGES
        ----------------------------------------- */}

        <section className="mt-5">
          <PatientImagesSection
            patientId={String(patient.id)}
          />
        </section>

      </div>

      {/* -----------------------------------------
          MODALS
      ----------------------------------------- */}

      {consentPdfVisible && (
        <ConsentPdfSection
          visible={consentPdfVisible}
          onClose={() => setConsentPdfVisible(false)}
          patient={patient}
        />
      )}

      {medicalCertificateVisible && (
        <MedicalCertificate
          visible={medicalCertificateVisible}
          onClose={() =>
            setMedicalCertificateVisible(false)
          }
          patient={patient}
        />
      )}

      {smartCardVisible && (
        <PatientSmartCard
          visible={smartCardVisible}
          onClose={() => setSmartCardVisible(false)}
          patient={{
            id: patient.id,
            case_number: patient.case_number,
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            phone: patient.phone,
            regDate: patient.regDate,
            address: patient.address,
          }}
          qrCode={patient.qr_code}
        />
      )}

    </DashboardLayout>
  );
};

/* ================================================
   INFO CARD
================================================ */

const InfoCard = ({
  icon,
  iconClass,
  label,
  value,
}) => {
  return (
    <div className="
      rounded-2xl
      border border-slate-200
      bg-white
      p-4
      shadow-sm
    ">

      <div className="flex items-center gap-3">

        <div className={`
          flex h-10 w-10
          shrink-0
          items-center justify-center
          rounded-xl
          ${iconClass}
        `}>
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-xs font-medium text-slate-400">
            {label}
          </p>

          <p className="
            mt-1
            truncate
            text-sm
            font-semibold
            text-slate-700
          ">
            {value || "—"}
          </p>

        </div>

      </div>
    </div>
  );
};

/* ================================================
   ACTION BUTTON
================================================ */

const ActionButton = ({
  icon,
  label,
  className,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex min-h-[50px]
        items-center justify-center
        gap-2
        rounded-xl
        px-4 py-3
        text-sm
        font-medium
        text-white
        shadow-sm
        transition
        ${className}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default PatientDetails;