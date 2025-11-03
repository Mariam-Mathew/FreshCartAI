// hooks/useVoiceCommands.ts
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { voiceService } from "../services/voice.service";
import { useStore } from "../store";

export const useVoiceCommands = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showInputModal, setShowInputModal] = useState(false);

  const voiceEnabled = useStore((state) => state.settings.voiceEnabled);
  const addToShoppingList = useStore((state) => state.addToShoppingList);

  const startListening = useCallback(async () => {
    if (!voiceEnabled) {
      Alert.alert("Voice Disabled", "Enable voice commands in settings");
      return;
    }

    setIsListening(true);
    setShowInputModal(true);
    setTranscript("");
  }, [voiceEnabled]);

  const stopListening = useCallback(async () => {
    setIsListening(false);
    setShowInputModal(false);
    setTranscript("");
  }, []);

  const handleVoiceInput = useCallback(async (inputText: string) => {
    setTranscript(inputText);
    setShowInputModal(false);
    setIsListening(false);

    const command = voiceService.parseCommand(inputText);

    if (command) {
      await executeCommand(command);
    } else {
      await voiceService.speak("Sorry, I did not understand that command");
      Alert.alert(
        "Command Not Recognized",
        `I heard: "${inputText}"\n\nTry:\n• "Add milk to shopping list"\n• "Add 2 eggs to shopping list"`
      );
    }
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
              Alert.alert(
                "✓ Added!",
                `${command.item}${
                  command.quantity ? ` (${command.quantity})` : ""
                } added to shopping list`
              );
            }
            break;

          case "find_recipes":
            await voiceService.speak(
              "Finding recipes based on your ingredients"
            );
            Alert.alert(
              "Recipe Search",
              'Go to Recipes tab and click "Find Recipes"'
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
    showInputModal,
    startListening,
    stopListening,
    handleVoiceInput,
    speak,
  };
};
