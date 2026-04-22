#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

const projectDir = path.join(__dirname, '..');

try {
  console.log('Fetching remote branches...');
  execSync('git fetch origin', { cwd: projectDir, stdio: 'inherit' });

  console.log('Checking out fix-system-website branch...');
  execSync('git checkout fix-system-website', { cwd: projectDir, stdio: 'inherit' });

  console.log('Successfully switched to fix-system-website branch!');
} catch (error) {
  console.error('Error switching branch:', error.message);
  process.exit(1);
}
