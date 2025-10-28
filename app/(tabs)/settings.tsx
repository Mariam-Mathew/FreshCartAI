// app/(tabs)/settings.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useStore } from "../../store";

export default function SettingsScreen() {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  const shoppingList = useStore((state) => state.shoppingList);
  const storageItems = useStore((state) => state.storageItems);

  const clearAllData = useStore((state) => state.clearAllData);

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
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications-outline" size={24} color="#4CAF50" />
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

        <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
