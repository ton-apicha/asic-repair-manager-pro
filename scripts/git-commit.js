// Cross-platform Git Commit Helper
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

const isWindows = os.platform() === 'win32';
const scriptName = isWindows ? 'git-commit.ps1' : 'git-commit.sh';
const command = isWindows ? 'powershell' : 'bash';
const args = isWindows ? ['-File', path.join(__dirname, scriptName)] : [path.join(__dirname, scriptName)];

const proc = spawn(command, args, { stdio: 'inherit', shell: true });

proc.on('error', (error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});

proc.on('exit', (code) => {
  process.exit(code || 0);
});

