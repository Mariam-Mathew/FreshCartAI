// app/(tabs)/recipes.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { aiService } from "../../services/ai.service";
import { useStore } from "../../store";
import { Recipe } from "../../types";

export default function RecipesScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const recipes = useStore((state) => state.recipes);
  const storageItems = useStore((state) => state.storageItems);
  const setRecipes: any = useStore((state) => state.setRecipes);
  const setCurrentRecipe = useStore((state) => state.setCurrentRecipe);

  const handleFindRecipes = async () => {
    if (storageItems.length === 0) {
      Alert.alert(
        "No Items",
        "Add items to storage first to get recipe suggestions!"
      );
      return;
    }

    // Check if API key is configured
    try {
      const savedKey = await AsyncStorage.getItem("@groq_api_key");
      if (!savedKey) {
        Alert.alert(
          "AI Not Configured",
          "Please add your Groq API key in Settings to use AI recipe suggestions.",
          [{ text: "OK", style: "cancel" }]
        );
        return;
      }

      setLoading(true);

      // Make sure API key is set
      aiService.setApiKey(savedKey);

      // Get ingredient names from storage
      const ingredients = storageItems.map((item) => item.name);

      console.log("Finding recipes for:", ingredients);

      // Call AI service
      const aiRecipes = await aiService.suggestRecipes(ingredients);

      console.log("Got recipes:", aiRecipes.length);

      setRecipes(aiRecipes);

      if (aiRecipes.length > 0) {
        Alert.alert("Success", `Found ${aiRecipes.length} recipes for you!`);
      } else {
        Alert.alert(
          "No Recipes",
          "Could not generate recipes. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Error finding recipes:", error);
      Alert.alert(
        "Error",
        `Failed to get recipe suggestions: ${error.message || "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
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
        {item.prepTime !== undefined && item.cookTime !== undefined && (
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.prepTime + item.cookTime} min
            </Text>
          </View>
        )}
        {item.servings !== undefined && (
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
    <SafeAreaView style={styles.container} edges={["bottom"]}>
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
    </SafeAreaView>
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
