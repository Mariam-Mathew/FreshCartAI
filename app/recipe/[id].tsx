// app/recipe/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useStore } from "../../store";

export default function RecipeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const currentRecipe = useStore((state: any) => state.currentRecipe);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCookingMode, setIsCookingMode] = useState(false);

  if (!currentRecipe) {
    return (
      <View style={styles.container}>
        <Text>Recipe not found</Text>
      </View>
    );
  }

  const handleNextStep = () => {
    if (currentStep < currentRecipe.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recipe</Text>
        <View style={{ width: 28 }} />
      </View>

      {!isCookingMode ? (
        <ScrollView style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{currentRecipe.title}</Text>
            <Text style={styles.description}>{currentRecipe.description}</Text>
          </View>

          <View style={styles.infoRow}>
            {currentRecipe.prepTime && (
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>
                  {currentRecipe.prepTime + (currentRecipe.cookTime || 0)} min
                </Text>
              </View>
            )}
            {currentRecipe.servings && (
              <View style={styles.infoItem}>
                <Ionicons name="people-outline" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>
                  {currentRecipe.servings} servings
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {currentRecipe.ingredients.map((ingredient: any, index: any) => (
              <View key={index} style={styles.ingredientItem}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#4CAF50"
                />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {currentRecipe.instructions.map((instruction: any, index: any) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.startCookingButton}
            onPress={() => setIsCookingMode(true)}
          >
            <Ionicons name="play-circle" size={24} color="#fff" />
            <Text style={styles.startCookingText}>Start Cooking Mode</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.cookingModeContainer}>
          <View style={styles.cookingHeader}>
            <Text style={styles.cookingTitle}>{currentRecipe.title}</Text>
            <TouchableOpacity
              onPress={() => setIsCookingMode(false)}
              style={styles.exitCookingButton}
            >
              <Text style={styles.exitCookingText}>Exit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.stepCounter}>
            <Text style={styles.stepCounterText}>
              Step {currentStep + 1} of {currentRecipe.instructions.length}
            </Text>
          </View>

          <View style={styles.stepContentContainer}>
            <View style={styles.bigStepNumber}>
              <Text style={styles.bigStepNumberText}>{currentStep + 1}</Text>
            </View>
            <ScrollView style={styles.stepTextContainer}>
              <Text style={styles.stepText}>
                {currentRecipe.instructions[currentStep]}
              </Text>
            </ScrollView>
          </View>

          <View style={styles.cookingControls}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                currentStep === 0 && styles.controlButtonDisabled,
              ]}
              onPress={handlePreviousStep}
              disabled={currentStep === 0}
            >
              <Ionicons
                name="chevron-back"
                size={32}
                color={currentStep === 0 ? "#ccc" : "#4CAF50"}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.voiceButtonLarge}>
              <Ionicons name="mic" size={36} color="#fff" />
              <Text style={styles.voiceButtonText}>Voice Control</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                currentStep === currentRecipe.instructions.length - 1 &&
                  styles.controlButtonDisabled,
              ]}
              onPress={handleNextStep}
              disabled={currentStep === currentRecipe.instructions.length - 1}
            >
              <Ionicons
                name="chevron-forward"
                size={32}
                color={
                  currentStep === currentRecipe.instructions.length - 1
                    ? "#ccc"
                    : "#4CAF50"
                }
              />
            </TouchableOpacity>
          </View>

          {currentStep === currentRecipe.instructions.length - 1 && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => {
                setIsCookingMode(false);
                router.back();
              }}
            >
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.completeButtonText}>Complete Recipe</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
  },
  titleSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: "row",
    padding: 20,
    gap: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  ingredientText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  instructionItem: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  startCookingButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  startCookingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  cookingModeContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  cookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  cookingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  exitCookingButton: {
    padding: 8,
  },
  exitCookingText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
  stepCounter: {
    backgroundColor: "#4CAF50",
    padding: 12,
    alignItems: "center",
  },
  stepCounterText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  stepContentContainer: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  bigStepNumber: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  bigStepNumberText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "700",
  },
  stepTextContainer: {
    maxHeight: 300,
  },
  stepText: {
    fontSize: 24,
    color: "#333",
    lineHeight: 36,
    textAlign: "center",
  },
  cookingControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  controlButton: {
    padding: 12,
  },
  controlButtonDisabled: {
    opacity: 0.3,
  },
  voiceButtonLarge: {
    backgroundColor: "#4CAF50",
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  voiceButtonText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
  completeButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
