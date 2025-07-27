export function getConfig() {
  const apiHost = import.meta.env.VITE_API_HOST as string;

  if (!apiHost) {
    throw new Error('Missing required environment variable: VITE_API_HOST');
  }

  return { apiHost };
}
