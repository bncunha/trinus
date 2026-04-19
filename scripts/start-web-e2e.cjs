const { spawn } = require('node:child_process');
const path = require('node:path');
const { pnpmCommand } = require('./e2e-real-env.cjs');

const rootDir = path.resolve(__dirname, '..');
const child = spawn(
  pnpmCommand(),
  ['--filter', '@trinus/web', 'exec', 'ng', 'serve', '--host', 'localhost', '--port', '4201'],
  {
    cwd: rootDir,
    env: {
      ...process.env,
      NODE_ENV: 'test'
    },
    shell: process.platform === 'win32',
    stdio: 'inherit'
  }
);

function stop(signal) {
  if (!child.killed) {
    child.kill(signal);
  }
}

process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop('SIGTERM'));
child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
