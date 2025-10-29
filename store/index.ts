// store/index.ts
import { create } from "zustand";
import { notificationService } from "../services/notification.service";
import { storageService } from "../services/storage.service";
import { AppSettings, GroceryItem, Recipe, StorageItem } from "../types";

interface AppStore {
  // Data loaded state
  isLoaded: boolean;
  setIsLoaded: (loaded: boolean) => void;

  // Shopping List State
  shoppingList: GroceryItem[];
  addToShoppingList: (item: GroceryItem) => void;
  removeFromShoppingList: (id: string) => void;
  updateShoppingItem: (id: string, updates: Partial<GroceryItem>) => void;
  clearShoppingList: () => void;

  // Storage State
  storageItems: StorageItem[];
  addToStorage: (item: StorageItem) => void;
  removeFromStorage: (id: string) => void;
  updateStorageItem: (id: string, updates: Partial<StorageItem>) => void;
  moveToStorage: (shoppingItemId: string, expiryDate?: Date) => void;
  clearStorage: () => void;

  // Recipes State
  recipes: Recipe[];
  currentRecipe: Recipe | null;
  setCurrentRecipe: (recipe: Recipe | null) => void;
  setRecipes: (recipes: Recipe[]) => void;
  clearRecipes: () => void;

  // Settings State
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;

  // Voice State
  isListening: boolean;
  setIsListening: (listening: boolean) => void;

  // Data Management
  loadAllData: () => Promise<void>;
  saveAllData: () => Promise<void>;
  clearAllData: () => void;

  // Notifications
  checkAndScheduleNotifications: () => Promise<void>;
}

export const useStore = create<AppStore>((set, get) => ({
  // ==================== Data Loaded ====================
  isLoaded: false,
  setIsLoaded: (loaded) => set({ isLoaded: loaded }),

  // ==================== Shopping List ====================
  shoppingList: [],

  addToShoppingList: (item) => {
    set((state) => ({
      shoppingList: [...state.shoppingList, item],
    }));
    get().saveAllData();
  },

  removeFromShoppingList: (id) => {
    set((state) => ({
      shoppingList: state.shoppingList.filter((item) => item.id !== id),
    }));
    get().saveAllData();
  },

  updateShoppingItem: (id, updates) => {
    set((state) => ({
      shoppingList: state.shoppingList.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
    get().saveAllData();
  },

  clearShoppingList: () => {
    set({ shoppingList: [] });
    get().saveAllData();
  },

  // ==================== Storage ====================
  storageItems: [],

  addToStorage: (item) => {
    set((state) => ({
      storageItems: [...state.storageItems, item],
    }));

    // Schedule notification for this item
    if (item.expiryDate && get().settings.notificationsEnabled) {
      notificationService.scheduleExpiryNotification(
        item,
        get().settings.expiryWarningDays
      );
    }

    get().saveAllData();
  },

  removeFromStorage: (id) => {
    // Cancel notifications for this item
    notificationService.cancelNotificationsForItem(id);

    set((state) => ({
      storageItems: state.storageItems.filter((item) => item.id !== id),
    }));
    get().saveAllData();
  },

  updateStorageItem: (id, updates) => {
    set((state) => ({
      storageItems: state.storageItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
    get().saveAllData();
  },

  moveToStorage: (shoppingItemId, expiryDate) => {
    const state = get();
    const shoppingItem = state.shoppingList.find(
      (item) => item.id === shoppingItemId
    );

    if (shoppingItem) {
      const storageItem: StorageItem = {
        ...shoppingItem,
        id: shoppingItemId,
        isPurchased: true,
        purchasedAt: new Date(),
        expiryDate: expiryDate || undefined,
        location: "pantry",
      };

      state.addToStorage(storageItem);
      state.removeFromShoppingList(shoppingItemId);
    }
  },

  clearStorage: () => {
    notificationService.cancelAllNotifications();
    set({ storageItems: [] });
    get().saveAllData();
  },

  // ==================== Recipes ====================
  recipes: [],
  currentRecipe: null,

  setCurrentRecipe: (recipe) => set({ currentRecipe: recipe }),

  setRecipes: (recipes) => {
    set({ recipes });
    get().saveAllData();
  },

  clearRecipes: () => {
    set({ recipes: [], currentRecipe: null });
    get().saveAllData();
  },

  // ==================== Settings ====================
  settings: {
    notificationsEnabled: true,
    expiryWarningDays: 3,
    voiceEnabled: true,
    theme: "light",
  },

  updateSettings: (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates },
    }));

    // If notifications were enabled, check and schedule
    if (updates.notificationsEnabled) {
      get().checkAndScheduleNotifications();
    }
    // If notifications were disabled, cancel all
    else if (updates.notificationsEnabled === false) {
      notificationService.cancelAllNotifications();
    }
  },

  // ==================== Voice ====================
  isListening: false,
  setIsListening: (listening) => set({ isListening: listening }),

  // ==================== Data Management ====================
  loadAllData: async () => {
    try {
      const [shoppingList, storageItems, recipes] = await Promise.all([
        storageService.loadShoppingList(),
        storageService.loadStorageItems(),
        storageService.loadRecipes(),
      ]);

      set({
        shoppingList,
        storageItems,
        recipes,
        isLoaded: true,
      });

      // Check and schedule notifications after loading
      get().checkAndScheduleNotifications();
    } catch (error) {
      console.error("Failed to load data:", error);
      set({ isLoaded: true });
    }
  },

  saveAllData: async () => {
    try {
      const state = get();
      await Promise.all([
        storageService.saveShoppingList(state.shoppingList),
        storageService.saveStorageItems(state.storageItems),
        storageService.saveRecipes(state.recipes),
      ]);
    } catch (error) {
      console.error("Failed to save data:", error);
    }
  },

  clearAllData: () => {
    notificationService.cancelAllNotifications();
    storageService.clearAllData();
    set({
      shoppingList: [],
      storageItems: [],
      recipes: [],
      currentRecipe: null,
    });
  },

  // ==================== Notifications ====================
  checkAndScheduleNotifications: async () => {
    const state = get();

    if (!state.settings.notificationsEnabled) return;

    try {
      await notificationService.checkExpiringItems(
        state.storageItems,
        state.settings.expiryWarningDays
      );

      await storageService.saveLastNotificationCheck(new Date());
    } catch (error) {
      console.error("Failed to check notifications:", error);
    }
  },
}));
