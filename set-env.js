const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, './src/environments');
const targetPath = path.join(targetDir, 'environment.prod.ts');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const envConfigFile = `export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL || 'http://3.137.137.83:8080/api'}'
};
`;

console.log('Generating production environment file...');

fs.writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    console.error(err);
    throw err;
  } else {
    console.log(`Environment file generated at ${targetPath}`);
  }
});
