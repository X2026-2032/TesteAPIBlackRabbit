const fs = require('fs');
const path = require('path');

const filesToCopy = [
  'ajiopay.pem',
  'myserver.key'
];

const outputDir = 'build'; // ajuste conforme necessário

for (const file of filesToCopy) {
  const destPath = path.join(outputDir, path.basename(file));
  fs.copyFileSync(file, destPath);
  console.log(`Copied ${file} to ${destPath}`);
}