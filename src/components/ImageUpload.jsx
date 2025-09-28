import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image, Loader } from 'lucide-react';
import { uploadToCloudinary } from '../lib/cloudinary.js';
import { toast } from 'sonner';

const ImageUpload = ({ onUploadComplete, onCancel, categoryId, categories, hideCategory = false }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [photoDetails, setPhotoDetails] = useState({
    title: '',
    category_id: categoryId || '',
  });

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const rejectionReasons = rejectedFiles.map(rejected => {
        const reasons = rejected.errors.map(error => error.message).join(', ');
        return `${rejected.file.name}: ${reasons}`;
      }).join('\n');
      toast.error(`Some files were rejected:\n${rejectionReasons}`);
    }

    if (acceptedFiles.length === 0) return;
    const files = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(2, 11),
      preview: URL.createObjectURL(file),
      title: file.name.split('.')[0].replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    }));

    setSelectedFiles(prevFiles => {
      // Filter out duplicate files based on name and size
      const newFiles = files.filter(newFile =>
        !prevFiles.some(existingFile =>
          existingFile.file.name === newFile.file.name &&
          existingFile.file.size === newFile.file.size
        )
      );
      return [...prevFiles, ...newFiles];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    preventDropOnDocument: true,
    maxFiles: 50 // Allow up to 50 files at once
  });

  const removeFile = (id) => {
    setSelectedFiles(files => files.filter(file => file.id !== id));
  };

  const updateFileTitle = (id, title) => {
    setSelectedFiles(files =>
      files.map(file =>
        file.id === id ? { ...file, title } : file
      )
    );
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    if (!hideCategory && !photoDetails.category_id) {
      toast.error('Please choose a category');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = selectedFiles.map(async (fileData, index) => {
        const cloudinaryResult = await uploadToCloudinary(fileData.file);

        setUploadProgress(((index + 1) / selectedFiles.length) * 100);

        return {
          title: fileData.title,
          url: cloudinaryResult.url,
          category_id: parseInt(photoDetails.category_id),
          public_id: cloudinaryResult.publicId,
        };
      });

      const uploadedPhotos = await Promise.all(uploadPromises);

      // Call the callback with uploaded photos
      onUploadComplete(uploadedPhotos);

      // Show success message
      toast.success(`Successfully uploaded ${uploadedPhotos.length} photo${uploadedPhotos.length === 1 ? '' : 's'}!`);

      // Reset form
      setSelectedFiles([]);
      setPhotoDetails({ title: '', category_id: categoryId || '' });

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Upload Photos</h3>
        <button
          onClick={onCancel}
          disabled={uploading}
          className="text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          title={uploading ? 'Cannot close during upload' : 'Close upload form'}
        >
          <X size={24} />
        </button>
      </div>

      {/* Category Selection */}
      {!hideCategory && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Category
          </label>
          <select
            value={photoDetails.category_id}
            onChange={(e) => setPhotoDetails({ ...photoDetails, category_id: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Choose a category...</option>
            {categories.filter(cat => cat.id !== 'all').map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-100 border-4 scale-105 shadow-lg'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        style={{ minHeight: '150px' }}
      >
        <input {...getInputProps()} />
        <Upload size={48} className={`mx-auto mb-4 pointer-events-none transition-colors ${
          isDragActive ? 'text-blue-500' : 'text-gray-400'
        }`} />
        {isDragActive ? (
          <div className="pointer-events-none">
            <p className="text-blue-600 text-xl font-bold animate-pulse">
              🎯 DROP IMAGES HERE! 🎯
            </p>
            <p className="text-blue-500 text-sm mt-2">Release to upload multiple images</p>
          </div>
        ) : (
          <div className="pointer-events-none">
            <p className="text-gray-600 font-medium mb-2">
              Drag & drop multiple images here, or click to select
            </p>
            <p className="text-sm text-gray-500 mb-1">
              Supports: JPG, PNG, GIF, WebP (max 10MB each)
            </p>
            <p className="text-xs text-gray-400">
              You can select or drop up to 50 images at once
            </p>
          </div>
        )}
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-4">
            Selected Images ({selectedFiles.length}) - Ready to upload
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
            {selectedFiles.map((fileData) => (
              <div key={fileData.id} className="flex items-center gap-3 p-3 border rounded-lg bg-white hover:shadow-md transition-shadow">
                <img
                  src={fileData.preview}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded border border-gray-200"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgN1YxN0EyIDIgMCAwIDAgNSAxOUgxOUEyIDIgMCAwIDAgMjEgMTdWN0EyIDIgMCAwIDAgMTkgNUg1QTIgMiAwIDAgMCAzIDdaTTUgN0gxOVYxM0w3IDEzTDUgMTFWN1pNNSAxN1Y3SDE5VjE3SDVaIiBmaWxsPSIjOTU5NUI0Ii8+CjxjaXJjbGUgY3g9IjguNSIgY3k9IjEwLjUiIHI9IjEuNSIgZmlsbD0iIzk1OTVCNCIvPgo8L3N2Zz4K';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={fileData.title}
                    onChange={(e) => updateFileTitle(fileData.id, e.target.value)}
                    className="w-full text-sm border-none outline-none font-medium text-gray-900 bg-transparent"
                    placeholder="Photo title..."
                  />
                  <p className="text-xs text-gray-500 truncate">
                    {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(fileData.id)}
                  className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-2">
            <Loader className="animate-spin h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">
              Uploading... {Math.round(uploadProgress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleUpload}
          disabled={uploading || selectedFiles.length === 0 || (!hideCategory && !photoDetails.category_id)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          title={
            selectedFiles.length === 0
              ? 'Please select images first'
              : !hideCategory && !photoDetails.category_id
                ? 'Please select a category'
                : `Upload ${selectedFiles.length} image(s)`
          }
        >
          {uploading ? (
            <>
              <Loader className="animate-spin h-4 w-4" />
              Uploading...
            </>
          ) : (
            <>
              <Image size={16} />
              {selectedFiles.length === 0 ? 'Select Images to Upload' : `Upload ${selectedFiles.length} ${selectedFiles.length === 1 ? 'Photo' : 'Photos'}`}
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={uploading}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          title={uploading ? 'Cannot cancel during upload' : 'Cancel upload'}
        >
          {uploading ? 'Uploading...' : 'Cancel'}
        </button>
      </div>
    </div>
  );
};

export default ImageUpload;