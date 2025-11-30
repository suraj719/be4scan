const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Scan {
  id: string;
  name: string;
  type: string;
  target: string;
  status: "queued" | "running" | "completed" | "failed";
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  findingsCount: number;
  errorMessage?: string;
}

export interface Finding {
  id: string;
  title: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  description?: string;
  resource: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage on initialization
    this.token = localStorage.getItem("auth_token");
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Request failed" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>("/api/auth/me");
  }

  // Scan endpoints
  async createScan(name: string, type: string, target: string): Promise<Scan> {
    return this.request<Scan>("/api/scans", {
      method: "POST",
      body: JSON.stringify({ name, type, target }),
    });
  }

  async getScans(): Promise<Scan[]> {
    return this.request<Scan[]>("/api/scans");
  }

  async getScan(id: string): Promise<Scan> {
    return this.request<Scan>(`/api/scans/${id}`);
  }

  // Finding endpoints
  async getFindings(scanId: string): Promise<Finding[]> {
    return this.request<Finding[]>(`/api/findings?scanId=${scanId}`);
  }

  // Artifact download
  getArtifactUrl(scanId: string): string {
    return `${this.baseUrl}/api/artifacts/${scanId}/nuclei.json`;
  }

  async downloadArtifact(scanId: string): Promise<Blob> {
    const url = this.getArtifactUrl(scanId);
    const headers: Record<string, string> = {};
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error("Failed to download artifact");
    return response.blob();
  }
}

export const api = new ApiClient(API_BASE_URL);
