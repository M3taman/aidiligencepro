import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { useFileUpload } from '@/hooks/useFileUpload';
import { listFiles, deleteFile } from '@/utils/storageUtils';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Trash2, Download, FileIcon, FileText, FileImage, FileArchive } from 'lucide-react';
import { toast } from 'react-hot-toast';

type FileCategory = 'reports' | 'blogs' | 'profile' | 'uploads';

const FileManagerPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FileCategory>('uploads');
  const [files, setFiles] = useState<Array<{ name: string; url: string; path: string }>>([]);
  const [loading, setLoading] = useState(false);
  
  const { 
    uploadedFiles, 
    uploadFiles, 
    deleteUploadedFile, 
    uploadProgress, 
    uploadError, 
    clearUploadedFiles 
  } = useFileUpload({
    folder: activeTab,
    maxSize: 10 * 1024 * 1024, // 10MB
    onUploadComplete: (files) => {
      toast.success(`${files.length} file(s) uploaded successfully`);
      fetchFiles();
    },
    onUploadError: (error) => {
      toast.error(error);
    }
  });

  const fetchFiles = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const folderPath = `${activeTab}/${user.uid}`;
      const filesList = await listFiles(folderPath);
      setFiles(filesList);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (path: string) => {
    try {
      await deleteFile(path);
      setFiles(files.filter(file => file.path !== path));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return <FileImage className="h-10 w-10 text-blue-500" />;
    } else if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(extension || '')) {
      return <FileText className="h-10 w-10 text-green-500" />;
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
      return <FileArchive className="h-10 w-10 text-amber-500" />;
    }
    
    return <FileIcon className="h-10 w-10 text-gray-500" />;
  };

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user, activeTab]);

  return (
    <>
      <Helmet>
        <title>File Manager | AI Diligence Pro</title>
        <meta name="description" content="Manage your uploaded files and documents" />
      </Helmet>
      
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">File Manager</h1>
        
        <Tabs defaultValue="uploads" onValueChange={(value) => setActiveTab(value as FileCategory)}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="uploads">General Uploads</TabsTrigger>
            <TabsTrigger value="reports">Report Attachments</TabsTrigger>
            <TabsTrigger value="blogs">Blog Images</TabsTrigger>
            <TabsTrigger value="profile">Profile Pictures</TabsTrigger>
          </TabsList>
          
          {['uploads', 'reports', 'blogs', 'profile'].map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Upload Files</CardTitle>
                    <CardDescription>
                      Upload new files to your {category} folder
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUpload
                      onUploadComplete={(files) => {
                        toast.success(`${files.length} file(s) uploaded successfully`);
                        fetchFiles();
                      }}
                      onUploadError={(error) => toast.error(error)}
                      folder={category as FileCategory}
                      maxSize={10 * 1024 * 1024} // 10MB
                      buttonText={`Upload to ${category}`}
                      accept={category === 'profile' ? 'image/*' : undefined}
                      multiple={category !== 'profile'}
                    />
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Your Files</CardTitle>
                    <CardDescription>
                      Manage files in your {category} folder
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">Loading files...</span>
                      </div>
                    ) : files.length === 0 ? (
                      <div className="text-center py-10 text-gray-500">
                        <p>No files found in this folder</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {files.map((file, index) => (
                          <div key={index} className="border rounded-lg p-4 flex items-center">
                            {getFileIcon(file.name)}
                            <div className="ml-4 flex-1 min-w-0">
                              <p className="font-medium truncate" title={file.name}>
                                {file.name}
                              </p>
                            </div>
                            <div className="flex space-x-2 ml-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => window.open(file.url, '_blank')}
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDeleteFile(file.path)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
};

export default FileManagerPage; 