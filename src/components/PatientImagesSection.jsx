import React, { useEffect, useState } from "react";
import ImageService from "../services/images.service";

const PatientImagesSection = ({ patientId }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const API_BASE_URL = "https://navdant.phst.in";

  useEffect(() => {
    if (patientId) {
      loadImages();
    }
  }, [patientId]);

  const loadImages = async () => {
    try {
      setLoading(true);

      const response = await ImageService.getPatientImages(
        Number(patientId)
      );

      if (response.status === "success") {
        const formattedImages = (response.images || []).map((img) => ({
          id: img.id,
          image_path: img.image_path,
          createdAt: img.created_at
            ? new Date(img.created_at).toLocaleDateString("en-GB")
            : new Date().toLocaleDateString("en-GB"),
        }));

        setImages(formattedImages);
      }
    } catch (error) {
      console.error("Load images error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    const cleanPath = imagePath.replace(/^\/+/, "");

    return `${API_BASE_URL}/${cleanPath}`;
  };

  // -----------------------------
  // Upload Image
  // -----------------------------

  const handlePickImage = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Optional validation
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("image", file);

      const response = await ImageService.uploadPatientImage(
        Number(patientId),
        formData
      );

      if (response.status === "success") {
        const newImage = {
          id: response.image_id,
          image_path: response.image_path,
          createdAt: new Date().toLocaleDateString("en-GB"),
        };

        setImages((prev) => [...prev, newImage]);

        alert("Image uploaded successfully.");
      } else {
        alert("Failed to upload image.");
      }
    } catch (error) {
      console.error("Upload error:", error);

      if (error?.response?.status === 400) {
        alert("Invalid file type or size.");
      } else if (error?.response?.status === 404) {
        alert("Patient not found.");
      } else {
        alert("Failed to upload image.");
      }
    } finally {
      setUploading(false);

      // Important: allow selecting same image again
      event.target.value = "";
    }
  };

  // -----------------------------
  // View Image
  // -----------------------------

  const handleViewImage = (image) => {
    setSelectedImage(image);
    setImageModalOpen(true);
  };

  // -----------------------------
  // Delete Image
  // -----------------------------

  const handleDeleteImage = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response = await ImageService.deletePatientImage(id);

      if (response.status === "success") {
        setImages((prev) => prev.filter((image) => image.id !== id));

        if (selectedImage?.id === id) {
          setSelectedImage(null);
          setImageModalOpen(false);
        }

        alert("Image deleted successfully.");
      } else {
        alert(response.message || "Failed to delete image.");
      }
    } catch (error) {
      console.error("Delete image error:", error);

      if (error?.response?.status === 401) {
        alert("Session expired. Please login again.");
      } else if (error?.response?.status === 403) {
        alert("You don't have permission to delete this image.");
      } else if (error?.response?.status === 404) {
        alert("Image not found.");
      } else {
        alert(
          error?.response?.data?.message ||
            "Failed to delete image."
        );
      }
    } finally {
      setDeletingId(null);
    }
  };

  // -----------------------------
  // Loading
  // -----------------------------

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-slate-600 text-xl">🖼️</span>

          <h2 className="text-sm font-bold text-slate-800 uppercase">
            Patient Images Gallery
          </h2>
        </div>

        <div className="h-px bg-slate-100 my-4" />

        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />

          <p className="text-sm text-slate-500 mt-3">
            Loading images...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-slate-600 text-xl">
              🖼️
            </span>

            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide truncate">
              Patient Images Gallery ({images.length})
            </h2>
          </div>

          {/* Add Image */}
          <label
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer transition ${
              uploading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-[#0B1E41] hover:bg-[#162b52]"
            }`}
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <span className="text-lg leading-none">+</span>
                <span className="hidden md:inline">
                  Add Image
                </span>
              </>
            )}

            {!uploading && (
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePickImage}
              />
            )}
          </label>
        </div>

        {/* Empty State */}
        {images.length === 0 && (
          <label className="flex flex-col items-center justify-center py-12 px-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 transition">
            <span className="text-5xl text-slate-300">
              🖼️
            </span>

            <p className="text-sm font-medium text-slate-600 mt-3">
              No images added yet
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Click to add first image
            </p>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePickImage}
            />
          </label>
        )}

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((image) => (
              <div
                key={image.id}
                className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-48 bg-slate-100">
                  <img
                    src={getImageUrl(image.image_path)}
                    alt="Patient"
                    className="w-full h-full object-cover cursor-pointer hover:scale-[1.02] transition"
                    onClick={() => handleViewImage(image)}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(image.id)}
                    disabled={deletingId === image.id}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/90 hover:bg-red-600 text-white flex items-center justify-center shadow-md disabled:opacity-60"
                    title="Delete image"
                  >
                    {deletingId === image.id ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span className="text-sm">🗑</span>
                    )}
                  </button>
                </div>

                {/* Date */}
                <div className="px-3 py-2 text-center">
                  <p className="text-xs text-slate-400">
                    {image.createdAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {imageModalOpen && selectedImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-slate-950">
              <h3 className="text-white font-semibold">
                Image Preview
              </h3>

              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-white/10 text-white flex items-center justify-center text-xl"
              >
                ×
              </button>
            </div>

            {/* Image */}
            <div className="h-[70vh] flex items-center justify-center bg-black p-4">
              <img
                src={getImageUrl(selectedImage.image_path)}
                alt="Patient"
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Date */}
            <div className="px-5 py-3 bg-slate-950 text-center">
              <p className="text-xs text-slate-400">
                Uploaded: {selectedImage.createdAt}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientImagesSection;