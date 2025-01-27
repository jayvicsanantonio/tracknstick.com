import axios from "axios";
import getConfig from "@/lib/getConfig";

const { apiKey, apiHost } = getConfig();
export const apiClient = axios.create({
  baseURL: `${apiHost}`,
  headers: { "X-API-Key": apiKey },
});
