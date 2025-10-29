// services/voice.service.ts
import * as Speech from "expo-speech";

export interface VoiceRecognitionResult {
  transcript: string;
  confidence?: number;
}

export class VoiceService {
  // Text-to-Speech
  async speak(
    text: string,
    options?: {
      language?: string;
      pitch?: number;
      rate?: number;
    }
  ): Promise<void> {
    try {
      await Speech.speak(text, {
        language: options?.language || "en-US",
        pitch: options?.pitch || 1.0,
        rate: options?.rate || 1.0,
      });
    } catch (error) {
      console.error("Speech error:", error);
      throw error;
    }
  }

  // Stop speaking
  async stop(): Promise<void> {
    try {
      await Speech.stop();
    } catch (error) {
      console.error("Stop speech error:", error);
    }
  }

  // Check if currently speaking
  async isSpeaking(): Promise<boolean> {
    try {
      return await Speech.isSpeakingAsync();
    } catch (error) {
      console.error("Check speaking error:", error);
      return false;
    }
  }

  // Parse voice command
  parseCommand(transcript: string): {
    action: string;
    item?: string;
    quantity?: number;
    days?: number;
  } | null {
    const lowerTranscript = transcript.toLowerCase().trim();

    // Add to shopping list
    if (
      lowerTranscript.includes("add") &&
      lowerTranscript.includes("shopping")
    ) {
      const match = lowerTranscript.match(/add\s+(.+?)\s+to\s+shopping/i);
      if (match) {
        const itemText = match[1];
        const qtyMatch = itemText.match(/(\d+)\s+(.+)/);

        if (qtyMatch) {
          return {
            action: "add_to_shopping",
            quantity: parseInt(qtyMatch[1]),
            item: qtyMatch[2],
          };
        }

        return {
          action: "add_to_shopping",
          item: itemText,
        };
      }
    }

    // Move to storage
    if (
      lowerTranscript.includes("move") &&
      lowerTranscript.includes("storage")
    ) {
      const match = lowerTranscript.match(/move\s+(.+?)\s+to\s+storage/i);
      if (match) {
        return {
          action: "move_to_storage",
          item: match[1],
        };
      }
    }

    // Set expiry
    if (
      lowerTranscript.includes("expiry") ||
      lowerTranscript.includes("expires")
    ) {
      const match = lowerTranscript.match(/(\d+)\s+days?/i);
      if (match) {
        return {
          action: "set_expiry",
          days: parseInt(match[1]),
        };
      }
    }

    // Find recipes
    if (
      lowerTranscript.includes("recipe") ||
      lowerTranscript.includes("cook")
    ) {
      return {
        action: "find_recipes",
      };
    }

    // Next step (cooking mode)
    if (lowerTranscript.includes("next")) {
      return {
        action: "next_step",
      };
    }

    // Previous step (cooking mode)
    if (
      lowerTranscript.includes("previous") ||
      lowerTranscript.includes("back")
    ) {
      return {
        action: "previous_step",
      };
    }

    // Repeat step (cooking mode)
    if (lowerTranscript.includes("repeat")) {
      return {
        action: "repeat_step",
      };
    }

    return null;
  }
}

// Singleton instance
export const voiceService = new VoiceService();
