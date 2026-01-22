// API Client for WireGuard Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.denitanurramadhani.my.id';

export interface ApiResponse<T = any> {
  status: string;
  data?: T;
  message?: string;
  [key: string]: any;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const response = await this.request<{
      status: string;
      username: string;
      role: 'admin' | 'user';
      access_token: string;
      refresh_token: string;
      wireguard_enabled: boolean;
      max_devices: number;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', response.refresh_token);
        localStorage.setItem('user_role', response.role);
        localStorage.setItem('username', response.username);
      }
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request<{
      status: string;
      username: string;
      role: 'admin' | 'user';
      cn?: string;
      mail?: string;
    }>('/auth/me');
  }

  async logout() {
    this.setToken(null);
  }

  // Health check
  async healthCheck() {
    return this.request('/health/');
  }

  // Devices endpoints
  async getMyDevices() {
    return this.request('/devices/');
  }

  async addDevice(deviceName: string) {
    return this.request('/devices/add', {
      method: 'POST',
      body: JSON.stringify({ device_name: deviceName }),
    });
  }

  async getDevice(deviceId: number) {
    return this.request(`/devices/${deviceId}`);
  }

  async revokeDevice(deviceId: number) {
    return this.request(`/devices/${deviceId}`, {
      method: 'DELETE',
    });
  }

  async getDeviceQR(deviceId: number) {
    return this.request(`/devices/${deviceId}/qr`);
  }

  async regenerateQR(deviceId: number) {
    return this.request(`/devices/${deviceId}/regenerate-qr`, {
      method: 'POST',
    });
  }

  // Analytics endpoints
  async getTrafficAnalytics(deviceId?: number, hours: number = 24) {
    const params = new URLSearchParams();
    if (deviceId) params.append('device_id', deviceId.toString());
    params.append('hours', hours.toString());
    return this.request(`/analytics/traffic?${params.toString()}`);
  }

  async getTrafficSummary(deviceId?: number) {
    const params = deviceId ? `?device_id=${deviceId}` : '';
    return this.request(`/analytics/summary${params}`);
  }

  // My Access endpoint
  async getMyAccess() {
    return this.request('/myaccess/');
  }

  // Admin endpoints - User Management
  async getAdminUsers() {
    return this.request<{
      status: string;
      users: Array<{
        username: string;
        cn?: string;
        mail?: string;
        wireguard_enabled: boolean;
        max_devices: number;
        device_count: number;
        has_devices: boolean;
      }>;
      count: number;
    }>('/admin/users');
  }

  async getUserDetail(username: string) {
    return this.request<{
      status: string;
      username: string;
      role: 'admin' | 'user';
      ldap?: {
        cn?: string;
        mail?: string;
        wireguard_enabled: boolean;
        max_devices: number;
      };
      mysql?: {
        role?: string;
        created_at?: string;
        updated_at?: string;
      };
      devices: {
        count: number;
        active: number;
      };
    }>(`/admin/users/${username}`);
  }

  async createUser(username: string, password: string, role: 'admin' | 'user' = 'user') {
    return this.request<{
      status: string;
      message: string;
      username: string;
      uid_number: number;
      gid_number: number;
      role: 'admin' | 'user';
      ldap_created: boolean;
      mysql_created: boolean;
    }>('/admin/add-user', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    });
  }

  async updateUserRole(username: string, role: 'admin' | 'user') {
    return this.request<{
      status: string;
      message: string;
      username: string;
      role: 'admin' | 'user';
      old_role?: string;
    }>(`/admin/users/${username}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async deleteUser(username: string) {
    return this.request<{
      status: string;
      message: string;
      username: string;
      mysql_deleted: boolean;
      ldap_deleted: boolean;
      warning: string;
    }>(`/admin/users/${username}`, {
      method: 'DELETE',
    });
  }

  async getAdminDevices(status?: string, limit: number = 100, offset: number = 0) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.request(`/admin/devices?${params.toString()}`);
  }

  async getAdminDeviceDetails(deviceId: number) {
    return this.request(`/admin/devices/${deviceId}`);
  }

  async revokeAdminDevice(deviceId: number) {
    return this.request(`/admin/devices/${deviceId}`, {
      method: 'DELETE',
    });
  }

  async enableUserVPN(username: string) {
    return this.request(`/admin/users/${username}/enable`, {
      method: 'POST',
    });
  }

  async disableUserVPN(username: string) {
    return this.request(`/admin/users/${username}/disable`, {
      method: 'POST',
    });
  }

  async getSystemStats() {
    return this.request('/admin/monitoring/stats');
  }

  async getAlerts(limit: number = 50, severity?: string) {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (severity) params.append('severity', severity);
    return this.request(`/admin/monitoring/alerts?${params.toString()}`);
  }

  async getAuditLogs(
    action?: string,
    ldap_uid?: string,
    performed_by?: string,
    limit: number = 100,
    offset: number = 0
  ) {
    const params = new URLSearchParams();
    if (action) params.append('action', action);
    if (ldap_uid) params.append('ldap_uid', ldap_uid);
    if (performed_by) params.append('performed_by', performed_by);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.request(`/admin/monitoring/audit-logs?${params.toString()}`);
  }

  async getBandwidthLimits() {
    return this.request('/admin/bandwidth/limits');
  }

  async setBandwidthLimit(username: string, limitMB: number) {
    return this.request('/admin/bandwidth/limits', {
      method: 'POST',
      body: JSON.stringify({ ldap_uid: username, limit_mb: limitMB }),
    });
  }

  // Peers endpoint
  async getPeers() {
    return this.request('/peers/');
  }
}

export const api = new ApiClient(API_BASE_URL);


