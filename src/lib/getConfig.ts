export default function getConfig() {
  const apiKey = import.meta.env.VITE_X_API_KEY as string;
  const apiHost = import.meta.env.VITE_API_HOST as string;

  if (!apiKey || !apiHost) {
    throw new Error(
      "Missing required environment variables: VITE_X_API_KEY, VITE_API_HOST"
    );
  }

  return { apiKey, apiHost };
}
