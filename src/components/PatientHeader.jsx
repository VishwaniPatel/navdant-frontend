import React from "react";

const PatientHeader = ({ patient }) => {
  const getInitials = (name) => {
    if (!name) return "?";

    const nameParts = name.trim().split(/\s+/);

    if (nameParts.length === 1) {
      return nameParts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    const firstName = nameParts[0];
    const lastName =
      nameParts[nameParts.length - 1];

    return (
      firstName[0] + lastName[0]
    ).toUpperCase();
  };

  return (
    <div className="
      rounded-2xl
      border border-slate-200
      bg-white
      p-5
      shadow-sm
      md:p-6
    ">
      <div className="flex items-center gap-4">

        {/* Avatar */}
        <div className="
          flex
          h-16 w-16
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-[#0B1E41]
          text-lg
          font-bold
          text-white
          md:h-20 md:w-20
          md:text-xl
        ">
          {getInitials(patient.name)}
        </div>

        {/* Patient information */}
        <div className="min-w-0 flex-1">

          {/* Name */}
          <h2 className="
            truncate
            text-lg
            font-bold
            text-slate-800
            md:text-xl
          ">
            {patient.name}
          </h2>

          {/* Case / Age / Gender */}
          <div className="
            mt-1
            flex
            flex-wrap
            items-center
            gap-x-2
            gap-y-1
            text-sm
            text-slate-600
          ">

            <span>
              Case No. {patient.case_number || "—"}
            </span>

            <span className="text-slate-300">
              •
            </span>

            <span>
              {patient.age
                ? `${patient.age} yrs`
                : "Age N/A"}
            </span>

            <span className="text-slate-300">
              •
            </span>

            <span>
              {patient.gender || "N/A"}
            </span>

          </div>

          {/* Registration */}
          <p className="
            mt-1
            text-xs
            text-slate-500
            md:text-sm
          ">
            Registered on: {patient.regDate || "—"}
          </p>

        </div>

      </div>
    </div>
  );
};

export default PatientHeader;