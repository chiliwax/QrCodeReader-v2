import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHistory, ScanHistoryItem } from '@/contexts/history.context';
import { useCamera } from '@/contexts/camera.context';
import { format } from 'date-fns';
import { parseQRCode } from '@/utils/qrCodeParser';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { history, removeFromHistory, clearHistory, isLoading } = useHistory();
  const { handleBarcodePress } = useCamera();

  // Log history status on component mount
  useEffect(() => {
    console.log("[HistoryScreen] Mounted, history items:", history.length);
    console.log("[HistoryScreen] Is loading:", isLoading);
    if (history.length > 0) {
      console.log("[HistoryScreen] First item:", JSON.stringify(history[0]));
    }
  }, [history, isLoading]);

  const confirmClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all scan history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearHistory },
      ]
    );
  };

  const handleUseCode = (item: ScanHistoryItem) => {
    console.log("[HistoryScreen] Using code from history:", item.data);
    const barcodeResult = {
      type: item.type,
      data: item.data,
      bounds: item.bounds || {
        origin: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
      },
      cornerPoints: item.cornerPoints || [],
    };
    
    handleBarcodePress(barcodeResult);
    router.back();
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      'Delete Scan',
      'Are you sure you want to delete this scan?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => removeFromHistory(id) 
        },
      ]
    );
  };

  const renderHistoryItem = ({ item }: { item: ScanHistoryItem }) => {
    const date = new Date(item.timestamp);
    const formattedDate = format(date, 'MMM d, yyyy h:mm a');
    const parsedData = parseQRCode(item.data);
    
    
    return (
      <View style={styles.historyItem}>
        <View style={styles.historyContent}>
          <View style={styles.historyHeader}>
            <View style={styles.typeContainer}>
              <Ionicons name="qr-code" size={18} color="#00f2ea" />
              <Text style={styles.typeText}>{parsedData.type.toUpperCase()}</Text>
            </View>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
          <View>
            {Object.entries(parsedData.parsedData).map(([key, value]) => (
              <Text key={key} style={styles.dataDetailText}>
                <Text style={styles.dataKeyText}>{key}: </Text>
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </Text>
            ))}
          </View>
        </View>
        <View style={styles.actionsContainer}>
          {/* <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleUseCode(item)}
          >
            <Ionicons name="open-outline" size={22} color="#00f2ea" />
          </TouchableOpacity> */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => confirmDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={22} color="#ff4757" />
          </TouchableOpacity>
        </View>
      </View>
    );
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
        <Text style={styles.headerTitle}>Scan History</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={confirmClearHistory}
        >
          <Ionicons name="trash-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* History loading state */}
      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading history...</Text>
        </View>
      ) : history.length > 0 ? (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="scan-outline" size={64} color="#333" />
          <Text style={styles.emptyText}>No scan history yet</Text>
          <Text style={styles.emptySubtext}>
            Scanned QR codes will appear here
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  listContent: {
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    color: '#00f2ea',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  dateText: {
    color: '#999',
    fontSize: 12,
  },
  dataText: {
    color: 'white',
    fontSize: 14,
  },
  actionsContainer: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
    marginTop: 16,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  dataDetailText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
  },
  dataKeyText: {
    color: '#888888',
    fontWeight: 'bold',
  },
});