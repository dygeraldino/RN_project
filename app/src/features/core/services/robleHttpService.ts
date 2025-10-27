import axios, { AxiosError, AxiosHeaders, AxiosInstance } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RobleConfig } from "../config/robleConfig";
import {
  AuthTokens,
  ForgotPasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
  SignupRequest,
  VerifyEmailRequest,
} from "../types/auth";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export class RobleHttpService {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshQueue: {
    resolve: () => void;
    reject: (error: Error) => void;
  }[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: RobleConfig.baseUrl,
      timeout: 30_000,
      headers: RobleConfig.defaultHeaders(),
    });

    this.client.interceptors.request.use(async (config) => {
      const isAuth = this.isAuthEndpoint(config.url ?? "");
      if (!isAuth) {
        const token = await this.getAccessToken();
        if (token) {
          if (config.headers instanceof AxiosHeaders) {
            config.headers.set("Authorization", `Bearer ${token}`);
          } else {
            config.headers = new AxiosHeaders({
              ...(config.headers as Record<string, unknown>),
              Authorization: `Bearer ${token}`,
            });
          }
        }
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !this.isAuthEndpoint(originalRequest.url ?? "") &&
          !originalRequest.headers?.["x-retry"]
        ) {
          try {
            await this.queueTokenRefresh();
            const token = await this.getAccessToken();
            if (!token) {
              throw new Error("Sin token");
            }

            const headers =
              originalRequest.headers instanceof AxiosHeaders
                ? originalRequest.headers
                : new AxiosHeaders(originalRequest.headers ?? {});
            headers.set("x-retry", "true");
            headers.set("Authorization", `Bearer ${token}`);
            originalRequest.headers = headers;

            return this.client(originalRequest);
          } catch (refreshError) {
            await this.clearTokens();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  get dio(): AxiosInstance {
    return this.client;
  }

  private isAuthEndpoint(path: string): boolean {
    const endpoints = [
      "/login",
      "/signup",
      "/signup-direct",
      "/refresh-token",
      "/forgot-password",
      "/reset-password",
      "/verify-email",
    ];
    return endpoints.some((endpoint) => path.includes(endpoint));
  }

  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  }

  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  }

  async saveTokens(tokens: AuthTokens): Promise<void> {
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, tokens.accessToken],
      [REFRESH_TOKEN_KEY, tokens.refreshToken],
    ]);
  }

  async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  }

  private async queueTokenRefresh(): Promise<void> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.refreshQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;
    try {
      await this.refreshToken();
      this.refreshQueue.forEach(({ resolve }) => resolve());
    } catch (error) {
      const normalized =
        error instanceof Error ? error : new Error(String(error));
      this.refreshQueue.forEach(({ reject }) => reject(normalized));
      throw normalized;
    } finally {
      this.refreshQueue = [];
      this.isRefreshing = false;
    }
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token disponible");

    const { data, status } = await this.client.post<AuthTokens>(
      RobleConfig.refreshTokenEndpoint,
      { refreshToken }
    );

    if (![200, 201].includes(status)) {
      throw new Error("No fue posible renovar el token");
    }

    await this.saveTokens(data);
  }

  async login(request: LoginRequest): Promise<AuthTokens> {
    const response = await this.client.post<AuthTokens>(
      RobleConfig.loginEndpoint,
      request
    );
    if ([200, 201].includes(response.status)) {
      await this.saveTokens(response.data);
      return response.data;
    }
    throw new Error("Credenciales inválidas");
  }

  async signup(request: SignupRequest): Promise<boolean> {
    const response = await this.client.post(
      RobleConfig.signupEndpoint,
      request
    );
    return [200, 201].includes(response.status);
  }

  async signupDirect(request: SignupRequest): Promise<boolean> {
    const response = await this.client.post(
      RobleConfig.signupDirectEndpoint,
      request
    );
    return [200, 201].includes(response.status);
  }

  async verifyEmail(request: VerifyEmailRequest): Promise<boolean> {
    const response = await this.client.post(
      RobleConfig.verifyEmailEndpoint,
      request
    );
    return [200, 201].includes(response.status);
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<boolean> {
    const response = await this.client.post(
      RobleConfig.forgotPasswordEndpoint,
      request
    );
    return response.status === 200;
  }

  async resetPassword(request: ResetPasswordRequest): Promise<boolean> {
    const response = await this.client.post(
      RobleConfig.resetPasswordEndpoint,
      request
    );
    return response.status === 200;
  }

  async logout(): Promise<boolean> {
    try {
      const response = await this.client.post(RobleConfig.logoutEndpoint);
      if (response.status === 200) {
        await this.clearTokens();
        return true;
      }
    } catch (error) {
      console.warn(
        "Error durante el logout remoto, limpiando localmente",
        error
      );
    }
    await this.clearTokens();
    return true;
  }

  async verifyToken(): Promise<boolean> {
    try {
      const response = await this.client.get(RobleConfig.verifyTokenEndpoint);
      return response.status === 200;
    } catch (error) {
      console.warn("Fallo al verificar token", error);
      return false;
    }
  }

  private handleError(error: AxiosError): Error {
    if (!error.response) {
      return new Error("Error de red: " + (error.message ?? "desconocido"));
    }

    const { status, data } = error.response;
    const message = (data as any)?.message ?? (data as any)?.error;

    switch (status) {
      case 400:
        return new Error(message ?? "Datos inválidos");
      case 401:
        return new Error(message ?? "Credenciales incorrectas");
      case 403:
        return new Error(message ?? "Acceso denegado");
      case 404:
        return new Error(
          message ?? `Servicio no encontrado. dbName: ${RobleConfig.dbName}`
        );
      case 500:
        return new Error(message ?? "Error interno del servidor");
      default:
        return new Error(
          message ??
            `Error HTTP ${status}: ${
              (error.response.data as any) ?? "Desconocido"
            }`
        );
    }
  }
}

export const robleHttpService = new RobleHttpService();
