"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, BellRing } from "lucide-react";

const enabledKey = "wardrobe-daily-notifications";
const lastShownKey = "wardrobe-daily-notification-date";
const notificationHour = 9;

type OutfitNotification = {
  title: string;
  body: string;
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const getNextNotificationDelay = () => {
  const now = new Date();
  const next = new Date(now);

  next.setHours(notificationHour, 0, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  return next.getTime() - now.getTime();
};

export default function DailyOutfitBell() {
  const timeoutRef = useRef<number | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const clearScheduledNotification = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showDailySuggestion = useCallback(async (force = false) => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const today = getTodayKey();
    if (!force && window.localStorage.getItem(lastShownKey) === today) {
      return;
    }

    const response = await fetch("/api/daily-outfit");
    const suggestion = (await response.json()) as OutfitNotification;

    if (!response.ok) {
      setStatus("Sign in to get outfit reminders.");
      return;
    }

    new Notification(suggestion.title, {
      body: suggestion.body,
      icon: "/favicon.ico",
    });

    window.localStorage.setItem(lastShownKey, today);
  }, []);

  const scheduleDailySuggestion = useCallback(() => {
    clearScheduledNotification();

    timeoutRef.current = window.setTimeout(async () => {
      await showDailySuggestion();
      timeoutRef.current = window.setInterval(() => {
        void showDailySuggestion();
      }, 24 * 60 * 60 * 1000);
    }, getNextNotificationDelay());
  }, [clearScheduledNotification, showDailySuggestion]);

  useEffect(() => {
    const savedEnabled = window.localStorage.getItem(enabledKey) === "true";
    const canNotify = "Notification" in window;
    const enabled = savedEnabled && canNotify && Notification.permission === "granted";

    const syncEnabledState = window.setTimeout(() => setIsEnabled(enabled), 0);

    if (enabled) {
      scheduleDailySuggestion();
    }

    return () => {
      window.clearTimeout(syncEnabledState);
      clearScheduledNotification();
    };
  }, [clearScheduledNotification, scheduleDailySuggestion]);

  useEffect(() => {
    if (!status) {
      return;
    }

    const hideStatus = window.setTimeout(() => setStatus(null), 2000);

    return () => window.clearTimeout(hideStatus);
  }, [status]);

  const toggleNotifications = async () => {
    setStatus(null);

    if (!("Notification" in window)) {
      setStatus("This browser does not support notifications.");
      return;
    }

    if (isEnabled) {
      clearScheduledNotification();
      window.localStorage.setItem(enabledKey, "false");
      setIsEnabled(false);
      setStatus("Daily outfit reminders are off.");
      return;
    }

    const permission =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();

    if (permission !== "granted") {
      setStatus("Notifications were not allowed.");
      return;
    }

    window.localStorage.setItem(enabledKey, "true");
    setIsEnabled(true);
    setStatus("Daily outfit reminders are on.");
    await showDailySuggestion(true);
    scheduleDailySuggestion();
  };

  const BellIcon = isEnabled ? BellRing : Bell;

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={toggleNotifications}
        className={`p-2 rounded-full transition-colors ${
          isEnabled
            ? "bg-nebula-primary/15 text-nebula-primary"
            : "hover:bg-black/5 text-nebula-on-surface/60"
        }`}
        aria-label={isEnabled ? "Disable daily outfit notifications" : "Enable daily outfit notifications"}
      >
        <BellIcon size={20} />
      </button>

      {status && (
        <div className="absolute right-0 top-11 z-50 w-56 rounded-nebula-inner border border-black/5 bg-nebula-surface px-4 py-3 text-xs font-bold text-nebula-on-surface/70 shadow-xl">
          {status}
        </div>
      )}
    </div>
  );
}
