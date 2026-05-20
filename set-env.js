const fs = require('fs');
const path = require('path');

// Determine which env file to use based on arguments
const envFile = process.argv.includes('--local') ? '.envlocal' : '.env';
const envPath = path.join(__dirname, envFile);

// Default fallback URL
let apiUrl = 'http://localhost:8080/api'; 

// Read the env file and extract API_URL
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^API_URL=(.*)$/m);
  if (match) {
    apiUrl = match[1].trim();
  }
}

const targetDir = path.join(__dirname, './src/environments');
const targetPath = path.join(targetDir, 'environment.ts');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Generate the single environment.ts file
const envConfigFile = `export const environment = {
  production: ${envFile === '.env'},
  apiUrl: '${apiUrl}'
};
`;

console.log(`Generating environment file from ${envFile}...`);
fs.writeFileSync(targetPath, envConfigFile);
console.log(`Environment file generated at ${targetPath} with apiUrl: ${apiUrl}`);
