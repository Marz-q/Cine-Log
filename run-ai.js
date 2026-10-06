const { spawn, execSync } = require('child_process');
const path = require('path');

const aiDir = path.join(__dirname, 'ai-service');

// Find working python command
let pythonCmd = 'python';
const candidates = ['python', 'python3', 'py'];
for (const cand of candidates) {
  try {
    execSync(`${cand} --version`, { stdio: 'ignore' });
    pythonCmd = cand;
    break;
  } catch (e) {
    // try next
  }
}

const args = ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'];

console.log(`[AI-Service] Starting FastAPI from ${aiDir} on port 8000 using ${pythonCmd}...`);

const child = spawn(pythonCmd, args, {
  cwd: aiDir,
  shell: true,
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
