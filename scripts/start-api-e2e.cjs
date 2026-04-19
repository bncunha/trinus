const { spawn } = require('node:child_process');
const path = require('node:path');
const { apiEnv, pnpmCommand } = require('./e2e-real-env.cjs');
const setupDatabase = require('./e2e-real-global-setup.cjs');

const rootDir = path.resolve(__dirname, '..');
let child = null;

function stop(signal) {
  if (child && !child.killed) {
    child.kill(signal);
  }
}

process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop('SIGTERM'));

(async () => {
  await setupDatabase();

  child = spawn(pnpmCommand(), ['--filter', '@trinus/api', 'dev'], {
    cwd: rootDir,
    env: {
      ...process.env,
      ...apiEnv
    },
    shell: process.platform === 'win32',
    stdio: 'inherit'
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
