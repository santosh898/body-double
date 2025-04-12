type NotificationType =
  | "message"
  | "pairRequest"
  | "pairAccepted"
  | "callConnected";

interface NotificationOptions {
  title: string;
  body: string;
  type: NotificationType;
}

class NotificationManager {
  private static instance: NotificationManager;
  private permission: NotificationPermission = "default";
  private isTabActive = true;

  private constructor() {
    // Initialize document visibility listener
    document.addEventListener("visibilitychange", () => {
      this.isTabActive = document.visibilityState === "visible";
    });
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  public async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    if (this.permission === "granted") {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  public async showNotification({
    title,
    body,
    type,
  }: NotificationOptions): Promise<void> {
    // Only show notifications when the tab is not active
    if (this.isTabActive) {
      return;
    }
    console.log(await this.requestPermission());

    if (this.permission !== "granted") {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: "/favicon.ico",
        tag: type, // This prevents duplicate notifications of the same type
      });

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  }
}

export const notificationManager = NotificationManager.getInstance();
