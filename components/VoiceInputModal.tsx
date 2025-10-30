// components/VoiceInputModal.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface VoiceInputModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export default function VoiceInputModal({
  visible,
  onClose,
  onSubmit,
}: VoiceInputModalProps) {
  const [inputText, setInputText] = useState("");

  const handleSubmit = () => {
    if (inputText.trim()) {
      onSubmit(inputText.trim());
      setInputText("");
    }
  };

  const handleClose = () => {
    setInputText("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.micContainer}>
              <Ionicons name="mic" size={32} color="#4CAF50" />
            </View>
            <Text style={styles.title}>🎤 Voice Command</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>Speak or type your command</Text>

          <View style={styles.examplesCard}>
            <Text style={styles.examplesTitle}>Examples:</Text>
            <Text style={styles.exampleText}>• Add milk to shopping list</Text>
            <Text style={styles.exampleText}>
              • Add 2 eggs to shopping list
            </Text>
            <Text style={styles.exampleText}>• Add bread to shopping list</Text>
            <Text style={styles.exampleText}>• Find recipes</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Type your command here..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSubmit}
            autoFocus
            multiline
            numberOfLines={3}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={!inputText.trim()}
            >
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickActions}>
            <Text style={styles.quickActionsTitle}>Quick Commands:</Text>
            <View style={styles.quickButtonsRow}>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => setInputText("Add milk to shopping list")}
              >
                <Text style={styles.quickButtonText}>Add Milk</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => setInputText("Add 2 eggs to shopping list")}
              >
                <Text style={styles.quickButtonText}>Add 2 Eggs</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.quickButtonsRow}>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => setInputText("Add bread to shopping list")}
              >
                <Text style={styles.quickButtonText}>Add Bread</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => setInputText("Find recipes")}
              >
                <Text style={styles.quickButtonText}>Find Recipes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  micContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  examplesCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#fafafa",
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  quickActions: {
    marginTop: 8,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
  },
  quickButtonsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  quickButton: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  quickButtonText: {
    color: "#4CAF50",
    fontSize: 13,
    fontWeight: "600",
  },
});
