import React from "react";

const PatientInfoCard = ({
  icon: Icon,
  iconColor = "#0B1E41",
  title,
  children,
  rightElement,
}) => {
  return (
    <div className="mb-4 rounded-2xl bg-white shadow-sm border border-slate-100">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {Icon && (
              <Icon
                size={20}
                color={iconColor}
                strokeWidth={2}
              />
            )}

            <h3 className="ml-2 text-[13px] font-bold uppercase text-[#0B1E41]">
              {title}
            </h3>
          </div>

          {rightElement && (
            <div className="flex items-center gap-3">
              {rightElement}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-3 h-px bg-slate-100" />

        {children}
      </div>
    </div>
  );
};

export default PatientInfoCard;