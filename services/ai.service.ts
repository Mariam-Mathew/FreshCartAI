// services/ai.service.ts - GROQ AI Service

const GROQ_API_KEY = "YOUR_GROQ_API_KEY_HERE"; // Get from https://console.groq.com
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface RecipeSuggestion {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  matchedIngredients?: string[];
}

export class AIService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || GROQ_API_KEY;
  }

  // Set API key dynamically
  setApiKey(key: string) {
    this.apiKey = key;
  }

  // Check if API key is configured
  isConfigured(): boolean {
    return this.apiKey !== "YOUR_GROQ_API_KEY_HERE" && this.apiKey.length > 0;
  }

  // Generic Groq API call
  private async callGroq(
    messages: GroqMessage[],
    temperature = 0.7
  ): Promise<string> {
    try {
      if (!this.isConfigured()) {
        throw new Error("Groq API key not configured");
      }

      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", // Fast and free
          messages,
          temperature,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Groq API error: ${error}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Groq API call failed:", error);
      throw error;
    }
  }

  // Suggest expiry date for an item
  async suggestExpiryDate(itemName: string): Promise<number> {
    try {
      const prompt = `How many days does ${itemName} typically last before expiring? 
Reply with ONLY a number (the number of days). No explanation.`;

      const messages: GroqMessage[] = [
        {
          role: "system",
          content:
            "You are a food safety expert. Provide realistic expiry estimates for food items.",
        },
        {
          role: "user",
          content: prompt,
        },
      ];

      const response = await this.callGroq(messages, 0.3);
      const days = parseInt(response.trim());

      // Validate and return
      if (isNaN(days) || days < 1) {
        return 7; // Default fallback
      }

      return days;
    } catch (error) {
      console.error("Error suggesting expiry:", error);
      return 7; // Default fallback
    }
  }

  // Get recipe suggestions based on ingredients
  async suggestRecipes(ingredients: string[]): Promise<RecipeSuggestion[]> {
    try {
      const ingredientList = ingredients.join(", ");

      const prompt = `I have these ingredients: ${ingredientList}

Suggest 3 simple recipes I can make. For each recipe, provide:
1. Recipe name
2. Brief description (1 sentence)
3. List of ingredients needed (from my list + common pantry items)
4. Step-by-step instructions (5-7 steps)
5. Prep time in minutes
6. Cook time in minutes
7. Number of servings

Format your response as valid JSON array like this:
[
  {
    "title": "Recipe Name",
    "description": "Brief description",
    "ingredients": ["ingredient1", "ingredient2"],
    "instructions": ["step 1", "step 2"],
    "prepTime": 10,
    "cookTime": 20,
    "servings": 4
  }
]`;

      const messages: GroqMessage[] = [
        {
          role: "system",
          content:
            "You are a helpful cooking assistant. Always respond with valid JSON only, no extra text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ];

      const response = await this.callGroq(messages, 0.8);

      // Parse JSON response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Invalid JSON response from AI");
      }

      const recipes = JSON.parse(jsonMatch[0]);

      // Add matched ingredients
      return recipes.map((recipe: any) => ({
        ...recipe,
        id: Date.now().toString() + Math.random(),
        matchedIngredients: recipe.ingredients.filter((ing: string) =>
          ingredients.some(
            (i) =>
              ing.toLowerCase().includes(i.toLowerCase()) ||
              i.toLowerCase().includes(ing.toLowerCase())
          )
        ),
      }));
    } catch (error) {
      console.error("Error suggesting recipes:", error);
      // Return fallback recipes
      return this.getFallbackRecipes(ingredients);
    }
  }

  // Suggest recipes for expiring items
  async suggestRecipesForExpiringItems(
    expiringItems: string[]
  ): Promise<RecipeSuggestion[]> {
    try {
      const itemList = expiringItems.join(", ");

      const prompt = `These ingredients are expiring soon: ${itemList}

Suggest 2 recipes that use these expiring ingredients to reduce food waste. For each recipe:
1. Recipe name (mention it uses expiring items)
2. Brief description
3. Ingredients needed
4. Step-by-step instructions
5. Prep and cook time
6. Servings

Format as JSON array.`;

      const messages: GroqMessage[] = [
        {
          role: "system",
          content:
            "You are a sustainable cooking assistant helping reduce food waste. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ];

      const response = await this.callGroq(messages, 0.8);

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Invalid JSON response");
      }

      const recipes = JSON.parse(jsonMatch[0]);

      return recipes.map((recipe: any) => ({
        ...recipe,
        id: Date.now().toString() + Math.random(),
        matchedIngredients: expiringItems,
      }));
    } catch (error) {
      console.error("Error suggesting recipes for expiring items:", error);
      return [];
    }
  }

  // Fallback recipes when AI fails
  private getFallbackRecipes(ingredients: string[]): RecipeSuggestion[] {
    return [
      {
        id: "fallback-1",
        title: "Simple Stir Fry",
        description: "Quick and easy vegetable stir fry",
        ingredients: ingredients
          .slice(0, 3)
          .concat(["soy sauce", "oil", "garlic"]),
        instructions: [
          "Heat oil in a large pan or wok",
          "Add minced garlic and cook for 30 seconds",
          "Add your vegetables and stir fry for 5-7 minutes",
          "Add soy sauce and toss well",
          "Serve hot over rice",
        ],
        prepTime: 10,
        cookTime: 10,
        servings: 2,
        matchedIngredients: ingredients.slice(0, 3),
      },
      {
        id: "fallback-2",
        title: "Simple Soup",
        description: "Warm and comforting soup",
        ingredients: ingredients
          .slice(0, 4)
          .concat(["broth", "salt", "pepper"]),
        instructions: [
          "Bring broth to a boil in a large pot",
          "Add chopped vegetables",
          "Simmer for 15-20 minutes until tender",
          "Season with salt and pepper",
          "Serve hot",
        ],
        prepTime: 10,
        cookTime: 20,
        servings: 4,
        matchedIngredients: ingredients.slice(0, 4),
      },
    ];
  }

  // Smart item categorization
  async categorizeItem(itemName: string): Promise<string> {
    // Simple categorization without API call for performance
    const lowerName = itemName.toLowerCase();

    if (
      ["milk", "cheese", "yogurt", "butter", "cream"].some((d) =>
        lowerName.includes(d)
      )
    ) {
      return "dairy";
    }
    if (
      ["chicken", "beef", "pork", "fish", "meat"].some((m) =>
        lowerName.includes(m)
      )
    ) {
      return "meat";
    }
    if (
      ["apple", "banana", "orange", "berry", "grape"].some((f) =>
        lowerName.includes(f)
      )
    ) {
      return "fruit";
    }
    if (
      ["lettuce", "tomato", "carrot", "potato", "onion"].some((v) =>
        lowerName.includes(v)
      )
    ) {
      return "vegetable";
    }
    if (["bread", "roll", "bagel"].some((b) => lowerName.includes(b))) {
      return "bakery";
    }

    return "other";
  }
}

// Singleton instance
export const aiService = new AIService();
