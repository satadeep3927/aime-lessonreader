const ENV_KEY = "aime_env";
const PASSPHRASE = "aime-staging-2026";

export type AppEnv = "prod" | "staging";

export const ENV_URLS: Record<AppEnv, string> = {
  prod: "https://api.aime52.ai",
  staging: "https://staging-api.aime52.ai",
};

export function getEnv(): AppEnv {
  const stored = localStorage.getItem(ENV_KEY);
  return stored === "staging" ? "staging" : "prod";
}

export function setEnv(env: AppEnv) {
  localStorage.setItem(ENV_KEY, env);
  applyEnv(env);
}

export function verifyPassphrase(input: string): boolean {
  return input === PASSPHRASE;
}

/** Apply env to the DOM (data attribute) and apiClient baseURL */
export function applyEnv(env: AppEnv) {
  document.documentElement.setAttribute("data-env", env);

  // Dynamically update axios baseURL — imported lazily to avoid circular deps
  import("@/lib/apiClient").then(({ apiClient }) => {
    apiClient.defaults.baseURL = ENV_URLS[env];
  });
}

/** Call once on app boot to sync DOM + apiClient with stored env */
export function initEnv() {
  applyEnv(getEnv());
}
