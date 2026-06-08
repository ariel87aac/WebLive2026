const productionWebHost = 'live.limiteflix.com';
const productionApiUrl = 'https://liveapi.limiteflix.com';
const productionTurnHost = 'liveturn.limiteflix.com';

type RuntimeConfig = {
  apiBaseUrl?: string;
  socketBaseUrl?: string;
  turnUrl?: string;
  turnUsername?: string;
  turnCredential?: string;
};

declare global {
  interface Window {
    __WEBLIVE_CONFIG__?: RuntimeConfig;
  }
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function resolveDefaultApiBaseUrl(): string {
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  if (window.location.hostname === productionWebHost) {
    return productionApiUrl;
  }

  const protocol =
    window.location.protocol === 'https:' || !isLocalhost ? 'https:' : 'http:';

  return `${protocol}//${window.location.hostname}:3000`;
}

const runtimeConfig = window.__WEBLIVE_CONFIG__ ?? {};
const configuredApiUrl =
  runtimeConfig.apiBaseUrl?.trim() || resolveDefaultApiBaseUrl();

export const API_BASE_URL = trimTrailingSlash(configuredApiUrl);
export const SOCKET_BASE_URL = trimTrailingSlash(
  runtimeConfig.socketBaseUrl?.trim() || API_BASE_URL,
);

const turnUrl =
  runtimeConfig.turnUrl?.trim() || `turns:${productionTurnHost}:5349`;
const turnUsername = runtimeConfig.turnUsername?.trim();
const turnCredential = runtimeConfig.turnCredential?.trim();

export const WEBRTC_ICE_SERVERS: RTCIceServer[] = [
  { urls: `stun:${productionTurnHost}:3478` },
  ...(turnUsername && turnCredential
    ? [
        {
          urls: turnUrl,
          username: turnUsername,
          credential: turnCredential,
        } satisfies RTCIceServer,
      ]
    : []),
  { urls: 'stun:stun.l.google.com:19302' },
];
