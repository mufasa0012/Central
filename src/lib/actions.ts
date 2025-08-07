'use server';

import imagekit from '@/lib/imagekit';

export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File;

  if (!file) {
    return { error: 'No file provided.' };
  }

  try {
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    const response = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: 'shop-central',
    });

    return { url: response.url };
  } catch (error: any) {
    console.error('ImageKit upload error:', error);
    return { error: error.message || 'Failed to upload image.' };
  }
}
