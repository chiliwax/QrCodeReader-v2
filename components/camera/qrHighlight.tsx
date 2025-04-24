import { type BarcodeScanningResult } from "expo-camera";
import { TouchableOpacity, View, StyleSheet, Text } from "react-native";
import { useCamera } from "@/contexts/camera.context";
import { useUtil } from "./util";
import { Ionicons } from "@expo/vector-icons";
import { parseQRCode } from "@/utils/qrCodeParser";

// QR code highlight component - separated to improve performance
function QRCodeHighlight({
  barcode,
  index,
  onPress,
}: {
  barcode: BarcodeScanningResult;
  index: number;
  onPress: (barcode: BarcodeScanningResult) => void;
}) {
  if (!barcode.bounds || !barcode.bounds.origin || !barcode.bounds.size) {
    console.log("No bounds found");
    return null;
  }

  const { origin, size } = barcode.bounds;
  const { type } = parseQRCode(barcode.data);

  return (
    <>
      <TouchableOpacity
        key={`barcode-${index}`}
        style={{
          position: "absolute",
          left: origin.x,
          top: origin.y,
          width: size.width,
          height: size.height,
          borderWidth: 2,
          borderColor: "#00f2ea",
          borderRadius: 8,
          backgroundColor: "rgba(0, 242, 234, 0.2)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 30,
        }}
        onPress={() => onPress(barcode)}
      ></TouchableOpacity>
      <View
        style={[
          styles.qrTypeContainer,
          {
            left: origin.x,
            top: origin.y,
            height: size.height,
            width: size.width,
          },
        ]}
      >
        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.qrTypeText}>
          {type.replaceAll("_", " ")}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  qrTypeContainer: {
    position: "absolute",
    padding: 4,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  qrTypeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cornerBracket: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "#00f2ea",
  },
});

export const RenderQRHighlights = () => {
  const { settings, handleBarcodePress, detectedBarcodes } = useCamera();
  const { getMostCenteredBarcode } = useUtil();
  if (detectedBarcodes.length === 0) return null;

  return (
    <>
      {settings.settings.multiCodeDetection
        ? // Render all detected barcodes
          detectedBarcodes.map((barcode, index) => (
            <QRCodeHighlight
              key={`qr-${index}`}
              barcode={barcode}
              index={index}
              onPress={handleBarcodePress}
            />
          ))
        : // Render only the most centered barcode
          getMostCenteredBarcode(detectedBarcodes) && (
            <QRCodeHighlight
              barcode={getMostCenteredBarcode(detectedBarcodes)!}
              index={0}
              onPress={handleBarcodePress}
            />
          )}
    </>
  );
};
