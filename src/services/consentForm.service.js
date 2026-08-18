// consentForm.service.ts

import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native'; // Add this import
export interface ConsentFormPage {
    id: number;
    patient_id: number;
    file_path: string;
    page_number: number;
    uploaded_at: string;
}

export interface ConsentFormResponse {
    status?: string;
    success?: boolean;
    message?: string;
    patient_id: number;
    total: number;
    data?: ConsentFormPage[];
    // Alternative structure if your API returns differently
    consent_forms?: ConsentFormPage[];
    pages?: ConsentFormPage[];
}


export interface UploadConsentFormResponse {
    status: string;
    message: string;
    upload_id?: number;
    consent_form_ids?: number[];
    file_paths?: string[];
    consent_form_pages: ConsentFormPage[];
}

const ConsentFormService = {
    // =========================
    // HELPER: Get static page 2 image as file
    // =========================
      getStaticPage2Image: async (): Promise<{
        uri: string;
        name: string;
        type: string;
    }> => {
        try {
            // Path from src/services/ to root/assets/images/
            const page2Image = require('../assets/images/consent_page2.png');
            
            const resolved = Image.resolveAssetSource(page2Image);
            
            console.log('Static page 2 image loaded from:', resolved.uri);
            
            return {
                uri: resolved.uri,
                name: 'consent_page2.png',
                type: 'image/png',
            };
        } catch (error) {
            console.error('Error loading static page 2 image:', error);
            throw new Error('Failed to load static page 2 image from assets');
        }
    },

    // =========================
    // CONSENT FORM CRUD
    // =========================

    getConsentForms: async (patientId: string | number): Promise<ConsentFormResponse> => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            const response = await API.get(`/api/patients/${patientId}/consent-forms`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return { 
                    status: 'success', 
                    patient_id: Number(patientId), 
                    total: 0, 
                    consent_forms: [] 
                };
            }
            throw error;
        }
    },

  uploadConsentForm: async (
  patientId: string | number,
  files: Array<{ uri: string; name: string; type: string }>,
  pageNumber?: number
): Promise<UploadConsentFormResponse> => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const formData = new FormData();

    if (pageNumber && files.length === 1) {
      const fieldName = `page_${pageNumber}`;
      const file = files[0];
      console.log(`Uploading to field: ${fieldName}`, file);
      formData.append(fieldName, {
        uri: file.uri,
        type: file.type,
        name: file.name,
      } as any);
    } else {
      console.log('Batch upload using pages[]');
      files.forEach((file) => {
        formData.append('pages[]', {
          uri: file.uri,
          type: file.type,
          name: file.name,
        } as any);
      });
    }

    // Log form data keys (cannot log values easily)

    const response = await API.post(`/api/patients/${patientId}/consent-form/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
     console.error('Upload error response data:', error.response?.data);
  console.error('Upload error status:', error.response?.status);
  console.error('Upload error headers:', error.response?.headers);
    throw error;
  }
},
    // Simplified method for 3-page consent form with static page 2
    uploadThreePageConsentForm: async (
        patientId: string | number,
        page1File: { uri: string; name: string; type: string },
        page3File: { uri: string; name: string; type: string }
    ): Promise<UploadConsentFormResponse> => {
        try {
            // Get the static page 2 image from assets
            const staticPage2 = await ConsentFormService.getStaticPage2Image();
            
            // Upload all three pages
            return await ConsentFormService.uploadConsentForm(patientId, [
                page1File,
                staticPage2,
                page3File,
            ]);
        } catch (error) {
            console.error('Error uploading 3-page consent form:', error);
            throw error;
        }
    },

    generateConsentFormPDF: async (patientId: string | number): Promise<Blob> => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            const response = await API.get(`/api/patients/${patientId}/consent-form`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    },

    deleteConsentFormPage: async (consentFormId: number): Promise<{ status: string; message: string }> => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            const response = await API.post(`/api/patients/consent-forms/${consentFormId}/delete`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting consent form page:', error);
            throw error;
        }
    },
};

export default ConsentFormService;