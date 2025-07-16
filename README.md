# Aidiligence.pro

This is a premium AI-powered due diligence platform for RIAs. It is built with Firebase, React, TypeScript, and Node.js.

## Setup

1. Clone the repository.
2. Install the dependencies for the frontend:
   ```
   npm install
   ```
3. Install the dependencies for the backend:
   ```
   cd functions
   npm install
   cd ..
   ```

## Running the Application

1. Start the Firebase emulators:
   ```
   npm run firebase:emulators
   ```
2. Start the development server:
   ```
   npm run dev
   ```

## Deployment

1. Build the application:
   ```
   npm run build
   ```
2. Deploy to Firebase:
   ```
   firebase deploy
   ```