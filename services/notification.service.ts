// services/notification.service.ts
import { differenceInDays, format } from "date-fns";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { StorageItem } from "../types";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  private isInitialized = false;

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Notification permissions not granted");
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("expiry-alerts", {
          name: "Expiry Alerts",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#4CAF50",
        });
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Failed to request notification permissions:", error);
      return false;
    }
  }

  // Check if notifications are enabled
  async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Failed to check notification status:", error);
      return false;
    }
  }

  // Schedule notification for expiring item
  async scheduleExpiryNotification(
    item: StorageItem,
    daysBeforeExpiry: number = 1
  ): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        await this.requestPermissions();
      }

      if (!item.expiryDate) return null;

      const daysLeft = differenceInDays(item.expiryDate, new Date());

      if (daysLeft <= 0) return null; // Already expired

      // Calculate when to send notification
      const notificationDate = new Date(item.expiryDate);
      notificationDate.setDate(notificationDate.getDate() - daysBeforeExpiry);
      notificationDate.setHours(9, 0, 0, 0); // 9 AM

      // Don't schedule if notification time has passed
      if (notificationDate <= new Date()) return null;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ Item Expiring Soon!",
          body: `${item.name} expires in ${daysLeft} day${
            daysLeft > 1 ? "s" : ""
          } (${format(item.expiryDate, "MMM dd")})`,
          data: { itemId: item.id, itemName: item.name },
          sound: true,
        },
        trigger: {
          date: notificationDate,
        },
      });

      return notificationId;
    } catch (error) {
      console.error("Failed to schedule expiry notification:", error);
      return null;
    }
  }

  // Schedule daily summary notification
  async scheduleDailySummary(expiringItems: StorageItem[]): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.requestPermissions();
      }

      if (expiringItems.length === 0) return;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow

      const itemNames = expiringItems
        .slice(0, 3)
        .map((item) => item.name)
        .join(", ");
      const moreCount = expiringItems.length - 3;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🛒 Items Expiring Soon",
          body: `${itemNames}${
            moreCount > 0 ? ` and ${moreCount} more` : ""
          } expiring this week`,
          data: { type: "daily_summary" },
          sound: true,
        },
        trigger: {
          date: tomorrow,
        },
      });
    } catch (error) {
      console.error("Failed to schedule daily summary:", error);
    }
  }

  // Send immediate notification for expired items
  async sendExpiredItemNotification(item: StorageItem): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.requestPermissions();
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⚠️ Item Expired!",
          body: `${item.name} has expired. Consider removing it from storage.`,
          data: { itemId: item.id, type: "expired" },
          sound: true,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error("Failed to send expired item notification:", error);
    }
  }

  // Cancel all scheduled notifications for an item
  async cancelNotificationsForItem(itemId: string): Promise<void> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();

      for (const notification of scheduled) {
        if (notification.content.data?.itemId === itemId) {
          await Notifications.cancelScheduledNotificationAsync(
            notification.identifier
          );
        }
      }
    } catch (error) {
      console.error("Failed to cancel notifications:", error);
    }
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Failed to cancel all notifications:", error);
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Failed to get scheduled notifications:", error);
      return [];
    }
  }

  // Check and send notifications for expiring items
  async checkExpiringItems(
    storageItems: StorageItem[],
    warningDays: number = 3
  ): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.requestPermissions();
      }

      const expiringItems: StorageItem[] = [];
      const today = new Date();

      for (const item of storageItems) {
        if (!item.expiryDate) continue;

        const daysLeft = differenceInDays(item.expiryDate, today);

        // Expired
        if (daysLeft < 0) {
          await this.sendExpiredItemNotification(item);
        }
        // Expiring within warning days
        else if (daysLeft <= warningDays) {
          expiringItems.push(item);
          await this.scheduleExpiryNotification(item, 0);
        }
      }

      // Schedule daily summary if there are expiring items
      if (expiringItems.length > 0) {
        await this.scheduleDailySummary(expiringItems);
      }
    } catch (error) {
      console.error("Failed to check expiring items:", error);
    }
  }

  // Test notification (for debugging)
  async sendTestNotification(): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "✅ Test Notification",
          body: "Notifications are working correctly!",
          data: { type: "test" },
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Failed to send test notification:", error);
    }
  }
}

// Singleton instance
export const notificationService = new NotificationService();
