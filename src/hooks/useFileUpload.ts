import { useState } from 'react';
import { uploadFile, deleteFile, generateFilePath } from '@/utils/storageUtils';
import { useAuth } from '@/components/auth/authContext';

interface UploadedFile {
  url: string;
  path: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

interface UseFileUploadOptions {
  folder?: string;
  maxSize?: number; // in MB
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: Error) => void;
  onDeleteComplete?: (path: string) => void;
  onDeleteError?: (error: Error) => void;
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const {
    folder = 'uploads',
    maxSize = 5, // 5MB default
    onUploadComplete,
    onUploadError,
    onDeleteComplete,
    onDeleteError
  } = options;

  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const uploadFiles = async (files: FileList | File[]) => {
    if (!user) {
      const authError = new Error('You must be logged in to upload files');
      setError(authError.message);
      if (onUploadError) onUploadError(authError);
      return [];
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);

    const fileArray = Array.from(files);
    const uploadedResults: UploadedFile[] = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
          throw new Error(`File size exceeds ${maxSize}MB limit`);
        }

        // Create a unique path for the file
        const path = generateFilePath(user.uid, file.name, folder);
        
        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            const newProgress = prev + Math.random() * 10;
            return newProgress > 90 ? 90 : newProgress;
          });
        }, 300);

        // Upload the file
        const url = await uploadFile(file, path);
        
        clearInterval(progressInterval);
        setProgress(100);
        
        const uploadedFile: UploadedFile = {
          url,
          path,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date()
        };
        
        uploadedResults.push(uploadedFile);
        
        // Call the callback for each file
        if (onUploadComplete) onUploadComplete(uploadedFile);
      }
      
      // Update state with uploaded files
      setUploadedFiles(prev => [...prev, ...uploadedResults]);
      
      return uploadedResults;
    } catch (error: any) {
      setError(error.message || 'Failed to upload file');
      if (onUploadError) onUploadError(error);
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  const deleteUploadedFile = async (path: string) => {
    if (!user) {
      const authError = new Error('You must be logged in to delete files');
      setError(authError.message);
      if (onDeleteError) onDeleteError(authError);
      return false;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteFile(path);
      
      // Update state to remove the deleted file
      setUploadedFiles(prev => prev.filter(file => file.path !== path));
      
      if (onDeleteComplete) onDeleteComplete(path);
      return true;
    } catch (error: any) {
      setError(error.message || 'Failed to delete file');
      if (onDeleteError) onDeleteError(error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    uploadFiles,
    deleteUploadedFile,
    isUploading,
    isDeleting,
    progress,
    error,
    uploadedFiles,
    clearError: () => setError(null),
    clearUploadedFiles: () => setUploadedFiles([])
  };
};

export default useFileUpload; 