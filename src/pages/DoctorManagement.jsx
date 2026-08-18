import React, { useCallback, useEffect, useState } from "react";
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  GraduationCap,
  Award,
  X,
  Stethoscope,
} from "lucide-react";

import DashboardLayout from "../components/layouts/DashboardLayout";
import DoctorService from "../services/doctors.service";

const SAFE_TEXT_REGEX = /^[a-zA-Z.\s'-]+$/;

const DoctorManagement = () => {
  /* =========================
     STATES
  ========================= */

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [menuOpenId, setMenuOpenId] = useState(null);

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [editName, setEditName] = useState("");
  const [editDegree, setEditDegree] = useState("");
  const [editDesignation, setEditDesignation] = useState("");

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  /* =========================
     PROPER CASE
  ========================= */

  const toProperCase = (str) => {
    if (!str) return "";

    return str
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  };

  /* =========================
     FETCH DOCTORS
  ========================= */

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);

      const res = await DoctorService.getAllDoctors();

      setDoctors(res?.doctors || []);
    } catch (error) {
      console.error("Doctor fetch error:", error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  /* =========================
     CLOSE ACTION MENU
  ========================= */

  useEffect(() => {
    const handleOutsideClick = () => {
      setMenuOpenId(null);
    };

    if (menuOpenId !== null) {
      document.addEventListener(
        "click",
        handleOutsideClick
      );
    }

    return () => {
      document.removeEventListener(
        "click",
        handleOutsideClick
      );
    };
  }, [menuOpenId]);

  /* =========================
     OPEN ACTION MENU
  ========================= */

  const handleMenuClick = (event, doctorId) => {
    event.stopPropagation();

    const button =
      event.currentTarget;

    const rect =
      button.getBoundingClientRect();

    const menuWidth = 140;

    let left =
      rect.right - menuWidth;

    let top =
      rect.bottom + 6;

    /*
      Prevent menu from going
      outside right side
    */

    if (
      left + menuWidth >
      window.innerWidth - 10
    ) {
      left =
        window.innerWidth -
        menuWidth -
        10;
    }

    /*
      Prevent menu from going
      outside left side
    */

    if (left < 10) {
      left = 10;
    }

    /*
      If there isn't enough space
      below, show above button
    */

    const estimatedMenuHeight = 90;

    if (
      top + estimatedMenuHeight >
      window.innerHeight - 10
    ) {
      top =
        rect.top -
        estimatedMenuHeight -
        6;
    }

    setMenuPosition({
      top,
      left,
    });

    setMenuOpenId((previous) =>
      previous === doctorId
        ? null
        : doctorId
    );
  };

  /* =========================
     OPEN ADD MODAL
  ========================= */

  const openAddModal = () => {
    setSelectedDoctor(null);

    setEditName("Dr. ");
    setEditDegree("");
    setEditDesignation("");

    setErrors({});
    setMenuOpenId(null);

    setModalOpen(true);
  };

  /* =========================
     OPEN EDIT MODAL
  ========================= */

  const openEditModal = (doctor) => {
    setSelectedDoctor(doctor);

    setEditName(
      doctor.name || ""
    );

    setEditDegree(
      doctor.degree || ""
    );

    setEditDesignation(
      doctor.designation || ""
    );

    setErrors({});
    setMenuOpenId(null);

    setModalOpen(true);
  };

  /* =========================
     CLOSE MODAL
  ========================= */

  const closeModal = () => {
    if (submitting) return;

    setModalOpen(false);
    setSelectedDoctor(null);

    setEditName("");
    setEditDegree("");
    setEditDesignation("");

    setErrors({});
  };

  /* =========================
     VALIDATION
  ========================= */

  const validateForm = () => {
    const newErrors = {};

    let nameWithoutPrefix =
      editName.trim();

    if (
      nameWithoutPrefix.startsWith(
        "Dr."
      )
    ) {
      nameWithoutPrefix =
        nameWithoutPrefix
          .slice(3)
          .trim();
    }

    /* NAME */

    if (!nameWithoutPrefix) {
      newErrors.name =
        "Doctor name is required";
    } else if (
      !SAFE_TEXT_REGEX.test(
        editName
      )
    ) {
      newErrors.name =
        "Name contains invalid characters";
    }

    /* DEGREE */

    if (!editDegree.trim()) {
      newErrors.degree =
        "Degree is required";
    } else if (
      !SAFE_TEXT_REGEX.test(
        editDegree
      )
    ) {
      newErrors.degree =
        "Degree contains invalid characters";
    }

    /* DESIGNATION */

    if (!editDesignation.trim()) {
      newErrors.designation =
        "Designation is required";
    } else if (
      !SAFE_TEXT_REGEX.test(
        editDesignation
      )
    ) {
      newErrors.designation =
        "Designation contains invalid characters";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };

  /* =========================
     SUBMIT
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      let name =
        editName.trim();

      if (!name.startsWith("Dr.")) {
        name = `Dr. ${name}`;
      }

      name =
        toProperCase(name);

      const payload = {
        name,
        degree:
          toProperCase(
            editDegree.trim()
          ),
        designation:
          toProperCase(
            editDesignation.trim()
          ),
      };

      let response;

      if (selectedDoctor) {
        response =
          await DoctorService.updateDoctor(
            selectedDoctor.id,
            payload
          );
      } else {
        response =
          await DoctorService.addDoctor(
            payload
          );
      }

      if (
        response?.status ===
          "success" ||
        response?.data?.status ===
          "success"
      ) {
        setModalOpen(false);

        setSelectedDoctor(null);

        setEditName("");
        setEditDegree("");
        setEditDesignation("");

        setErrors({});

        await fetchDoctors();
      } else {
        throw new Error(
          response?.message ||
            "Operation failed"
        );
      }
    } catch (error) {
      console.error(
        "Save doctor error:",
        error
      );

      alert(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Failed to save doctor."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================
     DELETE
  ========================= */

  const handleDelete = async (
    doctor
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${doctor.name}?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(
        doctor.id
      );

      setMenuOpenId(null);

      await DoctorService.deleteDoctor(
        doctor.id
      );

      await fetchDoctors();
    } catch (error) {
      console.error(
        "Delete doctor error:",
        error
      );

      alert(
        error?.response?.data
          ?.message ||
          "Failed to delete doctor."
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  /* =========================
     CLEAR ERROR
  ========================= */

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full">

          {/* HEADER */}

          <div className="
            mb-6
            flex
            flex-wrap
            items-center
            justify-between
            gap-4
          ">

            <div className="space-y-2">
              <div className="
                h-7
                w-56
                animate-pulse
                rounded
                bg-slate-200
              " />

              <div className="
                h-3
                w-72
                animate-pulse
                rounded
                bg-slate-200
              " />
            </div>

            <div className="
              h-10
              w-32
              animate-pulse
              rounded-xl
              bg-slate-200
            " />

          </div>

          {/* SUMMARY */}

          <div className="
            mb-5
            h-20
            animate-pulse
            rounded-2xl
            bg-slate-200
          " />

          {/* TABLE */}

          <div className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
          ">

            <div className="
              h-14
              animate-pulse
              bg-slate-100
            " />

            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="
                    h-16
                    border-t
                    border-slate-100
                    animate-pulse
                    bg-white
                  "
                />
              )
            )}

          </div>

        </div>
      </DashboardLayout>
    );
  }

  /* =========================
     UI
  ========================= */

  return (
    <DashboardLayout>

      <div className="w-full">

        {/* =========================
            HEADER
        ========================= */}

        <div className="
          mb-6
          flex
          flex-wrap
          items-center
          justify-between
          gap-4
        ">

          <div>

            <h1 className="
              text-2xl
              font-bold
              text-slate-800
            ">
              Manage Clinic Doctors
            </h1>

            <p className="
              mt-1
              text-sm
              text-slate-500
            ">
              Add, update, and manage
              your clinic doctors
            </p>

          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-[#0B1E41]
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-[#102a59]
            "
          >
            <Plus size={18} />
            Add Doctor
          </button>

        </div>

        {/* =========================
            SUMMARY
        ========================= */}

        <div className="
          mb-5
          flex
          items-center
          justify-between
          rounded-2xl
          border
          border-slate-200
          bg-white
          px-5
          py-4
          shadow-sm
        ">

          <div className="
            flex
            items-center
            gap-3
          ">

            <div className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-blue-50
              text-blue-600
            ">
              <Stethoscope
                size={21}
              />
            </div>

            <div>

              <p className="
                text-xs
                font-medium
                text-slate-400
              ">
                Registered Doctors
              </p>

              <p className="
                mt-1
                text-lg
                font-bold
                text-[#0B1E41]
              ">
                {doctors.length}
              </p>

            </div>

          </div>

          <span className="
            rounded-lg
            bg-slate-100
            px-3
            py-1.5
            text-xs
            font-medium
            text-slate-500
          ">
            {doctors.length}{" "}
            {doctors.length === 1
              ? "Doctor"
              : "Doctors"}
          </span>

        </div>

        {/* =========================
            SECTION TITLE
        ========================= */}

        <div className="mb-4">

          <h2 className="
            text-base
            font-bold
            text-slate-800
          ">
            Doctor Details
          </h2>

          <p className="
            mt-1
            text-xs
            text-slate-400
          ">
            Manage the doctors
            associated with your clinic
          </p>

        </div>

        {/* =========================
            TABLE
        ========================= */}

        {doctors.length > 0 ? (

          <div className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
          ">

            {/* ONLY TABLE SCROLLS */}

            <div className="
              overflow-x-auto
              rounded-2xl
            ">

              <table className="
                w-full
                min-w-[700px]
                border-collapse
              ">

                {/* HEADER */}

                <thead>

                  <tr className="
                    border-b
                    border-slate-200
                    bg-slate-50
                  ">

                    <th className="
                      px-5
                      py-4
                      text-left
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                    ">
                      Doctor
                    </th>

                    <th className="
                      px-5
                      py-4
                      text-left
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                    ">
                      Degree
                    </th>

                    <th className="
                      px-5
                      py-4
                      text-left
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                    ">
                      Designation
                    </th>

                    <th className="
                      w-[80px]
                      px-5
                      py-4
                      text-center
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wide
                      text-slate-500
                    ">
                      Action
                    </th>

                  </tr>

                </thead>

                {/* BODY */}

                <tbody>

                  {doctors
                    .slice()
                    .reverse()
                    .map(
                      (
                        doctor,
                        index
                      ) => (

                        <tr
                          key={
                            doctor.id
                          }
                          className={`
                            border-b
                            border-slate-100
                            transition
                            hover:bg-slate-50
                            ${
                              index ===
                              doctors.length -
                                1
                                ? "border-b-0"
                                : ""
                            }
                          `}
                        >

                          {/* DOCTOR */}

                          <td className="
                            px-5
                            py-4
                          ">

                            <div className="
                              flex
                              items-center
                              gap-3
                            ">

                              <div className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-blue-50
                                text-blue-600
                              ">
                                <Stethoscope
                                  size={19}
                                />
                              </div>

                              <div className="
                                min-w-0
                              ">

                                <p className="
                                  truncate
                                  text-sm
                                  font-semibold
                                  text-slate-800
                                ">
                                  {
                                    doctor.name
                                  }
                                </p>

                                <p className="
                                  mt-0.5
                                  text-xs
                                  text-slate-400
                                ">
                                  Doctor
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* DEGREE */}

                          <td className="
                            px-5
                            py-4
                          ">

                            <div className="
                              flex
                              items-center
                              gap-2
                            ">

                              <GraduationCap
                                size={17}
                                className="
                                  shrink-0
                                  text-slate-400
                                "
                              />

                              <span className="
                                text-sm
                                font-medium
                                text-slate-700
                              ">
                                {
                                  doctor.degree ||
                                  "—"
                                }
                              </span>

                            </div>

                          </td>

                          {/* DESIGNATION */}

                          <td className="
                            px-5
                            py-4
                          ">

                            <div className="
                              flex
                              items-center
                              gap-2
                            ">

                              <Award
                                size={17}
                                className="
                                  shrink-0
                                  text-slate-400
                                "
                              />

                              <span className="
                                text-sm
                                font-medium
                                text-slate-700
                              ">
                                {
                                  doctor.designation ||
                                  "—"
                                }
                              </span>

                            </div>

                          </td>

                          {/* ACTION */}

                          <td className="
                            px-5
                            py-4
                            text-center
                          ">

                            <button
                              type="button"
                              onClick={(
                                event
                              ) =>
                                handleMenuClick(
                                  event,
                                  doctor.id
                                )
                              }
                              className="
                                inline-flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                text-slate-400
                                transition
                                hover:bg-slate-100
                                hover:text-slate-700
                              "
                            >
                              <MoreVertical
                                size={19}
                              />
                            </button>

                          </td>

                        </tr>

                      )
                    )}

                </tbody>

              </table>

            </div>

          </div>

        ) : (

          /* =========================
             EMPTY STATE
          ========================= */

          <div className="
            flex
            min-h-[300px]
            flex-col
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-5
            py-10
            text-center
            shadow-sm
          ">

            <div className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-full
              bg-slate-100
              text-slate-400
            ">
              <Stethoscope
                size={30}
              />
            </div>

            <h3 className="
              mt-4
              text-sm
              font-semibold
              text-slate-700
            ">
              No doctors found
            </h3>

            <p className="
              mt-1
              text-xs
              text-slate-400
            ">
              Add a doctor to start
              managing your clinic
              doctors.
            </p>

            <button
              type="button"
              onClick={openAddModal}
              className="
                mt-4
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-[#0B1E41]
                px-4
                py-2
                text-xs
                font-semibold
                text-white
                hover:bg-[#102a59]
              "
            >
              <Plus size={15} />
              Add Doctor
            </button>

          </div>

        )}

      </div>

      {/* =====================================================
          FLOATING ACTION MENU

          IMPORTANT:
          This is OUTSIDE the table.
          position: fixed prevents table/row clipping.
      ===================================================== */}

      {menuOpenId !== null && (

        <div
          className="
            fixed
            z-[9999]
            w-36
            overflow-hidden
            rounded-xl
            border
            border-slate-200
            bg-white
            py-1
            shadow-xl
          "
          style={{
            top:
              menuPosition.top,
            left:
              menuPosition.left,
          }}
          onClick={(e) =>
            e.stopPropagation()
          }
        >

          {/* UPDATE */}

          <button
            type="button"
            onClick={() => {

              const doctor =
                doctors.find(
                  (item) =>
                    item.id ===
                    menuOpenId
                );

              if (doctor) {
                openEditModal(
                  doctor
                );
              }

              setMenuOpenId(null);
            }}
            className="
              flex
              w-full
              items-center
              gap-2
              px-3
              py-2.5
              text-left
              text-sm
              text-slate-600
              hover:bg-slate-50
            "
          >

            <Pencil
              size={16}
              className="
                text-[#0B1E41]
              "
            />

            Update

          </button>

          <div className="
            border-t
            border-slate-100
          " />

          {/* DELETE */}

          <button
            type="button"
            onClick={() => {

              const doctor =
                doctors.find(
                  (item) =>
                    item.id ===
                    menuOpenId
                );

              if (doctor) {
                handleDelete(
                  doctor
                );
              }

              setMenuOpenId(null);
            }}
            disabled={
              deleteLoading ===
              menuOpenId
            }
            className="
              flex
              w-full
              items-center
              gap-2
              px-3
              py-2.5
              text-left
              text-sm
              text-red-600
              hover:bg-red-50
              disabled:opacity-50
            "
          >

            {deleteLoading ===
            menuOpenId ? (

              <span className="
                h-4
                w-4
                animate-spin
                rounded-full
                border-2
                border-red-200
                border-t-red-600
              " />

            ) : (

              <Trash2
                size={16}
              />

            )}

            Delete

          </button>

        </div>

      )}

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {modalOpen && (

        <div className="
          fixed
          inset-0
          z-[100]
          flex
          items-center
          justify-center
          bg-black/50
          px-4
          py-6
        ">

          <div className="
            w-full
            max-w-lg
            overflow-hidden
            rounded-2xl
            bg-white
            shadow-2xl
          ">

            {/* MODAL HEADER */}

            <div className="
              flex
              items-center
              justify-between
              border-b
              border-slate-100
              px-5
              py-4
            ">

              <div>

                <h2 className="
                  text-lg
                  font-bold
                  text-slate-800
                ">
                  {selectedDoctor
                    ? "Update Doctor"
                    : "Add Doctor"}
                </h2>

                <p className="
                  mt-1
                  text-xs
                  text-slate-400
                ">
                  {selectedDoctor
                    ? "Update doctor details"
                    : "Add a new doctor to your clinic"}
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  hover:bg-slate-100
                  hover:text-slate-700
                "
              >
                <X size={19} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="
                space-y-4
                px-5
                py-5
              ">

                {/* NAME */}

                <FormField
                  label="Full Name"
                  required
                  error={
                    errors.name
                  }
                >

                  <input
                    type="text"
                    value={
                      editName
                    }
                    onChange={(
                      e
                    ) => {
                      setEditName(
                        e.target.value
                      );

                      clearError(
                        "name"
                      );
                    }}
                    onBlur={() => {

                      if (
                        editName.trim()
                      ) {
                        setEditName(
                          toProperCase(
                            editName
                          )
                        );
                      }

                    }}
                    placeholder="Enter doctor's name"
                    className={`
                      w-full
                      rounded-xl
                      border
                      bg-white
                      px-3.5
                      py-2.5
                      text-sm
                      text-slate-700
                      outline-none
                      transition
                      focus:border-[#0B1E41]
                      focus:ring-2
                      focus:ring-[#0B1E41]/10
                      ${
                        errors.name
                          ? "border-red-400"
                          : "border-slate-200"
                      }
                    `}
                  />

                </FormField>

                {/* DEGREE */}

                <FormField
                  label="Degree"
                  required
                  error={
                    errors.degree
                  }
                >

                  <input
                    type="text"
                    value={
                      editDegree
                    }
                    onChange={(
                      e
                    ) => {
                      setEditDegree(
                        e.target.value
                      );

                      clearError(
                        "degree"
                      );
                    }}
                    onBlur={() => {

                      if (
                        editDegree.trim()
                      ) {
                        setEditDegree(
                          toProperCase(
                            editDegree
                          )
                        );
                      }

                    }}
                    placeholder="Enter degree"
                    className={`
                      w-full
                      rounded-xl
                      border
                      bg-white
                      px-3.5
                      py-2.5
                      text-sm
                      text-slate-700
                      outline-none
                      transition
                      focus:border-[#0B1E41]
                      focus:ring-2
                      focus:ring-[#0B1E41]/10
                      ${
                        errors.degree
                          ? "border-red-400"
                          : "border-slate-200"
                      }
                    `}
                  />

                </FormField>

                {/* DESIGNATION */}

                <FormField
                  label="Designation"
                  required
                  error={
                    errors.designation
                  }
                >

                  <input
                    type="text"
                    value={
                      editDesignation
                    }
                    onChange={(
                      e
                    ) => {
                      setEditDesignation(
                        e.target.value
                      );

                      clearError(
                        "designation"
                      );
                    }}
                    onBlur={() => {

                      if (
                        editDesignation.trim()
                      ) {
                        setEditDesignation(
                          toProperCase(
                            editDesignation
                          )
                        );
                      }

                    }}
                    placeholder="Enter designation"
                    className={`
                      w-full
                      rounded-xl
                      border
                      bg-white
                      px-3.5
                      py-2.5
                      text-sm
                      text-slate-700
                      outline-none
                      transition
                      focus:border-[#0B1E41]
                      focus:ring-2
                      focus:ring-[#0B1E41]/10
                      ${
                        errors.designation
                          ? "border-red-400"
                          : "border-slate-200"
                      }
                    `}
                  />

                </FormField>

              </div>

              {/* FOOTER */}

              <div className="
                flex
                gap-3
                border-t
                border-slate-100
                bg-slate-50
                px-5
                py-4
              ">

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    submitting
                  }
                  className="
                    flex-1
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-slate-600
                    hover:bg-slate-100
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="
                    flex
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#0B1E41]
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-[#102a59]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {submitting && (

                    <span className="
                      h-4
                      w-4
                      animate-spin
                      rounded-full
                      border-2
                      border-white/30
                      border-t-white
                    " />

                  )}

                  {selectedDoctor
                    ? "Update Doctor"
                    : "Add Doctor"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </DashboardLayout>
  );
};

/* =========================
   FORM FIELD
========================= */

const FormField = ({
  label,
  required,
  error,
  children,
}) => {
  return (
    <div>

      <div className="
        mb-1.5
        flex
        items-center
        gap-1
      ">

        <label className="
          text-xs
          font-semibold
          text-slate-700
        ">
          {label}
        </label>

        {required && (
          <span className="
            text-red-500
          ">
            *
          </span>
        )}

      </div>

      {children}

      {error && (
        <p className="
          mt-1
          text-xs
          text-red-500
        ">
          {error}
        </p>
      )}

    </div>
  );
};

export default DoctorManagement;