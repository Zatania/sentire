import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(__filename, '../../');

console.log('[v0] Project root:', projectRoot);

try {
  process.chdir(projectRoot);
  console.log('[v0] Changed to project directory');

  // Check current branch
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  console.log('[v0] Current branch:', currentBranch);

  // Fetch latest from remote
  console.log('[v0] Fetching from remote...');
  execSync('git fetch origin', { stdio: 'inherit' });

  // Switch to fix-system-website branch
  console.log('[v0] Switching to fix-system-website...');
  execSync('git checkout fix-system-website', { stdio: 'inherit' });

  console.log('[v0] Successfully switched to fix-system-website branch');
  
  // Show current status
  execSync('git status', { stdio: 'inherit' });
} catch (error) {
  console.error('[v0] Error:', error.message);
  process.exit(1);
}
