import API from "./api.js";

const PatientService = {
  // =========================
  // BASIC CRUD
  // =========================

  addPatient: async (payload) => {
    const res = await API.post("/api/patients", payload);
    return res.data;
  },

  getAllPatients: async (params) => {
    const res = await API.get("/api/patients", {
      params,
    });

    return res.data;
  },

  getPatientById: async (id) => {
    console.log("in api",id);
    
    const res = await API.get(`/api/patients/${id}`);
    return res.data;
  },

  updatePatient: async (id, payload) => {
    const res = await API.post(
      `/api/patients/${id}/update`,
      payload
    );

    return res.data;
  },

  deletePatient: async (id) => {
    const res = await API.post(
      `/api/patients/${id}/delete`
    );

    return res.data;
  },

  // =========================
  // REPORT
  // =========================

  getPatientReport: async (filters) => {
    const res = await API.get(
      "/api/patients/report",
      {
        params: filters,
      }
    );

    return res.data;
  },

  // =========================
  // CONSENT FORM
  // =========================

  getConsentFormPDF: async (id) => {
    const res = await API.get(
      `/api/patients/${id}/consent-form`,
      {
        responseType: "blob",
      }
    );

    return res.data;
  },

  uploadConsentForm: async (id, files) => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("pages[]", file);
    });

    const res = await API.post(
      `/api/patients/${id}/consent-form/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  },

  getConsentForms: async (id) => {
    const res = await API.get(
      `/api/patients/${id}/consent-forms`
    );

    return res.data;
  },

  deleteConsentForm: async (consentFormId) => {
    const res = await API.post(
      `/api/patients/consent-forms/${consentFormId}`
    );

    return res.data;
  },

  // =========================
  // PATIENT IMAGES
  // =========================

  getPatientImages: async (id) => {
    const res = await API.get(
      `/api/patients/${id}/images`
    );

    return res.data;
  },

  uploadPatientImage: async (id, file) => {
    const formData = new FormData();

    formData.append("image", file);

    const res = await API.post(
      `/api/patients/${id}/images/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  },

  deletePatientImage: async (imageId) => {
    const res = await API.post(
      `/api/patients/images/${imageId}/delete`
    );

    return res.data;
  },

  // =========================
  // PDF
  // =========================

  getSmartCard: async (id) => {
    const res = await API.get(
      `/api/patients/${id}/smart-card`,
      {
        responseType: "blob",
      }
    );

    return res.data;
  },

  getMedicalCertificate: async (
    id,
    params
  ) => {
    const res = await API.get(
      `/api/patients/${id}/medical-certificate`,
      {
        params: {
          date: params.date,
          reason: params.reason,
          ...(params.doctor_id && {
            doctor_id: params.doctor_id,
          }),
        },
        responseType: "blob",
      }
    );

    return res.data;
  },

  // =========================
  // VISITS
  // =========================

  getPatientVisits: async (patientId) => {
    const res = await API.get(
      `/api/patients/${patientId}/visits`
    );

    return res.data;
  },

  addPatientVisit: async (
    patientId,
    payload
  ) => {
    const res = await API.post(
      `/api/patients/${patientId}/visits`,
      payload
    );

    return res.data;
  },

  updatePatientVisit: async (
    visitId,
    payload
  ) => {
    const res = await API.post(
      `/api/patients/visits/${visitId}/update`,
      payload
    );

    return res.data;
  },

  deletePatientVisit: async (visitId) => {
    const res = await API.post(
      `/api/patients/visits/${visitId}/delete`
    );

    return res.data;
  },

  // =========================
  // PAYMENTS
  // =========================

  getPatientPayments: async (patientId) => {
    const res = await API.get(
      `/api/patients/${patientId}/payments`
    );

    return res.data;
  },

  addPatientPayment: async (
    patientId,
    payload
  ) => {
    const res = await API.post(
      `/api/patients/${patientId}/payments`,
      payload
    );

    return res.data;
  },

  updatePatientPayment: async (
    paymentId,
    payload
  ) => {
    const res = await API.post(
      `/api/patients/payments/${paymentId}/update`,
      payload
    );

    return res.data;
  },

  deletePatientPayment: async (paymentId) => {
    const res = await API.post(
      `/api/patients/payments/${paymentId}/delete`
    );

    return res.data;
  },

  getNextCaseNumber: async () => {
    try {
      const response = await API.get('/api/patients/next-case-number');
      return response.data;
    } catch (error) {
      console.error('Error fetching next case number:', error);
      throw error;
    }
  },
};

export default PatientService;