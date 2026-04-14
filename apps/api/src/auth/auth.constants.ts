export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'trinus_auth';
export const AUTH_REFRESH_COOKIE_NAME = process.env.AUTH_REFRESH_COOKIE_NAME ?? 'trinus_refresh';
export const AUTH_COOKIE_SECURE = process.env.AUTH_COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
export const AUTH_COOKIE_SAME_SITE = process.env.AUTH_COOKIE_SAME_SITE ?? 'lax';
export const AUTH_TOKEN_TTL_SECONDS = parseDurationToSeconds(process.env.JWT_EXPIRES_IN ?? '1h');
export const AUTH_REFRESH_TOKEN_TTL_SECONDS = parseDurationToSeconds(process.env.JWT_REFRESH_EXPIRES_IN ?? '1h');

function parseDurationToSeconds(value: string): number {
  const match = value.trim().match(/^(\d+)([dhm])?$/);

  if (!match) {
    return 60 * 60 * 8;
  }

  const amount = Number(match[1]);
  const unit = match[2] ?? 's';

  if (unit === 'd') {
    return amount * 24 * 60 * 60;
  }

  if (unit === 'h') {
    return amount * 60 * 60;
  }

  if (unit === 'm') {
    return amount * 60;
  }

  return amount;
}
