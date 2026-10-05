import { User, UserRole } from '../types';

const STORAGE_KEYS = {
  USERS: 'safarsindh_users_v1',
  SESSION: 'safarsindh_session_v1',
  PENDING_OTPS: 'safarsindh_otps_v1',
};

// Fallback hash implementation if crypto.subtle is unavailable (e.g. HTTP / insecure context)
async function hashPassword(password: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(password);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }

  // Simple deterministic string hash fallback
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'fallback_' + Math.abs(hash).toString(16);
}

/**
 * Normalizes Pakistani mobile numbers to +923XXXXXXXXX
 * Supports:
 * - 03001234567 -> +923001234567
 * - 0300 1234567 -> +923001234567
 * - +92 300 1234567 -> +923001234567
 * - 923001234567 -> +923001234567
 * - 00923001234567 -> +923001234567
 */
export function normalizePhone(raw: string): string {
  if (!raw) return '';
  // Remove all non-digits except a leading +
  let cleaned = raw.trim().replace(/[^\d+]/g, '');

  if (cleaned.startsWith('0092')) {
    cleaned = '+92' + cleaned.slice(4);
  } else if (cleaned.startsWith('92') && !cleaned.startsWith('+92')) {
    cleaned = '+92' + cleaned.slice(2);
  } else if (cleaned.startsWith('03')) {
    cleaned = '+92' + cleaned.slice(1);
  } else if (cleaned.startsWith('3') && cleaned.length === 10) {
    cleaned = '+92' + cleaned;
  }

  return cleaned;
}

export function isValidPakistaniPhone(phone: string): boolean {
  const norm = normalizePhone(phone);
  // Must be +92 followed by 3 and 9 digits (total 13 chars)
  return /^\+923\d{9}$/.test(norm);
}

// Seed demo accounts
const SEED_USERS: User[] = [
  {
    id: 'usr-pass-1',
    name: 'Aaryan Khan',
    phone: '+923001234567',
    role: 'passenger',
    emergencyContact: '+923009988776',
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'usr-drv-1',
    name: 'Ali Raza Soomro',
    phone: '+923002345678',
    role: 'driver',
    emergencyContact: '+923001122334',
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'usr-admin-1',
    name: 'SafarSindh Admin',
    phone: '+923000000000',
    role: 'admin',
    createdAt: Date.now() - 90 * 86400000,
  },
];

async function ensureSeedUsers() {
  if (typeof window === 'undefined') return;

  const existingRaw = localStorage.getItem(STORAGE_KEYS.USERS);
  let users: User[] = existingRaw ? JSON.parse(existingRaw) : [];

  const passengerHash = await hashPassword('123456');
  const driverHash = await hashPassword('123456');
  const adminHash = await hashPassword('admin123');

  let updated = false;

  SEED_USERS.forEach((seedUser) => {
    const existingIndex = users.findIndex(
      (u) => u.phone === seedUser.phone || u.id === seedUser.id
    );
    const hash =
      seedUser.role === 'admin'
        ? adminHash
        : seedUser.role === 'driver'
        ? driverHash
        : passengerHash;

    if (existingIndex === -1) {
      users.push({ ...seedUser, passwordHash: hash });
      updated = true;
    } else if (!users[existingIndex].passwordHash) {
      users[existingIndex].passwordHash = hash;
      updated = true;
    }
  });

  if (updated || !existingRaw) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
}

// Call seed initialization
ensureSeedUsers();

export function getUsers(): User[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getSession(): User | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function logOut(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  } catch {
    // Ignore error
  }
}

export async function logIn(phone: string, password: string): Promise<User> {
  await ensureSeedUsers();
  const normalized = normalizePhone(phone);
  if (!isValidPakistaniPhone(normalized)) {
    throw new Error('INVALID_PHONE');
  }

  const users = getUsers();
  const user = users.find((u) => u.phone === normalized);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const hash = await hashPassword(password);
  if (user.passwordHash && user.passwordHash !== hash) {
    throw new Error('WRONG_PASSWORD');
  }

  const sessionUser: User = {
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    emergencyContact: user.emergencyContact,
    createdAt: user.createdAt,
  };

  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionUser));
  return sessionUser;
}

export function generateOtp(phone: string): string {
  const normalized = normalizePhone(phone);
  // Generate random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    const otps = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_OTPS) || '{}');
    otps[normalized] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };
    localStorage.setItem(STORAGE_KEYS.PENDING_OTPS, JSON.stringify(otps));
  } catch {
    // Fallback
  }
  return otp;
}

export function verifyOtp(phone: string, enteredOtp: string): boolean {
  const normalized = normalizePhone(phone);
  try {
    const otps = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_OTPS) || '{}');
    const record = otps[normalized];
    if (!record) return false;
    if (Date.now() > record.expiresAt) return false;
    return record.otp === enteredOtp.trim();
  } catch {
    return false;
  }
}

export async function signUp(data: {
  name: string;
  phone: string;
  password: string;
  role: 'passenger' | 'driver';
  emergencyContact?: string;
}): Promise<User> {
  await ensureSeedUsers();
  const normalized = normalizePhone(data.phone);

  if (!isValidPakistaniPhone(normalized)) {
    throw new Error('INVALID_PHONE');
  }
  if (!data.name || data.name.trim().length < 2) {
    throw new Error('INVALID_NAME');
  }
  if (!data.password || data.password.length < 6) {
    throw new Error('WEAK_PASSWORD');
  }
  // Admin accounts cannot be created via public sign up
  if ((data.role as string) === 'admin') {
    throw new Error('ADMIN_SIGNUP_NOT_ALLOWED');
  }

  const users = getUsers();
  if (users.some((u) => u.phone === normalized)) {
    throw new Error('PHONE_ALREADY_REGISTERED');
  }

  const passwordHash = await hashPassword(data.password);
  const newUser: User = {
    id: 'usr-' + (data.role === 'driver' ? 'drv-' : 'pass-') + Math.random().toString(36).substring(2, 9),
    name: data.name.trim(),
    phone: normalized,
    role: data.role,
    passwordHash,
    emergencyContact: data.emergencyContact || '',
    createdAt: Date.now(),
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  const sessionUser: User = {
    id: newUser.id,
    name: newUser.name,
    phone: newUser.phone,
    role: newUser.role,
    emergencyContact: newUser.emergencyContact,
    createdAt: newUser.createdAt,
  };

  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionUser));
  return sessionUser;
}

export async function updateProfile(userId: string, updates: Partial<User>): Promise<User> {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) {
    throw new Error('USER_NOT_FOUND');
  }

  // Prevent changing role or id
  delete updates.id;
  delete updates.role;
  delete updates.passwordHash;

  if (updates.phone) {
    updates.phone = normalizePhone(updates.phone);
  }

  const updatedUser: User = {
    ...users[index],
    ...updates,
  };

  users[index] = updatedUser;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  const currentSession = getSession();
  if (currentSession && currentSession.id === userId) {
    const newSession: User = {
      ...currentSession,
      ...updates,
    };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newSession));
    return newSession;
  }

  return updatedUser;
}
