import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  
  const openWebsite = (url: string) => {
    Linking.openURL(url);
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
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* About content */}
      <ScrollView style={styles.content}>
        {/* App Logo and Name */}
        <View style={styles.appInfoContainer}>
          <View style={styles.logoContainer}>
            <Ionicons name="qr-code" size={80} color="#00f2ea" />
          </View>
          <Text style={styles.appName}>QR Code Reader</Text>
          <Text style={styles.appVersion}>Version {appVersion}</Text>
        </View>

        {/* App Description */}
        <View style={styles.section}>
          <Text style={styles.sectionDescription}>
            A fast and user-friendly QR code scanner designed to provide seamless scanning 
            with a modern interface. Quickly scan any QR code using your device's camera 
            or from images in your gallery.
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featureItem}>
            <Ionicons name="scan-outline" size={20} color="#00f2ea" />
            <Text style={styles.featureText}>Fast QR code scanning</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="images-outline" size={20} color="#00f2ea" />
            <Text style={styles.featureText}>Scan from gallery images</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="flashlight-outline" size={20} color="#00f2ea" />
            <Text style={styles.featureText}>Flashlight for low-light scanning</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="moon-outline" size={20} color="#00f2ea" />
            <Text style={styles.featureText}>Dark mode support</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="cog-outline" size={20} color="#00f2ea" />
            <Text style={styles.featureText}>Customizable scanning options</Text>
          </View>
        </View>

        {/* Contact/Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact & Support</Text>
          
          {/* <TouchableOpacity 
            style={styles.buttonItem}
            onPress={() => openWebsite('https://example.com/support')}
          >
            <Ionicons name="help-circle-outline" size={24} color="#00f2ea" />
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonItemTitle}>Support Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity> */}
          
          {/* <TouchableOpacity 
            style={styles.buttonItem}
            onPress={() => openWebsite('https://example.com/feedback')}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#00f2ea" />
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonItemTitle}>Send Feedback</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity> */}
          
          <TouchableOpacity 
            style={styles.buttonItem}
            onPress={() => Linking.openURL('mailto:llecointe.thibault@gmail.com')}
          >
            <Ionicons name="mail-outline" size={24} color="#00f2ea" />
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonItemTitle}>Email Us</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Open Source */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Built With</Text>
          <View style={styles.techContainer}>
            <TechItem name="React Native" />
            <TechItem name="Expo" />
            <TechItem name="Expo Router" />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {new Date().getFullYear()} QR Code Reader
          </Text>
          <Text style={styles.footerText}>
            Made with <Ionicons name="heart" size={12} color="#FF6B6B" /> by Developer
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function TechItem({ name }: { name: string }) {
  return (
    <View style={styles.techItem}>
      <Text style={styles.techItemText}>{name}</Text>
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
  appInfoContainer: {
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: "rgba(0, 242, 234, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 14,
    color: "#999",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00f2ea",
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 15,
    color: "#ccc",
    lineHeight: 22,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    color: "#ddd",
    fontSize: 15,
    marginLeft: 12,
  },
  buttonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 16,
  },
  buttonTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  buttonItemTitle: {
    fontSize: 16,
    color: "white",
  },
  techContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  techItem: {
    backgroundColor: "rgba(0, 242, 234, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  techItemText: {
    color: "#00f2ea",
    fontWeight: "500",
  },
  footer: {
    padding: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
  },
});