# Setup Guide for AI Diligence Pro

This guide will help you set up and configure the AI Diligence Pro platform for local development and deployment.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase CLI
- An OpenAI API key
- An Alpha Vantage API key

## Step 1: API Keys Setup

### OpenAI API Key
1. Go to [OpenAI API](https://platform.openai.com/api-keys)
2. Create an account or log in
3. Generate a new API key
4. Copy the key (you won't be able to see it again)

### Alpha Vantage API Key
1. Go to [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Get a free API key
3. Copy the key

### SEC API Key (Optional)
1. Go to [SEC-API.io](https://sec-api.io/)
2. Register for an account
3. Get your API key

## Step 2: Firebase Setup

### Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "aidiligencepro")
4. Follow the setup wizard

### Configure Firebase in Your Project
1. In the Firebase console, go to Project Settings
2. Scroll down to "Your apps" and click the web app icon
3. Register your app with a nickname
4. Copy the configuration object

### Set Up Firebase Functions
1. Install Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Initialize Firebase in your project:
   ```
   firebase init
   ```
   Select:
   - Firestore
   - Functions
   - Hosting
   - Storage

4. Set the API keys in Firebase Functions config:
   ```
   firebase functions:config:set aiml.key="your-openai-api-key" alphavantage.key="your-alphavantage-key" sec.key="your-sec-api-key" news.key="your-news-api-key"
   ```

## Step 3: Local Development Setup

1. Copy the environment variables:
   ```
   cp .env.example .env
   ```

2. Edit the `.env` file with your API keys

3. Install dependencies:
   ```
   npm install
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Step 4: Deployment

### Deploy to Firebase
1. Build the project:
   ```
   npm run build
   ```

2. Deploy to Firebase:
   ```
   firebase deploy
   ```

## Testing the Setup

1. Navigate to the local development server (usually http://localhost:3000)
2. Enter a company name in the search box
3. Click "Generate Report"
4. If everything is set up correctly, you should see a due diligence report being generated

## Troubleshooting

### API Key Issues
- Verify your API keys are correctly set in both `.env` and Firebase Functions config
- Check the Firebase Functions logs for any errors

### Firebase Issues
- Make sure you have the correct Firebase project selected (`firebase use <project-id>`)
- Check Firebase console for any errors in the Functions section

### Application Issues
- Check the browser console for any JavaScript errors
- Check the server logs for any backend errors

