import Cookies from 'js-cookie';

export function setAuthTokens(access: string, refresh: string, remember = false): void {
  const expires = remember ? 30 : 7;
  Cookies.set('accessToken', access, { path: '/', expires });
  Cookies.set('refreshToken', refresh, { path: '/', expires });
}
