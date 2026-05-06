import { useEffect, useState } from "react";
import { IonIcon } from "@ionic/react";
import {
  checkmarkCircleOutline,
  alertCircleOutline,
  informationCircleOutline,
  closeOutline,
} from "ionicons/icons";
import type { Notification } from "../types/types";

interface NotificationToastProps {
  notifications: Notification[];
  onDismiss: (id: number) => void;
}

const iconMap = {
  success: checkmarkCircleOutline,
  error: alertCircleOutline,
  info: informationCircleOutline,
};

const colorMap = {
  success: {
    bg: "bg-white border-l-4 border-l-emerald-400",
    icon: "text-emerald-500",
    text: "text-zinc-700",
  },
  error: {
    bg: "bg-white border-l-4 border-l-red-400",
    icon: "text-red-500",
    text: "text-zinc-700",
  },
  info: {
    bg: "bg-white border-l-4 border-l-blue-400",
    icon: "text-blue-500",
    text: "text-zinc-700",
  },
};

const Toast: React.FC<{
  notification: Notification;
  onDismiss: (id: number) => void;
}> = ({ notification, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const mountTimer = setTimeout(() => setVisible(true), 10);
    const dismissTimer = setTimeout(() => handleDismiss(), 3500);
    return () => {
      clearTimeout(mountTimer);
      clearTimeout(dismissTimer);
    };
  }, []);

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(() => onDismiss(notification.id), 300);
  };

  const colors = colorMap[notification.type];

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-lg border border-zinc-100 w-72 transition-all duration-300 ease-out ${colors.bg} ${
        visible && !leaving
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-8"
      }`}
    >
      <IonIcon
        icon={iconMap[notification.type]}
        className={`text-lg shrink-0 ${colors.icon}`}
      />
      <p className={`text-sm flex-1 leading-snug font-medium ${colors.text}`}>
        {notification.message}
      </p>
      <button
        onClick={handleDismiss}
        className="text-zinc-300 hover:text-zinc-500 transition-colors shrink-0"
      >
        <IonIcon icon={closeOutline} className="text-base" />
      </button>
    </div>
  );
};

const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss,
}) => {
  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-200 flex flex-col gap-2 items-end pointer-events-none">
      {notifications.map((n) => (
        <div key={n.id} className="pointer-events-auto">
          <Toast notification={n} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
