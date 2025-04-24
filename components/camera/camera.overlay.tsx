import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { View, TouchableOpacity, Text } from "react-native";
import { styles } from "./camera.style";
import { useCamera } from "@/contexts/camera.context";
import { usePicker } from "./imagePicker";

export const TopNavigation = () => {
  return (
    <View style={styles.topBar}>
      <TouchableOpacity
        style={styles.topBarButton}
        onPress={() => router.push("/settings")}
      >
        <Ionicons name="settings-outline" size={28} color="white" />
      </TouchableOpacity>
      
    </View>
  );
};

export const SideNavigation = () => {
  const { toggleCameraFacing, facing, toggleTorch, torch } = useCamera();
  const { pickImage } = usePicker();

  return (
    <View style={styles.rightButtons}>
      <TouchableOpacity
        style={styles.topBarButton}
        onPress={() => router.push("/history")}
      >
        <Ionicons name="time-outline" size={28} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.sideButton} onPress={toggleCameraFacing}>
        <Ionicons name="camera-reverse-outline" size={28} color="white" />
      </TouchableOpacity>

      {/* Only show torch button with back camera */}
      {facing === "back" && (
        <TouchableOpacity style={styles.sideButton} onPress={toggleTorch}>
          <Ionicons
            name={torch ? "flashlight" : "flashlight-outline"}
            size={28}
            color="white"
          />
        </TouchableOpacity>
      )}

      {/* Gallery access button */}
      <TouchableOpacity style={styles.sideButton} onPress={pickImage}>
        <Ionicons name="images-outline" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export const BottomElements = () => {
  const { scannedRef, scanStatusText } = useCamera();
  return (
    <View style={styles.bottomControls}>
      {scannedRef.current ? (
        <></>
      ) : (
        <View style={styles.scanningStatus}>
          <Text style={styles.scanningText}>{scanStatusText}</Text>
        </View>
      )}
    </View>
  );
};

export const CameraOverlay = () => {
  return (
    <>
      <TopNavigation />
      <SideNavigation />
      <BottomElements />
    </>
  );
};
