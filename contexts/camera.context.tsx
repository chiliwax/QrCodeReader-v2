import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  MutableRefObject,
} from "react";
import { BarcodeScanningResult, CameraType, CameraView } from "expo-camera";
import { bufferTime, filter, map, Subject } from "rxjs";
import * as ImagePicker from "expo-image-picker";
import { type BottomSheetModal } from "@gorhom/bottom-sheet";
import { useSettings } from "./settings.context";
import { useHistory } from "./history.context";

// Define the shape of your camera context
interface CameraContextType {
  // Refs
  CameraRef: React.RefObject<CameraView>;
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  scannedRef: MutableRefObject<boolean>;

  // States
  facing: CameraType;
  torch: boolean;
  continuousScan: boolean;
  scanned: boolean;
  detectedBarcodes: BarcodeScanningResult[];
  result: BarcodeScanningResult | null;

  // State setters
  setScanned: (value: boolean) => void;
  setResult: (result: BarcodeScanningResult | null) => void;
  setDetectedBarcodes: (barcodes: BarcodeScanningResult[]) => void;

  // Functions
  handleBarcodeScanned: (barcode: BarcodeScanningResult) => void;
  toggleCameraFacing: () => void;
  toggleTorch: () => void;
  handleBarcodePress: (barcode: BarcodeScanningResult) => void;
  setContinuousScan: (value: boolean) => void;
  scanStatusText: string;
  pickImage: () => Promise<void>;

  // Settings access
  settings: ReturnType<typeof useSettings>;
}

// Create the context with a default empty value
const CameraContext = createContext<CameraContextType | null>(null);

// Provider component
export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Hooks
  const settings = useSettings();
  const history = useHistory();

  // Constants
  const TIME_BUFFER = 200;

  // RXJS
  const barcode$ = useMemo(() => new Subject<BarcodeScanningResult>(), []);

  // Refs
  const CameraRef = useRef<CameraView>(null);
  const scannedRef = useRef<boolean>(false);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const lastProcessedBarcodeRef = useRef<string | null>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // States
  const [facing, setFacing] = useState<CameraType>("back");
  const [torch, setTorch] = useState<boolean>(false);
  const [continuousScan, setContinuousScan] = useState<boolean>(false);
  const [scanned, setScanned] = useState<boolean>(false);
  const [detectedBarcodes, setDetectedBarcodes] = useState<
    BarcodeScanningResult[]
  >([]);
  const [result, setResult] = useState<BarcodeScanningResult | null>(null);

  // Set up RxJS subscription
  useEffect(() => {
    console.log("Setting up barcode subscription");

    const subscription = barcode$
      .pipe(
        filter((_) => !scannedRef.current),
        bufferTime(TIME_BUFFER),
        map((barcodes) => {
          if (barcodes.length <= 0) return [];
          // Deduplication logic
          const uniques = new Set();
          return barcodes.reduce((arr, current) => {
            if (!uniques.has(current.data)) {
              arr.push(current);
              uniques.add(current.data);
            }
            return arr;
          }, [] as BarcodeScanningResult[]);
        })
      )
      .subscribe((uniqueBarcodes) => {
        setDetectedBarcodes(uniqueBarcodes);
      });

    return () => {
      console.log("Cleaning up barcode subscription");
      subscription.unsubscribe();
    };
  }, [TIME_BUFFER]);

  // Functions
  const handleBarcodeScanned = useCallback((barcode: BarcodeScanningResult) => {
    barcode$.next(barcode);
  }, []);

  const toggleCameraFacing = useCallback(() => {
    setFacing((prevFacing) => (prevFacing === "back" ? "front" : "back"));
    setTorch(false); // Turn off torch when flipping camera
  }, []);

  const toggleTorch = useCallback(() => {
    setTorch((prevTorch) => !prevTorch);
  }, []);

  const handleBarcodePress = useCallback(
    (barcode: BarcodeScanningResult) => {
      if (scannedRef.current) return;
      
      // Immediately set scanned to true to prevent multiple processing
      scannedRef.current = true;
      
      // Create a stable copy of the barcode data to prevent race conditions
      const stableBarcode = {
        ...barcode,
        data: barcode.data,
        type: barcode.type,
        bounds: { ...barcode.bounds },
        cornerPoints: [...barcode.cornerPoints]
      };
      
      console.log("[Camera] Processing barcode click for data:", stableBarcode.data);
      
      // Only show the clicked barcode
      setDetectedBarcodes([stableBarcode]);
      
      if (!continuousScan) {
        CameraRef.current?.pausePreview();
      }
      
      // Use our stable copy for everything else
      setResult(stableBarcode);
      bottomSheetModalRef.current?.present();
      setScanned(true);
      
      // Add to history if history is enabled
      if (settings.settings.historyEnabled) {
        history.addToHistory(stableBarcode);
        console.log("[Camera] Added to history:", stableBarcode.data);
      } else {
        console.log("[Camera] History is disabled, not adding to history");
      }
    },
    [continuousScan, settings.settings.historyEnabled]
  );

  const scanStatusText = useMemo(() => {
    if (detectedBarcodes.length > 0) {
      if (settings.settings.multiCodeDetection) {
        return `${detectedBarcodes.length} QR code${
          detectedBarcodes.length > 1 ? "s" : ""
        } detected - Tap to select`;
      }
      return "QR code detected - Tap to select";
    }
    return "Scanning for QR code";
  }, [detectedBarcodes.length, settings.settings.multiCodeDetection]);

  // Image picker function
  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // TODO: Process the image to find QR codes
        // This would typically involve passing the image to a barcode scanner library
        console.log("Image selected:", result.assets[0].uri);

        // Example placeholder for processing the image
        // Simulate finding a QR code
        const mockBarcode: BarcodeScanningResult = {
          type: "qr",
          data: "https://example.com/from-gallery",
          bounds: {
            origin: { x: 0, y: 0 },
            size: { width: 100, height: 100 },
          },
          cornerPoints: [],
        };

        // Process as if it was scanned
        handleBarcodePress(mockBarcode);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  }, []);

  // Create the context value
  const contextValue = useMemo(
    (): CameraContextType => ({
      // Refs
      CameraRef,
      bottomSheetModalRef,
      scannedRef,

      // States
      facing,
      torch,
      continuousScan,
      scanned,
      detectedBarcodes,
      result,

      // State setters
      setScanned,
      setResult,
      setDetectedBarcodes,

      // Functions
      handleBarcodeScanned,
      toggleCameraFacing,
      toggleTorch,
      handleBarcodePress,
      setContinuousScan,
      scanStatusText,
      pickImage,

      // Settings
      settings,
    }),
    [
      facing,
      torch,
      continuousScan,
      scanned,
      detectedBarcodes,
      result,
      handleBarcodeScanned,
      toggleCameraFacing,
      toggleTorch,
      handleBarcodePress,
      setContinuousScan,
      setScanned,
      setResult,
      setDetectedBarcodes,
      scanStatusText,
      pickImage,
      settings,
    ]
  );

  return (
    <CameraContext.Provider value={contextValue}>
      {children}
    </CameraContext.Provider>
  );
};

// Custom hook to use the camera context
export const useCamera = () => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error("useCamera must be used within a CameraProvider");
  }
  return context;
};
