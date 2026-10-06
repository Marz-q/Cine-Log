const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWindows = process.platform === 'win32';
const backendDir = path.join(__dirname, 'backend');

// Determine command
let cmd;
let args = process.argv.slice(2);
if (args.length === 0) {
  args = ['spring-boot:run'];
}

if (isWindows) {
  const mvnwCmd = path.join(backendDir, 'mvnw.cmd');
  if (fs.existsSync(mvnwCmd)) {
    cmd = mvnwCmd;
  } else {
    cmd = 'mvn';
  }
} else {
  const mvnwSh = path.join(backendDir, 'mvnw');
  if (fs.existsSync(mvnwSh)) {
    cmd = mvnwSh;
  } else {
    cmd = 'mvn';
  }
}

console.log(`[Backend] Starting Spring Boot from ${backendDir} using ${cmd}...`);

const child = spawn(cmd, args, {
  cwd: backendDir,
  shell: true,
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
