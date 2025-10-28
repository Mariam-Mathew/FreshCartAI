// constants/commonItems.ts

export interface CommonItem {
  name: string;
  defaultExpiryDays: number;
  category: string;
  defaultLocation: "fridge" | "freezer" | "pantry";
}

export const COMMON_ITEMS: CommonItem[] = [
  // Dairy
  {
    name: "milk",
    defaultExpiryDays: 5,
    category: "dairy",
    defaultLocation: "fridge",
  },
  {
    name: "yogurt",
    defaultExpiryDays: 10,
    category: "dairy",
    defaultLocation: "fridge",
  },
  {
    name: "cheese",
    defaultExpiryDays: 21,
    category: "dairy",
    defaultLocation: "fridge",
  },
  {
    name: "butter",
    defaultExpiryDays: 30,
    category: "dairy",
    defaultLocation: "fridge",
  },
  {
    name: "eggs",
    defaultExpiryDays: 21,
    category: "dairy",
    defaultLocation: "fridge",
  },

  // Meat & Poultry
  {
    name: "chicken",
    defaultExpiryDays: 2,
    category: "meat",
    defaultLocation: "fridge",
  },
  {
    name: "beef",
    defaultExpiryDays: 3,
    category: "meat",
    defaultLocation: "fridge",
  },
  {
    name: "pork",
    defaultExpiryDays: 3,
    category: "meat",
    defaultLocation: "fridge",
  },
  {
    name: "fish",
    defaultExpiryDays: 1,
    category: "meat",
    defaultLocation: "fridge",
  },

  // Fruits
  {
    name: "banana",
    defaultExpiryDays: 5,
    category: "fruit",
    defaultLocation: "pantry",
  },
  {
    name: "apple",
    defaultExpiryDays: 14,
    category: "fruit",
    defaultLocation: "fridge",
  },
  {
    name: "orange",
    defaultExpiryDays: 7,
    category: "fruit",
    defaultLocation: "pantry",
  },
  {
    name: "berries",
    defaultExpiryDays: 3,
    category: "fruit",
    defaultLocation: "fridge",
  },

  // Vegetables
  {
    name: "lettuce",
    defaultExpiryDays: 5,
    category: "vegetable",
    defaultLocation: "fridge",
  },
  {
    name: "tomato",
    defaultExpiryDays: 7,
    category: "vegetable",
    defaultLocation: "pantry",
  },
  {
    name: "carrot",
    defaultExpiryDays: 21,
    category: "vegetable",
    defaultLocation: "fridge",
  },
  {
    name: "potato",
    defaultExpiryDays: 30,
    category: "vegetable",
    defaultLocation: "pantry",
  },
  {
    name: "onion",
    defaultExpiryDays: 30,
    category: "vegetable",
    defaultLocation: "pantry",
  },

  // Pantry
  {
    name: "bread",
    defaultExpiryDays: 4,
    category: "bakery",
    defaultLocation: "pantry",
  },
  {
    name: "rice",
    defaultExpiryDays: 365,
    category: "grain",
    defaultLocation: "pantry",
  },
  {
    name: "pasta",
    defaultExpiryDays: 365,
    category: "grain",
    defaultLocation: "pantry",
  },
];

export const CATEGORIES = [
  "dairy",
  "meat",
  "fruit",
  "vegetable",
  "bakery",
  "grain",
  "beverage",
  "snack",
  "other",
];

export const STORAGE_LOCATIONS = [
  { value: "fridge", label: "Refrigerator", icon: "🧊" },
  { value: "freezer", label: "Freezer", icon: "❄️" },
  { value: "pantry", label: "Pantry", icon: "🏺" },
] as const;
