const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// Log with colors
const log = {
  info: (msg) => console.log(`${colors.blue}${colors.bright}ℹ ${colors.reset}${msg}`),
  success: (msg) => console.log(`${colors.green}${colors.bright}✓ ${colors.reset}${msg}`),
  warning: (msg) => console.log(`${colors.yellow}${colors.bright}⚠ ${colors.reset}${msg}`),
  error: (msg) => console.log(`${colors.red}${colors.bright}✗ ${colors.reset}${msg}`),
  title: (msg) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}\n`)
};

// Execute command and return output
function runCommand(command, options = {}) {
  try {
    log.info(`Running: ${command}`);
    return execSync(command, { stdio: options.silent ? 'pipe' : 'inherit', encoding: 'utf-8' });
  } catch (error) {
    if (options.ignoreError) {
      log.warning(`Command failed but continuing: ${command}`);
      return '';
    }
    log.error(`Command failed: ${command}`);
    log.error(error.message);
    process.exit(1);
  }
}

// Ask a question and get user input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${question}${colors.reset} `, (answer) => {
      resolve(answer);
    });
  });
}

// Main deployment function
async function deploy() {
  log.title('🚀 Starting Firebase Deployment Process');

  // Check if Firebase CLI is installed
  try {
    runCommand('firebase --version', { silent: true });
    log.success('Firebase CLI is installed');
  } catch (error) {
    log.error('Firebase CLI is not installed. Please install it with: npm install -g firebase-tools');
    process.exit(1);
  }

  // Check if user is logged in to Firebase
  try {
    const loginStatus = runCommand('firebase login:list', { silent: true });
    if (!loginStatus.includes('✔')) {
      log.warning('You are not logged in to Firebase');
      const shouldLogin = await askQuestion('Do you want to login now? (y/n): ');
      if (shouldLogin.toLowerCase() === 'y') {
        runCommand('firebase login');
      } else {
        log.error('Firebase login is required to deploy');
        process.exit(1);
      }
    } else {
      log.success('Already logged in to Firebase');
    }
  } catch (error) {
    log.error('Failed to check Firebase login status');
    process.exit(1);
  }

  // Build the project
  log.title('🔨 Building the project');
  runCommand('npm run build');
  log.success('Build completed successfully');

  // Deploy to Firebase
  log.title('🔥 Deploying to Firebase');
  
  // Ask which services to deploy
  log.info('Select which Firebase services to deploy:');
  const deployHosting = await askQuestion('Deploy Hosting? (y/n): ');
  const deployStorage = await askQuestion('Deploy Storage Rules? (y/n): ');
  const deployFunctions = await askQuestion('Deploy Functions? (y/n): ');
  
  let deployCommand = 'firebase deploy';
  const deployOptions = [];
  
  if (deployHosting.toLowerCase() === 'y') deployOptions.push('hosting');
  if (deployStorage.toLowerCase() === 'y') deployOptions.push('storage');
  if (deployFunctions.toLowerCase() === 'y') deployOptions.push('functions');
  
  if (deployOptions.length === 0) {
    log.warning('No services selected for deployment');
    const shouldContinue = await askQuestion('Do you want to deploy all services? (y/n): ');
    if (shouldContinue.toLowerCase() !== 'y') {
      log.error('Deployment cancelled');
      process.exit(1);
    }
  } else {
    deployCommand += ' --only ' + deployOptions.join(',');
  }
  
  // Confirm deployment
  const projectId = runCommand('firebase use', { silent: true }).trim();
  log.info(`You are about to deploy to Firebase project: ${projectId}`);
  const confirmDeploy = await askQuestion('Continue with deployment? (y/n): ');
  
  if (confirmDeploy.toLowerCase() === 'y') {
    runCommand(deployCommand);
    log.success('🎉 Deployment completed successfully!');
    
    // Get the hosting URL
    if (deployOptions.includes('hosting')) {
      try {
        const hostingUrl = runCommand('firebase hosting:channel:list', { silent: true })
          .split('\n')
          .find(line => line.includes('live'))
          ?.match(/https:\/\/[^\s]+/)?.[0];
        
        if (hostingUrl) {
          log.info(`Your app is live at: ${hostingUrl}`);
        }
      } catch (error) {
        // Ignore errors when trying to get the hosting URL
      }
    }
  } else {
    log.warning('Deployment cancelled');
  }
  
  rl.close();
}

// Run the deployment
deploy().catch(error => {
  log.error('Deployment failed');
  log.error(error.message);
  rl.close();
  process.exit(1); 