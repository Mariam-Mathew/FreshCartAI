// app/(tabs)/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { addDays, format } from "date-fns";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COMMON_ITEMS } from "../../constants/commonItems";
import { useVoiceCommands } from "../../hooks/useVoiceCommands";
import { useStore } from "../../store";
import { GroceryItem } from "../../types";

export default function ShoppingListScreen() {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GroceryItem | null>(null);
  const [customDays, setCustomDays] = useState("");

  const shoppingList = useStore((state) => state.shoppingList);
  const addToShoppingList = useStore((state) => state.addToShoppingList);
  const removeFromShoppingList = useStore(
    (state) => state.removeFromShoppingList
  );
  const moveToStorage = useStore((state) => state.moveToStorage);

  const { isListening, startListening, stopListening } = useVoiceCommands();

  const handleAddItem = () => {
    if (!itemName.trim()) {
      Alert.alert("Error", "Please enter an item name");
      return;
    }

    const newItem: GroceryItem = {
      id: Date.now().toString(),
      name: itemName.trim(),
      quantity: quantity ? parseInt(quantity) : undefined,
      addedAt: new Date(),
    };

    addToShoppingList(newItem);
    setItemName("");
    setQuantity("");
  };

  const handlePurchase = (item: GroceryItem) => {
    setSelectedItem(item);
    setShowExpiryModal(true);
  };

  const getSuggestedExpiryDays = (itemName: string): number => {
    const commonItem = COMMON_ITEMS.find(
      (item) => item.name.toLowerCase() === itemName.toLowerCase()
    );
    return commonItem?.defaultExpiryDays || 7; // Default 7 days if not found
  };

  const handleMoveToStorage = (days: number) => {
    if (selectedItem) {
      const expiryDate = addDays(new Date(), days);
      moveToStorage(selectedItem.id, expiryDate);
      setShowExpiryModal(false);
      setSelectedItem(null);
      setCustomDays("");
    }
  };

  const handleCustomExpiry = () => {
    const days = parseInt(customDays);
    if (isNaN(days) || days < 0) {
      Alert.alert("Invalid Input", "Please enter a valid number of days");
      return;
    }
    handleMoveToStorage(days);
  };

  const renderItem = ({ item }: { item: GroceryItem }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.quantity && (
          <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
        )}
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          onPress={() => handlePurchase(item)}
          style={styles.checkButton}
        >
          <Ionicons name="checkmark-circle-outline" size={28} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => removeFromShoppingList(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={24} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.nameInput]}
            placeholder="Item name"
            value={itemName}
            onChangeText={setItemName}
            onSubmitEditing={handleAddItem}
          />
          <TextInput
            style={[styles.input, styles.quantityInput]}
            placeholder="Qty"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      {shoppingList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ddd" />
          <Text style={styles.emptyText}>Your shopping list is empty</Text>
          <Text style={styles.emptySubtext}>Add items to get started</Text>
        </View>
      ) : (
        <FlatList
          data={shoppingList}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Voice button - now functional! */}
      <TouchableOpacity
        style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
        onPress={isListening ? stopListening : startListening}
      >
        <Ionicons
          name={isListening ? "stop" : "mic-outline"}
          size={28}
          color="#fff"
        />
        {isListening && (
          <View style={styles.listeningIndicator}>
            <View style={styles.pulse} />
          </View>
        )}
      </TouchableOpacity>

      {/* Expiry Date Modal */}
      <Modal
        visible={showExpiryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExpiryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Expiry Date</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowExpiryModal(false);
                  setSelectedItem(null);
                  setCustomDays("");
                }}
              >
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <>
                <Text style={styles.itemNameModal}>{selectedItem.name}</Text>

                {/* AI Suggested Expiry */}
                {(() => {
                  const suggestedDays = getSuggestedExpiryDays(
                    selectedItem.name
                  );
                  const suggestedDate = addDays(new Date(), suggestedDays);
                  return (
                    <TouchableOpacity
                      style={styles.suggestionCard}
                      onPress={() => handleMoveToStorage(suggestedDays)}
                    >
                      <View style={styles.suggestionIcon}>
                        <Ionicons name="sparkles" size={24} color="#4CAF50" />
                      </View>
                      <View style={styles.suggestionText}>
                        <Text style={styles.suggestionLabel}>AI Suggested</Text>
                        <Text style={styles.suggestionDate}>
                          {format(suggestedDate, "MMM dd, yyyy")} (
                          {suggestedDays} days)
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color="#4CAF50"
                      />
                    </TouchableOpacity>
                  );
                })()}

                {/* Quick Options */}
                <Text style={styles.sectionTitle}>Quick Options</Text>
                <View style={styles.quickOptionsGrid}>
                  {[
                    { days: 1, label: "Tomorrow" },
                    { days: 3, label: "3 Days" },
                    { days: 7, label: "1 Week" },
                    { days: 14, label: "2 Weeks" },
                    { days: 30, label: "1 Month" },
                    { days: 90, label: "3 Months" },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.days}
                      style={styles.quickOption}
                      onPress={() => handleMoveToStorage(option.days)}
                    >
                      <Text style={styles.quickOptionText}>{option.label}</Text>
                      <Text style={styles.quickOptionDays}>{option.days}d</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Custom Days Input */}
                <Text style={styles.sectionTitle}>Custom</Text>
                <View style={styles.customInputRow}>
                  <TextInput
                    style={styles.customInput}
                    placeholder="Enter days"
                    value={customDays}
                    onChangeText={setCustomDays}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={styles.customButton}
                    onPress={handleCustomExpiry}
                  >
                    <Text style={styles.customButtonText}>Set</Text>
                  </TouchableOpacity>
                </View>

                {/* No Expiry Option */}
                <TouchableOpacity
                  style={styles.noExpiryButton}
                  onPress={() => {
                    if (selectedItem) {
                      moveToStorage(selectedItem.id);
                      setShowExpiryModal(false);
                      setSelectedItem(null);
                    }
                  }}
                >
                  <Text style={styles.noExpiryText}>No Expiry Date</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  inputContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  nameInput: {
    flex: 1,
  },
  quantityInput: {
    width: 80,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
  },
  itemActions: {
    flexDirection: "row",
    gap: 12,
  },
  checkButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
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
  voiceButtonActive: {
    backgroundColor: "#f44336",
  },
  listeningIndicator: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "transparent",
  },
  pulse: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(244, 67, 54, 0.3)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  itemNameModal: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 20,
  },
  suggestionCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionLabel: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
    marginBottom: 4,
  },
  suggestionDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  quickOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  quickOption: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    width: "31%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  quickOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  quickOptionDays: {
    fontSize: 12,
    color: "#666",
  },
  customInputRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  customButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: "center",
  },
  customButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  noExpiryButton: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  noExpiryText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
});
