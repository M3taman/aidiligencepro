# AI Diligence Pro

AI-powered due diligence and report generation platform with Firebase Storage integration.

## Firebase Storage Integration

This project now includes Firebase Storage integration for file uploads and management. The following features have been implemented:

### File Manager

A complete file management system that allows users to:
- Upload files to different categories (general uploads, report attachments, blog images, profile pictures)
- View and manage uploaded files
- Download files
- Delete files

### Storage Security Rules

Firebase Storage security rules have been configured to:
- Allow authenticated users to upload files to their own directories
- Restrict file access based on user authentication
- Organize files in separate folders based on their purpose

### File Upload Components

The following components and utilities have been created:

1. **FileUpload Component**: A reusable UI component for file uploads
2. **useFileUpload Hook**: A custom hook for managing file uploads
3. **Storage Utilities**: Helper functions for interacting with Firebase Storage

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up Firebase:
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Firebase Authentication and Storage
   - Add your Firebase configuration to `src/firebase.ts`

4. Run the development server:
   ```
   npm run dev
   ```

## Deployment

Several deployment scripts are available:

- `npm run deploy` - Deploy all Firebase services
- `npm run deploy:hosting` - Deploy only Firebase Hosting
- `npm run deploy:storage` - Deploy only Firebase Storage rules
- `npm run deploy:interactive` - Interactive deployment script with options

## Firebase Emulators

For local development, you can use Firebase Emulators:

```
npm run firebase:emulators
```

This will start the Firebase emulators for Authentication, Firestore, Functions, and Storage.

## File Structure

- `src/components/ui/file-upload.tsx` - Reusable file upload component
- `src/hooks/useFileUpload.ts` - Custom hook for file uploads
- `src/utils/storageUtils.ts` - Firebase Storage utility functions
- `src/pages/file-manager.tsx` - File manager page
- `storage.rules` - Firebase Storage security rules
- `firebase.json` - Firebase configuration

## Usage Examples

### Basic File Upload

```tsx
import { FileUpload } from '@/components/ui/file-upload';

const MyComponent = () => {
  return (
    <FileUpload
      onUploadComplete={(files) => console.log('Uploaded files:', files)}
      onUploadError={(error) => console.error('Upload error:', error)}
      folder="uploads"
      maxSize={5 * 1024 * 1024} // 5MB
      buttonText="Upload Files"
      multiple={true}
    />
  );
};
```

### Using the useFileUpload Hook

```tsx
import { useFileUpload } from '@/hooks/useFileUpload';

const MyComponent = () => {
  const { 
    uploadedFiles, 
    uploadFiles, 
    deleteUploadedFile, 
    uploadProgress, 
    uploadError, 
    clearUploadedFiles 
  } = useFileUpload({
    folder: 'uploads',
    maxSize: 10 * 1024 * 1024, // 10MB
    onUploadComplete: (files) => {
      console.log('Upload completed:', files);
    },
    onUploadError: (error) => {
      console.error('Upload error:', error);
    }
  });

  return (
    <div>
      <input 
        type="file" 
        multiple 
        onChange={(e) => uploadFiles(e.target.files)} 
      />
      {uploadProgress > 0 && <progress value={uploadProgress} max={100} />}
      {uploadError && <div className="error">{uploadError}</div>}
      {uploadedFiles.map((file) => (
        <div key={file.path}>
          <a href={file.url} target="_blank" rel="noopener noreferrer">
            {file.name}
          </a>
          <button onClick={() => deleteUploadedFile(file.path)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
```

## License

MIT
