# AI Diligence Pro 🚀

A premium AI-powered due diligence platform for Registered Investment Advisors (RIAs). Built with Firebase, React, TypeScript, and Node.js.

## 🌟 Features

- **AI-Powered Analysis**: Generate comprehensive due diligence reports using advanced AI models
- **Real-time Sentiment Tracking**: Monitor market sentiment with interactive charts
- **Secure Authentication**: Multi-factor authentication with Firebase Auth
- **Subscription Management**: Integrated PayPal subscription system
- **PDF Report Generation**: Export detailed reports as professional PDFs
- **Model Context Protocol (MCP)**: Advanced AI integration for financial analysis
- **Responsive Design**: Modern UI with Tailwind CSS and glassmorphism effects

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Chart.js** for data visualization
- **React Router** for navigation

### Backend
- **Firebase Functions** (Node.js 20)
- **Firestore** for database
- **Firebase Auth** for authentication
- **Firebase Hosting** for deployment

### Development Tools
- **ESLint** with Google config
- **Vitest** for testing
- **TypeScript** for type safety

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- Firebase CLI installed globally
- Firebase project set up

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aidiligence-pro.git
   cd aidiligence-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase configuration
   ```

4. **Start development servers**
   ```bash
   # Start Firebase emulators
   npm run firebase:emulators
   
   # In another terminal, start the dev server
   npm run dev
   ```

## 📦 Production Deployment

### Automated Deployment
```bash
# Make the deploy script executable (first time only)
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

### Manual Deployment
```bash
# Build the project
npm run build:prod

# Deploy to Firebase
firebase deploy
```

### Deploy Only Hosting
```bash
npm run firebase:deploy:hosting
```

### Deploy Only Functions
```bash
npm run firebase:deploy:functions
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:prod` - Build with production optimizations
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run type-check` - Run TypeScript type checking
- `npm run preview` - Preview production build locally

## 🏗️ Project Structure

```
aidiligence-pro/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard components
│   │   ├── landing/        # Landing page components
│   │   ├── layout/         # Layout components
│   │   └── payments/       # Payment components
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── firebase.ts         # Firebase configuration
├── functions/              # Firebase Functions
│   ├── src/
│   │   ├── index.ts        # Functions entry point
│   │   ├── mcpServer.ts    # MCP server implementation
│   │   └── reportGenerator.ts # PDF report generation
├── public/                 # Static assets
├── firebase.json           # Firebase configuration
├── firestore.rules         # Firestore security rules
└── deploy.sh              # Deployment script
```

## 🔐 Security Features

- **Environment Variables**: Sensitive data stored in environment variables
- **Firebase Security Rules**: Comprehensive Firestore security rules
- **Error Boundaries**: Graceful error handling throughout the app
- **Input Validation**: Server-side validation for all inputs
- **HTTPS Only**: All communications encrypted
- **Content Security Policy**: Security headers configured

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📊 Performance Optimizations

- **Code Splitting**: Automatic chunking for optimal loading
- **Tree Shaking**: Unused code elimination
- **Image Optimization**: Optimized asset delivery
- **Caching**: Aggressive caching strategies
- **Bundle Analysis**: Built-in bundle analyzer

## 🌐 Domain Setup

This application is configured for deployment to `aidiligence.pro`. To use your own domain:

1. Update the `VITE_APP_URL` in your `.env` file
2. Configure your domain in Firebase Hosting
3. Update the `firebase.json` hosting configuration

## 📈 Monitoring & Analytics

- **Error Tracking**: Integrated error boundary system
- **Performance Monitoring**: Built-in performance tracking
- **User Analytics**: Firebase Analytics integration
- **Custom Logging**: Structured logging for debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support, email support@aidiligence.pro or create an issue in this repository.

---

**Built with ❤️ for the future of investment research**