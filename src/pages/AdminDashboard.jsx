import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Loader, Camera } from "lucide-react";
import { toast } from "sonner";
import { categoriesService, photosService } from "../services/database.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../lib/cloudinary.js";
import AddCategoryModal from "../components/AddCategoryModal.jsx";
import CategoryEditModal from "../components/CategoryEditModal.jsx";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal.jsx";
import Header from "../components/Header.jsx";
import { CategorySkeletonGrid } from "../components/SkeletonLoader.jsx";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Admin Dashboard - Categories" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CategoriesManager />
      </div>
    </div>
  );
};

const CategoriesManager = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    image_url: "",
    image_public_id: "",
    image_file: null,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    category: null,
  });

  // Load categories only once when component mounts
  const loadCategories = useCallback(async () => {
    if (loading) {
      try {
        const data = await categoriesService.getAll();
        setCategories(data);
      } catch (err) {
        toast.error("Failed to load categories: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  }, [loading]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleAddCategory = async () => {
    if (newCategory.name.trim() && newCategory.image_file) {
      try {
        setActionLoading("adding");

        // First upload the image
        const uploadedImage = await uploadToCloudinary(newCategory.image_file);

        // Then create the category with the uploaded image data
        const category = await categoriesService.create({
          name: newCategory.name,
          image_url: uploadedImage.url,
          image_public_id: uploadedImage.publicId,
        });

        setCategories([category, ...categories]);
        setNewCategory({
          name: "",
          image_url: "",
          image_public_id: "",
          image_file: null,
        });
        setShowAddForm(false);
        toast.success("Category added successfully");
      } catch (err) {
        toast.error("Failed to add category: " + err.message);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory({ ...category });
  };

  const handleSaveEditedCategory = async (categoryId, updatedData) => {
    try {
      setActionLoading(`updating-${categoryId}`);
      const updated = await categoriesService.update(categoryId, updatedData);
      setCategories(
        categories.map((cat) => (cat.id === categoryId ? updated : cat))
      );
      setEditingCategory(null);
      toast.success("Category updated successfully");
    } catch (err) {
      toast.error("Failed to update category: " + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCategory = async (category) => {
    try {
      // Check if category has photos using the photosService
      const photos = await photosService.getAll(category.id);
      if (photos.length > 0) {
        toast.error(
          "Cannot delete category that contains photos. Please delete all photos in this category first."
        );
        return;
      }

      // If no photos, show confirmation modal
      setDeleteModal({ isOpen: true, category });
    } catch (err) {
      toast.error("Error checking category photos");
    }
  };

  const confirmDeleteCategory = async () => {
    const { category } = deleteModal;
    try {
      setActionLoading(`deleting-${category.id}`);

      // Delete from database
      await categoriesService.delete(category.id);

      // Delete category image from Cloudinary if it exists
      if (
        category?.image_public_id &&
        !category.image_public_id.startsWith("demo")
      ) {
        try {
          await deleteFromCloudinary(category.image_public_id);
          console.log("Successfully deleted category image from Cloudinary");
        } catch (cloudinaryError) {
          console.warn(
            "Failed to delete category image from Cloudinary:",
            cloudinaryError
          );
        }
      }

      setCategories(categories.filter((cat) => cat.id !== category.id));
      setDeleteModal({ isOpen: false, category: null });
      toast.success("Category deleted successfully");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <CategorySkeletonGrid count={8} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 ">Categories</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <AddCategoryModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        onAddCategory={handleAddCategory}
        actionLoading={actionLoading}
      />

      {/* Category Edit Modal */}
      {editingCategory && (
        <CategoryEditModal
          category={editingCategory}
          onSave={handleSaveEditedCategory}
          onCancel={() => setEditingCategory(null)}
        />
      )}

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, category: null })}
        onConfirm={confirmDeleteCategory}
        title="Delete Category"
        message="You're going to delete the"
        itemName={deleteModal.category?.name}
        isDeleting={actionLoading === `deleting-${deleteModal.category?.id}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Category Image */}
            <div
              className="h-48 bg-gray-200 cursor-pointer group relative"
              onClick={() => navigate(`/category/${category.id}`)}
            >
              {category.image_url ? (
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Category Content */}
            <div className="p-4">
              <div>
                <h3
                  className="font-medium text-gray-900 mb-3 cursor-pointer hover:text-blue-600"
                  onClick={() => navigate(`/category/${category.id}`)}
                >
                  {category.name}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    {new Date(category.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCategory(category);
                      }}
                      disabled={actionLoading === `deleting-${category.id}`}
                      className="text-blue-600 cursor-pointer hover:text-blue-900 disabled:text-blue-400 p-1"
                      title="Edit Category"
                    >
                      <Edit size={16} />
                    </button>
                    {/* Hide delete button for protected categories */}
                    {category.name !== "Slider" &&
                      category.name !== "No Category" &&
                      category.name !== "MobileSlider" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(category);
                          }}
                          disabled={actionLoading === `deleting-${category.id}`}
                          className="text-red-600 cursor-pointer hover:text-red-900 disabled:text-red-400 p-1"
                          title="Delete Category"
                        >
                          {actionLoading === `deleting-${category.id}` ? (
                            <Loader className="animate-spin" size={16} />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
