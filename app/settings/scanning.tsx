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
  AUTO_COPY: "settings_auto_copy",
  AUTO_FLASH: "settings_auto_flash",
  MULTI_CODE: "settings_multi_code",
  CONTINUOUS_SCAN: "settings_continuous_scan",
};

export default function ScanningSettings() {
  const insets = useSafeAreaInsets();
  const { settings, setContinuousScan, setMultiCodeDetection } = useSettings();
  
  // Settings states for features that aren't fully implemented yet
  const [autoCopy, setAutoCopy] = useState(false);
  const [autoFlash, setAutoFlash] = useState(false);

  // Load settings from storage on initial render
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const autoCopySetting = await AsyncStorage.getItem(
          SETTINGS_KEYS.AUTO_COPY
        );
        if (autoCopySetting !== null) setAutoCopy(autoCopySetting === "true");

        const autoFlashSetting = await AsyncStorage.getItem(
          SETTINGS_KEYS.AUTO_FLASH
        );
        if (autoFlashSetting !== null)
          setAutoFlash(autoFlashSetting === "true");
          
        // No need to load multiCode and continuousScan from AsyncStorage
        // as they come from the settings context
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };

    loadSettings();
  }, []);

  // Save setting to storage whenever it changes - only for settings not yet in context
  const saveSetting = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error("Error saving setting:", error);
    }
  };

  // Toggle handlers with storage updates
  const toggleAutoCopy = (newValue: boolean) => {
    setAutoCopy(newValue);
    saveSetting(SETTINGS_KEYS.AUTO_COPY, newValue);
  };

  const toggleAutoFlash = (newValue: boolean) => {
    setAutoFlash(newValue);
    saveSetting(SETTINGS_KEYS.AUTO_FLASH, newValue);
  };

  const toggleMultiCode = (newValue: boolean) => {
    // Use context setter which updates both AsyncStorage and global state
    setMultiCodeDetection(newValue);
  };

  const toggleContinuousScan = (newValue: boolean) => {
    setContinuousScan(newValue);
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
        <Text style={styles.headerTitle}>Scanning Options</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Settings content */}
      <ScrollView style={styles.content}>
        {/* Scanning behavior section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Scanning Behavior</Text>
        </View>

        {/* <SettingsToggleItem
          icon="flash-outline"
          title="Auto Flash in Low Light"
          description="Automatically enable flash when environment is dark"
          value={autoFlash}
          onValueChange={toggleAutoFlash}
        />
        <SettingsToggleItem
          icon="scan-outline"
          title="Continuous Scanning"
          description="Continue scanning after a code is detected"
          value={settings.continuousScan}
          onValueChange={toggleContinuousScan}
        /> */}
        <SettingsToggleItem
          icon="grid-outline"
          title="Multi-Code Detection"
          description="Scan multiple QR codes at once"
          value={settings.multiCodeDetection}
          onValueChange={toggleMultiCode}
        />

        {/* Result handling section */}
        {/* <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Result Handling</Text>
        </View>

        <SettingsToggleItem
          icon="copy-outline"
          title="Auto Copy Results"
          description="Automatically copy scan results to clipboard"
          value={autoCopy}
          onValueChange={toggleAutoCopy}
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
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  sectionTitle: {
    color: "#00f2ea",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
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
