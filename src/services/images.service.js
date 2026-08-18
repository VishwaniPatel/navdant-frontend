// services/images.service.ts
import API from './api';

const ImageService = {
  getPatientImages: async (patientId: number) => {
    console.log("🌐 [ImageService] GET /api/patients/${patientId}/images");
    const res = await API.get(`/api/patients/${patientId}/images`);
    console.log("🌐 [ImageService] Response:", res.status, res.data);
    return res.data;
  },

  uploadPatientImage: async (patientId: number, formData: any) => {
    console.log("🌐 [ImageService] POST /api/patients/${patientId}/images/upload");
    
    const res = await API.post(
      `/api/patients/${patientId}/images/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    console.log("🌐 [ImageService] Response:", res.status, res.data);
    return res.data;
  },

  
  deletePatientImage: async (imageId: number) => {
    // The token will be automatically added by your interceptor
    const res = await API.post(`/api/patients/images/${imageId}/delete`);
    return res.data;
  },
};

export default ImageService;