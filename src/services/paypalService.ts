import axios from "axios";

// A simple in-memory cache for the token
let tokenCache = {
  accessToken: null as string | null,
  expiresAt: 0,
};

/**
 * Fetches a PayPal OAuth2 access token, using a cache to avoid redundant requests.
 * @returns {Promise<string>} A promise that resolves to the access token.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const now = Date.now();
  // If we have a token and it's not expired (with a 5-minute buffer), return it
  if (tokenCache.accessToken && tokenCache.expiresAt > now + 5 * 60 * 1000) {
    return tokenCache.accessToken;
  }

  const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API } = process.env;
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await axios<{ access_token: string; expires_in: number }>({
    method: "post",
    url: `${PAYPAL_API}/v1/oauth2/token`,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: "grant_type=client_credentials",
  });

  const { access_token, expires_in } = response.data;

  // Store the new token and its expiration time in the cache
  tokenCache = {
    accessToken: access_token,
    expiresAt: now + expires_in * 1000,
  };

  return access_token;
}
