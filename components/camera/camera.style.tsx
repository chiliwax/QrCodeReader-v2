import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  // TikTok-style button layout
  topBar: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 20,
    zIndex: 20,
    gap: 10,
  },
  topBarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  rightButtons: {
    position: "absolute",
    top: 50,
    right: 20,
    flexDirection: "column",
    zIndex: 20,
    gap: 20,
  },
  sideButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 20,
  },
  scanAgainButton: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanningStatus: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  scanningText: {
    color: "white",
    fontSize: 14,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "grey",
  },
  modalContentContainer: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    padding: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  resultSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  resultContent: {
    width: "100%",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
  },
  // QR Code action styles
  primaryActionButton: {
    width: "100%",
    backgroundColor: "#00f2ea", // TikTok-like teal color
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryActionsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    marginTop: 10,
    marginBottom: 20,
  },
  secondaryActionButton: {
    alignItems: "center",
    padding: 10,
  },
  secondaryActionText: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  // Structured data display
  structuredDataContainer: {
    width: "100%",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  dataField: {
    marginBottom: 10,
  },
  dataLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  dataValue: {
    fontSize: 16,
    color: "#333",
  },
  // Collapsible raw data
  rawDataToggle: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#eaeaea",
    borderRadius: 8,
    marginBottom: 5,
  },
  rawDataToggleText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  rawDataContainer: {
    width: "100%",
    backgroundColor: "#f7f7f7",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  rawDataText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "monospace",
  },
  rawDataScrollView: {
    maxHeight: 100,
    width: "100%",
  }
});
