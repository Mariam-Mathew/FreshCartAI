// store/index.ts
import { create } from "zustand";
import { AppSettings, GroceryItem, Recipe, StorageItem } from "../types";

interface AppStore {
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

  // Clear All Data
  clearAllData: () => void;
}

export const useStore = create<AppStore>((set, get) => ({
  // ==================== Shopping List ====================
  shoppingList: [],

  addToShoppingList: (item) =>
    set((state) => ({
      shoppingList: [...state.shoppingList, item],
    })),

  removeFromShoppingList: (id) =>
    set((state) => ({
      shoppingList: state.shoppingList.filter((item) => item.id !== id),
    })),

  updateShoppingItem: (id, updates) =>
    set((state) => ({
      shoppingList: state.shoppingList.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),

  clearShoppingList: () => set({ shoppingList: [] }),

  // ==================== Storage ====================
  storageItems: [],

  addToStorage: (item) =>
    set((state) => ({
      storageItems: [...state.storageItems, item],
    })),

  removeFromStorage: (id) =>
    set((state) => ({
      storageItems: state.storageItems.filter((item) => item.id !== id),
    })),

  updateStorageItem: (id, updates) =>
    set((state) => ({
      storageItems: state.storageItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),

  moveToStorage: (shoppingItemId, expiryDate) => {
    const state = get();
    const shoppingItem = state.shoppingList.find(
      (item) => item.id === shoppingItemId
    );

    if (shoppingItem) {
      const storageItem: StorageItem = {
        ...shoppingItem,
        id: shoppingItemId, // Keep same ID
        isPurchased: true,
        purchasedAt: new Date(),
        expiryDate: expiryDate || undefined,
        location: "pantry", // Default location
      };

      state.addToStorage(storageItem);
      state.removeFromShoppingList(shoppingItemId);
    }
  },

  clearStorage: () => set({ storageItems: [] }),

  // ==================== Recipes ====================
  recipes: [],
  currentRecipe: null,

  setCurrentRecipe: (recipe) => set({ currentRecipe: recipe }),

  setRecipes: (recipes) => set({ recipes }),

  clearRecipes: () => set({ recipes: [], currentRecipe: null }),

  // ==================== Settings ====================
  settings: {
    notificationsEnabled: true,
    expiryWarningDays: 3,
    voiceEnabled: true,
    theme: "light",
  },

  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates },
    })),

  // ==================== Voice ====================
  isListening: false,

  setIsListening: (listening) => set({ isListening: listening }),

  // ==================== Clear All ====================
  clearAllData: () =>
    set({
      shoppingList: [],
      storageItems: [],
      recipes: [],
      currentRecipe: null,
    }),
}));
