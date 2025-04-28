# AI Diligence Pro

An AI-powered due diligence tool for investment professionals.

## Setup Instructions

### 1. API Keys Setup

The application requires several API keys to function properly:

#### Required API Keys:
- OpenAI API Key (for GPT-4 integration)
- Alpha Vantage API Key (for financial data)
- Firebase configuration (for authentication and database)

#### Optional API Keys:
- SEC API Key (for SEC filing data)
- News API Key (for news integration)

### 2. Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```
   cp .env.example .env
   ```

2. Edit the `.env` file and add your actual API keys:
   ```
   OPENAI_API_KEY=sk-your_openai_api_key_here
   ALPHA_VANTAGE_API_KEY=your_alphavantage_api_key_here
   ...
   ```

### 3. Firebase Setup

1. Configure Firebase Functions:
   ```
   firebase functions:config:set aiml.key="your-openai-api-key" alphavantage.key="your-alphavantage-key"
   ```

2. Deploy Firebase Functions:
   ```
   firebase deploy --only functions
   ```

### 4. Running the Application

#### Development Mode:
```
npm run dev
```

#### Production Build:
```
npm run build
npm start
```

## Features

- Automated due diligence report generation
- SEC filing analysis
- Financial data analysis
- Market analysis
- Risk assessment
- Smart alerts

## Architecture

The application is built with:
- React/TypeScript (frontend)
- Firebase (authentication, database, functions)
- OpenAI GPT-4 (AI analysis)
- Alpha Vantage (financial data)

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
