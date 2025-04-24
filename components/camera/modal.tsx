import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetModalProvider,
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { View, TouchableOpacity, Text, ScrollView } from "react-native";
import { styles } from "./camera.style";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCamera } from "@/contexts/camera.context";
import { useCallback, useMemo, useState } from "react";
import { parseQRCode, QRCodeType } from "@/utils/qrCodeParser";

export const Modal = () => {
  const inset = useSafeAreaInsets();
  const {
    result,
    bottomSheetModalRef,
    setScanned,
    setResult,
    setDetectedBarcodes,
    continuousScan,
    CameraRef,
    scannedRef,
  } = useCamera();

  // State to track if raw data is expanded
  const [isRawDataExpanded, setIsRawDataExpanded] = useState(false);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      handleModalDismiss();
    }
  }, []);

  const handleModalDismiss = useCallback(() => {
    // Clean up for continuous scan mode (modal dismissed but scan continues)
    setScanned(false);
    scannedRef.current = false;
    if (CameraRef.current) CameraRef.current.resumePreview();

    // Clear results
    setResult(null);
    setDetectedBarcodes([]);
  }, [continuousScan, setScanned, setResult, setDetectedBarcodes]);

  const handleScanAgain = useCallback(() => {
    // Dismiss modal and reset state
    bottomSheetModalRef.current?.dismiss();
    // Use timeout to ensure dismissed before reset
    setTimeout(() => {
      setScanned(false);
      scannedRef.current = false;
      if (CameraRef.current) CameraRef.current.resumePreview();
      setResult(null);
      setDetectedBarcodes([]);
    }, 500);
  }, [continuousScan, setScanned, setResult, setDetectedBarcodes]);

  const parsedQRCode = useMemo(() => {
    if (!result) return null;
    return parseQRCode(result.data);
  }, [result]);

  // Format the structured data based on QR code type
  const renderStructuredData = useCallback(() => {
    if (!parsedQRCode) return null;

    switch (parsedQRCode.type) {
      case QRCodeType.URL:
        return (
          <View style={styles.structuredDataContainer}>
            <View style={styles.dataField}>
              <Text style={styles.dataLabel}>Website</Text>
              <Text style={styles.dataValue}>{parsedQRCode.subtitle}</Text>
            </View>
            <View style={styles.dataField}>
              <Text style={styles.dataLabel}>URL</Text>
              <Text style={styles.dataValue} numberOfLines={2}>
                {parsedQRCode.parsedData.url}
              </Text>
            </View>
          </View>
        );

      case QRCodeType.APP_LINK:
        return (
          <View style={styles.structuredDataContainer}>
            <View style={styles.dataField}>
              <Text style={styles.dataLabel}>App</Text>
              <Text style={styles.dataValue}>{parsedQRCode.subtitle}</Text>
            </View>
            <View style={styles.dataField}>
              <Text style={styles.dataLabel}>URI</Text>
              <Text style={styles.dataValue} numberOfLines={2}>
                {parsedQRCode.parsedData.url}
              </Text>
            </View>
          </View>
        );

      case QRCodeType.WIFI:
        return (
          <View style={styles.structuredDataContainer}>
            <View style={styles.dataField}>
              <Text style={styles.dataLabel}>Network Name (SSID)</Text>
              <Text style={styles.dataValue}>
                {parsedQRCode.parsedData.ssid}
              </Text>
            </View>
            {parsedQRCode.parsedData.password && (
              <View style={styles.dataField}>
                <Text style={styles.dataLabel}>Password</Text>
                <Text style={styles.dataValue}>
                  {parsedQRCode.parsedData.password}
                </Text>
              </View>
            )}
            {parsedQRCode.parsedData.type && (
              <View style={styles.dataField}>
                <Text style={styles.dataLabel}>Security</Text>
                <Text style={styles.dataValue}>
                  {parsedQRCode.parsedData.type}
                </Text>
              </View>
            )}
          </View>
        );

      case QRCodeType.CONTACT:
        return (
          <View style={styles.structuredDataContainer}>
            <View style={styles.dataField}>
              <Text style={styles.dataLabel}>Name</Text>
              <Text style={styles.dataValue}>
                {parsedQRCode.parsedData.name}
              </Text>
            </View>
            {parsedQRCode.parsedData.phone && (
              <View style={styles.dataField}>
                <Text style={styles.dataLabel}>Phone</Text>
                <Text style={styles.dataValue}>
                  {parsedQRCode.parsedData.phone}
                </Text>
              </View>
            )}
            {parsedQRCode.parsedData.email && (
              <View style={styles.dataField}>
                <Text style={styles.dataLabel}>Email</Text>
                <Text style={styles.dataValue}>
                  {parsedQRCode.parsedData.email}
                </Text>
              </View>
            )}
          </View>
        );

      case QRCodeType.EMAIL:
        return (
          <View style={styles.structuredDataContainer}>
            <View style={styles.dataField}>
              <Text style={styles.dataLabel}>Email Address</Text>
              <Text style={styles.dataValue}>
                {parsedQRCode.parsedData.email}
              </Text>
            </View>
            {parsedQRCode.parsedData.subject && (
              <View style={styles.dataField}>
                <Text style={styles.dataLabel}>Subject</Text>
                <Text style={styles.dataValue}>
                  {parsedQRCode.parsedData.subject}
                </Text>
              </View>
            )}
            {parsedQRCode.parsedData.body && (
              <View style={styles.dataField}>
                <Text style={styles.dataLabel}>Body</Text>
                <Text style={styles.dataValue} numberOfLines={3}>
                  {parsedQRCode.parsedData.body}
                </Text>
              </View>
            )}
          </View>
        );

      case QRCodeType.SMS:
        return (
          <View style={styles.structuredDataContainer}>
            <View style={styles.dataField}>
              <Text style={styles.dataLabel}>Phone Number</Text>
              <Text style={styles.dataValue}>
                {parsedQRCode.parsedData.phone}
              </Text>
            </View>
            {parsedQRCode.parsedData.message && (
              <View style={styles.dataField}>
                <Text style={styles.dataLabel}>Message</Text>
                <Text style={styles.dataValue} numberOfLines={3}>
                  {parsedQRCode.parsedData.message}
                </Text>
              </View>
            )}
          </View>
        );

      case QRCodeType.PHONE:
        return (
          <View style={styles.structuredDataContainer}>
            <View style={styles.dataField}>
              <Text style={styles.dataLabel}>Phone Number</Text>
              <Text style={styles.dataValue}>
                {parsedQRCode.parsedData.phone}
              </Text>
            </View>
          </View>
        );

      case QRCodeType.GEO:
        return (
          <View style={styles.structuredDataContainer}>
            <View style={styles.dataField}>
              <Text style={styles.dataLabel}>Latitude</Text>
              <Text style={styles.dataValue}>
                {parsedQRCode.parsedData.latitude}
              </Text>
            </View>
            <View style={styles.dataField}>
              <Text style={styles.dataLabel}>Longitude</Text>
              <Text style={styles.dataValue}>
                {parsedQRCode.parsedData.longitude}
              </Text>
            </View>
          </View>
        );

      case QRCodeType.CALENDAR:
        return (
          <View style={styles.structuredDataContainer}>
            <View style={styles.dataField}>
              <Text style={styles.dataLabel}>Event</Text>
              <Text style={styles.dataValue}>
                {parsedQRCode.parsedData.summary}
              </Text>
            </View>
            {parsedQRCode.parsedData.location && (
              <View style={styles.dataField}>
                <Text style={styles.dataLabel}>Location</Text>
                <Text style={styles.dataValue}>
                  {parsedQRCode.parsedData.location}
                </Text>
              </View>
            )}
            {parsedQRCode.parsedData.startTime && (
              <View style={styles.dataField}>
                <Text style={styles.dataLabel}>Start Time</Text>
                <Text style={styles.dataValue}>
                  {parsedQRCode.parsedData.startTime.toLocaleString()}
                </Text>
              </View>
            )}
            {parsedQRCode.parsedData.endTime && (
              <View style={styles.dataField}>
                <Text style={styles.dataLabel}>End Time</Text>
                <Text style={styles.dataValue}>
                  {parsedQRCode.parsedData.endTime.toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        );

      case QRCodeType.TEXT:
        return (
          <View style={styles.structuredDataContainer}>
            <View style={styles.dataField}>
              <Text style={styles.dataLabel}>Content</Text>
              <Text style={styles.dataValue} numberOfLines={5}>
                {parsedQRCode.parsedData.text}
              </Text>
            </View>
          </View>
        );

      default:
        // For types without specific structured view, just show the raw data
        return (
          <View style={styles.structuredDataContainer}>
            <View style={styles.dataField}>
              <Text style={styles.dataValue} numberOfLines={5}>
                {parsedQRCode.rawData}
              </Text>
            </View>
          </View>
        );
    }
  }, [parsedQRCode]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        style={[props.style]}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
   
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      onChange={handleSheetChanges}
      enableDismissOnClose
      onDismiss={handleModalDismiss}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView
        style={[styles.modalContentContainer, { paddingBottom: inset.bottom }]}
      >
        {parsedQRCode && (
          <>
            <Text style={styles.resultTitle}>{parsedQRCode.title}</Text>
            {parsedQRCode.subtitle && (
              <Text style={styles.resultSubtitle}>{parsedQRCode.subtitle}</Text>
            )}

            {/* Structured Data Section */}
            {renderStructuredData()}

            {/* Collapsible Raw Data Section */}
            <TouchableOpacity
              style={styles.rawDataToggle}
              onPress={() => setIsRawDataExpanded(!isRawDataExpanded)}
            >
              <Text style={styles.rawDataToggleText}>Raw Data</Text>
              <Ionicons
                name={isRawDataExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>

            {isRawDataExpanded && (
              <View style={styles.rawDataContainer}>
                <ScrollView style={styles.rawDataScrollView}>
                  <Text style={styles.rawDataText} selectable>
                    {parsedQRCode.rawData}
                  </Text>
                </ScrollView>
              </View>
            )}

            {/* Primary action button */}
            {parsedQRCode.primaryAction && (
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={parsedQRCode.primaryAction.action}
              >
                <Text style={styles.actionButtonText}>
                  {parsedQRCode.primaryAction.label}
                </Text>
              </TouchableOpacity>
            )}

            {/* Secondary actions row */}
            {parsedQRCode.secondaryActions && (
              <View style={styles.secondaryActionsRow}>
                {parsedQRCode.secondaryActions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.secondaryActionButton}
                    onPress={action.action}
                  >
                    <Ionicons
                      name={action.icon as any}
                      size={24}
                      color="#00f2ea"
                    />
                    <Text style={styles.secondaryActionText}>
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {/* Scan again button */}
        <TouchableOpacity
          style={styles.scanAgainButton}
          onPress={handleScanAgain}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-circle" size={58} color="#fff" />
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
};
