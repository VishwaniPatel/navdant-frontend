import API from "./api";

const DoctorService = {
  getAllDoctors: async () => {
    const res = await API.get("/api/doctors");
    return res.data;
  },

  addDoctor: async (payload) => {
    const res = await API.post("/api/doctors", payload);
    return res.data;
  },

  getDoctorById: async (id) => {
    const res = await API.get(`/api/doctors/${id}`);
    return res.data;
  },

  updateDoctor: async (id, payload) => {
    const res = await API.post(
      `/api/doctors/${id}/update`,
      payload
    );
    return res.data;
  },

  deleteDoctor: async (id) => {
    const res = await API.post(
      `/api/doctors/${id}/delete`
    );
    return res.data;
  },
};

export default DoctorService;