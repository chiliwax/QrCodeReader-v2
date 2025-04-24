import { BarcodeScanningResult } from "expo-camera";
import { useCallback, useMemo } from "react";
import { Dimensions } from "react-native";

export const useUtil = () => {
  const screenDimensions = useMemo(() => {
      const width = Dimensions.get("window").width;
      const height = Dimensions.get("window").height;
      return {
        width,
        height,
        centerX: width / 2,
        centerY: height / 2,
      };
    }, []);

  const getDistanceFromCenter = useCallback(
    (barcode: BarcodeScanningResult) => {
      if (!barcode?.bounds?.origin) return Infinity;

      const { x, y } = barcode.bounds.origin;
      const centerX = x + (barcode.bounds.size?.width || 0) / 2;
      const centerY = y + (barcode.bounds.size?.height || 0) / 2;

      return Math.sqrt(
        Math.pow(centerX - screenDimensions.centerX, 2) +
          Math.pow(centerY - screenDimensions.centerY, 2)
      );
    },
    [screenDimensions]
  );

   const getMostCenteredBarcode = useCallback(
      (barcodes: BarcodeScanningResult[]) => {
        if (!barcodes || barcodes.length === 0) return null;
  
        return barcodes.reduce((closest, current) => {
          const closestDistance = getDistanceFromCenter(closest);
          const currentDistance = getDistanceFromCenter(current);
          return currentDistance < closestDistance ? current : closest;
        });
      },
      [getDistanceFromCenter]
    );

  return { getDistanceFromCenter, getMostCenteredBarcode };
};

