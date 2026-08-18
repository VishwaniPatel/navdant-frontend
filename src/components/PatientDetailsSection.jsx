import React from "react";
import {
  Phone,
  MapPin,
  HeartPulse,
  Cigarette,
  MessageSquareText,
  FileWarning,
  Pill,
  Droplets,
  AlertCircle,
  ClipboardX,
  Ban,
  UserRound,
} from "lucide-react";

const PatientDetailsSection = ({ patient }) => {
  const handlePhonePress = () => {
    const phoneNumber = patient?.phone;

    if (!phoneNumber || phoneNumber === "N/A") {
      alert("This patient does not have a phone number on record.");
      return;
    }

    const cleanedNumber = phoneNumber.replace(/[^\d+]/g, "");

    if (!cleanedNumber || cleanedNumber === "+") {
      alert("The phone number format is not valid.");
      return;
    }

    // Opens phone application on supported devices/browsers
    window.location.href = `tel:${cleanedNumber}`;
  };

  const conditions = [
    { label: "Blood Pressure", active: patient?.has_bp },
    { label: "Diabetes", active: patient?.has_diabetes },
    { label: "Heart Disease", active: patient?.has_heart_disease },
    { label: "Thyroid", active: patient?.has_thyroid },
    { label: "Kidney Disease", active: patient?.has_kidney_disease },
    { label: "Liver Disease", active: patient?.has_liver_disease },
    { label: "Respiratory", active: patient?.has_respiratory },
    { label: "Epilepsy", active: patient?.has_epilepsy },
    {
      label: "Bleeding Disorder",
      active: patient?.has_bleeding_disorder,
    },
    {
      label: "Past Surgery",
      active: patient?.has_past_surgery,
    },
    {
      label: "Pregnancy",
      active: patient?.has_pregnancy,
    },
    {
      label: "Other Medical",
      active: patient?.has_other_medical,
    },
  ].filter((condition) => condition.active);

  const habits = [
    {
      label: "Tobacco",
      active: patient?.habit_tobacco,
    },
    {
      label: "Smoking",
      active: patient?.habit_smoking,
    },
    {
      label: "Sopari",
      active: patient?.habit_sopari,
    },
    {
      label: "Teeth Grinding",
      active: patient?.habit_teeth_grinding,
    },
  ].filter((habit) => habit.active);

  const remarks = [
    {
      label: "Drug Allergies",
      value: patient?.drug_allergies,
      icon: <FileWarning size={18} />,
    },
    {
      label: "Acidity / GERD",
      value: patient?.drug_acidity,
      icon: <HeartPulse size={18} />,
    },
    {
      label: "Blood Thinner Issues",
      value: patient?.blood_thinner_issues,
      icon: <Droplets size={18} />,
    },
    {
      label: "Current Medications",
      value: patient?.current_medications,
      icon: <Pill size={18} />,
    },
  ].filter(
    (remark) =>
      remark.value && remark.value.trim() !== ""
  );

  return (
    <div className="p-4 pb-0">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

        {/* ================= Personal Information ================= */}
        <PatientInfoCard
          icon={<UserRound size={20} />}
          iconColor="text-blue-600"
          title="Personal Information"
        >
          <button
            type="button"
            onClick={handlePhonePress}
            className="block w-full cursor-pointer text-left"
          >
            <InfoRow
              icon={<Phone size={18} />}
              label="Phone Number"
              value={patient?.phone || "N/A"}
            />
          </button>

          <InfoRow
            icon={<MapPin size={18} />}
            label="Address"
            value={
              patient?.address ||
              "address not added by patient"
            }
          />
        </PatientInfoCard>

        {/* ================= Medical History ================= */}
        <PatientInfoCard
          icon={<HeartPulse size={20} />}
          iconColor="text-red-500"
          title="Medical History"
        >
          {conditions.length === 0 &&
          !patient?.past_surgery_details &&
          !patient?.medical_history ? (
            <EmptyState
              icon={<ClipboardX size={21} />}
              text="No medical history recorded"
            />
          ) : (
            <div className="flex flex-wrap gap-2 py-1">
              {conditions.map((condition, index) => (
                <BadgeItem
                  key={index}
                  label={condition.label}
                />
              ))}
            </div>
          )}
        </PatientInfoCard>

        {/* ================= Recorded Habits ================= */}
        <PatientInfoCard
          icon={<Cigarette size={20} />}
          iconColor="text-orange-500"
          title="Recorded Habits"
        >
          {habits.length === 0 ? (
            <EmptyState
              icon={<Ban size={21} />}
              iconColor="text-emerald-500"
              text="No bad habits or substance usage recorded"
            />
          ) : (
            <div className="flex flex-wrap gap-2 py-1">
              {habits.map((habit, index) => (
                <BadgeItem
                  key={index}
                  label={habit.label}
                />
              ))}
            </div>
          )}
        </PatientInfoCard>

        {/* ================= Clinical Remarks ================= */}
        <PatientInfoCard
          icon={<MessageSquareText size={20} />}
          iconColor="text-indigo-500"
          title="Clinical Remarks / Comments"
        >
          {remarks.length === 0 ? (
            <EmptyState
              icon={<MessageSquareText size={21} />}
              text="No additional data records added yet"
            />
          ) : (
            <div className="space-y-2">
              {remarks.map((remark, index) => (
                <InfoRow
                  key={index}
                  icon={remark.icon}
                  label={remark.label}
                  value={remark.value}
                />
              ))}
            </div>
          )}
        </PatientInfoCard>
      </div>
    </div>
  );
};

export default PatientDetailsSection;


/* =========================================================
   Patient Info Card
========================================================= */

const PatientInfoCard = ({
  icon,
  iconColor = "text-blue-600",
  title,
  children,
}) => {
  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 ${iconColor}`}
        >
          {icon}
        </div>

        <h3 className="text-base font-semibold text-slate-800">
          {title}
        </h3>
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
};


/* =========================================================
   Info Row
========================================================= */

const InfoRow = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50">

      {/* Icon */}
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm font-medium text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
};


/* =========================================================
   Badge Item
========================================================= */

const BadgeItem = ({ label }) => {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600">
      <AlertCircle size={14} />
      {label}
    </span>
  );
};


/* =========================================================
   Empty State
========================================================= */

const EmptyState = ({
  icon,
  text,
  iconColor = "text-slate-400",
}) => {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className={iconColor}>
        {icon}
      </div>

      <p className="flex-1 text-sm font-medium text-slate-500">
        {text}
      </p>
    </div>
  );
};