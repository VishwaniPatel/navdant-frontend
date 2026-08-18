import React from "react";
import {
  UserRound,
  Building2,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

import DashboardLayout from "../components/layouts/DashboardLayout";

const Profile = () => {
  return (
    <DashboardLayout>
      <div className="w-full">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div
              className="
                flex h-11 w-11
                items-center justify-center
                rounded-xl
                bg-[#0B1E41]/10
              "
            >
              <UserRound
                size={22}
                className="text-[#0B1E41]"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#0B1E41]">
                Profile
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Doctor and clinic information
              </p>
            </div>
          </div>
        </div>

        {/* PROFILE */}
        <div
          className="
            overflow-hidden
            rounded-2xl
            border border-slate-200
            bg-white
            shadow-sm
          "
        >
          {/* DOCTOR HEADER */}
          <div className="bg-[#0B1E41] px-6 py-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div
                className="
                  flex h-20 w-20
                  shrink-0
                  items-center justify-center
                  rounded-full
                  bg-white
                  text-[#0B1E41]
                  shadow-lg
                "
              >
                <UserRound size={38} />
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-white">
                  Dr. Hiral J. Patel
                </h2>

                <p className="mt-1 text-sm font-medium text-blue-200">
                  Orthodontist & Dentofacial Orthopaedician
                </p>
              </div>
            </div>
          </div>

          {/* CLINIC INFORMATION */}
          <div className="p-6">
            <div className="mb-5">
              <h3 className="text-base font-bold text-[#0B1E41]">
                Clinic Information
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Contact and clinic details
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* CLINIC NAME */}
              <ProfileItem
                icon={Building2}
                label="Clinic Name"
                value="Navdant Dental Clinic"
                iconClass="text-blue-600"
                bgClass="bg-blue-50"
              />

              {/* ADDRESS */}
              <ProfileItem
                icon={MapPin}
                label="Address"
                value="Opp. Zenith Doctor House, Halar Road, Valsad - 396001"
                iconClass="text-red-600"
                bgClass="bg-red-50"
              />

              {/* CONTACT */}
              <ProfileItem
                icon={Phone}
                label="Mobile / Contact"
                value="6359935612"
                iconClass="text-green-600"
                bgClass="bg-green-50"
              />

              {/* EMAIL */}
              <ProfileItem
                icon={Mail}
                label="Email"
                value="navdant0910@gmail.com"
                iconClass="text-purple-600"
                bgClass="bg-purple-50"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

/* =========================================================
   PROFILE ITEM
========================================================= */

const ProfileItem = ({
  icon: Icon,
  label,
  value,
  iconClass,
  bgClass,
}) => {
  return (
    <div
      className="
        flex items-start gap-4
        rounded-xl
        border border-slate-100
        bg-slate-50/50
        p-4
      "
    >
      <div
        className={`
          flex h-10 w-10
          shrink-0
          items-center justify-center
          rounded-xl
          ${bgClass}
        `}
      >
        <Icon
          size={18}
          className={iconClass}
        />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-[#0B1E41]">
          {value}
        </p>
      </div>
    </div>
  );
};

export default Profile;