import API from './api.js';

const DoctorService = {
  // =========================
  // GET ALL DOCTORS
  // =========================
  getAllDoctors: async () => {
    const res = await API.get('/api/doctors');
    return res.data;
  },

  // =========================
  // ADD DOCTOR
  // =========================
  addDoctor: async (payload: {
    name: string;
    degree: string;
    designation: string;
  }) => {
    const res = await API.post('/api/doctors', payload);
    return res.data;
  },

  // Get doctor by ID
getDoctorById: async (id: number) => {
  const res = await API.get(`/api/doctors/${id}`);
  return res.data;
},

// Update doctor
updateDoctor: async (id: number, payload: any) => {
  const res = await API.post(`/api/doctors/${id}/update`, payload);
  return res.data;
},

// Delete doctor
deleteDoctor: async (id: number) => {
  const res = await API.post(`/api/doctors/${id}/delete`);
  return res.data;
},
};

export default DoctorService;