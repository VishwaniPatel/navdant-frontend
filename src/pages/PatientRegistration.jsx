import React, { useCallback, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
    ArrowLeft,
    Check,
    ChevronLeft,
    Loader2,
    UserPlus,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import PatientService from "../services/patients.service";
import { SAFE_TEXT_REGEX } from "../utils/validators";
import DashboardLayout from "../components/layouts/DashboardLayout";
// import { useDialog } from "../components/CustomDialog";

const calculateDOB = (age) => {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - parseInt(age);
    return `${birthYear}-01-01`;
};

const formatDateForBackend = (dateString) => {
    const parts = dateString.split("/");

    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return dateString;
};

const generateEmail = (name) => {
    const emailName = name.toLowerCase().replace(/\s/g, ".");
    return `${emailName}@navdant.com`;
};

const toProperCase = (str) => {
    if (!str) return "";

    return str
        .toLowerCase()
        .split(" ")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ");
};

const patientSchema = yup.object({
    name: yup
        .string()
        .required("Full name is required")
        .test(
            "no-special-chars",
            "Name contains invalid characters",
            (value) => {
                if (!value) return true;
                return SAFE_TEXT_REGEX.test(value);
            }
        ),

    mobile: yup
        .string()
        .required("Mobile number is required")
        .matches(
            /^\d{10}$/,
            "Please enter a valid 10-digit mobile number"
        ),

    registrationDate: yup
        .string()
        .required("Registration date is required"),

    gender: yup
        .string()
        .required("Please select gender"),

    age: yup.string().default(""),

    address: yup.string().default(""),

    caseNumber: yup
        .string()
        .required("Case number is required")
        .matches(/^\d+$/, "Please enter a valid number"),
});

const initialFormState = {
    hasBP: false,
    hasKidneyDisease: false,
    hasDiabetes: false,
    hasLiverDisease: false,
    hasPastSurgery: false,
    hasPregnancy: false,
    hasBleedingDisorder: false,
    hasRespiratory: false,
    hasHeartDisease: false,
    hasThyroid: false,
    hasEpilepsy: false,
    hasOtherMedical: false,

    pastSurgeryDetails: "",

    habitTobacco: false,
    habitSmoking: false,
    habitSopari: false,
    habitTeethGrinding: false,

    drugAllergies: "",
    drugAcidity: "",
    bloodThinnerIssues: "",
    currentMedications: "",
};

const medicalConditions = [
    {
        key: "hasBP",
        label: "Blood Pressure",
        gujarati: "બ્લડ પ્રેશર",
    },
    {
        key: "hasDiabetes",
        label: "Diabetes",
        gujarati: "ડાયાબિટીસ",
    },
    {
        key: "hasHeartDisease",
        label: "Heart Disease / Operation",
        gujarati: "હૃદયરોગ / ઓપરેશન",
    },
    {
        key: "hasKidneyDisease",
        label: "Kidney Disease",
        gujarati: "કિડનીના રોગ",
    },
    {
        key: "hasLiverDisease",
        label: "Liver Disease",
        gujarati: "લિવરના રોગ",
    },
    {
        key: "hasRespiratory",
        label: "Respiratory Issues",
        gujarati: "શ્વાસની તકલીફ",
    },
    {
        key: "hasThyroid",
        label: "Thyroid",
        gujarati: "થાયરોઇડ",
    },
    {
        key: "hasEpilepsy",
        label: "Epilepsy",
        gujarati: "મિર્ગી",
    },
    {
        key: "hasBleedingDisorder",
        label: "Bleeding Disorder",
        gujarati: "લોહી બંધ ન થાય તેવી તકલીફ",
    },
    {
        key: "hasPastSurgery",
        label: "Past Surgery",
        gujarati: "ભૂતકાળની સર્જરી",
    },
    {
        key: "hasPregnancy",
        label: "Pregnancy",
        gujarati: "ગર્ભાવસ્થા",
    },
    {
        key: "hasOtherMedical",
        label: "Other",
        gujarati: "અન્ય",
    },
];

const habits = [
    {
        key: "habitTobacco",
        label: "Tobacco",
        gujarati: "તમાકુ",
    },
    {
        key: "habitSmoking",
        label: "Smoking",
        gujarati: "બીડી/સિગારેટ",
    },
    {
        key: "habitSopari",
        label: "Sopari",
        gujarati: "સુપારી",
    },
    {
        key: "habitTeethGrinding",
        label: "Teeth Grinding",
        gujarati: "દાંત કચકચાવવાની આદત",
    },
];

export default function PatientRegistration() {
    const navigate = useNavigate();
    const location = useLocation();

    /*
      Expected navigation:
  
      navigate("/patients/register", {
        state: {
          patientId,
          patientData
        }
      });
  
      For new patient:
      navigate("/patients/register");
    */

    const patientId = location.state?.patientId;
    const patientData = location.state?.patientData;

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialFormState);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [caseNumberLoading, setCaseNumberLoading] =
        useState(false);
    const [caseNumberError, setCaseNumberError] =
        useState("");
    const [isCheckingCase, setIsCheckingCase] =
        useState(false);

    const totalSteps = 4;

    const {
        control,
        handleSubmit,
        formState: { errors },
        getValues,
        setValue,
        trigger,
        clearErrors,
    } = useForm({
        resolver: yupResolver(patientSchema),
        defaultValues: {
            name: "",
            registrationDate: new Date().toLocaleDateString("en-GB"),
            mobile: "",
            age: "",
            gender: "",
            address: "",
            caseNumber: "",
        },
    });

    /*
     * Populate edit form
     */
    useEffect(() => {
        if (patientData && patientId) {
            populateFormForEdit(patientData);
        }
    }, [patientData, patientId]);

    const populateFormForEdit = (patient) => {
        let cleanPhone = patient.phone || "";

        cleanPhone = cleanPhone.replace(/\D/g, "");

        if (
            cleanPhone.length === 12 &&
            cleanPhone.startsWith("91")
        ) {
            cleanPhone = cleanPhone.slice(2);
        }

        if (cleanPhone.length > 10) {
            cleanPhone = cleanPhone.slice(-10);
        }

        setValue(
            "caseNumber",
            patient.case_number?.toString() || ""
        );

        setValue(
            "name",
            toProperCase(patient.name)
        );

        setValue("mobile", cleanPhone);

        setValue(
            "registrationDate",
            patient.registration_date || patient.regDate
        );

        setValue(
            "age",
            patient.age?.toString() || ""
        );

        setValue("gender", patient.gender || "");

        setValue(
            "address",
            toProperCase(patient.address || "")
        );

        setFormData((prev) => ({
            ...prev,

            hasBP: patient.has_bp || false,
            hasKidneyDisease:
                patient.has_kidney_disease || false,
            hasDiabetes:
                patient.has_diabetes || false,
            hasLiverDisease:
                patient.has_liver_disease || false,
            hasPastSurgery:
                patient.has_past_surgery || false,
            hasPregnancy:
                patient.has_pregnancy || false,
            hasBleedingDisorder:
                patient.has_bleeding_disorder || false,
            hasRespiratory:
                patient.has_respiratory || false,
            hasHeartDisease:
                patient.has_heart_disease || false,
            hasThyroid:
                patient.has_thyroid || false,
            hasEpilepsy:
                patient.has_epilepsy || false,
            hasOtherMedical:
                patient.has_other_medical || false,

            pastSurgeryDetails:
                patient.past_surgery_details || "",

            habitTobacco:
                patient.habit_tobacco || false,
            habitSmoking:
                patient.habit_smoking || false,
            habitSopari:
                patient.habit_sopari || false,
            habitTeethGrinding:
                patient.habit_teeth_grinding || false,

            drugAllergies:
                patient.drug_allergies || "",
            drugAcidity:
                patient.drug_acidity || "",
            bloodThinnerIssues:
                patient.blood_thinner_issues || "",
            currentMedications:
                patient.current_medications || "",
        }));
    };

    /*
     * Get next case number
     */
    useEffect(() => {
        if (!patientId) {
            fetchNextCaseNumber();
        }
    }, [patientId]);

    const fetchNextCaseNumber = async () => {
  setCaseNumberLoading(true);

  try {
    const response = await PatientService.getNextCaseNumber();

    console.log("NEXT CASE NUMBER RESPONSE:", response);

    const nextCaseNumber =
      response?.next_case_number ??
      response?.data?.next_case_number;

    if (nextCaseNumber !== undefined && nextCaseNumber !== null) {
      const next = String(nextCaseNumber);

      setValue("caseNumber", next, {
        shouldValidate: true,
        shouldDirty: true,
      });

      setNextCaseNumber(next);
    } else {
      console.error(
        "next_case_number not found in response:",
        response
      );
    }
  } catch (error) {
    console.error(
      "Failed to fetch next case number:",
      error?.response?.data || error
    );
  } finally {
    setCaseNumberLoading(false);
  }
};

    /*
     * Case number validation
     */
    const checkCaseNumber = useCallback(
        async (caseNum) => {
            if (!caseNum) {
                setCaseNumberError("");
                return true;
            }

            const num = parseInt(caseNum, 10);

            if (isNaN(num)) {
                setCaseNumberError(
                    "Please enter a valid number"
                );
                return false;
            }

            setIsCheckingCase(true);

            try {
                const response =
                    await PatientService.getPatientReport({
                        case_number: num,
                    });

                const existingPatients =
                    response.patients || [];

                if (existingPatients.length > 0) {
                    if (
                        patientId &&
                        existingPatients.some(
                            (p) => p.id === patientId
                        )
                    ) {
                        setCaseNumberError("");
                        return true;
                    }

                    setCaseNumberError(
                        "This case number is already in use."
                    );

                    return false;
                }

                setCaseNumberError("");

                return true;
            } catch (error) {
                console.error(
                    "Error checking case number:",
                    error
                );

                setCaseNumberError(
                    "Unable to verify case number."
                );

                return false;
            } finally {
                setIsCheckingCase(false);
            }
        },
        [patientId]
    );

    /*
     * Form state helpers
     */
    const updateCheckboxField = (key) => {
        setFormData((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const updateTextField = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    /*
     * Backend payload
     */
    const prepareBackendData = (data) => {
        const doctorId = 1;

        let dob = null;

        if (
            data.age &&
            parseInt(data.age) > 0
        ) {
            dob = calculateDOB(data.age);
        }

        const formattedRegDate =
            formatDateForBackend(
                data.registrationDate
            );

        const email = generateEmail(data.name);

        const formattedName =
            toProperCase(data.name);

        const formattedAddress =
            toProperCase(data.address || "");

        const medicalHistoryConditions = [];

        if (formData.hasBP)
            medicalHistoryConditions.push(
                "Blood Pressure"
            );

        if (formData.hasDiabetes)
            medicalHistoryConditions.push("Diabetes");

        if (formData.hasHeartDisease)
            medicalHistoryConditions.push(
                "Heart Disease"
            );

        if (formData.hasThyroid)
            medicalHistoryConditions.push("Thyroid");

        if (formData.hasKidneyDisease)
            medicalHistoryConditions.push(
                "Kidney Disease"
            );

        if (formData.hasLiverDisease)
            medicalHistoryConditions.push(
                "Liver Disease"
            );

        if (formData.hasRespiratory)
            medicalHistoryConditions.push(
                "Respiratory Issues"
            );

        if (formData.hasEpilepsy)
            medicalHistoryConditions.push("Epilepsy");

        if (formData.hasBleedingDisorder)
            medicalHistoryConditions.push(
                "Bleeding Disorder"
            );

        if (formData.hasPastSurgery)
            medicalHistoryConditions.push(
                "Past Surgery"
            );

        if (formData.hasPregnancy)
            medicalHistoryConditions.push(
                "Pregnancy"
            );

        if (formData.hasOtherMedical)
            medicalHistoryConditions.push("Other");

        let medicalHistory =
            medicalHistoryConditions.join(", ");

        if (formData.pastSurgeryDetails) {
            medicalHistory += ` (${formData.pastSurgeryDetails})`;
        }

        return {
            case_number: parseInt(
                data.caseNumber,
                10
            ),

            name: formattedName,

            phone: data.mobile,

            email,

            gender: data.gender,

            dob,

            address: formattedAddress,

            medical_history:
                medicalHistory || "",

            registration_date:
                formattedRegDate,

            has_bp: formData.hasBP,

            has_kidney_disease:
                formData.hasKidneyDisease,

            has_diabetes:
                formData.hasDiabetes,

            has_liver_disease:
                formData.hasLiverDisease,

            has_past_surgery:
                formData.hasPastSurgery,

            has_pregnancy:
                formData.hasPregnancy,

            has_bleeding_disorder:
                formData.hasBleedingDisorder,

            has_respiratory:
                formData.hasRespiratory,

            has_heart_disease:
                formData.hasHeartDisease,

            has_thyroid:
                formData.hasThyroid,

            has_epilepsy:
                formData.hasEpilepsy,

            has_other_medical:
                formData.hasOtherMedical,

            past_surgery_details:
                formData.pastSurgeryDetails || "",

            habit_tobacco:
                formData.habitTobacco,

            habit_smoking:
                formData.habitSmoking,

            habit_sopari:
                formData.habitSopari,

            habit_teeth_grinding:
                formData.habitTeethGrinding,

            drug_allergies:
                formData.drugAllergies || "",

            drug_acidity:
                formData.drugAcidity || "",

            blood_thinner_issues:
                formData.bloodThinnerIssues || "",

            current_medications:
                formData.currentMedications || "",

            doctor_id: doctorId,
        };
    };

    /*
     * Submit
     */
    const onSubmit = async (data) => {
        if (caseNumberError) {
            alert(caseNumberError);
            return;
        }

        setIsSubmitting(true);

        try {
            const backendData =
                prepareBackendData(data);

            let response;

            if (patientId) {
                response =
                    await PatientService.updatePatient(
                        patientId,
                        backendData
                    );
            } else {
                response =
                    await PatientService.addPatient(
                        backendData
                    );
            }

            if (response?.status === "success") {
                alert(
                    response?.message ||
                    `Patient ${patientId ? "updated" : "added"
                    } successfully!`
                );

                navigate("/patients");
            } else {
                alert(
                    response?.message ||
                    `Failed to ${patientId ? "update" : "save"
                    } patient record.`
                );
            }
        } catch (error) {
            console.error(
                "Error saving patient:",
                error
            );

            alert(
                error?.response?.data?.message ||
                error?.message ||
                `Failed to ${patientId ? "update" : "save"
                } patient record.`
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    /*
     * Next
     */
    const handleNext = async () => {
        if (currentStep === 1) {
            const isValid = await trigger([
                "name",
                "mobile",
                "registrationDate",
                "gender",
                "caseNumber",
            ]);

            if (!isValid) return;

            const caseNum =
                getValues("caseNumber");

            const isCaseValid =
                await checkCaseNumber(caseNum);

            if (!isCaseValid) return;
        }

        if (currentStep < totalSteps) {
            setCurrentStep(
                (prev) => prev + 1
            );
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(
                (prev) => prev - 1
            );
        }
    };

    const handleHeaderBack = () => {
        navigate("/patients");
    };

    return (
        <DashboardLayout>
            <div className="w-full">

                {/* Header - NO BACK ARROW */}
                <div className="mb-6 flex items-center gap-3">
                    <div
                        className="
              flex h-11 w-11
              items-center justify-center
              rounded-xl bg-[#0B1E41]/10
            "
                    >
                        <UserPlus
                            size={22}
                            className="text-[#0B1E41]"
                        />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-[#0B1E41]">
                            Patient Registration
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Register a new patient in your clinic
                        </p>
                    </div>
                </div>

                {/* Registration content */}
                <div
                    className="
            rounded-2xl
            border border-slate-200
            bg-white p-6
            shadow-sm
          "
                >

                    {/* Progress */}
                    <div className="border-b border-slate-200 bg-white px-4 py-4 md:px-8">
                        <div className="mx-auto max-w-5xl">

                            <div className="mb-2 text-sm font-medium text-slate-500">
                                Step {currentStep} of {totalSteps}
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                                <div
                                    className="h-full rounded-full bg-[#0B1E41] transition-all duration-300"
                                    style={{
                                        width: `${(currentStep /
                                                totalSteps) *
                                            100
                                            }%`,
                                    }}
                                />
                            </div>

                        </div>
                    </div>

                    {/* Content */}
                    <main className="mx-auto max-w-5xl px-4 py-6 pb-28 md:px-8 md:py-8">

                        {currentStep === 1 && (
                            <Step1
                                control={control}
                                errors={errors}
                                clearErrors={clearErrors}
                                getValues={getValues}
                                setValue={setValue}
                                caseNumberLoading={
                                    caseNumberLoading
                                }
                                caseNumberError={
                                    caseNumberError
                                }
                                isCheckingCase={
                                    isCheckingCase
                                }
                                checkCaseNumber={
                                    checkCaseNumber
                                }
                            />
                        )}

                        {currentStep === 2 && (
                            <Step2
                                formData={formData}
                                updateCheckboxField={
                                    updateCheckboxField
                                }
                                updateTextField={
                                    updateTextField
                                }
                            />
                        )}

                        {currentStep === 3 && (
                            <Step3
                                formData={formData}
                                updateCheckboxField={
                                    updateCheckboxField
                                }
                                updateTextField={
                                    updateTextField
                                }
                            />
                        )}

                        {currentStep === 4 && (
                            <Step4
                                formData={formData}
                                getValues={getValues}
                            />
                        )}

                    </main>

                    {/* Footer */}
                    <div className="mt-6 border-t border-slate-200 bg-white p-4">
                        <div className="mx-auto flex max-w-5xl gap-3">

                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="flex-1 rounded-xl bg-slate-100 px-5 py-3.5 font-semibold text-slate-600 transition hover:bg-slate-200"
                                >
                                    Back
                                </button>
                            )}

                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex-[2] rounded-xl bg-[#0B1E41] px-5 py-3.5 font-bold text-white transition hover:bg-[#142b59]"
                                >
                                    Continue
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={handleSubmit(onSubmit)}
                                    className="flex-[2] rounded-xl bg-[#0B1E41] px-5 py-3.5 font-bold text-white transition hover:bg-[#142b59] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />
                                            Saving...
                                        </span>
                                    ) : (
                                        "Save Patient"
                                    )}
                                </button>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function Step1({
    control,
    errors,
    clearErrors,
    getValues,
    caseNumberLoading,
    caseNumberError,
    isCheckingCase,
    checkCaseNumber,
}) {
    return (
        <section>
            <h2 className="mb-6 text-xl font-bold text-[#0B1E41] md:text-2xl">
                Patient Personal Details
            </h2>

            {/* Case Number */}
            <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Case Number *
                </label>

                {caseNumberLoading ? (
                    <div className="h-12 w-full animate-pulse rounded-xl bg-slate-200" />
                ) : (
                    <Controller
                        control={control}
                        name="caseNumber"
                        render={({
                            field: {
                                onChange,
                                onBlur,
                                value,
                            },
                        }) => (
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={value}
                                    placeholder="Auto-generated"
                                    onChange={(e) => {
                                        onChange(
                                            e.target.value.replace(
                                                /\D/g,
                                                ""
                                            )
                                        );
                                    }}
                                    onBlur={async () => {
                                        onBlur();
                                        await checkCaseNumber(
                                            value
                                        );
                                    }}
                                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:ring-2 ${errors.caseNumber ||
                                            caseNumberError
                                            ? "border-red-500 focus:ring-red-100"
                                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                                        }`}
                                />

                                {isCheckingCase && (
                                    <Loader2
                                        size={18}
                                        className="absolute right-4 top-3.5 animate-spin text-blue-600"
                                    />
                                )}
                            </div>
                        )}
                    />
                )}

                {(errors.caseNumber ||
                    caseNumberError) && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.caseNumber?.message ||
                                caseNumberError}
                        </p>
                    )}
            </div>

            {/* Name */}
            <FormInput
                label="Full Name *"
                name="name"
                control={control}
                error={errors.name}
                placeholder="Enter full name"
                onBlurFormat={(value, onChange) => {
                    if (value) {
                        onChange(
                            toProperCase(value)
                        );
                    }
                }}
                clearErrors={clearErrors}
            />

            {/* Registration date */}
            <FormInput
                label="Registration Date *"
                name="registrationDate"
                control={control}
                error={errors.registrationDate}
                placeholder="DD/MM/YYYY"
                clearErrors={clearErrors}
            />

            {/* Age */}
            <FormInput
                label="Age"
                name="age"
                control={control}
                placeholder="Age"
                type="number"
                clearErrors={clearErrors}
            />

            {/* Gender */}
            <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Gender *
                </label>

                <Controller
                    control={control}
                    name="gender"
                    render={({
                        field: {
                            onChange,
                            value,
                        },
                    }) => (
                        <div className="flex gap-6">
                            {["Male", "Female"].map(
                                (gender) => (
                                    <button
                                        type="button"
                                        key={gender}
                                        onClick={() => {
                                            onChange(gender);
                                            clearErrors(
                                                "gender"
                                            );
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <span
                                            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${value === gender
                                                    ? "border-[#0B1E41]"
                                                    : "border-slate-300"
                                                }`}
                                        >
                                            {value === gender && (
                                                <span className="h-2.5 w-2.5 rounded-full bg-[#0B1E41]" />
                                            )}
                                        </span>

                                        <span className="text-sm text-slate-700">
                                            {gender}
                                        </span>
                                    </button>
                                )
                            )}
                        </div>
                    )}
                />

                {errors.gender && (
                    <p className="mt-1 text-xs text-red-500">
                        {errors.gender.message}
                    </p>
                )}
            </div>

            {/* Mobile */}
            <FormInput
                label="Mobile Number *"
                name="mobile"
                control={control}
                error={errors.mobile}
                placeholder="10-digit mobile number"
                type="tel"
                maxLength={10}
                clearErrors={clearErrors}
            />

            {/* Address */}
            <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Address
                </label>

                <Controller
                    control={control}
                    name="address"
                    render={({
                        field: {
                            onChange,
                            onBlur,
                            value,
                        },
                    }) => (
                        <textarea
                            rows={3}
                            value={value}
                            placeholder="Enter full address"
                            onChange={(e) =>
                                onChange(e.target.value)
                            }
                            onBlur={() => {
                                onBlur();

                                if (value) {
                                    onChange(
                                        toProperCase(value)
                                    );
                                }
                            }}
                            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    )}
                />
            </div>
        </section>
    );
}

function FormInput({
    label,
    name,
    control,
    error,
    placeholder,
    type = "text",
    maxLength,
    onBlurFormat,
    clearErrors,
}) {
    return (
        <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </label>

            <Controller
                control={control}
                name={name}
                render={({
                    field: {
                        onChange,
                        onBlur,
                        value,
                    },
                }) => (
                    <input
                        type={type}
                        value={value}
                        maxLength={maxLength}
                        placeholder={placeholder}
                        onChange={(e) => {
                            let newValue =
                                e.target.value;

                            if (name === "mobile") {
                                newValue =
                                    newValue.replace(
                                        /\D/g,
                                        ""
                                    );
                            }

                            onChange(newValue);

                            if (clearErrors) {
                                clearErrors(name);
                            }
                        }}
                        onBlur={() => {
                            onBlur();

                            if (onBlurFormat) {
                                onBlurFormat(
                                    value,
                                    onChange
                                );
                            }
                        }}
                        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:ring-2 ${error
                                ? "border-red-500 focus:ring-red-100"
                                : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                    />
                )}
            />

            {error && (
                <p className="mt-1 text-xs text-red-500">
                    {error.message}
                </p>
            )}
        </div>
    );
}

function Step2({
    formData,
    updateCheckboxField,
    updateTextField,
}) {
    return (
        <section>
            <h2 className="mb-2 text-xl font-bold text-[#0B1E41] md:text-2xl">
                Medical History
            </h2>

            <p className="mb-5 text-sm text-slate-500">
                Select all conditions that apply:
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {medicalConditions.map(
                    (item) => {
                        const checked =
                            formData[item.key];

                        return (
                            <button
                                type="button"
                                key={item.key}
                                onClick={() =>
                                    updateCheckboxField(
                                        item.key
                                    )
                                }
                                className={`rounded-xl border p-4 text-left transition ${checked
                                        ? "border-red-400 bg-red-50"
                                        : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${checked
                                                ? "border-red-500 bg-red-500"
                                                : "border-slate-300 bg-white"
                                            }`}
                                    >
                                        {checked && (
                                            <Check
                                                size={13}
                                                strokeWidth={3}
                                                className="text-white"
                                            />
                                        )}
                                    </span>

                                    <span
                                        className={`text-sm font-medium ${checked
                                                ? "text-red-600"
                                                : "text-slate-700"
                                            }`}
                                    >
                                        {item.label}{" "}
                                        <span className="text-xs">
                                            ({item.gujarati})
                                        </span>
                                    </span>
                                </div>
                            </button>
                        );
                    }
                )}
            </div>

            <div className="mt-6">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Additional Medical Details
                </label>

                <textarea
                    rows={4}
                    value={
                        formData.pastSurgeryDetails
                    }
                    onChange={(e) =>
                        updateTextField(
                            "pastSurgeryDetails",
                            e.target.value
                        )
                    }
                    placeholder="Provide details about surgeries or other medical conditions"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
            </div>
        </section>
    );
}

function Step3({
    formData,
    updateCheckboxField,
    updateTextField,
}) {
    return (
        <section>
            <h2 className="mb-6 text-xl font-bold text-[#0B1E41] md:text-2xl">
                Habits & Medications
            </h2>

            <label className="mb-3 block text-sm font-semibold text-slate-700">
                Habits
            </label>

            <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {habits.map((item) => {
                    const checked =
                        formData[item.key];

                    return (
                        <button
                            type="button"
                            key={item.key}
                            onClick={() =>
                                updateCheckboxField(
                                    item.key
                                )
                            }
                            className={`rounded-xl border p-4 text-left transition ${checked
                                    ? "border-red-400 bg-red-50"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={`flex h-5 w-5 items-center justify-center rounded border-2 ${checked
                                            ? "border-red-500 bg-red-500"
                                            : "border-slate-300"
                                        }`}
                                >
                                    {checked && (
                                        <Check
                                            size={13}
                                            strokeWidth={3}
                                            className="text-white"
                                        />
                                    )}
                                </span>

                                <span
                                    className={`text-sm font-medium ${checked
                                            ? "text-red-600"
                                            : "text-slate-700"
                                        }`}
                                >
                                    {item.label}{" "}
                                    <span className="text-xs">
                                        ({item.gujarati})
                                    </span>
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            <TextAreaField
                label="Drug Allergies"
                placeholder="Add any drug allergies"
                value={formData.drugAllergies}
                onChange={(value) =>
                    updateTextField(
                        "drugAllergies",
                        value
                    )
                }
            />

            <TextAreaField
                label="Medications Causing Acidity"
                placeholder="Specify any medications causing acidity"
                value={formData.drugAcidity}
                onChange={(value) =>
                    updateTextField(
                        "drugAcidity",
                        value
                    )
                }
            />

            <TextAreaField
                label="Blood Thinner / Aspirin Issues"
                placeholder="Specify if taking blood thinning medications"
                value={
                    formData.bloodThinnerIssues
                }
                onChange={(value) =>
                    updateTextField(
                        "bloodThinnerIssues",
                        value
                    )
                }
            />

            <TextAreaField
                label="Current Medications"
                placeholder="List all current medications"
                value={
                    formData.currentMedications
                }
                onChange={(value) =>
                    updateTextField(
                        "currentMedications",
                        value
                    )
                }
                textarea
            />
        </section>
    );
}

function TextAreaField({
    label,
    placeholder,
    value,
    onChange,
    textarea = false,
}) {
    return (
        <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </label>

            {textarea ? (
                <textarea
                    rows={4}
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
            ) : (
                <input
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
            )}
        </div>
    );
}

function Step4({
    formData,
    getValues,
}) {
    const conditions = [
        ["hasBP", "Blood Pressure"],
        ["hasDiabetes", "Diabetes"],
        [
            "hasHeartDisease",
            "Heart Disease",
        ],
        ["hasThyroid", "Thyroid"],
        [
            "hasKidneyDisease",
            "Kidney Disease",
        ],
        [
            "hasLiverDisease",
            "Liver Disease",
        ],
        [
            "hasRespiratory",
            "Respiratory Issues",
        ],
        ["hasEpilepsy", "Epilepsy"],
        [
            "hasBleedingDisorder",
            "Bleeding Disorder",
        ],
        [
            "hasPastSurgery",
            "Past Surgery",
        ],
        ["hasPregnancy", "Pregnancy"],
        [
            "hasOtherMedical",
            "Other Medical",
        ],
    ];

    const selectedConditions =
        conditions.filter(
            ([key]) => formData[key]
        );

    const selectedHabits = [
        ["habitTobacco", "Tobacco"],
        ["habitSmoking", "Smoking"],
        ["habitSopari", "Sopari"],
        [
            "habitTeethGrinding",
            "Teeth Grinding",
        ],
    ].filter(([key]) => formData[key]);

    return (
        <section>
            <h2 className="mb-6 text-xl font-bold text-[#0B1E41] md:text-2xl">
                Review Patient Details
            </h2>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">

                <ReviewSection title="Personal Information">

                    <ReviewRow
                        label="Case Number"
                        value={
                            getValues("caseNumber") ||
                            "Not provided"
                        }
                    />

                    <ReviewRow
                        label="Name"
                        value={
                            getValues("name") ||
                            "Not provided"
                        }
                    />

                    <ReviewRow
                        label="Age"
                        value={
                            getValues("age") ||
                            "Not provided"
                        }
                    />

                    <ReviewRow
                        label="Gender"
                        value={
                            getValues("gender") ||
                            "Not provided"
                        }
                    />

                    <ReviewRow
                        label="Mobile"
                        value={
                            getValues("mobile") ||
                            "Not provided"
                        }
                    />

                    <ReviewRow
                        label="Registration Date"
                        value={getValues(
                            "registrationDate"
                        )}
                    />

                    {getValues("address") && (
                        <ReviewRow
                            label="Address"
                            value={getValues(
                                "address"
                            )}
                        />
                    )}

                </ReviewSection>

                <ReviewSection title="Medical Conditions">

                    {selectedConditions.length >
                        0 ? (
                        <div className="space-y-1">
                            {selectedConditions.map(
                                ([, label]) => (
                                    <div
                                        key={label}
                                        className="font-semibold text-red-600"
                                    >
                                        • {label}
                                    </div>
                                )
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-600">
                            No medical conditions
                            reported
                        </p>
                    )}

                    {formData.pastSurgeryDetails && (
                        <ReviewRow
                            label="Additional Details"
                            value={
                                formData.pastSurgeryDetails
                            }
                        />
                    )}

                </ReviewSection>

                <ReviewSection title="Habits & Medications">

                    {selectedHabits.length >
                        0 && (
                            <div className="mb-3 space-y-1">
                                {selectedHabits.map(
                                    ([, label]) => (
                                        <div
                                            key={label}
                                            className="font-semibold text-red-600"
                                        >
                                            • {label}
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                    {formData.drugAllergies && (
                        <ReviewRow
                            label="Drug Allergies"
                            value={
                                formData.drugAllergies
                            }
                        />
                    )}

                    {formData.drugAcidity && (
                        <ReviewRow
                            label="Acidity Issues"
                            value={
                                formData.drugAcidity
                            }
                        />
                    )}

                    {formData.bloodThinnerIssues && (
                        <ReviewRow
                            label="Blood Thinner Issues"
                            value={
                                formData.bloodThinnerIssues
                            }
                        />
                    )}

                    {formData.currentMedications && (
                        <ReviewRow
                            label="Current Medications"
                            value={
                                formData.currentMedications
                            }
                        />
                    )}

                    {!selectedHabits.length &&
                        !formData.drugAllergies &&
                        !formData.drugAcidity &&
                        !formData.bloodThinnerIssues &&
                        !formData.currentMedications && (
                            <p className="text-sm text-slate-500">
                                No habits or medication
                                details provided
                            </p>
                        )}

                </ReviewSection>

            </div>
        </section>
    );
}

function ReviewSection({
    title,
    children,
}) {
    return (
        <div className="border-b border-slate-200 py-5 first:pt-0 last:border-b-0 last:pb-0">
            <h3 className="mb-4 text-base font-bold text-[#0B1E41]">
                {title}
            </h3>

            {children}
        </div>
    );
}

function ReviewRow({
    label,
    value,
}) {
    return (
        <div className="mb-2 grid grid-cols-1 gap-1 sm:grid-cols-[160px_1fr]">
            <span className="text-sm font-semibold text-slate-500">
                {label}:
            </span>

            <span className="break-words text-sm text-slate-800">
                {value}
            </span>
        </div>
    );
}