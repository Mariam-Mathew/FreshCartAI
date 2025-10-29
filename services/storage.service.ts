// services/storage.service.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GroceryItem, Recipe, StorageItem } from "../types";

const STORAGE_KEYS = {
  SHOPPING_LIST: "@shopping_list",
  STORAGE_ITEMS: "@storage_items",
  RECIPES: "@recipes",
  LAST_NOTIFICATION_CHECK: "@last_notification_check",
};

export class StorageService {
  // Save shopping list
  async saveShoppingList(items: GroceryItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SHOPPING_LIST,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error("Failed to save shopping list:", error);
      throw error;
    }
  }

  // Load shopping list
  async loadShoppingList(): Promise<GroceryItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SHOPPING_LIST);
      if (!data) return [];

      const items = JSON.parse(data);
      // Convert date strings back to Date objects
      return items.map((item: any) => ({
        ...item,
        addedAt: new Date(item.addedAt),
      }));
    } catch (error) {
      console.error("Failed to load shopping list:", error);
      return [];
    }
  }

  // Save storage items
  async saveStorageItems(items: StorageItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.STORAGE_ITEMS,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error("Failed to save storage items:", error);
      throw error;
    }
  }

  // Load storage items
  async loadStorageItems(): Promise<StorageItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.STORAGE_ITEMS);
      if (!data) return [];

      const items = JSON.parse(data);
      // Convert date strings back to Date objects
      return items.map((item: any) => ({
        ...item,
        addedAt: new Date(item.addedAt),
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
        purchasedAt: item.purchasedAt ? new Date(item.purchasedAt) : undefined,
      }));
    } catch (error) {
      console.error("Failed to load storage items:", error);
      return [];
    }
  }

  // Save recipes
  async saveRecipes(recipes: Recipe[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
    } catch (error) {
      console.error("Failed to save recipes:", error);
      throw error;
    }
  }

  // Load recipes
  async loadRecipes(): Promise<Recipe[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RECIPES);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error("Failed to load recipes:", error);
      return [];
    }
  }

  // Save last notification check time
  async saveLastNotificationCheck(date: Date): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_NOTIFICATION_CHECK,
        date.toISOString()
      );
    } catch (error) {
      console.error("Failed to save last notification check:", error);
    }
  }

  // Load last notification check time
  async loadLastNotificationCheck(): Promise<Date | null> {
    try {
      const data = await AsyncStorage.getItem(
        STORAGE_KEYS.LAST_NOTIFICATION_CHECK
      );
      if (!data) return null;
      return new Date(data);
    } catch (error) {
      console.error("Failed to load last notification check:", error);
      return null;
    }
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SHOPPING_LIST,
        STORAGE_KEYS.STORAGE_ITEMS,
        STORAGE_KEYS.RECIPES,
      ]);
    } catch (error) {
      console.error("Failed to clear all data:", error);
      throw error;
    }
  }

  // Export all data as JSON
  async exportData(): Promise<string> {
    try {
      const shoppingList = await this.loadShoppingList();
      const storageItems = await this.loadStorageItems();
      const recipes = await this.loadRecipes();

      return JSON.stringify(
        {
          version: "1.0.0",
          exportDate: new Date().toISOString(),
          data: {
            shoppingList,
            storageItems,
            recipes,
          },
        },
        null,
        2
      );
    } catch (error) {
      console.error("Failed to export data:", error);
      throw error;
    }
  }

  // Import data from JSON
  async importData(jsonData: string): Promise<void> {
    try {
      const parsed = JSON.parse(jsonData);

      if (parsed.data.shoppingList) {
        await this.saveShoppingList(parsed.data.shoppingList);
      }
      if (parsed.data.storageItems) {
        await this.saveStorageItems(parsed.data.storageItems);
      }
      if (parsed.data.recipes) {
        await this.saveRecipes(parsed.data.recipes);
      }
    } catch (error) {
      console.error("Failed to import data:", error);
      throw error;
    }
  }
}

// Singleton instance
export const storageService = new StorageService();
