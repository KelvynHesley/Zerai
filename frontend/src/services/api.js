import axios from "axios";
import { storage } from "../utils/storage";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://shaggy-anica-zerai-e688171d.koyeb.app/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Espera 10 segundos antes de desistir
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getItem("userToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Erro ao pegar token para requisição", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
