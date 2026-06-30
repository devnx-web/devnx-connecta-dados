import { useIntl } from "react-intl";

import { useHealthCheck } from "core/api";
import { useWebappConfig } from "core/config";
import { Notification } from "core/services/Notification";
import { useNotificationService } from "core/services/Notification/NotificationService";

const HEALTH_NOTIFICATION_ID = "health.error";

export const useApiHealthPoll = (): void => {
  const { formatMessage } = useIntl();
  const { version } = useWebappConfig();
  const { registerNotification, unregisterNotificationById } = useNotificationService();
  const healthPollEnabled = !(process.env.NODE_ENV === "development" && version === "dev");

  const errorNotification: Notification = {
    id: HEALTH_NOTIFICATION_ID,
    text: formatMessage({ id: "notifications.error.health" }),
    type: "error",
  };

  useHealthCheck(
    () => registerNotification(errorNotification),
    () => unregisterNotificationById(HEALTH_NOTIFICATION_ID),
    healthPollEnabled
  );
};
