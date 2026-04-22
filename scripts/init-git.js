const { execSync } = require('child_process');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

console.log('[v0] Current working directory:', process.cwd());
console.log('[v0] Project root:', projectRoot);

try {
  // Initialize git if not already initialized
  console.log('[v0] Initializing git repository...');
  execSync('git init', { cwd: projectRoot, stdio: 'inherit' });
  
  // Add the remote
  console.log('[v0] Adding remote origin...');
  execSync('git remote add origin https://github.com/sentirepupm406-del/v0-sentire-thesis-app.git', { 
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, GIT_ASKPASS: 'echo' }
  });
  
  // Fetch all branches
  console.log('[v0] Fetching branches...');
  execSync('git fetch origin', { cwd: projectRoot, stdio: 'inherit' });
  
  // Switch to fix-system-website branch
  console.log('[v0] Switching to fix-system-website branch...');
  execSync('git checkout --track origin/fix-system-website', { cwd: projectRoot, stdio: 'inherit' });
  
  console.log('[v0] Successfully switched to fix-system-website branch');
} catch (error) {
  console.error('[v0] Error:', error.message);
  process.exit(1);
}
