import axios from "axios";
import CryptoJS from "crypto-js";

export const deleteImageDirect = async (publicId) => {
  const cloudName = "djgtpzrev";
  const apiKey = "261831892579417";
  const apiSecret = "WOmNoe9S8Dh0HjCpBTmGx2pOWHQ";

  const timestamp = Math.floor(Date.now() / 1000);

  // Generate signature: SHA1 of `public_id=...&timestamp=...<api_secret>`
  const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = CryptoJS.SHA1(signatureString).toString();

  console.log('Attempting signed deletion with:', {
    publicId,
    timestamp,
    signature: signature.substring(0, 10) + '...' // Show partial signature for debugging
  });

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    console.log("✅ Cloudinary signed deletion successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Cloudinary signed deletion failed:", error.response?.data || error.message);
    throw error;
  }
};