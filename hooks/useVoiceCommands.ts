// hooks/useVoiceCommands.ts
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { voiceService } from "../services/voice.service";
import { useStore } from "../store";

export const useVoiceCommands = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const voiceEnabled = useStore((state) => state.settings.voiceEnabled);
  const addToShoppingList = useStore((state) => state.addToShoppingList);

  const startListening = useCallback(async () => {
    if (!voiceEnabled) {
      Alert.alert("Voice Disabled", "Enable voice commands in settings");
      return;
    }

    try {
      setIsListening(true);

      // Show commands prompt
      Alert.alert("Voice Command Demo", "Choose a command to test:", [
        {
          text: "Add Milk",
          onPress: async () => {
            setTranscript("add milk to shopping list");
            await executeCommand({ action: "add_to_shopping", item: "milk" });
            setIsListening(false);
          },
        },
        {
          text: "Add 2 Eggs",
          onPress: async () => {
            setTranscript("add 2 eggs to shopping list");
            await executeCommand({
              action: "add_to_shopping",
              item: "eggs",
              quantity: 2,
            });
            setIsListening(false);
          },
        },
        {
          text: "Add Bread",
          onPress: async () => {
            setTranscript("add bread to shopping list");
            await executeCommand({ action: "add_to_shopping", item: "bread" });
            setIsListening(false);
          },
        },
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setIsListening(false),
        },
      ]);
    } catch (error) {
      console.error("Start listening error:", error);
      Alert.alert("Error", "Failed to start voice recognition");
      setIsListening(false);
    }
  }, [voiceEnabled]);

  const stopListening = useCallback(async () => {
    setIsListening(false);
  }, []);

  const executeCommand = useCallback(
    async (command: any) => {
      try {
        switch (command.action) {
          case "add_to_shopping":
            if (command.item) {
              addToShoppingList({
                id: Date.now().toString(),
                name: command.item,
                quantity: command.quantity,
                addedAt: new Date(),
              });
              await voiceService.speak(
                `Added ${command.item} to shopping list`
              );
              Alert.alert("Success", `Added ${command.item} to shopping list`);
            }
            break;

          case "find_recipes":
            await voiceService.speak(
              "Finding recipes based on your ingredients"
            );
            break;

          case "next_step":
            await voiceService.speak("Moving to next step");
            break;

          case "previous_step":
            await voiceService.speak("Going back to previous step");
            break;

          case "repeat_step":
            await voiceService.speak("Repeating current step");
            break;

          default:
            await voiceService.speak("Command not recognized");
        }
      } catch (error) {
        console.error("Execute command error:", error);
      }
    },
    [addToShoppingList]
  );

  const speak = useCallback(async (text: string) => {
    try {
      await voiceService.speak(text);
    } catch (error) {
      console.error("Speak error:", error);
    }
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    speak,
  };
};
