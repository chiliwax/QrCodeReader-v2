import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Switch,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "@/contexts/settings.context";
import { useHistory } from "@/contexts/history.context";

// Settings keys
const SETTINGS_KEYS = {
  ANALYTICS: "settings_analytics",
  HISTORY: "settings_history",
};

export default function PrivacySettings() {
  const insets = useSafeAreaInsets();
  const { settings, setAnalyticsEnabled, setHistoryEnabled } = useSettings();
  const { clearHistory } = useHistory();
  
  // Load settings from storage on initial render
  useEffect(() => {
    console.log("[Privacy] History enabled in settings:", settings.historyEnabled);
  }, [settings.historyEnabled]);
  
  // Toggle handlers with storage updates
  const toggleAnalytics = (newValue: boolean) => {
    setAnalyticsEnabled(newValue);
  };
  
  const toggleHistory = (newValue: boolean) => {
    setHistoryEnabled(newValue);

    if (!newValue) {
      // Clear scan history when history is disabled
      clearScanHistory();
    }
  };

  const clearScanHistory = async () => {
    try {
      // Ask for confirmation
      Alert.alert(
        "Clear Scan History",
        "This will delete all your previous scan records. This action cannot be undone.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Clear History",
            onPress: () => {
              // Use the clearHistory function from the history context
              clearHistory();
              Alert.alert("Success", "Scan history has been cleared.");
            },
            style: "destructive",
          },
        ]
      );
    } catch (error) {
      console.error("Error clearing scan history:", error);
    }
  };

  const openCameraPermissions = () => {
    Linking.openSettings();
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
        <Text style={styles.headerTitle}>Privacy</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Settings content */}
      <ScrollView style={styles.content}>
        {/* Data Collection section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Data Collection</Text>
        </View>
        
        {/* <SettingsToggleItem
          icon="analytics-outline"
          title="Analytics"
          description="Help improve the app by sending anonymous usage data"
          value={settings.analyticsEnabled}
          onValueChange={toggleAnalytics}
        /> */}
        <SettingsToggleItem
          icon="time-outline"
          title="Scan History"
          description="Save your scan history for future reference"
          value={settings.historyEnabled}
          onValueChange={toggleHistory}
        />
        
        {/* Clear history button */}
        {settings.historyEnabled && (
          <TouchableOpacity 
            style={styles.buttonItem}
            onPress={clearScanHistory}
          >
            <Ionicons name="trash-outline" size={24} color="#ff4757" />
            <View style={styles.settingsTextContainer}>
              <Text style={styles.settingsItemTitle}>Clear Scan History</Text>
              <Text style={styles.settingsItemDescription}>
                Delete all previous scan records
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        )}
        
        {/* Permissions section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Permissions</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.buttonItem}
          onPress={openCameraPermissions}
        >
          <Ionicons name="camera-outline" size={24} color="#00f2ea" />
          <View style={styles.settingsTextContainer}>
            <Text style={styles.settingsItemTitle}>Camera Permissions</Text>
            <Text style={styles.settingsItemDescription}>
              Manage camera access for scanning QR codes
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        
        {/* Privacy policy */}
        {/* <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Legal</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.buttonItem}
          onPress={() => {
            // Here we would open a privacy policy screen or webview
            Alert.alert("Privacy Policy", "The privacy policy would open here.");
          }}
        >
          <Ionicons name="document-text-outline" size={24} color="#00f2ea" />
          <View style={styles.settingsTextContainer}>
            <Text style={styles.settingsItemTitle}>Privacy Policy</Text>
            <Text style={styles.settingsItemDescription}>
              Read our privacy policy
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity> */}
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
  buttonItem: {
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