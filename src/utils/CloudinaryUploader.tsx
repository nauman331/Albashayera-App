import { cloudinaryURL } from "./exports";
export const CloudinaryUploader = async (file: File) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

  if (!allowedTypes.includes(file.type)) {
    // toast.error('Invalid file type');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'car_auction');

  try {
    const response = await fetch(cloudinaryURL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
    //   toast.error('Cloudinary upload failed. Try again!');
    }

    const data = await response.json();

    if (!data.secure_url) {
    //   toast.error('No secure URL returned from Cloudinary. Try again!');
    }

    return { publicId: data.public_id, url: data.secure_url };
  } catch (error) {
    // toast.error('Upload error:');
    throw error;
  }
};