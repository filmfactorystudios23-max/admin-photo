import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Save, Loader, Image as ImageIcon } from "lucide-react";
import { uploadToCloudinary, deleteFromCloudinary } from "../lib/cloudinary.js";
import { toast } from 'sonner';

const PhotoEditModal = ({ photo, onSave, onCancel }) => {
  const [newImage, setNewImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showUploadUI, setShowUploadUI] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setNewImage(file);
      setPreview(URL.createObjectURL(file));
      setShowUploadUI(true); // Show upload UI when image is selected
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleSave = async () => {
    if (!newImage) return; // Only save if new image is selected

    setUploading(true);

    try {
      // Upload new image to Cloudinary
      const uploadResult = await uploadToCloudinary(newImage);

      // Delete old image from Cloudinary if it exists
      if (photo.public_id && photo.public_id !== "demo") {
        try {
          await deleteFromCloudinary(photo.public_id);
        } catch (deleteError) {
          console.warn("Failed to delete old image:", deleteError);
          // Continue anyway, as the new image upload succeeded
        }
      }

      // Update photo data with new image info only
      const finalPhotoData = {
        title: photo.title, // Keep original title
        category_id: photo.category_id, // Keep original category
        url: uploadResult.url,
        public_id: uploadResult.publicId,
      };

      // Save updated photo
      await onSave(photo.id, finalPhotoData);

      // Show success message
      toast.success('Photo updated successfully!');
    } catch (error) {
      console.error("Failed to update photo:", error);
      toast.error("Failed to update photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeNewImage = () => {
    setNewImage(null);
    setPreview(null);
  };

  const currentImageUrl = preview || photo.url;

  return (
    <div
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
      className="fixed inset-0 backdrop-blur-[5px]   flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 ">
          <h3 className="text-lg font-semibold text-gray-900">Edit Photo</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current/Preview Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Photo {newImage && "(New Image Selected)"}
            </label>
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={currentImageUrl}
                alt={photo.title}
                className="w-full h-64 object-cover"
              />
              {newImage && (
                <div className="absolute top-2 right-2">
                  <button
                    onClick={removeNewImage}
                    className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Replace Image Section */}
          {!showUploadUI ? (
            <div className="text-center">
              <button
                onClick={() => setShowUploadUI(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto cursor-pointer"
              >
                <Upload size={16} />
                Replace Image
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Replace Image
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input {...getInputProps()} />
                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                {isDragActive ? (
                  <p className="text-blue-600 font-medium">
                    Drop the image here...
                  </p>
                ) : (
                  <div>
                    <p className="text-gray-600 font-medium">
                      Drag & drop a new image, or click to select
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      This will replace the current image
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-3 text-center ">
                <button
                  onClick={() => {
                    setShowUploadUI(false);
                    setNewImage(null);
                    setPreview(null);
                  }}
                  className="text-red-500 cursor-pointer hover:text-gray-700 text-sm"
                >
                  Cancel Replace
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleSave}
            disabled={uploading || !newImage}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            title={
              !newImage
                ? "Select a new image to enable update"
                : "Update photo with new image"
            }
          >
            {uploading ? (
              <>
                <Loader className="animate-spin h-4 w-4" />
                {newImage ? "Uploading & Saving..." : "Saving..."}
              </>
            ) : (
              <>
                <Save size={16} />
                {newImage ? "Update Photo" : "Select New Image"}
              </>
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={uploading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoEditModal;
