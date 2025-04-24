import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Switch,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSettings } from "@/contexts/settings.context";

// Settings keys
const SETTINGS_KEYS = {
  DARK_MODE: "settings_dark_mode",
  HIGH_CONTRAST: "settings_high_contrast",
  LARGE_TEXT: "settings_large_text",
};

export default function AppearanceSettings() {
  const insets = useSafeAreaInsets();
  const { settings, setDarkMode } = useSettings();
  
  // Settings states
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  
  // Load settings from storage on initial render
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // No need to load darkMode as it comes from settings context
        
        const contrastSetting = await AsyncStorage.getItem(SETTINGS_KEYS.HIGH_CONTRAST);
        if (contrastSetting !== null) setHighContrast(contrastSetting === "true");
        
        const textSetting = await AsyncStorage.getItem(SETTINGS_KEYS.LARGE_TEXT);
        if (textSetting !== null) setLargeText(textSetting === "true");
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Save setting to storage whenever it changes
  const saveSetting = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error("Error saving setting:", error);
    }
  };
  
  // Toggle handlers with storage updates
  const toggleDarkMode = (newValue: boolean) => {
    // Use the setDarkMode from context which handles both state and storage
    setDarkMode(newValue);
  };
  
  const toggleHighContrast = (newValue: boolean) => {
    setHighContrast(newValue);
    saveSetting(SETTINGS_KEYS.HIGH_CONTRAST, newValue);
  };
  
  const toggleLargeText = (newValue: boolean) => {
    setLargeText(newValue);
    saveSetting(SETTINGS_KEYS.LARGE_TEXT, newValue);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appearance</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Settings content */}
      <ScrollView style={styles.content}>
        <SettingsToggleItem
          icon="moon-outline"
          title="Dark Mode"
          description="Use dark theme throughout the app"
          value={settings.darkMode}
          onValueChange={toggleDarkMode}
        />
        {/* <SettingsToggleItem
          icon="color-filter-outline"
          title="High Contrast"
          description="Increase contrast for better readability"
          value={highContrast}
          onValueChange={toggleHighContrast}
        />
        <SettingsToggleItem
          icon="text-outline"
          title="Large Text"
          description="Increase text size for better readability"
          value={largeText}
          onValueChange={toggleLargeText}
        /> */}
      </ScrollView>
    </View>
  );
}

function SettingsToggleItem({
  icon,
  title,
  description,
  value,
  onValueChange,
}: {
  icon: string;
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.settingsItem}>
      <Ionicons name={icon as any} size={24} color="#00f2ea" />
      <View style={styles.settingsTextContainer}>
        <Text style={styles.settingsItemTitle}>{title}</Text>
        {description && (
          <Text style={styles.settingsItemDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#3e3e3e", true: "#4fd1c5" }}
        thumbColor={value ? "#00f2ea" : "#f4f3f4"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  content: {
    flex: 1,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  settingsTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  settingsItemTitle: {
    fontSize: 16,
    color: "white",
  },
  settingsItemDescription: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
});