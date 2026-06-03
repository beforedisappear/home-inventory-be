export const AUTH_REFRESH_JWT_KIND = 'refresh' as const;

export interface AccessJwtPayload {
  sub: string; // userId
  exp?: number;
}

export interface RefreshJwtPayload {
  sub: string;
  kind: typeof AUTH_REFRESH_JWT_KIND;
  jti: string;
  exp?: number;
}
