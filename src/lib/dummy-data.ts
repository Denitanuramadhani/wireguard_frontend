// Dummy data for dashboard preview
// Will be replaced with real API calls later

export const dummyStats = {
  totalDevices: 42,
  activeDevices: 28,
  totalUsers: 15,
  totalTraffic: 0,
}

export const dummyTrafficData = [
  { date: "2024-01-01T00:00:00", traffic: 1024000 },
  { date: "2024-01-01T01:00:00", traffic: 2048000 },
  { date: "2024-01-01T02:00:00", traffic: 1536000 },
  { date: "2024-01-01T03:00:00", traffic: 3072000 },
  { date: "2024-01-01T04:00:00", traffic: 2560000 },
  { date: "2024-01-01T05:00:00", traffic: 4096000 },
  { date: "2024-01-01T06:00:00", traffic: 5120000 },
  { date: "2024-01-01T07:00:00", traffic: 6144000 },
  { date: "2024-01-01T08:00:00", traffic: 7168000 },
  { date: "2024-01-01T09:00:00", traffic: 8192000 },
  { date: "2024-01-01T10:00:00", traffic: 9216000 },
  { date: "2024-01-01T11:00:00", traffic: 10240000 },
  { date: "2024-01-01T12:00:00", traffic: 11264000 },
  { date: "2024-01-01T13:00:00", traffic: 12288000 },
  { date: "2024-01-01T14:00:00", traffic: 13312000 },
  { date: "2024-01-01T15:00:00", traffic: 14336000 },
  { date: "2024-01-01T16:00:00", traffic: 15360000 },
  { date: "2024-01-01T17:00:00", traffic: 16384000 },
  { date: "2024-01-01T18:00:00", traffic: 17408000 },
  { date: "2024-01-01T19:00:00", traffic: 18432000 },
  { date: "2024-01-01T20:00:00", traffic: 19456000 },
  { date: "2024-01-01T21:00:00", traffic: 20480000 },
  { date: "2024-01-01T22:00:00", traffic: 21504000 },
  { date: "2024-01-01T23:00:00", traffic: 22528000 },
]

export const dummyDevices = [
  {
    id: 1,
    device_name: "My Laptop",
    vpn_ip: "10.0.0.2",
    status: "active",
    created_at: "2024-01-15T10:30:00",
    last_seen: "2024-01-20T14:25:00",
    transfer_rx: 1024000000,
    transfer_tx: 512000000,
    transfer_total: 1536000000,
  },
  {
    id: 2,
    device_name: "Work Phone",
    vpn_ip: "10.0.0.3",
    status: "active",
    created_at: "2024-01-16T09:15:00",
    last_seen: "2024-01-20T13:45:00",
    transfer_rx: 512000000,
    transfer_tx: 256000000,
    transfer_total: 768000000,
  },
  {
    id: 3,
    device_name: "Home Desktop",
    vpn_ip: "10.0.0.4",
    status: "revoked",
    created_at: "2024-01-10T08:00:00",
    last_seen: "2024-01-18T20:30:00",
    transfer_rx: 2048000000,
    transfer_tx: 1024000000,
    transfer_total: 3072000000,
  },
  {
    id: 4,
    device_name: "Tablet",
    vpn_ip: "10.0.0.5",
    status: "active",
    created_at: "2024-01-18T11:20:00",
    last_seen: "2024-01-20T12:10:00",
    transfer_rx: 256000000,
    transfer_tx: 128000000,
    transfer_total: 384000000,
  },
]

export const dummyUsers = [
  {
    username: "john.doe",
    wireguard_enabled: true,
    max_devices: 5,
    device_count: 3,
  },
  {
    username: "jane.smith",
    wireguard_enabled: true,
    max_devices: 3,
    device_count: 2,
  },
  {
    username: "bob.wilson",
    wireguard_enabled: false,
    max_devices: 5,
    device_count: 0,
  },
  {
    username: "alice.brown",
    wireguard_enabled: true,
    max_devices: 10,
    device_count: 5,
  },
  {
    username: "charlie.davis",
    wireguard_enabled: true,
    max_devices: 2,
    device_count: 1,
  },
]

export const dummyAlerts = [
  {
    severity: "critical",
    message: "High bandwidth usage detected on device My Laptop",
    timestamp: "2024-01-20T14:30:00",
  },
  {
    severity: "high",
    message: "Device Home Desktop has been inactive for 2 days",
    timestamp: "2024-01-20T12:15:00",
  },
  {
    severity: "medium",
    message: "New device registered: Tablet",
    timestamp: "2024-01-18T11:20:00",
  },
  {
    severity: "low",
    message: "Scheduled maintenance completed",
    timestamp: "2024-01-17T03:00:00",
  },
]

export const dummyAuditLogs = [
  {
    action: "device_added",
    ldap_uid: "john.doe",
    performed_by: "john.doe",
    timestamp: "2024-01-20T14:25:00",
  },
  {
    action: "device_revoked",
    ldap_uid: "jane.smith",
    performed_by: "admin",
    timestamp: "2024-01-19T16:45:00",
  },
  {
    action: "user_vpn_enabled",
    ldap_uid: "bob.wilson",
    performed_by: "admin",
    timestamp: "2024-01-18T10:30:00",
  },
  {
    action: "device_added",
    ldap_uid: "alice.brown",
    performed_by: "alice.brown",
    timestamp: "2024-01-17T09:15:00",
  },
]

export const dummyPeers = [
  {
    public_key: "ABCD1234EFGH5678IJKL9012MNOP3456QRST7890UVWX",
    allowed_ips: "10.0.0.2/32",
    transfer_rx: 1024000000,
    transfer_tx: 512000000,
    last_handshake: "2024-01-20T14:25:00",
  },
  {
    public_key: "WXYZ7890UVST3456QRMN9012OPKL5678IJGH1234EFCD",
    allowed_ips: "10.0.0.3/32",
    transfer_rx: 512000000,
    transfer_tx: 256000000,
    last_handshake: "2024-01-20T13:45:00",
  },
  {
    public_key: "EFGH5678IJKL9012MNOP3456QRST7890UVWX1234ABCD",
    allowed_ips: "10.0.0.4/32",
    transfer_rx: 2048000000,
    transfer_tx: 1024000000,
    last_handshake: "2024-01-18T20:30:00",
  },
  {
    public_key: "QRST7890UVWX1234ABCD5678EFGH9012IJKL3456MNOP",
    allowed_ips: "10.0.0.5/32",
    transfer_rx: 256000000,
    transfer_tx: 128000000,
    last_handshake: "2024-01-20T12:10:00",
  },
]

export const dummySystemStats = {
  statistics: {
    devices: {
      total: 42,
      active: 28,
      revoked: 10,
      expired: 4,
    },
    users: {
      total_with_devices: 15,
      total_enabled: 12,
    },
    alerts: {
      critical: 1,
      high: 3,
      medium: 5,
      low: 10,
    },
  },
}

