import { preparePKCE } from '@/utils/auth-crypto';

const MOTHER_API_URL = import.meta.env.VITE_MOTHER_API_URL || 'http://localhost:8000';
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

export default {
  async login() {
    const challenge = await preparePKCE();

    const authUrl = new URL(`${MOTHER_API_URL}/oauth/authorize`);
    authUrl.searchParams.append('client_id', CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', '*');
    authUrl.searchParams.append('code_challenge', challenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');

    // Anti-Race Condition: setTimeout de 150ms
    setTimeout(() => {
        window.location.href = authUrl.toString();
    }, 150);
  },

  logout() {
    this.logoutLocal();
    window.location.href = `${MOTHER_API_URL}/logout`;
  },

  logoutLocal() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    sessionStorage.removeItem('pkce_verifier');
  }
};
