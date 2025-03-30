import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const functionsDir = join(__dirname, 'functions');

try {
  // Build the functions code
  console.log('Building functions...');
  execSync('npm run build', { cwd: functionsDir, stdio: 'inherit' });
  
  // Deploy the functions
  console.log('Deploying functions...');
  execSync('firebase deploy --only functions', { cwd: __dirname, stdio: 'inherit' });
  
  console.log('Functions deployed successfully!');
} catch (error) {
  console.error('Error during deployment:', error.message);
  process.exit(1);
}
