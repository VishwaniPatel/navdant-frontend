import API from "./api";

const ConsentFormService = {
  // =========================================
  // GET STATIC PAGE 2 IMAGE
  // =========================================
  getStaticPage2Image: async () => {
    try {
      // Put consent_page2.png inside:
      // public/assets/images/consent_page2.png
      //
      // OR change this path according to your public folder.

      const response = await fetch("/assets/images/consent_page2.png");

      if (!response.ok) {
        throw new Error("Failed to load static page 2 image");
      }

      const blob = await response.blob();

      return new File(
        [blob],
        "consent_page2.png",
        {
          type: "image/png",
        }
      );
    } catch (error) {
      console.error(
        "Error loading static page 2 image:",
        error
      );

      throw new Error(
        "Failed to load static page 2 image"
      );
    }
  },

  // =========================================
  // GET CONSENT FORMS
  // =========================================
  getConsentForms: async (patientId) => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await API.get(
        `/api/patients/${patientId}/consent-forms`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          status: "success",
          patient_id: Number(patientId),
          total: 0,
          consent_forms: [],
        };
      }

      throw error;
    }
  },

  // =========================================
  // UPLOAD CONSENT FORM
  // =========================================
  uploadConsentForm: async (
    patientId,
    files,
    pageNumber
  ) => {
    try {
      const token = localStorage.getItem("access_token");

      const formData = new FormData();

      /*
       * Single page upload
       *
       * Page 1 -> page_1
       * Page 3 -> page_2
       */
      if (pageNumber && files.length === 1) {
        const file = files[0];

        formData.append(
          `page_${pageNumber}`,
          file
        );
      } else {
        /*
         * Multiple files
         */
        files.forEach((file) => {
          formData.append("pages[]", file);
        });
      }

      const response = await API.post(
        `/api/patients/${patientId}/consent-form/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,

            // IMPORTANT:
            // Don't manually set Content-Type here.
            // Browser/Axios will automatically add:
            // multipart/form-data; boundary=...
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Upload error response data:",
        error.response?.data
      );

      console.error(
        "Upload error status:",
        error.response?.status
      );

      console.error(
        "Upload error headers:",
        error.response?.headers
      );

      throw error;
    }
  },

  // =========================================
  // UPLOAD THREE PAGE CONSENT FORM
  // =========================================
  uploadThreePageConsentForm: async (
    patientId,
    page1File,
    page3File
  ) => {
    try {
      const staticPage2 =
        await ConsentFormService.getStaticPage2Image();

      return await ConsentFormService.uploadConsentForm(
        patientId,
        [
          page1File,
          staticPage2,
          page3File,
        ]
      );
    } catch (error) {
      console.error(
        "Error uploading 3-page consent form:",
        error
      );

      throw error;
    }
  },

  // =========================================
  // GENERATE CONSENT FORM PDF
  // =========================================
  generateConsentFormPDF: async (
    patientId
  ) => {
    try {
      const token =
        localStorage.getItem("access_token");

      const response = await API.get(
        `/api/patients/${patientId}/consent-form`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },

          responseType: "blob",
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Error generating PDF:",
        error
      );

      throw error;
    }
  },

  // =========================================
  // DELETE CONSENT FORM PAGE
  // =========================================
  deleteConsentFormPage: async (
    consentFormId
  ) => {
    try {
      const token =
        localStorage.getItem("access_token");

      const response = await API.post(
        `/api/patients/consent-forms/${consentFormId}/delete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Error deleting consent form page:",
        error
      );

      throw error;
    }
  },
};

export default ConsentFormService;