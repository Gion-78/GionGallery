// Drop the SDK entirely and use direct FormData upload with fetch
// This approach uses the private key directly in the browser code

// Define interfaces for better type safety
interface ImageKitResponse {
  url: string;
  thumbnailUrl?: string;
  fileId: string;
  [key: string]: any;
}

// ImageKit credentials - including private key as authorized by user
const IMAGEKIT_PUBLIC_KEY = "public_ZzuyZP/OYE2/SWGniccrAZdrWvc=";
const IMAGEKIT_PRIVATE_KEY = "private_nyalbQkA+XXj8YoyyuFwPP4RxPw=";
const IMAGEKIT_URL_ENDPOINT = "https://ik.imagekit.io/GionGallery/";

// Function to create basic auth header
const getBasicAuthHeader = () => {
  return `Basic ${btoa(`${IMAGEKIT_PRIVATE_KEY}:`)}`;
};

// Direct upload function using the private key
const uploadToImageKit = async (file: File, options: Record<string, any> = {}): Promise<ImageKitResponse> => {
  const formData = new FormData();
  
  // Add file
  formData.append('file', file);
  
  // Add options
  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined) {
      formData.append(key, String(value));
    }
  }
  
  try {
    // Use the private key directly for authentication via Basic Auth
    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': getBasicAuthHeader()
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Upload failed';
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch (e) {
        // If parsing fails, use the raw text
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

// Upload function for images
export const uploadImage = async (file: File, folder: string, fileName: string) => {
  try {
    // Use direct upload with private key authentication
    const data = await uploadToImageKit(file, {
      fileName,
      folder,
      useUniqueFileName: true
    });
    
    return {
      success: true,
      url: data.url,
      thumbnailUrl: data.thumbnailUrl,
      fileId: data.fileId
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error
    };
  }
};

// Upload function for zip files
export const uploadZip = async (file: File, folder: string, fileName: string) => {
  try {
    // Use direct upload with private key authentication
    const data = await uploadToImageKit(file, {
      fileName,
      folder,
      useUniqueFileName: false
    });
    
    return {
      success: true,
      url: data.url,
      fileId: data.fileId
    };
  } catch (error) {
    console.error('Error uploading zip file:', error);
    return {
      success: false,
      error
    };
  }
};

// Upload function for videos
export const uploadVideo = async (file: File, folder: string, fileName: string) => {
  try {
    // Use direct upload with simpler parameters to avoid API errors
    const data = await uploadToImageKit(file, {
      fileName,
      folder,
      useUniqueFileName: true,
      // Use tags to help identify high quality videos
      tags: ["original-quality"],
      // Basic metadata
      responseFields: "url,thumbnailUrl,fileId"
    });
    
    return {
      success: true,
      url: data.url,
      thumbnailUrl: data.thumbnailUrl,
      fileId: data.fileId
    };
  } catch (error) {
    console.error('Error uploading video:', error);
    return {
      success: false,
      error
    };
  }
};

// Delete function for any file type
export const deleteFile = async (fileId: string) => {
  try {
    const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': getBasicAuthHeader()
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Delete failed';
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch (e) {
        // If parsing fails, use the raw text
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      error
    };
  }
}; 