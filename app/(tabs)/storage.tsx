// app/(tabs)/storage.tsx
import { Ionicons } from "@expo/vector-icons";
import { differenceInDays, format } from "date-fns";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useStore } from "../../store";
import { StorageItem } from "../../types";

export default function StorageScreen() {
  const [filter, setFilter] = useState<"all" | "expiring" | "expired">("all");
  const storageItems = useStore((state) => state.storageItems);
  const removeFromStorage = useStore((state) => state.removeFromStorage);

  const getExpiryStatus = (expiryDate?: Date) => {
    if (!expiryDate)
      return { status: "none", color: "#999", text: "No expiry date" };

    const daysLeft = differenceInDays(expiryDate, new Date());

    if (daysLeft < 0) {
      return { status: "expired", color: "#f44336", text: "Expired" };
    } else if (daysLeft === 0) {
      return { status: "today", color: "#ff9800", text: "Expires today" };
    } else if (daysLeft <= 3) {
      return {
        status: "expiring",
        color: "#ff9800",
        text: `${daysLeft} days left`,
      };
    } else {
      return {
        status: "fresh",
        color: "#4CAF50",
        text: `${daysLeft} days left`,
      };
    }
  };

  const filteredItems = storageItems.filter((item) => {
    if (filter === "all") return true;
    const { status } = getExpiryStatus(item.expiryDate);
    if (filter === "expiring")
      return status === "expiring" || status === "today";
    if (filter === "expired") return status === "expired";
    return true;
  });

  const handleDelete = (itemId: string) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from storage?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeFromStorage(itemId),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: StorageItem }) => {
    const expiryInfo = getExpiryStatus(item.expiryDate);

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.quantity && (
              <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={22} color="#f44336" />
          </TouchableOpacity>
        </View>

        <View style={styles.itemDetails}>
          {item.location && (
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
          )}
          {item.expiryDate && (
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                {format(item.expiryDate, "MMM dd, yyyy")}
              </Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.expiryBadge,
            { backgroundColor: expiryInfo.color + "20" },
          ]}
        >
          <Text style={[styles.expiryText, { color: expiryInfo.color }]}>
            {expiryInfo.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "all" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.filterTextActive,
            ]}
          >
            All ({storageItems.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "expiring" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("expiring")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "expiring" && styles.filterTextActive,
            ]}
          >
            Expiring Soon
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === "expired" && styles.filterButtonActive,
          ]}
          onPress={() => setFilter("expired")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "expired" && styles.filterTextActive,
            ]}
          >
            Expired
          </Text>
        </TouchableOpacity>
      </View>

      {filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={80} color="#ddd" />
          <Text style={styles.emptyText}>
            {filter === "all" ? "Your storage is empty" : `No ${filter} items`}
          </Text>
          <Text style={styles.emptySubtext}>
            {filter === "all" ? "Purchase items from your shopping list" : ""}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  filterContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#4CAF50",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  filterTextActive: {
    color: "#fff",
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
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
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  itemInfo: {
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
  deleteButton: {
    padding: 4,
  },
  itemDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: "#666",
  },
  expiryBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  expiryText: {
    fontSize: 13,
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
  },
});
