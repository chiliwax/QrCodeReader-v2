import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Settings() {
  const insets = useSafeAreaInsets();

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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Settings content */}
      <ScrollView style={styles.content}>
        {/* <SettingsItem
          icon="color-palette-outline"
          title="Appearance"
          onPress={() => router.push("/settings/appearance")}
        /> */}
        {/* <SettingsItem
          icon="notifications-outline"
          title="Notifications"
          onPress={() => router.push("/settings/notifications")}
        /> */}
        <SettingsItem
          icon="scan-outline"
          title="Scanning Options"
          onPress={() => router.push("/settings/scanning")}
        />
        <SettingsItem
          icon="shield-checkmark-outline"
          title="Privacy"
          onPress={() => router.push("/settings/privacy")}
        />
        <SettingsItem
          icon="information-circle-outline"
          title="About"
          onPress={() => router.push("/settings/about")}
        />
      </ScrollView>
    </View>
  );
}

function SettingsItem({
  icon,
  title,
  description,
  onPress,
}: {
  icon: string;
  title: string;
  description?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <Ionicons name={icon as any} size={24} color="#00f2ea" />
      <View style={styles.settingsTextContainer}>
        <Text style={styles.settingsItemTitle}>{title}</Text>
        {description && (
          <Text style={styles.settingsItemDescription}>{description}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="gray" />
    </TouchableOpacity>
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
