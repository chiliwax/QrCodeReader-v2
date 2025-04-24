import { CameraView } from "expo-camera";
import { useCamera } from "@/contexts/camera.context";
import { styles } from "./camera.style";
import { CameraOverlay } from "./camera.overlay";
import { RenderQRHighlights } from "./qrHighlight";
import { Modal } from "./modal";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export const Camera = () => {
  const logic = useCamera();
  return (
    <BottomSheetModalProvider>
      <CameraView
        ref={logic.CameraRef}
        style={styles.camera}
        facing={logic.facing}
        enableTorch={logic.torch}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={logic.handleBarcodeScanned}
      >
        {/* Render QR code highlights */}
        <RenderQRHighlights />
        {/* Overlay */}
        <CameraOverlay />
        {/* Modal */}
        <Modal />
      </CameraView>
    </BottomSheetModalProvider>
  );
};
