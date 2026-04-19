const databaseUrl = 'mysql://trinus_e2e:trinus_e2e@127.0.0.1:3307/trinus_e2e';

const apiEnv = {
  AUTH_COOKIE_NAME: 'trinus_auth_e2e',
  AUTH_COOKIE_SAME_SITE: 'lax',
  AUTH_COOKIE_SECURE: 'false',
  AUTH_REFRESH_COOKIE_NAME: 'trinus_refresh_e2e',
  CORS_ORIGIN: 'http://localhost:4201',
  DATABASE_URL: databaseUrl,
  JWT_EXPIRES_IN: '10m',
  JWT_REFRESH_EXPIRES_IN: '30m',
  JWT_SECRET: 'trinus-e2e-secret',
  NODE_ENV: 'test',
  PORT: '3001'
};

function pnpmCommand() {
  return process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
}

module.exports = {
  apiEnv,
  databaseUrl,
  pnpmCommand
};
