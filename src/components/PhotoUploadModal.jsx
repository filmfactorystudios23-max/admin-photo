import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Loader, Image as ImageIcon } from "lucide-react";
import { uploadToCloudinary } from "../lib/cloudinary.js";
import { toast } from "sonner";

const PhotoUploadModal = ({ isOpen, onClose, category, onUploadComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const rejectionReasons = rejectedFiles
        .map((rejected) => {
          const reasons = rejected.errors
            .map((error) => error.message)
            .join(", ");
          return `${rejected.file.name}: ${reasons}`;
        })
        .join("\n");
      toast.error(`Some files were rejected:\n${rejectionReasons}`);
    }

    if (acceptedFiles.length === 0) return;

    const files = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substring(2, 11),
      preview: URL.createObjectURL(file),
      title: file.name
        .split(".")[0]
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
    }));

    setSelectedFiles((prev) => {
      // Filter out duplicate files based on name and size
      const newFiles = files.filter(
        (newFile) =>
          !prev.some(
            (existingFile) =>
              existingFile.file.name === newFile.file.name &&
              existingFile.file.size === newFile.file.size
          )
      );

      // Silently filter out duplicates
      return [...prev, ...newFiles];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    noClick: false,
    noKeyboard: false,
    disabled: false,
    preventDropOnDocument: false,
    maxFiles: 50, // Allow up to 50 files at once
  });

  const removeFile = (id) => {
    setSelectedFiles((files) => files.filter((file) => file.id !== id));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = selectedFiles.map(async (fileData, index) => {
        const cloudinaryResult = await uploadToCloudinary(fileData.file);

        // Update progress after each upload
        setUploadProgress(
          Math.round(((index + 1) / selectedFiles.length) * 100)
        );

        return {
          title: fileData.title,
          url: cloudinaryResult.url,
          public_id: cloudinaryResult.publicId,
          category_id: category.id,
        };
      });

      const uploadedPhotos = await Promise.all(uploadPromises);
      onUploadComplete(uploadedPhotos);

      // Show success message
      toast.success(
        `Successfully uploaded ${uploadedPhotos.length} photo${
          uploadedPhotos.length === 1 ? "" : "s"
        }!`
      );

      setSelectedFiles([]);
      // Close modal after successful upload
      setTimeout(() => {
        onClose();
      }, 500); // Small delay to show success state
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (uploading) return; // Prevent closing during upload
    setSelectedFiles([]);
    setUploadProgress(0);
    onClose();
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (uploading) return; // Prevent closing during upload
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
      className="fixed inset-0 backdrop-blur-[5px]   flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6  ">
          <h3 className="text-xl font-semibold text-gray-900">
            Upload Photos to "{category?.name}"
          </h3>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-gray-400 hover:text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
            title={uploading ? "Cannot close during upload" : "Close modal"}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Photos will be automatically added to the{" "}
            <strong>{category?.name}</strong> category.
          </p>

          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 mb-6 relative ${
              isDragActive
                ? "border-blue-500 bg-blue-100 border-4 scale-105 shadow-lg"
                : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"
            }`}
            style={{ minHeight: "150px" }}
          >
            <input {...getInputProps()} />
            <Upload
              size={48}
              className={`mx-auto mb-4 pointer-events-none transition-colors ${
                isDragActive ? "text-blue-500" : "text-gray-400"
              }`}
            />
            {isDragActive ? (
              <div className="pointer-events-none">
                <p className="text-blue-600 text-xl font-bold animate-pulse">
                  🎯 DROP IMAGES HERE! 🎯
                </p>
                <p className="text-blue-500 text-sm mt-2">
                  Release to upload multiple images
                </p>
              </div>
            ) : (
              <div className="pointer-events-none">
                <p className="text-gray-700 text-lg font-medium mb-2">
                  📁 Click to browse files or drag & drop images here
                </p>
                <p className="text-sm text-gray-500 mb-1">
                  Supports: JPG, PNG, GIF, WebP (max 10MB each)
                </p>
                <p className="text-xs text-gray-400">
                  Select multiple images at once (up to 50 files)
                </p>
              </div>
            )}
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Selected Images ({selectedFiles.length}) - Ready to upload
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
                {selectedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="relative group bg-white border border-gray-200 rounded-lg p-2 hover:shadow-md transition-shadow"
                  >
                    <img
                      src={file.preview}
                      alt={file.title}
                      className="w-full h-16 object-cover rounded-md border border-gray-100"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgN1YxN0EyIDIgMCAwIDAgNSAxOUgxOUEyIDIgMCAwIDAgMjEgMTdWN0EyIDIgMCAwIDAgMTkgNUg1QTIgMiAwIDAgMCAzIDdaTTUgN0gxOVYxM0w3IDEzTDUgMTFWN1pNNSAxN1Y3SDE5VjE3SDVaIiBmaWxsPSIjOTU5NUI0Ii8+CjxjaXJjbGUgY3g9IjguNSIgY3k9IjEwLjUiIHI9IjEuNSIgZmlsbD0iIzk1OTVCNCIvPgo8L3N2Zz4K";
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 opacity-100 transition-opacity shadow-sm z-10"
                      title="Remove image"
                    >
                      <X size={10} />
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate font-medium">
                      {file.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {(file.file.size / 1024 / 1024).toFixed(1)}MB
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            title={uploading ? "Cannot cancel during upload" : "Cancel upload"}
          >
            {uploading ? "Uploading..." : "Cancel"}
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 font-medium"
            title={
              selectedFiles.length === 0
                ? "Please select images first"
                : `Upload ${selectedFiles.length} image(s)`
            }
          >
            {uploading ? (
              <Loader className="animate-spin" size={18} />
            ) : (
              <ImageIcon size={18} />
            )}
            {uploading
              ? "Uploading..."
              : selectedFiles.length === 0
              ? "Select Images to Upload"
              : `Upload ${selectedFiles.length} Photo${
                  selectedFiles.length !== 1 ? "s" : ""
                }`}
          </button>
        </div>

        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center rounded-xl z-10">
            <div className="flex flex-col items-center max-w-xs w-full">
              <Loader className="animate-spin h-8 w-8 text-blue-600 mb-4" />
              <span className="text-lg font-medium text-gray-800 mb-2">
                Uploading {selectedFiles.length} photo
                {selectedFiles.length !== 1 ? "s" : ""}...
              </span>
              <span className="text-sm text-gray-600 mb-4">
                {uploadProgress}% complete
              </span>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Please don't close this window
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUploadModal;
