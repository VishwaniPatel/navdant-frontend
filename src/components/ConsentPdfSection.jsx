import React, { useEffect, useState } from "react";
import {
  X,
  Upload,
  Trash2,
  FileText,
  FileSignature,
  FileType2,
  Loader2,
  Info,
  ChevronLeft,
} from "lucide-react";

import ConsentFormService from "../services/consentForm.service";
import { CONSENT_PAGE_2_BASE64 } from "../../constants/consentFormImages";
import { baseUrl } from "../environment/environment";

import { useDialog } from "./CustomDialog";

const ConsentPdfSection = ({ visible, onClose, patient }) => {
  const [uploadedImage1, setUploadedImage1] = useState(null);
  const [uploadedImage2, setUploadedImage2] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetchingForms, setFetchingForms] = useState(false);

  const [consentForms, setConsentForms] = useState([]);

  const [showViewer, setShowViewer] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  const { showDialog } = useDialog();

  // ======================================================
  // FETCH CONSENT FORMS
  // ======================================================

  useEffect(() => {
    if (visible && patient?.id) {
      fetchConsentForms();

      setUploadedImage1(null);
      setUploadedImage2(null);
      setShowViewer(false);
      setHtmlContent("");
    }
  }, [visible, patient?.id]);

  const fetchConsentForms = async () => {
    setFetchingForms(true);

    try {
      const response =
        await ConsentFormService.getConsentForms(patient.id);

      console.log("Consent forms response:", response);

      const forms =
        response?.consent_forms ||
        response?.data ||
        response?.pages ||
        [];

      setConsentForms(Array.isArray(forms) ? forms : []);
    } catch (error) {
      console.error("Fetch consent forms error:", error);
      setConsentForms([]);
    } finally {
      setFetchingForms(false);
    }
  };

  // ======================================================
  // PAGE CHECKS
  // ======================================================

  const hasPage1InDatabase = () => {
    return consentForms.some(
      (form) => Number(form.page_number) === 1
    );
  };

  // Backend page_number 2 = actual Page 3
  const hasPage3InDatabase = () => {
    return consentForms.some(
      (form) => Number(form.page_number) === 2
    );
  };

  const hasBothPagesInDatabase = () => {
    return (
      hasPage1InDatabase() &&
      hasPage3InDatabase()
    );
  };

  // ======================================================
  // NORMALIZE BASE64
  // ======================================================

  const normalizeBase64Image = (
    base64,
    mimeType = "image/png"
  ) => {
    if (!base64) {
      console.error("Page 2 Base64 is empty");
      return "";
    }

    let value = String(base64).trim();

    // Remove quotes if Base64 was exported with quotes
    value = value.replace(/^["']|["']$/g, "");

    // Already has data:image/... prefix
    if (value.startsWith("data:image/")) {
      return value;
    }

    // Raw Base64
    return `data:${mimeType};base64,${value}`;
  };

  // ======================================================
  // PAGE 2 STATIC BASE64
  // ======================================================

  const getPage2Image = () => {
    const page2 = normalizeBase64Image(
      CONSENT_PAGE_2_BASE64,
      "image/png"
    );

    console.log(
      "Page 2 Base64:",
      page2
        ? `${page2.substring(0, 50)}...`
        : "EMPTY"
    );

    return page2;
  };

  // ======================================================
  // IMAGE UPLOAD
  // ======================================================

  const handleImageUpload = (pageNumber) => {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*";

    input.onchange = (event) => {
      const file = event.target.files?.[0];

      if (!file) return;

      const imageData = {
        uri: URL.createObjectURL(file),
        name: file.name,
        type: file.type || "image/jpeg",
        file,
      };

      if (pageNumber === 1) {
        setUploadedImage1(imageData);
      }

      if (pageNumber === 2) {
        setUploadedImage2(imageData);
      }
    };

    input.click();
  };

  // ======================================================
  // REMOVE IMAGE
  // ======================================================

  const removeImage = (pageNumber) => {
    if (pageNumber === 1) {
      if (uploadedImage1?.uri) {
        URL.revokeObjectURL(uploadedImage1.uri);
      }

      setUploadedImage1(null);
    }

    if (pageNumber === 2) {
      if (uploadedImage2?.uri) {
        URL.revokeObjectURL(uploadedImage2.uri);
      }

      setUploadedImage2(null);
    }
  };

  // ======================================================
  // DELETE PAGE
  // ======================================================

  const handleDeletePage = async (
    consentFormId,
    pageNumber
  ) => {
    const pageName =
      Number(pageNumber) === 1
        ? "1 (Consent Form)"
        : "3 (Signature Page)";

    const confirmed = window.confirm(
      `Are you sure you want to delete Page ${pageName}?`
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      await ConsentFormService.deleteConsentFormPage(
        consentFormId
      );

      showDialog({
        title: "Success",
        message: "Page deleted successfully",
      });

      await fetchConsentForms();
    } catch (error) {
      console.error("Delete page error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete page";

      showDialog({
        title: "Error",
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // FETCH SERVER IMAGE AS BASE64
  // ======================================================

  const fetchExistingImageAsBase64 = async (
    filePath
  ) => {
    try {
      if (!filePath) {
        throw new Error("File path is empty");
      }

      const imageUrl = `${baseUrl.replace(
        /\/$/,
        ""
      )}/${filePath.replace(/^\//, "")}`;

      console.log("Loading image:", imageUrl);

      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to load image: ${response.status}`
        );
      }

      const blob = await response.blob();

      return await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          resolve(reader.result);
        };

        reader.onerror = reject;

        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error(
        "Error fetching existing image:",
        error
      );

      return "";
    }
  };

  // ======================================================
  // CREATE HTML
  // ======================================================

  const createHTMLContent = (
    page1Src,
    page2Src,
    page3Src
  ) => {
    return `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<title>
  Consent Form - ${patient?.name || ""}
</title>

<style>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  background: #f1f5f9;
}

body {
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Arial,
    sans-serif;
}

.page {
  width: 100%;
  min-height: 100vh;

  background: #ffffff;

  display: flex;
  justify-content: center;
  align-items: flex-start;

  margin-bottom: 20px;

  page-break-after: always;
}

.page:last-child {
  page-break-after: auto;
  margin-bottom: 0;
}

.page-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: contain;
}

.error {
  min-height: 300px;
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #64748b;
  font-size: 14px;
  background: #f8fafc;
}

@media print {

  html,
  body {
    background: #ffffff;
  }

  .page {
    margin: 0;
    min-height: auto;
    page-break-after: always;
  }

  .page:last-child {
    page-break-after: auto;
  }

}

</style>

</head>

<body>

<!-- PAGE 1 -->

<div class="page">

  ${
    page1Src
      ? `
        <img
          src="${page1Src}"
          class="page-image"
          alt="Consent Form Page 1"
        />
      `
      : `
        <div class="error">
          Unable to load Page 1
        </div>
      `
  }

</div>


<!-- PAGE 2 -->

<div class="page">

  ${
    page2Src
      ? `
        <img
          src="${page2Src}"
          class="page-image"
          alt="Standard Terms Page 2"
        />
      `
      : `
        <div class="error">
          Unable to load Page 2
        </div>
      `
  }

</div>


<!-- PAGE 3 -->

<div class="page">

  ${
    page3Src
      ? `
        <img
          src="${page3Src}"
          class="page-image"
          alt="Signature Page"
        />
      `
      : `
        <div class="error">
          Unable to load Page 3
        </div>
      `
  }

</div>

</body>

</html>
`;
  };

  // ======================================================
  // VIEW CONSENT FORM
  // ======================================================

  const handleViewPDF = async () => {
    if (!hasBothPagesInDatabase()) {
      showDialog({
        title: "Error",
        message:
          "Both Page 1 and Page 3 are required to view the consent form.",
      });

      return;
    }

    setLoading(true);

    try {
      // ------------------------------------------
      // PAGE 1
      // ------------------------------------------

      const page1 = consentForms.find(
        (form) => Number(form.page_number) === 1
      );

      let page1Base64 = "";

      if (page1?.file_path) {
        page1Base64 =
          await fetchExistingImageAsBase64(
            page1.file_path
          );
      }

      // ------------------------------------------
      // PAGE 2
      // STATIC BASE64
      // ------------------------------------------

      const page2Base64 =
        getPage2Image();

      if (!page2Base64) {
        throw new Error(
          "Page 2 image could not be loaded."
        );
      }

      // ------------------------------------------
      // PAGE 3
      // Backend page_number = 2
      // ------------------------------------------

      const page3 = consentForms.find(
        (form) => Number(form.page_number) === 2
      );

      let page3Base64 = "";

      if (page3?.file_path) {
        page3Base64 =
          await fetchExistingImageAsBase64(
            page3.file_path
          );
      }

      console.log("Viewer images:", {
        page1Loaded: !!page1Base64,
        page2Loaded: !!page2Base64,
        page3Loaded: !!page3Base64,
      });

      // ------------------------------------------
      // CREATE HTML
      // ------------------------------------------

      const html = createHTMLContent(
        page1Base64,
        page2Base64,
        page3Base64
      );

      setHtmlContent(html);
      setShowViewer(true);
    } catch (error) {
      console.error(
        "Error viewing consent form:",
        error
      );

      showDialog({
        title: "Error",
        message:
          error?.message ||
          "Failed to view consent form",
      });
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // UPLOAD SINGLE PAGE
  // ======================================================

  const uploadSinglePage = async (
    pageNumber,
    image
  ) => {
    if (!image?.file) {
      showDialog({
        title: "Error",
        message: `Please select image for Page ${
          pageNumber === 1 ? "1" : "3"
        }`,
      });

      return;
    }

    setLoading(true);

    try {
      await ConsentFormService.uploadConsentForm(
        patient.id,
        [image.file],
        pageNumber === 1 ? 1 : 2
      );

      showDialog({
        title: "Success",
        message: `Page ${
          pageNumber === 1 ? "1" : "3"
        } uploaded successfully!`,
      });

      await fetchConsentForms();

      removeImage(pageNumber);
    } catch (error) {
      console.error("Upload error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to upload page";

      showDialog({
        title: "Error",
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // VIEWER
  // ======================================================

  if (!visible) {
    return null;
  }

  if (showViewer) {
    const viewerUrl = htmlContent
      ? `data:text/html;charset=utf-8,${encodeURIComponent(
          htmlContent
        )}`
      : "";

    return (
      <div className="fixed inset-0 z-[200] bg-white">
        {/* Header */}

        <div className="flex h-16 items-center border-b border-slate-200 bg-white px-4 shadow-sm">
          <button
            type="button"
            onClick={() => {
              setShowViewer(false);
              setHtmlContent("");
            }}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-[#0B1E41] hover:bg-slate-100"
          >
            <ChevronLeft size={20} />
            Back
          </button>

          <h2 className="flex-1 text-center text-base font-bold text-[#0B1E41]">
            Consent Form - {patient?.name}
          </h2>

          <div className="w-[70px]" />
        </div>

        {/* Viewer */}

        <div className="h-[calc(100vh-64px)] w-full bg-slate-100">
          {viewerUrl ? (
            <iframe
              src={viewerUrl}
              title="Consent Form"
              className="h-full w-full border-0"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Loader2
                size={32}
                className="animate-spin text-[#0B1E41]"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ======================================================
  // MISSING PAGES
  // ======================================================

  const missingPage1 = !hasPage1InDatabase();
  const missingPage3 = !hasPage3InDatabase();

  // ======================================================
  // MAIN MODAL
  // ======================================================

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-[700px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Consent Form Management
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Manage patient consent form pages
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}

        <div className="flex-1 overflow-y-auto">

          {/* Patient */}

          <div className="m-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-[#0B1E41]">
              Patient: {patient?.name}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Case No: {patient?.case_number}
            </p>
          </div>

          {/* Loading */}

          {fetchingForms && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2
                size={25}
                className="animate-spin text-[#0B1E41]"
              />

              <p className="mt-2 text-sm text-slate-500">
                Loading forms...
              </p>
            </div>
          )}

          {/* Existing Forms */}

          {!fetchingForms &&
            consentForms.length > 0 && (
              <div className="mx-4 mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3">

                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Uploaded Pages:
                </h3>

                {consentForms.map((form) => (
                  <div
                    key={form.id}
                    className="mb-2 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 last:mb-0"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">

                      {Number(form.page_number) === 1 ? (
                        <FileText
                          size={20}
                          className="shrink-0 text-blue-500"
                        />
                      ) : (
                        <FileSignature
                          size={20}
                          className="shrink-0 text-emerald-500"
                        />
                      )}

                      <span className="truncate text-sm text-slate-700">
                        Page{" "}
                        {Number(form.page_number) === 1
                          ? "1 (Consent Form)"
                          : "3 (Signature Page)"}
                      </span>
                    </div>

                    <span className="hidden text-xs text-slate-400 sm:block">
                      {form.uploaded_at
                        ? new Date(
                            form.uploaded_at
                          ).toLocaleDateString()
                        : ""}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeletePage(
                          form.id,
                          form.page_number
                        )
                      }
                      disabled={loading}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

          {/* View */}

          {!fetchingForms &&
            hasBothPagesInDatabase() && (
              <div className="px-4 pb-5">

                <button
                  type="button"
                  onClick={handleViewPDF}
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0B1E41] text-sm font-semibold text-white transition hover:bg-[#102a59] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={20}
                        className="animate-spin"
                      />

                      Preparing...
                    </>
                  ) : (
                    <>
                      <FileType2 size={20} />

                      View Consent Form
                    </>
                  )}
                </button>

              </div>
            )}

          {/* Missing Pages */}

          {!fetchingForms &&
            !hasBothPagesInDatabase() && (
              <>
                {/* Page 1 */}

                {missingPage1 && (
                  <UploadSection
                    title="Page 1: Consent Form"
                    required
                    selectedImage={uploadedImage1}
                    onSelect={() =>
                      handleImageUpload(1)
                    }
                    onRemove={() =>
                      removeImage(1)
                    }
                    onUpload={() =>
                      uploadSinglePage(
                        1,
                        uploadedImage1
                      )
                    }
                    loading={loading}
                    buttonText="Select Page 1 (Consent Form)"
                    uploadText="Upload Page 1"
                  />
                )}

                {/* Page 2 */}

                <div className="mx-4 mb-5">

                  <h3 className="mb-3 text-base font-semibold text-slate-800">
                    Page 2: Standard Terms
                  </h3>

                  <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                    <Info
                      size={20}
                      className="mt-0.5 shrink-0 text-emerald-700"
                    />

                    <div className="flex-1">

                      <p className="text-sm leading-5 text-emerald-800">
                        Page 2 will be automatically
                        added from the default template.
                      </p>

                      {/* Optional Page 2 Preview */}

                      <img
                        src={getPage2Image()}
                        alt="Standard Terms Page 2"
                        className="mt-4 max-h-[250px] w-full rounded-lg border border-emerald-200 object-contain bg-white"
                        onError={(e) => {
                          console.error(
                            "Page 2 preview failed"
                          );

                          e.currentTarget.style.display =
                            "none";
                        }}
                      />

                    </div>
                  </div>
                </div>

                {/* Page 3 */}

                {missingPage3 && (
                  <UploadSection
                    title="Page 3: Signature Page"
                    required
                    selectedImage={uploadedImage2}
                    onSelect={() =>
                      handleImageUpload(2)
                    }
                    onRemove={() =>
                      removeImage(2)
                    }
                    onUpload={() =>
                      uploadSinglePage(
                        2,
                        uploadedImage2
                      )
                    }
                    loading={loading}
                    buttonText="Select Page 3 (Signature Page)"
                    uploadText="Upload Page 3"
                  />
                )}
              </>
            )}
        </div>

        {/* Footer */}

        <div className="flex justify-end border-t border-slate-200 bg-white px-4 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <X size={18} />

            Close
          </button>
        </div>

      </div>
    </div>
  );
};

// ======================================================
// UPLOAD SECTION
// ======================================================

const UploadSection = ({
  title,
  required,
  selectedImage,
  onSelect,
  onRemove,
  onUpload,
  loading,
  buttonText,
  uploadText,
}) => {
  return (
    <div className="mx-4 mb-5">

      <h3 className="mb-3 text-base font-semibold text-slate-800">
        {title}

        {required && (
          <span className="ml-2 text-xs font-normal text-red-500">
            *Required
          </span>
        )}
      </h3>

      {!selectedImage ? (
        <button
          type="button"
          onClick={onSelect}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50"
        >
          <Upload
            size={25}
            className="text-blue-500"
          />

          <span className="text-sm font-medium text-blue-500">
            {buttonText}
          </span>
        </button>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

          <div className="flex justify-center">
            <img
              src={selectedImage.uri}
              alt={title}
              className="max-h-[300px] max-w-full rounded-lg object-contain shadow-sm"
            />
          </div>

          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={onRemove}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
            >
              <Trash2 size={16} />

              Remove
            </button>
          </div>

          <button
            type="button"
            onClick={onUpload}
            disabled={loading}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0B1E41] text-sm font-semibold text-white hover:bg-[#102a59] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />

                {uploadText}
              </>
            )}
          </button>

        </div>
      )}
    </div>
  );
};

export default ConsentPdfSection;