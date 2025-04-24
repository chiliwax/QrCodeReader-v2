// Image picker function

import { useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { useCamera } from "@/contexts/camera.context";

export const usePicker = () => {
  const { scannedRef, setResult, bottomSheetModalRef, CameraRef } = useCamera();
  const pickImage = useCallback(async () => {
    try {
      // No permissions request is necessary for launching the image library
      let imageResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
      });

      if (imageResult.canceled) return;

      CameraRef.current?.pausePreview();
      
      // Scan the image for QR codes
      const scannedImage = await Camera.scanFromURLAsync(
        imageResult.assets[0].uri,
        ["qr"]
      );

      console.log("Scan result:", scannedImage);

      // Check if any QR codes were found
      if (scannedImage && scannedImage.length > 0) {
        // QR code detected - mimic the same flow as camera scanning
        scannedRef.current = true;

        // Store the result and show the modal
        const qrCodeResult = scannedImage[0];
        setResult({
          type: qrCodeResult.type,
          data: qrCodeResult.data,
          bounds: qrCodeResult.bounds,
          cornerPoints: qrCodeResult.cornerPoints,
        });

        // Open the bottom sheet modal
        bottomSheetModalRef.current?.present();
      } else {
        // No QR code found
        alert("No QR code found in the selected image");
      }
    } catch (error) {
      console.error("Error scanning image:", error);
      alert("Error analyzing the image");
    }
  }, []);

  return {
    pickImage,
  };
};
