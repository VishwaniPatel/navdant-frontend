import API from "./api";

const ImageService = {
  getPatientImages: async (patientId) => {
    const res = await API.get(
      `/api/patients/${patientId}/images`
    );

    return res.data;
  },

  uploadPatientImage: async (patientId, formData) => {
    const res = await API.post(
      `/api/patients/${patientId}/images/upload`,
      formData
    );

    return res.data;
  },

  deletePatientImage: async (imageId) => {
    const res = await API.post(
      `/api/patients/images/${imageId}/delete`
    );

    return res.data;
  },
};

export default ImageService;