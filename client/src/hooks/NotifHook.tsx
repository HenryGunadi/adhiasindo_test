import { useState, useCallback } from "react";
import type { Notification } from "../types/types";

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback(
    (message: string, type: Notification["type"] = "success") => {
      const id = Date.now();
      setNotifications((prev) => [...prev, { id, message, type }]);
    },
    [],
  );

  const dismiss = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications, notify, dismiss };
};
