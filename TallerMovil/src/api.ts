import { Platform } from "react-native";

export type Cliente = {
  id: number;
  nombreCompleto: string;
  telefono?: string | null;
  email?: string | null;
  direccion?: string | null;
  fechaRegistro: string;
};

export type Vehiculo = {
  id: number;
  clienteId: number;
  clienteNombre?: string | null;
  placa: string;
  vin?: string | null;
  marca: string;
  modelo: string;
  anio?: number | null;
  color?: string | null;
  fechaRegistro: string;
};

export type Mantenimiento = {
  id: number;
  vehiculoId: number;
  placa?: string | null;
  marca?: string | null;
  modelo?: string | null;
  fechaServicio: string;
  tipoServicio: string;
  descripcion: string;
  kilometraje?: number | null;
  costo: number;
  tecnico?: string | null;
  recomendaciones?: string | null;
  proximoMantenimiento?: string | null;
};

export type Sesion = {
  token: string;
  expiraEn: string;
  nombreUsuario: string;
  rol: string;
};

const defaultBaseUrl = Platform.OS === "android"
  ? "http://10.0.2.2:5250"
  : "http://localhost:5250";

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || defaultBaseUrl
).replace(/\/+$/, "");

let currentToken: string | null = null;

export function setApiToken(token: string | null) {
  currentToken = token;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (currentToken) headers.set("Authorization", "Bearer " + currentToken);

  let response: Response;
  try {
    response = await fetch(API_BASE_URL + path, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("No se pudo conectar con la API. Comprueba la URL y que el servidor esté activo.");
  }

  if (!response.ok) {
    let message = "La solicitud no pudo completarse.";
    try {
      const body = await response.json();
      message = body.mensaje || body.title || body.message || message;
    } catch {
      // Respuesta sin JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return await response.json() as T;
}

export function jsonBody(value: unknown) {
  return JSON.stringify(value);
}
