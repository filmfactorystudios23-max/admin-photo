import React from "react";
import { AlertTriangle, Loader } from "lucide-react";
import Modal from "./Modal";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  bulkCount,
  isDeleting = false,
  deleteButtonText = "Yes, Delete!",
  cancelButtonText = "No, Keep It.",
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      showCloseButton={false}
      className="max-w-md"
    >
      <div className="text-center py-4">
        {/* Warning Icon */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

        {/* Message */}
        <p className="text-sm text-gray-500 mb-6">
          {bulkCount ? (
            `You're going to delete ${bulkCount} selected photo${
              bulkCount !== 1 ? "s" : ""
            }. Are you sure?`
          ) : (
            <>
              {message}{" "}
              {itemName && (
                <>
                  "<span className="font-medium text-gray-700">{itemName}</span>
                  "
                </>
              )}{" "}
              {itemName ? "project. Are you sure?" : "Are you sure?"}
            </>
          )}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-6 py-2 cursor-pointer text-gray-700 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-6 py-2 cursor-pointer bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader className="animate-spin h-4 w-4" />
                Deleting...
              </>
            ) : (
              deleteButtonText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
