import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from '@/firebase';

/**
 * Uploads a file to Firebase Storage
 * @param file The file to upload
 * @param path The path in storage where the file should be stored
 * @returns A promise that resolves to the download URL of the uploaded file
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};

/**
 * Deletes a file from Firebase Storage
 * @param path The path to the file in storage
 * @returns A promise that resolves when the file is deleted
 */
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Gets the download URL for a file in Firebase Storage
 * @param path The path to the file in storage
 * @returns A promise that resolves to the download URL
 */
export const getFileURL = async (path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw new Error('Failed to get file URL');
  }
};

/**
 * Lists all files in a directory in Firebase Storage
 * @param path The path to the directory in storage
 * @returns A promise that resolves to an array of file references
 */
export const listFiles = async (path: string) => {
  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    return result.items;
  } catch (error) {
    console.error('Error listing files:', error);
    throw new Error('Failed to list files');
  }
};

/**
 * Generates a unique file path for storage
 * @param userId The user ID
 * @param fileName The original file name
 * @param folder The folder to store the file in
 * @returns A unique path for the file
 */
export const generateFilePath = (userId: string, fileName: string, folder: string): string => {
  const timestamp = Date.now();
  const extension = fileName.split('.').pop();
  return `${folder}/${userId}/${timestamp}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
}; 