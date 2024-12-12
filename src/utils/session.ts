// utils/session.ts
// WARNING: This is a naive example. For production, use a secure, encrypted session store.
let userTokens: { [key: string]: { access_token: string; refresh_token?: string } } = {};

export function storeUserTokens(userId: string, tokens: { access_token: string; refresh_token?: string }) {
  userTokens[userId] = tokens;
}

export function getUserTokens(userId: string) {
  return userTokens[userId];
}
