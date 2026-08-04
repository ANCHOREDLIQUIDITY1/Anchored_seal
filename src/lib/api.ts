import { CreateAgreementPayload } from '@/types';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const api = {
  auth: {
    login: async (credentials: Record<string, string>) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      return data;
    },
    register: async (credentials: Record<string, string>) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      return data;
    }
  },
  agreements: {
    getAll: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/agreements`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch agreements');
      return data;
    },
    getById: async (id: string) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/agreements/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch agreement');
      return data;
    },
    create: async (payload: CreateAgreementPayload | Record<string, unknown>) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/agreements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create agreement');
      return data;
    }
  },
  user: {
    getMe: async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
      return data;
    },
    updateProfile: async (payload: { name?: string; phone?: string }) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');
      return data;
    },
    updatePassword: async (payload: { currentPassword: string; newPassword: string }) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users/me/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update password');
      return data;
    },
    updateNotifications: async (notifications: Record<string, boolean>) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/users/me/notifications`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notifications })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update notifications');
      return data;
    }
  }
};
