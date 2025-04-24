import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarcodeScanningResult } from 'expo-camera';
import { useSettings } from './settings.context';

// Define the shape of a scan history item
export interface ScanHistoryItem {
  id: string;
  data: string;
  type: string;
  timestamp: number;
  bounds?: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
  cornerPoints?: any[];
}

// Convert BarcodeScanningResult to ScanHistoryItem
export const createHistoryItem = (
  scanResult: BarcodeScanningResult
): ScanHistoryItem => {
  return {
    id: Date.now().toString(),
    data: scanResult.data,
    type: scanResult.type,
    timestamp: Date.now(),
    bounds: scanResult.bounds,
    cornerPoints: scanResult.cornerPoints,
  };
};

// Define context type
interface HistoryContextType {
  history: ScanHistoryItem[];
  addToHistory: (scan: BarcodeScanningResult) => Promise<void>;
  clearHistory: () => Promise<void>;
  removeFromHistory: (id: string) => Promise<void>;
  isLoading: boolean;
}

// Create context
const HistoryContext = createContext<HistoryContextType>({
  history: [],
  addToHistory: async () => {},
  clearHistory: async () => {},
  removeFromHistory: async () => {},
  isLoading: true,
});

// Provider component
export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { settings } = useSettings();

  // Load history from storage on initial mount
  useEffect(() => {
    console.log("[HistoryContext] Provider mounted, loading history...");
    loadHistory();
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("[HistoryContext] Loading history from AsyncStorage...");
      
      const savedHistory = await AsyncStorage.getItem('scan_history');
      if (savedHistory) {
        console.log("[HistoryContext] Found saved history:", savedHistory.substring(0, 100) + (savedHistory.length > 100 ? "..." : ""));
        const parsedHistory = JSON.parse(savedHistory);
        console.log("[HistoryContext] History items count:", parsedHistory.length);
        setHistory(parsedHistory);
      } else {
        console.log("[HistoryContext] No history found in storage");
        setHistory([]);
      }
    } catch (error) {
      console.error('[HistoryContext] Error loading scan history:', error);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveHistory = useCallback(async (newHistory: ScanHistoryItem[]) => {
    try {
      console.log("[HistoryContext] Saving history, items count:", newHistory.length);
      await AsyncStorage.setItem('scan_history', JSON.stringify(newHistory));
      setHistory(newHistory);
      console.log("[HistoryContext] History saved successfully");
    } catch (error) {
      console.error('[HistoryContext] Error saving scan history:', error);
    }
  }, []);

  const addToHistory = useCallback(async (scan: BarcodeScanningResult) => {
    console.log("[HistoryContext] Adding scan to history:", scan.data);
    
    // Debug log for settings.historyEnabled
    console.log("[HistoryContext] History enabled in settings:", settings.historyEnabled);
    
    if (!settings.historyEnabled) {
      console.log("[HistoryContext] History is disabled in settings, not saving scan");
      return;
    }
    
    try {
      // Get the current history from AsyncStorage first to ensure we have the latest
      const currentHistory = await AsyncStorage.getItem('scan_history');
      let existingHistory: ScanHistoryItem[] = [];
      
      if (currentHistory) {
        try {
          existingHistory = JSON.parse(currentHistory);
          console.log("[HistoryContext] Retrieved existing history items:", existingHistory.length);
        } catch (e) {
          console.error("[HistoryContext] Error parsing history:", e);
          existingHistory = [];
        }
      }
      
      // Create the history item from the scan
      const historyItem = createHistoryItem(scan);
      console.log("[HistoryContext] Created history item:", JSON.stringify(historyItem));
      
      // Create a new history array with the new item at the beginning
      const updatedHistory = [historyItem, ...existingHistory];
      console.log("[HistoryContext] New history length will be:", updatedHistory.length);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('scan_history', JSON.stringify(updatedHistory));
      console.log("[HistoryContext] History saved to AsyncStorage");
      
      // Update state
      setHistory(updatedHistory);
      console.log("[HistoryContext] History state updated");
    } catch (error) {
      console.error('[HistoryContext] Error adding to scan history:', error);
    }
  }, [settings.historyEnabled]);

  const removeFromHistory = useCallback(async (id: string) => {
    try {
      console.log("[HistoryContext] Removing item from history, id:", id);
      const newHistory = history.filter(item => item.id !== id);
      await saveHistory(newHistory);
      console.log("[HistoryContext] Item removed successfully");
    } catch (error) {
      console.error('[HistoryContext] Error removing from scan history:', error);
    }
  }, [history, saveHistory]);

  const clearHistory = useCallback(async () => {
    try {
      console.log("[HistoryContext] Clearing all history");
      await AsyncStorage.removeItem('scan_history');
      setHistory([]);
      console.log("[HistoryContext] History cleared successfully");
    } catch (error) {
      console.error('[HistoryContext] Error clearing scan history:', error);
    }
  }, []);

  console.log("[HistoryContext] Current history items count:", history.length);

  return (
    <HistoryContext.Provider
      value={{
        history,
        addToHistory,
        clearHistory,
        removeFromHistory,
        isLoading,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

// Custom hook to use the history context
export const useHistory = () => useContext(HistoryContext);