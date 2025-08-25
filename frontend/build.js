const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.bright}${colors.blue}=== Document Portal Frontend Build Script ===${colors.reset}\n`);

try {
  // Step 1: Clean previous build
  console.log(`${colors.cyan}Cleaning previous build...${colors.reset}`);
  if (fs.existsSync(path.join(__dirname, 'dist'))) {
    fs.rmSync(path.join(__dirname, 'dist'), { recursive: true, force: true });
  }
  console.log(`${colors.green}✓ Previous build cleaned${colors.reset}\n`);

  // Step 2: Install dependencies
  console.log(`${colors.cyan}Installing dependencies...${colors.reset}`);
  execSync('npm install', { stdio: 'inherit' });
  console.log(`${colors.green}✓ Dependencies installed${colors.reset}\n`);

  // Step 3: Build for production
  console.log(`${colors.cyan}Building for production...${colors.reset}`);
  execSync('npm run build', { stdio: 'inherit' });
  console.log(`${colors.green}✓ Production build completed${colors.reset}\n`);

  // Step 4: Copy to FastAPI static directory
  console.log(`${colors.cyan}Copying build to FastAPI static directory...${colors.reset}`);
  const distPath = path.join(__dirname, 'dist');
  const staticPath = path.join(__dirname, '..', 'static', 'react');
  
  // Create static/react directory if it doesn't exist
  if (!fs.existsSync(staticPath)) {
    fs.mkdirSync(staticPath, { recursive: true });
  }

  // Copy files
  copyFolderRecursiveSync(distPath, path.join(__dirname, '..', 'static'));
  console.log(`${colors.green}✓ Build copied to FastAPI static directory${colors.reset}\n`);

  console.log(`${colors.bright}${colors.magenta}Build completed successfully!${colors.reset}`);
  console.log(`${colors.yellow}To start the FastAPI server:${colors.reset}`);
  console.log(`${colors.bright}cd .. && uvicorn api.main:app --port 8080 --reload${colors.reset}\n`);

} catch (error) {
  console.error(`${colors.bright}\x1b[31mBuild failed:${colors.reset}`, error);
  process.exit(1);
}

/**
 * Copy a folder recursively
 * @param {string} source - Source folder path
 * @param {string} target - Target folder path
 */
function copyFolderRecursiveSync(source, target) {
  const targetFolder = path.join(target, path.basename(source));
  
  // Create target folder if it doesn't exist
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }

  // Copy files
  if (fs.lstatSync(source).isDirectory()) {
    const files = fs.readdirSync(source);
    files.forEach(file => {
      const currentSource = path.join(source, file);
      if (fs.lstatSync(currentSource).isDirectory()) {
        copyFolderRecursiveSync(currentSource, targetFolder);
      } else {
        const targetFile = path.join(targetFolder, file);
        fs.copyFileSync(currentSource, targetFile);
      }
    });
  }
}