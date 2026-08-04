"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { IUser, IAgreement } from "@/types";
import {
  Camera, Save, Lock, Bell, AlertCircle,
  CheckCircle, Loader2
} from "lucide-react";

interface NotificationPrefs {
  agreementSigned: boolean;
  pendingReminder: boolean;
  expiryWarning: boolean;
  newComment: boolean;
  weeklySummary: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  agreementSigned: true,
  pendingReminder: true,
  expiryWarning: true,
  newComment: false,
  weeklySummary: false,
};

const NOTIFICATION_LABELS: Record<keyof NotificationPrefs, string> = {
  agreementSigned: "Agreement signed by party",
  pendingReminder: "Pending signature reminder",
  expiryWarning: "Agreement expiry warning",
  newComment: "New comment on agreement",
  weeklySummary: "Weekly summary digest",
};

export default function ProfilePage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [agreements, setAgreements] = useState<IAgreement[]>([]);
  const [loading, setLoading] = useState(true);

  // Personal info form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Notification preferences
  const [notifications, setNotifications] = useState<NotificationPrefs>(DEFAULT_NOTIFICATIONS);
  const [notifSaving, setNotifSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const [profileRes, agreementsRes] = await Promise.all([
        api.user.getMe(),
        api.agreements.getAll(),
      ]);

      const userData = profileRes.data;
      setUser(userData);
      setName(userData.name || "");
      setEmail(userData.email || "");
      setPhone(userData.phone || "");
      setAgreements(agreementsRes.data || []);

      // Load notification prefs from user preferences
      if (userData.preferences?.notifications) {
        const stored = userData.preferences.notifications;
        setNotifications({
          agreementSigned: stored.agreementSigned ?? DEFAULT_NOTIFICATIONS.agreementSigned,
          pendingReminder: stored.pendingReminder ?? DEFAULT_NOTIFICATIONS.pendingReminder,
          expiryWarning: stored.expiryWarning ?? DEFAULT_NOTIFICATIONS.expiryWarning,
          newComment: stored.newComment ?? DEFAULT_NOTIFICATIONS.newComment,
          weeklySummary: stored.weeklySummary ?? DEFAULT_NOTIFICATIONS.weeklySummary,
        });
      }
    } catch (err: unknown) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (localStorage.getItem("token")) {
        loadProfile();
      } else {
        setLoading(false);
      }
    }, 0);
  }, [loadProfile]);

  // Stats computation
  const stats = {
    total: agreements.length,
    signed: agreements.filter((a) => a.status === "signed").length,
    pending: agreements.filter((a) => a.status === "pending" || a.status === "partially_signed").length,
    expired: agreements.filter((a) => a.status === "expired").length,
  };

  // Format join date
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "";

  // Initials
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "U";

  // Handlers
  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const res = await api.user.updateProfile({ name, phone });
      // Update localStorage so sidebar reflects changes
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.name = res.data.name;
        parsed.phone = res.data.phone;
        localStorage.setItem("user", JSON.stringify(parsed));
      }
      setUser(res.data);
      setProfileMsg({ type: "success", text: "Profile updated successfully" });
    } catch (err: unknown) {
      setProfileMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to update profile" });
    } finally {
      setProfileSaving(false);
      setTimeout(() => setProfileMsg(null), 4000);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordMsg({ type: "error", text: "Please fill in both password fields" });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "New password must be at least 8 characters" });
      return;
    }
    setPasswordSaving(true);
    setPasswordMsg(null);
    try {
      await api.user.updatePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordMsg({ type: "success", text: "Password updated successfully" });
    } catch (err: unknown) {
      setPasswordMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to update password" });
    } finally {
      setPasswordSaving(false);
      setTimeout(() => setPasswordMsg(null), 4000);
    }
  };

  const handleToggleNotification = async (key: keyof NotificationPrefs) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    setNotifSaving(true);
    try {
      await api.user.updateNotifications(updated as unknown as Record<string, boolean>);
    } catch (err: unknown) {
      // Revert on failure
      setNotifications(notifications);
      console.error("Failed to update notifications:", err);
    } finally {
      setNotifSaving(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex flex-col gap-6 pb-12 mx-auto w-full animate-pulse">
        <div>
          <div className="h-8 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-200 rounded" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-(--color-bg-card) rounded-2xl border border-[#DCD8CC]/50 p-8 h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12 mx-auto w-full">
      {/* Title */}
      <div>
        <h1 className="font-bold text-2xl md:text-3xl text-gray-900 tracking-tight">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* User Identity Card */}
      <div className="bg-(--color-bg-card) rounded-2xl border border-[#DCD8CC]/50 p-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-16 h-16 rounded-full bg-[#153A22] flex items-center justify-center text-white font-bold text-xl select-none">
              {initials}
            </div>
            <button className="absolute inset-0 w-full h-full rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg text-gray-900 truncate">{user?.name}</h2>
            <p className="text-gray-500 text-sm truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-[#E8F3EC] text-[#3B7B56] text-[11px] font-bold px-2.5 py-1 rounded-full capitalize">
                <CheckCircle className="w-3 h-3" />
                {user?.plan || "free"} Plan
              </span>
              {memberSince && (
                <span className="text-[11px] text-gray-400 font-medium bg-[#E2DFD6] px-2.5 py-1 rounded-full">
                  Member since {memberSince}
                </span>
              )}
            </div>
          </div>

          {/* Upload Photo button (desktop) */}
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 border border-[#DCD8CC] rounded-lg text-xs font-bold text-gray-700 hover:bg-[#E2DFD6] transition-colors">
            <Camera className="w-4 h-4" />
            Upload Photo
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-(--color-bg-card) rounded-2xl border border-[#DCD8CC]/50 p-6">
        <h3 className="font-bold text-base text-gray-900 mb-5">Personal Information</h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="profile-name" className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-page)] border border-[#DCD8CC]/60 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#153A22]/20 focus:border-[#153A22] transition-all placeholder:text-gray-400"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 rounded-lg bg-[#E2DFD6]/40 border border-[#DCD8CC]/60 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="profile-phone" className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-page)] border border-[#DCD8CC]/60 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#153A22]/20 focus:border-[#153A22] transition-all placeholder:text-gray-400"
              placeholder="+234 xxx xxxx xxxx"
            />
          </div>
        </div>

        {profileMsg && (
          <div className={`mt-4 flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg ${
            profileMsg.type === "success" ? "bg-[#E8F3EC] text-[#3B7B56]" : "bg-red-50 text-red-600"
          }`}>
            {profileMsg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {profileMsg.text}
          </div>
        )}

        <button
          onClick={handleSaveProfile}
          disabled={profileSaving}
          className="mt-5 bg-[#153A22] hover:bg-[#112d1b] text-white px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Agreement Statistics */}
      <div className="bg-(--color-bg-card) rounded-2xl border border-[#DCD8CC]/50 p-6">
        <h3 className="font-bold text-base text-gray-900 mb-5">Agreement Statistics</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[var(--color-bg-page)] rounded-xl p-4 text-center border border-[#DCD8CC]/40">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Total</p>
          </div>
          <div className="bg-[var(--color-bg-page)] rounded-xl p-4 text-center border border-[#DCD8CC]/40">
            <p className="text-2xl font-bold text-[#3B7B56]">{stats.signed}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Signed</p>
          </div>
          <div className="bg-[var(--color-bg-page)] rounded-xl p-4 text-center border border-[#DCD8CC]/40">
            <p className="text-2xl font-bold text-[#C6A55C]">{stats.pending}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Pending</p>
          </div>
          <div className="bg-[var(--color-bg-page)] rounded-xl p-4 text-center border border-[#DCD8CC]/40">
            <p className="text-2xl font-bold text-[#B84C3A]">{stats.expired}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Expired</p>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-(--color-bg-card) rounded-2xl border border-[#DCD8CC]/50 p-6">
        <h3 className="font-bold text-base text-gray-900 mb-5 flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-500" />
          Security
        </h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-page)] border border-[#DCD8CC]/60 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#153A22]/20 focus:border-[#153A22] transition-all placeholder:text-gray-400"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="new-password" className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg-page)] border border-[#DCD8CC]/60 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#153A22]/20 focus:border-[#153A22] transition-all placeholder:text-gray-400"
              placeholder="••••••••"
            />
          </div>
        </div>

        {passwordMsg && (
          <div className={`mt-4 flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg ${
            passwordMsg.type === "success" ? "bg-[#E8F3EC] text-[#3B7B56]" : "bg-red-50 text-red-600"
          }`}>
            {passwordMsg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {passwordMsg.text}
          </div>
        )}

        <button
          onClick={handleUpdatePassword}
          disabled={passwordSaving}
          className="mt-5 bg-[var(--color-bg-page)] hover:bg-[#E2DFD6] text-gray-900 px-5 py-2.5 rounded-lg font-bold text-xs border border-[#DCD8CC] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          Update Password
        </button>
      </div>

      {/* Notification Preferences */}
      <div className="bg-(--color-bg-card) rounded-2xl border border-[#DCD8CC]/50 p-6">
        <h3 className="font-bold text-base text-gray-900 mb-5 flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-500" />
          Notification Preferences
          {notifSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
        </h3>

        <div className="space-y-1">
          {(Object.keys(NOTIFICATION_LABELS) as (keyof NotificationPrefs)[]).map((key) => (
            <div
              key={key}
              className="flex items-center justify-between py-3 px-1 border-b border-[#DCD8CC]/30 last:border-b-0"
            >
              <span className="text-sm text-gray-700">{NOTIFICATION_LABELS[key]}</span>
              <button
                onClick={() => handleToggleNotification(key)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#153A22]/20 ${
                  notifications[key] ? "bg-[#153A22]" : "bg-[#D5D1C7]"
                }`}
                role="switch"
                aria-checked={notifications[key]}
                aria-label={NOTIFICATION_LABELS[key]}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    notifications[key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
