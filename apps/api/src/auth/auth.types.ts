import type { AuthSession } from '@trinus/contracts';

export type RequestWithAuth = {
  auth: AuthSession;
  cookies?: Record<string, string | undefined>;
};

