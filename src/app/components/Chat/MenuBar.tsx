import { useTheme } from "@/app/ThemeProvider";
import {
  getCurrentPushSubscription,
  registerPushNotifications,
  unregisterPushNotification,
} from "@/notifications/pushService";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { BellOff, BellRing, Moon, Sun, Users } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { LoadingIndicator } from "stream-chat-react";
import Toast from "../Toast";

interface MenuBarProps {
  onUserMenuClick: () => void;
}

const MenuBar: FC<MenuBarProps> = ({ onUserMenuClick }) => {
  const { theme } = useTheme();
  return (
    <div className="flex items-center justify-between gap-3 border-e border-e-[#DBDDE1] bg-white p-3 dark:border-e-gray-800 dark:bg-[#17191c]">
      <UserButton
        afterSignOutUrl="/"
        appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
      />
      <div className="flex gap-6">
        <PushSubscriptionToggleButton />
        <span className="Show users">
          <Users className="cursor-pointer" onClick={onUserMenuClick} />
        </span>
        <ThemeToggleButton />
      </div>
    </div>
  );
};

const ThemeToggleButton = () => {
  const { theme, setTheme } = useTheme();

  if (theme === "dark") {
    return (
      <span title="Switch to light theme">
        <Moon className="cursor-pointer" onClick={() => setTheme("light")} />
      </span>
    );
  }

  return (
    <span title="Switch to dark theme">
      <Sun className="cursor-pointer" onClick={() => setTheme("dark")} />
    </span>
  );
};

const PushSubscriptionToggleButton = () => {
  const [hasActivePushSubscription, setHasActivePushSubscription] =
    useState<boolean>();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>();
  useEffect(() => {
    const getActivePushSubscription = async () => {
      const subscription = await getCurrentPushSubscription();
      setHasActivePushSubscription(!!subscription);
    };
    getActivePushSubscription();
  }, []);
  const setPushNotificationEnabled = async (enabled: boolean) => {
    if (loading) return;
    setLoading(true);
    setMsg(undefined);
    try {
      if (enabled) {
        await registerPushNotifications();
      } else {
        await unregisterPushNotification();
      }
      setMsg(`Push notifications ${enabled ? "enabled" : "disabled"}`);
      setHasActivePushSubscription(enabled);
    } catch (error) {
      console.error(error);
      if (enabled && Notification.permission === "denied") {
        alert("Please enable push notification in your browser settings");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  if (hasActivePushSubscription === undefined) return null;
  return (
    <div className="relative">
      {loading && (
        <span className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <LoadingIndicator />
        </span>
      )}
      {msg && (
        <Toast className="shadowm-md absolute left-1/2 top-8 z-10 -translate-x-1/2 rounded-lg bg-white px-2 py-1 dark:bg-black">
          {msg}
        </Toast>
      )}
      {hasActivePushSubscription ? (
        <span title="Disable push notifications on this device">
          <BellOff
            onClick={() => setPushNotificationEnabled(false)}
            className={`cursor-pointer ${loading ? "opacity-10" : ""}`}
          />
        </span>
      ) : (
        <span title="Enable push notifications on this device">
          <BellRing
            onClick={() => setPushNotificationEnabled(true)}
            className={`cursor-pointer ${loading ? "opacity-10" : ""}`}
          />
        </span>
      )}
    </div>
  );
};

export default MenuBar;
