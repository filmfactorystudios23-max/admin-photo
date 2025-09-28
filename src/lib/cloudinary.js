const CLOUDINARY_CLOUD_NAME = "djgtpzrev"; // Your Cloudinary cloud name
const CLOUDINARY_UPLOAD_PRESET = "filmfactory"; // You'll need to create this upload preset

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

import { deleteImageDirect } from './deleteImageDirect.js';

export const deleteFromCloudinary = async (publicId) => {
  try {
    console.log('🗑️ Attempting to delete image with public_id:', publicId);

    // Use signed deletion method for reliable deletion
    const result = await deleteImageDirect(publicId);

    if (result.result === 'ok') {
      console.log('✅ Successfully deleted image from Cloudinary');
    } else {
      console.warn('⚠️ Cloudinary deletion result:', result.result);
    }

    return result;
  } catch (error) {
    console.error("❌ Cloudinary delete error:", error);

    // If signed deletion fails, try the old method as fallback
    try {
      console.log('🔄 Trying fallback deletion method...');

      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      console.log('🔄 Fallback deletion response:', data);
      return data;
    } catch (fallbackError) {
      console.error("❌ Both deletion methods failed:", fallbackError);
      throw error; // Throw original error
    }
  }
};
