const { execFileSync } = require('node:child_process');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const composeFile = path.join(rootDir, 'docker-compose.e2e.yml');

module.exports = async () => {
  execFileSync('docker', ['compose', '-f', composeFile, 'down', '-v', '--remove-orphans'], {
    cwd: rootDir,
    env: {
      ...process.env,
      COMPOSE_PROJECT_NAME: 'trinus-e2e'
    },
    stdio: 'inherit'
  });
};
