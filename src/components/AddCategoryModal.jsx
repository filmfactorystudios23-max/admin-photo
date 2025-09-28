import React from "react";
import { Save, Loader } from "lucide-react";
import CategoryImageUpload from "./CategoryImageUpload";
import Modal from "./Modal";

const AddCategoryModal = ({
  isOpen,
  onClose,
  newCategory,
  setNewCategory,
  onAddCategory,
  actionLoading,
}) => {
  const handleClose = () => {
    onClose();
    setNewCategory({
      name: "",
      image_url: "",
      image_public_id: "",
      image_file: null,
    });
  };

  const handleCategoryImageUpload = (file) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setNewCategory({
        ...newCategory,
        image_url: previewUrl,
        image_file: file,
      });
    } else {
      setNewCategory({
        ...newCategory,
        image_url: "",
        image_file: null,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Category">
      <div className="space-y-6">
        {/* Category Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Name *
          </label>
          <input
            type="text"
            placeholder="Enter category name"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Image *
          </label>
          <CategoryImageUpload
            currentImageUrl={newCategory.image_url}
            onImageUpload={handleCategoryImageUpload}
            required
          />
        </div>
      </div>

      {/* Modal Footer */}
      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100 bg-gray-50 -m-6 p-6 rounded-b-xl">
        <button
          onClick={handleClose}
          className="px-4 py-2 cursor-pointer text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onAddCategory}
          disabled={
            actionLoading === "adding" ||
            !newCategory.name.trim() ||
            !newCategory.image_file
          }
          className="px-6 py-2 bg-blue-600  cursor-pointer hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
        >
          {actionLoading === "adding" ? (
            <Loader className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          {actionLoading === "adding" ? "Creating..." : "Create Category"}
        </button>
      </div>
    </Modal>
  );
};

export default AddCategoryModal;
