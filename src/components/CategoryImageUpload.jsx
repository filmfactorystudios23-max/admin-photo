import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const CategoryImageUpload = ({ currentImageUrl, onImageUpload }) => {
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const rejectionReasons = rejectedFiles.map(rejected => {
        const reasons = rejected.errors.map(error => error.message).join(', ');
        return `${rejected.file.name}: ${reasons}`;
      }).join('\n');
      toast.error(`File was rejected:\n${rejectionReasons}`);
    }

    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      // Immediately notify parent with the file
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
    preventDropOnDocument: true,
    noClick: false,
    noKeyboard: false,
    disabled: false
  });


  const removePreview = () => {
    setSelectedFile(null);
    setPreview(null);
    // Notify parent that image was removed
    onImageUpload(null);
  };

  const displayImage = preview || currentImageUrl;

  return (
    <div>
      {/* Image Display or Upload Zone */}
      {displayImage ? (
        /* Selected Image with Cancel */
        <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
          <img
            src={displayImage}
            alt="Category cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <button
              onClick={removePreview}
              className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-colors"
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* Upload Dropzone */
        <div
          {...getRootProps()}
          className={`w-full h-40 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-blue-500 bg-blue-100 border-4 scale-105 shadow-lg'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center h-full pointer-events-none">
            <ImageIcon size={32} className={`mb-3 transition-colors ${
              isDragActive ? 'text-blue-500' : 'text-gray-400'
            }`} />
            {isDragActive ? (
              <div>
                <p className="text-blue-600 text-lg font-bold animate-pulse">
                  🎯 DROP IMAGE HERE! 🎯
                </p>
                <p className="text-blue-500 text-sm mt-1">Release to upload</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 text-sm font-medium mb-1">
                  Click to upload category image
                </p>
                <p className="text-xs text-gray-500">
                  Or drag and drop here (PNG, JPG, WEBP, max 10MB)
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryImageUpload;