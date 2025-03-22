import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { uploadFile, generateFilePath } from '@/utils/storageUtils';
import { useAuth } from '@/components/auth/authContext';
import { Upload, X, FileText, Image, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUploadComplete?: (url: string, path: string) => void;
  onUploadError?: (error: Error) => void;
  folder?: string;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  buttonText?: string;
  multiple?: boolean;
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  folder = 'uploads',
  accept = '*',
  maxSize = 5, // 5MB default
  className,
  buttonText = 'Upload File',
  multiple = false
}: FileUploadProps) {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string, path: string, name: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (!user) {
      setError('You must be logged in to upload files');
      if (onUploadError) onUploadError(new Error('User not authenticated'));
      return;
    }

    setIsUploading(true);
    setError(null);
    setProgress(0);

    const uploadPromises = Array.from(files).map(async (file) => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`File size exceeds ${maxSize}MB limit`);
      }

      try {
        // Create a unique path for the file
        const path = generateFilePath(user.uid, file.name, folder);
        
        // Simulate progress (since Firebase doesn't provide upload progress easily)
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
        
        return { url, path, name: file.name };
      } catch (error) {
        console.error('Upload error:', error);
        throw error;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      
      // Update state with uploaded files
      setUploadedFiles(prev => [...prev, ...results]);
      
      // Call the callback for each file
      results.forEach(result => {
        if (onUploadComplete) onUploadComplete(result.url, result.path);
      });
      
    } catch (error: any) {
      setError(error.message || 'Failed to upload file');
      if (onUploadError) onUploadError(error);
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return <Image className="h-4 w-4" />;
    } else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension || '')) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept}
        multiple={multiple}
      />
      
      <Button
        type="button"
        variant="outline"
        onClick={handleButtonClick}
        disabled={isUploading}
        className="w-full"
      >
        {isUploading ? (
          <span className="flex items-center">
            <Upload className="mr-2 h-4 w-4 animate-pulse" />
            Uploading...
          </span>
        ) : (
          <span className="flex items-center">
            <Upload className="mr-2 h-4 w-4" />
            {buttonText}
          </span>
        )}
      </Button>
      
      {isUploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {Math.round(progress)}% uploaded
          </p>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploaded Files:</p>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                <div className="flex items-center">
                  {getFileIcon(file.name)}
                  <span className="ml-2 text-sm truncate max-w-[200px]">{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload; 