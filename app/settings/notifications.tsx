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

// Settings keys
const SETTINGS_KEYS = {
  VIBRATION: "settings_vibration",
  SOUND: "settings_sound",
};

export default function NotificationsSettings() {
  const insets = useSafeAreaInsets();
  
  // Settings states
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Load settings from storage on initial render
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const vibrationSetting = await AsyncStorage.getItem(SETTINGS_KEYS.VIBRATION);
        if (vibrationSetting !== null) setVibrationEnabled(vibrationSetting === "true");
        
        const soundSetting = await AsyncStorage.getItem(SETTINGS_KEYS.SOUND);
        if (soundSetting !== null) setSoundEnabled(soundSetting === "true");
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
  const toggleVibration = (newValue: boolean) => {
    setVibrationEnabled(newValue);
    saveSetting(SETTINGS_KEYS.VIBRATION, newValue);
  };
  
  const toggleSound = (newValue: boolean) => {
    setSoundEnabled(newValue);
    saveSetting(SETTINGS_KEYS.SOUND, newValue);
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
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Settings content */}
      <ScrollView style={styles.content}>
        <SettingsToggleItem
          icon="vibrate-outline"
          title="Vibration"
          description="Vibrate when QR code is detected"
          value={vibrationEnabled}
          onValueChange={toggleVibration}
        />
        <SettingsToggleItem
          icon="volume-high-outline"
          title="Sound"
          description="Play sound when QR code is detected"
          value={soundEnabled}
          onValueChange={toggleSound}
        />
        
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#4fd1c5" />
          <Text style={styles.infoText}>
            These settings control feedback when a QR code is successfully scanned.
          </Text>
        </View>
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(79, 209, 197, 0.1)',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    color: '#999',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  }
});