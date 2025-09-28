import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, ArrowLeft, Camera, Loader } from "lucide-react";
import { toast } from "sonner";
import { categoriesService, photosService } from "../services/database.js";
import PhotoUploadModal from "../components/PhotoUploadModal.jsx";
import PhotoEditModal from "../components/PhotoEditModal.jsx";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal.jsx";
import Header from "../components/Header.jsx";
import { PhotoSkeletonGrid } from "../components/SkeletonLoader.jsx";
import { deleteFromCloudinary } from "../lib/cloudinary.js";

const CategoryPhotosPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    photo: null,
  });
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    loadCategoryData();
  }, [categoryId]);

  const loadCategoryData = async () => {
    try {
      setLoading(true);
      // Load category details and its photos
      const [categoryData, photosData] = await Promise.all([
        categoriesService.getById(categoryId),
        photosService.getAll(parseInt(categoryId)),
      ]);
      setCategory(categoryData);
      setPhotos(photosData);
    } catch (err) {
      toast.error("Failed to load category data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = (photo) => {
    setDeleteModal({ isOpen: true, photo });
  };

  const confirmDeletePhoto = async () => {
    const { photo, bulkCount } = deleteModal;

    // Handle bulk delete
    if (bulkCount && !photo) {
      return confirmBulkDelete();
    }

    // Handle single photo delete
    try {
      setActionLoading(`deleting-${photo.id}`);

      await photosService.delete(photo.id);

      if (photo?.public_id && photo.public_id !== "demo") {
        try {
          await deleteFromCloudinary(photo.public_id);
          console.log("Successfully deleted photo from Cloudinary");
        } catch (cloudinaryError) {
          console.warn("Failed to delete from Cloudinary:", cloudinaryError);
        }
      }

      setPhotos(photos.filter((p) => p.id !== photo.id));
      setSelectedPhotos(selectedPhotos.filter(id => id !== photo.id));
      setDeleteModal({ isOpen: false, photo: null });
      toast.success("Photo deleted successfully");
    } catch (err) {
      toast.error("Failed to delete photo: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedPhotos(photos.map(photo => photo.id));
    } else {
      setSelectedPhotos([]);
    }
  };

  // Handle individual photo selection
  const handlePhotoSelect = (photoId) => {
    const isSelected = selectedPhotos.includes(photoId);
    if (isSelected) {
      const newSelected = selectedPhotos.filter(id => id !== photoId);
      setSelectedPhotos(newSelected);
      setSelectAll(false);
    } else {
      const newSelected = [...selectedPhotos, photoId];
      setSelectedPhotos(newSelected);
      setSelectAll(newSelected.length === photos.length);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedPhotos.length === 0) return;
    setDeleteModal({
      isOpen: true,
      photo: null, // null indicates bulk delete
      bulkCount: selectedPhotos.length
    });
  };

  // Confirm bulk delete
  const confirmBulkDelete = async () => {
    try {
      setActionLoading('bulk-deleting');

      const photosToDelete = photos.filter(photo => selectedPhotos.includes(photo.id));

      // Delete from database
      await Promise.all(
        photosToDelete.map(photo => photosService.delete(photo.id))
      );

      // Delete from Cloudinary
      await Promise.all(
        photosToDelete.map(async (photo) => {
          if (photo?.public_id && photo.public_id !== "demo") {
            try {
              await deleteFromCloudinary(photo.public_id);
            } catch (cloudinaryError) {
              console.warn(`Failed to delete ${photo.title} from Cloudinary:`, cloudinaryError);
            }
          }
        })
      );

      // Update state
      setPhotos(photos.filter(photo => !selectedPhotos.includes(photo.id)));
      setSelectedPhotos([]);
      setSelectAll(false);
      setDeleteModal({ isOpen: false, photo: null });
      toast.success(`${selectedPhotos.length} photo${selectedPhotos.length !== 1 ? 's' : ''} deleted successfully`);
    } catch (err) {
      toast.error("Failed to delete photos: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUploadComplete = async (uploadedPhotos) => {
    try {
      setActionLoading("uploading");
      const savedPhotos = [];
      for (const photoData of uploadedPhotos) {
        const savedPhoto = await photosService.create(photoData);
        savedPhotos.push(savedPhoto);
      }

      setPhotos([...savedPhotos, ...photos]);
      setShowUpload(false);
      toast.success(`${uploadedPhotos.length} photo${uploadedPhotos.length !== 1 ? 's' : ''} uploaded successfully`);
    } catch (err) {
      toast.error("Failed to save photos: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditPhoto = (photo) => {
    setEditingPhoto(photo);
  };

  const handleSaveEditedPhoto = async (photoId, updatedData) => {
    try {
      setActionLoading(`updating-${photoId}`);
      const updatedPhoto = await photosService.updateWithImageReplace(
        photoId,
        updatedData
      );

      setPhotos(
        photos.map((photo) => (photo.id === photoId ? updatedPhoto : photo))
      );

      setEditingPhoto(null);
      toast.success("Photo updated successfully");
    } catch (err) {
      toast.error("Failed to update photo: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Only show "not found" if loading is complete AND category is still null
  if (!loading && !category) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Category not found
          </h2>
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Back Button */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/")}
                className="flex cursor-pointer items-center gap-2 text-blue-600 hover:text-blue-800 mr-4"
              >
                <ArrowLeft size={20} />
                Back to Categories
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
                ) : (
                  `${category?.name || "Category"} - Photos`
                )}
              </h1>
            </div>
            <Header title="" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          {loading ? (
            <>
              <div className="h-6 bg-gray-200 rounded w-80 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Manage Photos for "{category?.name || "Category"}"
                </h2>

                {/* Select All and Bulk Delete */}
                {photos.length > 0 && (
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Select All</span>
                    </label>

                    {selectedPhotos.length > 0 && (
                      <button
                        onClick={handleBulkDelete}
                        disabled={actionLoading?.includes('deleting')}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-3 py-1 rounded-lg flex items-center gap-2 text-sm cursor-pointer disabled:cursor-not-allowed"
                        title={`Delete ${selectedPhotos.length} selected photo${selectedPhotos.length !== 1 ? 's' : ''}`}
                      >
                        <Trash2 size={14} />
                        Delete ({selectedPhotos.length})
                      </button>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowUpload(true)}
                disabled={actionLoading === "uploading"}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                {actionLoading === "uploading" ? (
                  <Loader className="animate-spin" size={20} />
                ) : (
                  <Plus size={20} />
                )}
                {actionLoading === "uploading"
                  ? "Uploading..."
                  : "Upload Photos"}
              </button>
            </>
          )}
        </div>


        {!loading && (
          <PhotoUploadModal
            isOpen={showUpload}
            onClose={() => setShowUpload(false)}
            category={category}
            onUploadComplete={handleUploadComplete}
          />
        )}

        {loading ? (
          <PhotoSkeletonGrid count={8} />
        ) : photos.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No photos in this category
            </h3>
            <p className="text-gray-500 mb-4">
              Start by uploading some photos to "{category?.name || "Category"}"
              category.
            </p>
            <button
              onClick={() => setShowUpload(true)}
              disabled={actionLoading === "uploading"}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              {actionLoading === "uploading" ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <Plus size={20} />
              )}
              {actionLoading === "uploading"
                ? "Uploading..."
                : "Upload First Photo"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-white rounded-lg shadow-md overflow-hidden relative"
              >
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedPhotos.includes(photo.id)}
                    onChange={() => handlePhotoSelect(photo.id)}
                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    {new Date(photo.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEditPhoto(photo)}
                      disabled={actionLoading === `deleting-${photo.id}` || actionLoading === 'bulk-deleting'}
                      className="text-blue-600 cursor-pointer hover:text-blue-900 disabled:text-blue-400 disabled:cursor-not-allowed"
                      title="Edit Photo"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(photo)}
                      disabled={actionLoading === `deleting-${photo.id}` || actionLoading === 'bulk-deleting'}
                      className="text-red-600 cursor-pointer hover:text-red-900 disabled:text-red-400 disabled:cursor-not-allowed"
                      title="Delete Photo"
                    >
                      {actionLoading === `deleting-${photo.id}` || actionLoading === 'bulk-deleting' ? (
                        <Loader className="animate-spin" size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photo Edit Modal */}
        {editingPhoto && (
          <PhotoEditModal
            photo={editingPhoto}
            onSave={handleSaveEditedPhoto}
            onCancel={() => setEditingPhoto(null)}
          />
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, photo: null })}
          onConfirm={confirmDeletePhoto}
          title={deleteModal.bulkCount ? "Delete Photos" : "Delete Photo"}
          message="You're going to delete the"
          itemName={deleteModal.photo?.title}
          bulkCount={deleteModal.bulkCount}
          isDeleting={actionLoading === `deleting-${deleteModal.photo?.id}` || actionLoading === 'bulk-deleting'}
        />
      </div>
    </div>
  );
};

export default CategoryPhotosPage;
