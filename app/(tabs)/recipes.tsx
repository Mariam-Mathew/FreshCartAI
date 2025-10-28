// app/(tabs)/recipes.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useStore } from "../../store";
import { Recipe } from "../../types";

export default function RecipesScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const recipes = useStore((state) => state.recipes);
  const storageItems = useStore((state) => state.storageItems);
  const setRecipes = useStore((state) => state.setRecipes);
  const setCurrentRecipe = useStore((state) => state.setCurrentRecipe);

  const handleFindRecipes = async () => {
    if (storageItems.length === 0) {
      alert("Add items to storage first!");
      return;
    }

    setLoading(true);

    // Placeholder - will be replaced with AI integration
    setTimeout(() => {
      const mockRecipes: Recipe[] = [
        {
          id: "1",
          title: "Simple Pasta",
          description: "Quick and easy pasta dish",
          ingredients: ["pasta", "tomato", "olive oil", "garlic"],
          instructions: [
            "Boil water and cook pasta according to package directions",
            "Heat olive oil in a pan and sauté minced garlic",
            "Add chopped tomatoes and cook for 5 minutes",
            "Toss cooked pasta with the sauce",
            "Serve hot with cheese if desired",
          ],
          prepTime: 10,
          cookTime: 15,
          servings: 2,
        },
        {
          id: "2",
          title: "Chicken Stir Fry",
          description: "Healthy and delicious stir fry",
          ingredients: ["chicken", "vegetables", "soy sauce", "rice"],
          instructions: [
            "Cut chicken into bite-sized pieces",
            "Heat oil in a wok or large pan",
            "Cook chicken until golden brown",
            "Add vegetables and stir fry for 5 minutes",
            "Add soy sauce and serve over rice",
          ],
          prepTime: 15,
          cookTime: 10,
          servings: 4,
        },
      ];

      setRecipes(mockRecipes);
      setLoading(false);
    }, 1500);
  };

  const handleRecipePress = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    router.push(`/recipe/${recipe.id}`);
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => handleRecipePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.recipeHeader}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <Ionicons name="chevron-forward" size={24} color="#4CAF50" />
      </View>

      <Text style={styles.recipeDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.recipeInfo}>
        {item.prepTime && (
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.prepTime + item.cookTime!} min
            </Text>
          </View>
        )}
        {item.servings && (
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{item.servings} servings</Text>
          </View>
        )}
      </View>

      {item.matchedIngredients && item.matchedIngredients.length > 0 && (
        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>
            ✓ {item.matchedIngredients.length} ingredients matched
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          {storageItems.length > 0
            ? `${storageItems.length} items in storage`
            : "Add items to storage to get recipe suggestions"}
        </Text>
        <TouchableOpacity
          style={[
            styles.findButton,
            storageItems.length === 0 && styles.findButtonDisabled,
          ]}
          onPress={handleFindRecipes}
          disabled={loading || storageItems.length === 0}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="search" size={20} color="#fff" />
              <Text style={styles.findButtonText}>Find Recipes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {recipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={80} color="#ddd" />
          <Text style={styles.emptyText}>No recipes yet</Text>
          <Text style={styles.emptySubtext}>
            Click Find Recipes to get AI-powered suggestions
          </Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Voice button placeholder */}
      <TouchableOpacity style={styles.voiceButton}>
        <Ionicons name="mic-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    textAlign: "center",
  },
  findButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  findButtonDisabled: {
    backgroundColor: "#ccc",
  },
  findButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
  },
  recipeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  recipeDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  recipeInfo: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
  },
  matchBadge: {
    backgroundColor: "#E8F5E9",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  matchText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 8,
    textAlign: "center",
  },
  voiceButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#4CAF50",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});
