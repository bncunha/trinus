const { execFileSync } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');
const { apiEnv, pnpmCommand } = require('./e2e-real-env.cjs');

const rootDir = path.resolve(__dirname, '..');
const composeFile = path.join(rootDir, 'docker-compose.e2e.yml');
const composeEnv = {
  ...process.env,
  COMPOSE_PROJECT_NAME: 'trinus-e2e'
};

function dockerCompose(args) {
  execFileSync('docker', ['compose', '-f', composeFile, ...args], {
    cwd: rootDir,
    env: composeEnv,
    stdio: 'inherit'
  });
}

function canRunDockerCompose(args) {
  try {
    execFileSync('docker', ['compose', '-f', composeFile, ...args], {
      cwd: rootDir,
      env: composeEnv,
      stdio: 'ignore'
    });

    return true;
  } catch {
    return false;
  }
}

function runPnpm(args, stdio = 'inherit') {
  const command = process.platform === 'win32' ? 'cmd.exe' : pnpmCommand();
  const commandArgs =
    process.platform === 'win32' ? ['/d', '/s', '/c', `pnpm.cmd ${args.join(' ')}`] : args;

  execFileSync(command, commandArgs, {
    cwd: rootDir,
    env: {
      ...process.env,
      ...apiEnv
    },
    stdio
  });
}

async function runPnpmWithRetry(args, attempts) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      runPnpm(args, attempt === attempts ? 'inherit' : 'ignore');
      return;
    } catch (error) {
      if (attempt === attempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 3_000));
    }
  }
}

function waitForPort(port, host, timeoutMs) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = net.createConnection({ host, port });

      socket.once('connect', () => {
        socket.destroy();
        resolve();
      });
      socket.once('error', () => {
        socket.destroy();

        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Timed out waiting for ${host}:${port}.`));
          return;
        }

        setTimeout(attempt, 500);
      });
    };

    attempt();
  });
}

function waitForMysql(timeoutMs) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const isReady = canRunDockerCompose([
        'exec',
        '-T',
        'mysql-e2e',
        'mysqladmin',
        'ping',
        '-h',
        'localhost',
        '-uroot',
        '-proot',
        '--silent'
      ]);

      if (isReady) {
        resolve();
        return;
      }

      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error('Timed out waiting for mysql-e2e to become ready.'));
        return;
      }

      setTimeout(attempt, 1_000);
    };

    attempt();
  });
}

module.exports = async () => {
  dockerCompose(['down', '-v', '--remove-orphans']);
  dockerCompose(['up', '-d', 'mysql-e2e']);
  await waitForPort(3307, '127.0.0.1', 180_000);
  await waitForMysql(180_000);
  await new Promise((resolve) => setTimeout(resolve, 5_000));
  runPnpm(['--filter', '@trinus/api', 'exec', 'prisma', 'generate']);
  await runPnpmWithRetry(['--filter', '@trinus/api', 'exec', 'prisma', 'migrate', 'deploy'], 5);
};
