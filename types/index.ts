// types/index.ts

export interface GroceryItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  addedAt: Date;
}

export interface StorageItem extends GroceryItem {
  expiryDate?: Date;
  location?: "fridge" | "freezer" | "pantry";
  isPurchased: boolean;
  purchasedAt?: Date;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  matchedIngredients?: string[];
}

export type VoiceCommand =
  | "add_to_list"
  | "move_to_storage"
  | "find_recipes"
  | "next_step"
  | "previous_step"
  | "repeat_step"
  | "pause"
  | "resume";

export interface AppSettings {
  notificationsEnabled: boolean;
  expiryWarningDays: number;
  voiceEnabled: boolean;
  theme: "light" | "dark";
}
