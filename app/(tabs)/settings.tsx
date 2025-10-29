// app/(tabs)/settings.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { aiService } from "../../services/ai.service";
import { useStore } from "../../store";

const API_KEY_STORAGE = "@groq_api_key";

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  const shoppingList = useStore((state) => state.shoppingList);
  const storageItems = useStore((state) => state.storageItems);
  const clearAllData = useStore((state) => state.clearAllData);

  // Load saved API key on mount
  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const savedKey = await AsyncStorage.getItem(API_KEY_STORAGE);
      if (savedKey) {
        aiService.setApiKey(savedKey);
        setIsConfigured(true);
      }
    } catch (error) {
      console.error("Failed to load API key:", error);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert("Error", "Please enter an API key");
      return;
    }

    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem(API_KEY_STORAGE, apiKey.trim());

      // Set in AI service
      aiService.setApiKey(apiKey.trim());

      setIsConfigured(true);
      setApiKey("");
      Alert.alert(
        "Success",
        "Groq API key saved! You can now use AI features."
      );
    } catch (error) {
      console.error("Failed to save API key:", error);
      Alert.alert("Error", "Failed to save API key. Please try again.");
    }
  };

  const handleOpenGroqConsole = () => {
    Linking.openURL("https://console.groq.com/keys");
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will remove all items from shopping list and storage. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearAllData();
            Alert.alert("Success", "All data cleared");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Configuration</Text>

          <View style={styles.aiInfoCard}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="sparkles" size={32} color="#4CAF50" />
            </View>
            <Text style={styles.aiInfoTitle}>Enable AI Features</Text>
            <Text style={styles.aiInfoText}>
              Get AI-powered recipe suggestions and smart expiry predictions
              with Groq (100% FREE)
            </Text>

            <TouchableOpacity
              style={styles.getKeyButton}
              onPress={handleOpenGroqConsole}
            >
              <Ionicons name="key-outline" size={20} color="#fff" />
              <Text style={styles.getKeyText}>Get Free API Key</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.apiKeyInput}>
            <TextInput
              style={styles.input}
              placeholder="Paste your Groq API key here"
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry={!showApiKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowApiKey(!showApiKey)}
            >
              <Ionicons
                name={showApiKey ? "eye-off-outline" : "eye-outline"}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.saveKeyButton}
            onPress={handleSaveApiKey}
          >
            <Text style={styles.saveKeyText}>Save API Key</Text>
          </TouchableOpacity>

          {isConfigured && (
            <View style={styles.configuredBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.configuredText}>AI Configured ✓</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#4CAF50"
              />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Enable Notifications</Text>
                <Text style={styles.settingDescription}>
                  Get alerts for expiring items
                </Text>
              </View>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(value) =>
                updateSettings({ notificationsEnabled: value })
              }
              trackColor={{ false: "#ddd", true: "#A5D6A7" }}
              thumbColor={settings.notificationsEnabled ? "#4CAF50" : "#f4f3f4"}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="time-outline" size={24} color="#4CAF50" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Warning Days</Text>
                <Text style={styles.settingDescription}>
                  Alert {settings.expiryWarningDays} days before expiry
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Control</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="mic-outline" size={24} color="#4CAF50" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Voice Commands</Text>
                <Text style={styles.settingDescription}>
                  Control app with your voice
                </Text>
              </View>
            </View>
            <Switch
              value={settings.voiceEnabled}
              onValueChange={(value) => updateSettings({ voiceEnabled: value })}
              trackColor={{ false: "#ddd", true: "#A5D6A7" }}
              thumbColor={settings.voiceEnabled ? "#4CAF50" : "#f4f3f4"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="cart-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                Shopping List: {shoppingList.length} items
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="cube-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                Storage: {storageItems.length} items
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleClearData}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.infoCard}>
            <Text style={styles.appName}>FreshCart AI</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              Your smart grocery and recipe assistant with AI-powered features
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ for learning</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  aiInfoCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  aiIconContainer: {
    marginBottom: 12,
  },
  aiInfoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  aiInfoText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  getKeyButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  getKeyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  apiKeyInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 14,
    fontFamily: "monospace",
  },
  eyeButton: {
    padding: 14,
  },
  saveKeyButton: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveKeyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  configuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
  },
  configuredText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  settingItem: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: "#666",
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 15,
    color: "#333",
  },
  dangerButton: {
    backgroundColor: "#f44336",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  dangerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  appName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4CAF50",
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 13,
    color: "#999",
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  footer: {
    padding: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: "#999",
  },
});
