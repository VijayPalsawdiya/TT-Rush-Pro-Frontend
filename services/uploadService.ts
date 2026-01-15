import { api } from './api';

export interface UploadImageResponse {
    url: string;
    publicId: string;
    width: number;
    height: number;
}

export const uploadService = {
    /**
     * Upload image to Cloudinary
     * @param imageUri - Local image URI or base64 string
     * @param folder - Optional folder name in Cloudinary
     */
    uploadImage: async (imageUri: string, folder: string = 'profile-pictures'): Promise<string> => {
        try {
            // Convert image to base64 if it's a file URI
            let base64Image = imageUri;

            // If it's a file URI (starts with file://)
            if (imageUri.startsWith('file://')) {
                // For React Native, we'll need to use a library to convert
                // For now, assume it's already base64 or will be converted by the caller
                console.warn('File URI detected. Please convert to base64 before calling uploadImage');
            }

            // Ensure it has the data URI prefix
            if (!base64Image.startsWith('data:')) {
                base64Image = `data:image/jpeg;base64,${base64Image}`;
            }

            const response = await api.post<UploadImageResponse>('/upload/image', {
                image: base64Image,
                folder,
            });

            console.log('✅ Image uploaded to Cloudinary:', response.data.url);
            return response.data.url;
        } catch (error) {
            console.error('❌ Image upload failed:', error);
            throw error;
        }
    },

    /**
     * Delete image from Cloudinary
     * @param publicId - Cloudinary public ID
     */
    deleteImage: async (publicId: string): Promise<void> => {
        try {
            await api.post('/upload/image/delete', { publicId });
            console.log('✅ Image deleted from Cloudinary');
        } catch (error) {
            console.error('❌ Image delete failed:', error);
            throw error;
        }
    },
};
