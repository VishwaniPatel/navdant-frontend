import React, { useState } from "react";

import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  GraduationCap,
  Stethoscope,
  ShieldCheck,
  LockKeyhole,
  Bell,
  FileText,
  Globe,
  Pencil,
  Save,
  X,
  LogOut,
  Settings,
  CalendarDays,
  IndianRupee,
  CircleHelp,
  Info,
  ChevronRight,
  Camera,
} from "lucide-react";

import DashboardLayout from "../components/layouts/DashboardLayout";

/* =========================================================
   REUSABLE SECTION
========================================================= */

const ProfileSection = ({
  icon: Icon,
  title,
  description,
  children,
  action,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B1E41]/10">
            <Icon size={19} className="text-[#0B1E41]" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-[#0B1E41]">
              {title}
            </h2>

            {description && (
              <p className="mt-0.5 text-xs text-slate-400">
                {description}
              </p>
            )}
          </div>
        </div>

        {action}
      </div>

      <div className="p-5">{children}</div>
    </div>
  );
};

/* =========================================================
   INFORMATION ITEM
========================================================= */

const InfoItem = ({
  label,
  value,
  icon: Icon,
}) => {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-slate-400">
        {label}
      </p>

      <div className="flex items-center gap-2">
        {Icon && (
          <Icon
            size={15}
            className="shrink-0 text-slate-400"
          />
        )}

        <p className="text-sm font-semibold text-[#0B1E41]">
          {value || "-"}
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   EDITABLE INPUT
========================================================= */

const ProfileInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}) => {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-500">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full rounded-xl
          border border-slate-200
          bg-white px-3.5 py-2.5
          text-sm text-slate-700
          outline-none
          transition
          focus:border-[#0B1E41]
          focus:ring-2
          focus:ring-[#0B1E41]/10
        "
      />
    </div>
  );
};

/* =========================================================
   SETTING ROW
========================================================= */

const SettingRow = ({
  icon: Icon,
  title,
  description,
  children,
  onClick,
}) => {
  return (
    <div
      className="
        flex items-center
        justify-between gap-4
        border-b border-slate-100
        py-4 last:border-b-0
      "
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
          <Icon
            size={17}
            className="text-slate-500"
          />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#0B1E41]">
            {title}
          </p>

          {description && (
            <p className="mt-0.5 text-xs text-slate-400">
              {description}
            </p>
          )}
        </div>
      </div>

      {children || (
        <button
          type="button"
          onClick={onClick}
          className="
            flex shrink-0 items-center
            gap-1 text-xs font-semibold
            text-[#0B1E41]
            hover:underline
          "
        >
          Manage
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
};

/* =========================================================
   TOGGLE
========================================================= */

const Toggle = ({
  checked,
  onChange,
}) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`
        relative h-6 w-11
        rounded-full
        transition
        ${
          checked
            ? "bg-[#0B1E41]"
            : "bg-slate-200"
        }
      `}
    >
      <span
        className={`
          absolute top-1
          h-4 w-4
          rounded-full bg-white
          shadow-sm
          transition
          ${
            checked
              ? "left-6"
              : "left-1"
          }
        `}
      />
    </button>
  );
};

/* =========================================================
   PROFILE
========================================================= */

const Profile = () => {
  /* =======================================================
     USER DATA
  ======================================================= */

  const [profile, setProfile] = useState({
    name: "Dr. Doctor",
    email: "doctor@example.com",
    phone: "+91 XXXXX XXXXX",
    gender: "Male",
    dob: "",
  });

  /* =======================================================
     CLINIC DATA
  ======================================================= */

  const [clinic, setClinic] = useState({
    name: "Navdant Dental Clinic",
    phone: "+91 XXXXX XXXXX",
    email: "clinic@example.com",
    address: "",
    city: "",
    state: "Gujarat",
    pincode: "",
  });

  /* =======================================================
     PROFESSIONAL DATA
  ======================================================= */

  const [professional, setProfessional] =
    useState({
      qualification: "BDS",
      specialization: "General Dentistry",
      registrationNumber: "",
      experience: "",
    });

  /* =======================================================
     EDIT STATES
  ======================================================= */

  const [editingProfile, setEditingProfile] =
    useState(false);

  const [editingClinic, setEditingClinic] =
    useState(false);

  const [editingProfessional, setEditingProfessional] =
    useState(false);

  /* =======================================================
     NOTIFICATIONS
  ======================================================= */

  const [notifications, setNotifications] =
    useState({
      patients: true,
      appointments: true,
      payments: true,
      expenses: false,
      reports: true,
    });

  /* =======================================================
     HANDLERS
  ======================================================= */

  const handleProfileChange = (field) => (e) => {
    setProfile((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleClinicChange = (field) => (e) => {
    setClinic((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleProfessionalChange =
    (field) => (e) => {
      setProfessional((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSaveProfile = () => {
    // Connect your profile API here
    console.log("PROFILE:", profile);

    setEditingProfile(false);
  };

  const handleSaveClinic = () => {
    // Connect your clinic API here
    console.log("CLINIC:", clinic);

    setEditingClinic(false);
  };

  const handleSaveProfessional = () => {
    // Connect your professional API here
    console.log(
      "PROFESSIONAL:",
      professional
    );

    setEditingProfessional(false);
  };

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
                rounded-xl
                bg-[#0B1E41]/10
              "
            >
              <User
                size={22}
                className="text-[#0B1E41]"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#0B1E41]">
                Profile
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your personal and clinic information
              </p>
            </div>

          </div>

        </div>

        {/* =================================================
            PROFILE HERO
        ================================================= */}

        <div
          className="
            mb-5 overflow-hidden
            rounded-2xl
            border border-slate-200
            bg-white
            shadow-sm
          "
        >

          <div
            className="
              h-24
              bg-[#0B1E41]
            "
          />

          <div className="px-5 pb-5">

            <div className="-mt-10 flex flex-wrap items-end justify-between gap-4">

              <div className="flex items-end gap-4">

                {/* AVATAR */}

                <div className="relative">

                  <div
                    className="
                      flex h-20 w-20
                      items-center justify-center
                      rounded-2xl
                      border-4
                      border-white
                      bg-slate-100
                      shadow-md
                    "
                  >
                    <User
                      size={34}
                      className="text-slate-400"
                    />
                  </div>

                  <button
                    type="button"
                    className="
                      absolute -bottom-1
                      -right-1
                      flex h-8 w-8
                      items-center justify-center
                      rounded-full
                      border-2
                      border-white
                      bg-[#0B1E41]
                      text-white
                    "
                  >
                    <Camera size={14} />
                  </button>

                </div>

                {/* USER INFO */}

                <div className="pb-1">

                  <h2 className="text-xl font-bold text-[#0B1E41]">
                    {profile.name}
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    Dentist & Clinic Owner
                  </p>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">

                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Mail size={13} />
                      {profile.email}
                    </span>

                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Phone size={13} />
                      {profile.phone}
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

          {/* =================================================
              PERSONAL INFORMATION
          ================================================= */}

          <ProfileSection
            icon={User}
            title="Personal Information"
            description="Your basic personal details"
            action={
              !editingProfile ? (
                <button
                  type="button"
                  onClick={() =>
                    setEditingProfile(true)
                  }
                  className="
                    inline-flex items-center
                    gap-1.5 rounded-lg
                    border border-slate-200
                    bg-white px-3 py-2
                    text-xs font-semibold
                    text-slate-600
                    hover:bg-slate-50
                  "
                >
                  <Pencil size={14} />
                  Edit
                </button>
              ) : null
            }
          >

            {editingProfile ? (
              <div className="space-y-4">

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <ProfileInput
                    label="Full Name"
                    value={profile.name}
                    onChange={handleProfileChange("name")}
                  />

                  <ProfileInput
                    label="Gender"
                    value={profile.gender}
                    onChange={handleProfileChange("gender")}
                  />

                  <ProfileInput
                    label="Email"
                    type="email"
                    value={profile.email}
                    onChange={handleProfileChange("email")}
                  />

                  <ProfileInput
                    label="Mobile Number"
                    value={profile.phone}
                    onChange={handleProfileChange("phone")}
                  />

                  <ProfileInput
                    label="Date of Birth"
                    type="date"
                    value={profile.dob}
                    onChange={handleProfileChange("dob")}
                  />

                </div>

                <div className="flex justify-end gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setEditingProfile(false)
                    }
                    className="
                      inline-flex items-center
                      gap-2 rounded-xl
                      border border-slate-200
                      px-4 py-2.5
                      text-sm font-semibold
                      text-slate-600
                      hover:bg-slate-50
                    "
                  >
                    <X size={16} />
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="
                      inline-flex items-center
                      gap-2 rounded-xl
                      bg-[#0B1E41]
                      px-4 py-2.5
                      text-sm font-semibold
                      text-white
                      hover:bg-[#162D59]
                    "
                  >
                    <Save size={16} />
                    Save Changes
                  </button>

                </div>

              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <InfoItem
                  label="Full Name"
                  value={profile.name}
                  icon={User}
                />

                <InfoItem
                  label="Gender"
                  value={profile.gender}
                  icon={User}
                />

                <InfoItem
                  label="Email"
                  value={profile.email}
                  icon={Mail}
                />

                <InfoItem
                  label="Mobile Number"
                  value={profile.phone}
                  icon={Phone}
                />

                <InfoItem
                  label="Date of Birth"
                  value={
                    profile.dob
                      ? profile.dob
                      : "-"
                  }
                  icon={CalendarDays}
                />

              </div>
            )}

          </ProfileSection>

          {/* =================================================
              CLINIC INFORMATION
          ================================================= */}

          <ProfileSection
            icon={Building2}
            title="Clinic Information"
            description="Information about your dental clinic"
            action={
              !editingClinic ? (
                <button
                  type="button"
                  onClick={() =>
                    setEditingClinic(true)
                  }
                  className="
                    inline-flex items-center
                    gap-1.5 rounded-lg
                    border border-slate-200
                    bg-white px-3 py-2
                    text-xs font-semibold
                    text-slate-600
                    hover:bg-slate-50
                  "
                >
                  <Pencil size={14} />
                  Edit
                </button>
              ) : null
            }
          >

            {editingClinic ? (
              <div className="space-y-4">

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div className="sm:col-span-2">
                    <ProfileInput
                      label="Clinic Name"
                      value={clinic.name}
                      onChange={handleClinicChange("name")}
                    />
                  </div>

                  <ProfileInput
                    label="Clinic Phone"
                    value={clinic.phone}
                    onChange={handleClinicChange("phone")}
                  />

                  <ProfileInput
                    label="Clinic Email"
                    type="email"
                    value={clinic.email}
                    onChange={handleClinicChange("email")}
                  />

                  <div className="sm:col-span-2">
                    <ProfileInput
                      label="Address"
                      value={clinic.address}
                      onChange={handleClinicChange("address")}
                    />
                  </div>

                  <ProfileInput
                    label="City"
                    value={clinic.city}
                    onChange={handleClinicChange("city")}
                  />

                  <ProfileInput
                    label="State"
                    value={clinic.state}
                    onChange={handleClinicChange("state")}
                  />

                  <ProfileInput
                    label="Pincode"
                    value={clinic.pincode}
                    onChange={handleClinicChange("pincode")}
                  />

                </div>

                <div className="flex justify-end gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setEditingClinic(false)
                    }
                    className="
                      inline-flex items-center
                      gap-2 rounded-xl
                      border border-slate-200
                      px-4 py-2.5
                      text-sm font-semibold
                      text-slate-600
                      hover:bg-slate-50
                    "
                  >
                    <X size={16} />
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveClinic}
                    className="
                      inline-flex items-center
                      gap-2 rounded-xl
                      bg-[#0B1E41]
                      px-4 py-2.5
                      text-sm font-semibold
                      text-white
                      hover:bg-[#162D59]
                    "
                  >
                    <Save size={16} />
                    Save Changes
                  </button>

                </div>

              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <InfoItem
                  label="Clinic Name"
                  value={clinic.name}
                  icon={Building2}
                />

                <InfoItem
                  label="Clinic Phone"
                  value={clinic.phone}
                  icon={Phone}
                />

                <InfoItem
                  label="Clinic Email"
                  value={clinic.email}
                  icon={Mail}
                />

                <InfoItem
                  label="City"
                  value={clinic.city || "-"}
                  icon={MapPin}
                />

                <div className="sm:col-span-2">
                  <InfoItem
                    label="Clinic Address"
                    value={clinic.address || "-"}
                    icon={MapPin}
                  />
                </div>

              </div>
            )}

          </ProfileSection>

          {/* =================================================
              PROFESSIONAL INFORMATION
          ================================================= */}

          <ProfileSection
            icon={GraduationCap}
            title="Professional Information"
            description="Your dental professional details"
            action={
              !editingProfessional ? (
                <button
                  type="button"
                  onClick={() =>
                    setEditingProfessional(true)
                  }
                  className="
                    inline-flex items-center
                    gap-1.5 rounded-lg
                    border border-slate-200
                    bg-white px-3 py-2
                    text-xs font-semibold
                    text-slate-600
                    hover:bg-slate-50
                  "
                >
                  <Pencil size={14} />
                  Edit
                </button>
              ) : null
            }
          >

            {editingProfessional ? (
              <div className="space-y-4">

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <ProfileInput
                    label="Qualification"
                    value={professional.qualification}
                    onChange={handleProfessionalChange(
                      "qualification"
                    )}
                  />

                  <ProfileInput
                    label="Specialization"
                    value={professional.specialization}
                    onChange={handleProfessionalChange(
                      "specialization"
                    )}
                  />

                  <ProfileInput
                    label="Registration Number"
                    value={professional.registrationNumber}
                    onChange={handleProfessionalChange(
                      "registrationNumber"
                    )}
                  />

                  <ProfileInput
                    label="Years of Experience"
                    value={professional.experience}
                    onChange={handleProfessionalChange(
                      "experience"
                    )}
                  />

                </div>

                <div className="flex justify-end gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setEditingProfessional(false)
                    }
                    className="
                      inline-flex items-center
                      gap-2 rounded-xl
                      border border-slate-200
                      px-4 py-2.5
                      text-sm font-semibold
                      text-slate-600
                      hover:bg-slate-50
                    "
                  >
                    <X size={16} />
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveProfessional}
                    className="
                      inline-flex items-center
                      gap-2 rounded-xl
                      bg-[#0B1E41]
                      px-4 py-2.5
                      text-sm font-semibold
                      text-white
                      hover:bg-[#162D59]
                    "
                  >
                    <Save size={16} />
                    Save Changes
                  </button>

                </div>

              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <InfoItem
                  label="Qualification"
                  value={professional.qualification}
                  icon={GraduationCap}
                />

                <InfoItem
                  label="Specialization"
                  value={professional.specialization}
                  icon={Stethoscope}
                />

                <InfoItem
                  label="Registration Number"
                  value={
                    professional.registrationNumber ||
                    "-"
                  }
                  icon={FileText}
                />

                <InfoItem
                  label="Experience"
                  value={
                    professional.experience
                      ? `${professional.experience} Years`
                      : "-"
                  }
                  icon={Stethoscope}
                />

              </div>
            )}

          </ProfileSection>

          {/* =================================================
              CLINIC SETTINGS
          ================================================= */}

          <ProfileSection
            icon={Settings}
            title="Clinic Settings"
            description="Default settings for your clinic"
          >

            <div>

              <SettingRow
                icon={IndianRupee}
                title="Currency"
                description="Currency used for payments and reports"
              >
                <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  ₹ INR
                </span>
              </SettingRow>

              <SettingRow
                icon={CalendarDays}
                title="Date Format"
                description="How dates are displayed in the application"
              >
                <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  DD/MM/YYYY
                </span>
              </SettingRow>

              <SettingRow
                icon={FileText}
                title="Patient Records"
                description="Manage patient record preferences"
              />

            </div>

          </ProfileSection>

          {/* =================================================
              SECURITY
          ================================================= */}

          <ProfileSection
            icon={ShieldCheck}
            title="Security"
            description="Manage your account security"
          >

            <div>

              <SettingRow
                icon={LockKeyhole}
                title="Change Password"
                description="Update your account password"
              />

              <SettingRow
                icon={Mail}
                title="Change Email"
                description="Update your registered email address"
              />

              <SettingRow
                icon={Phone}
                title="Change Mobile Number"
                description="Update your registered mobile number"
              />

            </div>

          </ProfileSection>

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <ProfileSection
            icon={Bell}
            title="Notifications"
            description="Choose which notifications you receive"
          >

            <div>

              <SettingRow
                icon={User}
                title="Patient Registration"
                description="Notify when a new patient is registered"
              >
                <Toggle
                  checked={
                    notifications.patients
                  }
                  onChange={(value) =>
                    setNotifications(
                      (prev) => ({
                        ...prev,
                        patients: value,
                      })
                    )
                  }
                />
              </SettingRow>

              <SettingRow
                icon={CalendarDays}
                title="Appointments"
                description="Receive appointment reminders"
              >
                <Toggle
                  checked={
                    notifications.appointments
                  }
                  onChange={(value) =>
                    setNotifications(
                      (prev) => ({
                        ...prev,
                        appointments: value,
                      })
                    )
                  }
                />
              </SettingRow>

              <SettingRow
                icon={IndianRupee}
                title="Payments"
                description="Notify when payments are recorded"
              >
                <Toggle
                  checked={
                    notifications.payments
                  }
                  onChange={(value) =>
                    setNotifications(
                      (prev) => ({
                        ...prev,
                        payments: value,
                      })
                    )
                  }
                />
              </SettingRow>

              <SettingRow
                icon={FileText}
                title="Reports"
                description="Receive report notifications"
              >
                <Toggle
                  checked={
                    notifications.reports
                  }
                  onChange={(value) =>
                    setNotifications(
                      (prev) => ({
                        ...prev,
                        reports: value,
                      })
                    )
                  }
                />
              </SettingRow>

            </div>

          </ProfileSection>

          {/* =================================================
              APP INFORMATION
          ================================================= */}

          <ProfileSection
            icon={Info}
            title="About"
            description="Application information and support"
          >

            <div>

              <SettingRow
                icon={Info}
                title="App Version"
                description="Current version of Navdant Dental Clinic"
              >
                <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  v2.0.0
                </span>
              </SettingRow>

              <SettingRow
                icon={Globe}
                title="Privacy Policy"
                description="Read our privacy policy"
              />

              <SettingRow
                icon={FileText}
                title="Terms & Conditions"
                description="Read application terms"
              />

              <SettingRow
                icon={CircleHelp}
                title="Help & Support"
                description="Get help with the application"
              />

            </div>

          </ProfileSection>

        </div>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <div
          className="
            mt-5 flex flex-col
            gap-4 rounded-2xl
            border border-red-100
            bg-red-50 p-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div className="flex items-center gap-3">

            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl bg-white
              "
            >
              <LogOut
                size={18}
                className="text-red-500"
              />
            </div>

            <div>

              <h3 className="text-sm font-bold text-red-700">
                Sign Out
              </h3>

              <p className="mt-0.5 text-xs text-red-500">
                Sign out of your Navdant account
              </p>

            </div>

          </div>

          <button
            type="button"
            className="
              inline-flex items-center
              justify-center gap-2
              rounded-xl
              border border-red-200
              bg-white
              px-4 py-2.5
              text-sm font-semibold
              text-red-600
              transition
              hover:bg-red-100
            "
          >
            <LogOut size={16} />
            Logout
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

          <ShieldCheck
            size={18}
            className="shrink-0 text-blue-600"
          />

          <p className="text-xs text-blue-700">
            Your profile and clinic information
            should only be accessible to authorized
            users.
          </p>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default Profile;