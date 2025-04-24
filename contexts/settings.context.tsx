import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define all settings keys
export const SETTINGS_KEYS = {
  // Appearance
  DARK_MODE: "settings_dark_mode",
  THEME_COLOR: "settings_theme_color",
  
  // Notifications
  VIBRATION: "settings_vibration",
  SOUND: "settings_sound",
  
  // Scanning Options
  AUTO_COPY: "settings_auto_copy",
  AUTO_FLASH: "settings_auto_flash",
  MULTI_CODE: "settings_multi_code",
  CONTINUOUS_SCAN: "settings_continuous_scan",
  
  // Privacy
  ANALYTICS: "settings_analytics",
  HISTORY: "settings_history"
};

// Define the shape of our settings state
interface SettingsState {
  // Appearance
  darkMode: boolean;
  themeColor: string;
  
  // Notifications
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  
  // Scanning Options
  autoCopy: boolean;
  autoFlash: boolean;
  multiCodeDetection: boolean;
  continuousScan: boolean;
  
  // Privacy
  analyticsEnabled: boolean;
  historyEnabled: boolean;
}

// Define default settings
const DEFAULT_SETTINGS: SettingsState = {
  // Appearance
  darkMode: true,
  themeColor: "#00f2ea", // Default teal color
  
  // Notifications
  vibrationEnabled: true,
  soundEnabled: true,
  
  // Scanning Options
  autoCopy: false,
  autoFlash: false,
  multiCodeDetection: false,
  continuousScan: false,
  
  // Privacy
  analyticsEnabled: false,
  historyEnabled: true
};

// Create context type with state and updater functions
interface SettingsContextType {
  settings: SettingsState;
  
  // Appearance setters
  setDarkMode: (value: boolean) => Promise<void>;
  setThemeColor: (value: string) => Promise<void>;
  
  // Notification setters
  setVibrationEnabled: (value: boolean) => Promise<void>;
  setSoundEnabled: (value: boolean) => Promise<void>;
  
  // Scanning option setters
  setAutoCopy: (value: boolean) => Promise<void>;
  setAutoFlash: (value: boolean) => Promise<void>;
  setMultiCodeDetection: (value: boolean) => Promise<void>;
  setContinuousScan: (value: boolean) => Promise<void>;
  
  // Privacy setters
  setAnalyticsEnabled: (value: boolean) => Promise<void>;
  setHistoryEnabled: (value: boolean) => Promise<void>;
  
  // Generic setter and clear history function
  updateSetting: (key: string, value: any) => Promise<void>;
  clearScanHistory: () => Promise<void>;

  // Loading state
  isLoading: boolean;
}

// Create the context with default values
const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  
  // Default no-op implementations that will be overridden
  setDarkMode: async () => {},
  setThemeColor: async () => {},
  setVibrationEnabled: async () => {},
  setSoundEnabled: async () => {},
  setAutoCopy: async () => {},
  setAutoFlash: async () => {},
  setMultiCodeDetection: async () => {},
  setContinuousScan: async () => {},
  setAnalyticsEnabled: async () => {},
  setHistoryEnabled: async () => {},
  updateSetting: async () => {},
  clearScanHistory: async () => {},
  
  isLoading: true
});

// Provider component
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load all settings from AsyncStorage on initial mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        
        // Helper function to load each setting
        const loadSetting = async <T,>(key: string, defaultValue: T): Promise<T> => {
          const value = await AsyncStorage.getItem(key);
          if (value !== null) {
            if (typeof defaultValue === 'boolean') {
              return (value === 'true') as unknown as T;
            } else if (typeof defaultValue === 'number') {
              return Number(value) as unknown as T;
            }
            return value as unknown as T;
          }
          return defaultValue;
        };

        // Load all settings in parallel
        const [
          darkMode,
          themeColor,
          vibrationEnabled,
          soundEnabled,
          autoCopy,
          autoFlash,
          multiCodeDetection,
          continuousScan,
          analyticsEnabled,
          historyEnabled
        ] = await Promise.all([
          loadSetting(SETTINGS_KEYS.DARK_MODE, DEFAULT_SETTINGS.darkMode),
          loadSetting(SETTINGS_KEYS.THEME_COLOR, DEFAULT_SETTINGS.themeColor),
          loadSetting(SETTINGS_KEYS.VIBRATION, DEFAULT_SETTINGS.vibrationEnabled),
          loadSetting(SETTINGS_KEYS.SOUND, DEFAULT_SETTINGS.soundEnabled),
          loadSetting(SETTINGS_KEYS.AUTO_COPY, DEFAULT_SETTINGS.autoCopy),
          loadSetting(SETTINGS_KEYS.AUTO_FLASH, DEFAULT_SETTINGS.autoFlash),
          loadSetting(SETTINGS_KEYS.MULTI_CODE, DEFAULT_SETTINGS.multiCodeDetection),
          loadSetting(SETTINGS_KEYS.CONTINUOUS_SCAN, DEFAULT_SETTINGS.continuousScan),
          loadSetting(SETTINGS_KEYS.ANALYTICS, DEFAULT_SETTINGS.analyticsEnabled),
          loadSetting(SETTINGS_KEYS.HISTORY, DEFAULT_SETTINGS.historyEnabled)
        ]);

        // Update state with loaded settings
        setSettings({
          darkMode,
          themeColor,
          vibrationEnabled,
          soundEnabled,
          autoCopy,
          autoFlash,
          multiCodeDetection,
          continuousScan,
          analyticsEnabled,
          historyEnabled
        });
      } catch (error) {
        console.error('Error loading settings:', error);
        // Fall back to defaults on error
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Generic function to update a setting
  const updateSetting = async (key: string, value: any): Promise<void> => {
    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem(key, value.toString());
      
      // Update local state (create a new state object for proper re-rendering)
      setSettings(prev => ({ ...prev, [getStateKeyFromSettingKey(key)]: value }));
    } catch (error) {
      console.error(`Error saving setting ${key}:`, error);
    }
  };

  // Helper to map AsyncStorage key to settings state property
  const getStateKeyFromSettingKey = (key: string): keyof SettingsState => {
    const mapping: Record<string, keyof SettingsState> = {
      [SETTINGS_KEYS.DARK_MODE]: 'darkMode',
      [SETTINGS_KEYS.THEME_COLOR]: 'themeColor',
      [SETTINGS_KEYS.VIBRATION]: 'vibrationEnabled',
      [SETTINGS_KEYS.SOUND]: 'soundEnabled',
      [SETTINGS_KEYS.AUTO_COPY]: 'autoCopy',
      [SETTINGS_KEYS.AUTO_FLASH]: 'autoFlash',
      [SETTINGS_KEYS.MULTI_CODE]: 'multiCodeDetection',
      [SETTINGS_KEYS.CONTINUOUS_SCAN]: 'continuousScan',
      [SETTINGS_KEYS.ANALYTICS]: 'analyticsEnabled',
      [SETTINGS_KEYS.HISTORY]: 'historyEnabled'
    };
    
    return mapping[key] || 'darkMode'; // Default to darkMode if key not found
  };

  // Individual setters for each setting
  const setDarkMode = async (value: boolean) => updateSetting(SETTINGS_KEYS.DARK_MODE, value);
  const setThemeColor = async (value: string) => updateSetting(SETTINGS_KEYS.THEME_COLOR, value);
  const setVibrationEnabled = async (value: boolean) => updateSetting(SETTINGS_KEYS.VIBRATION, value);
  const setSoundEnabled = async (value: boolean) => updateSetting(SETTINGS_KEYS.SOUND, value);
  const setAutoCopy = async (value: boolean) => updateSetting(SETTINGS_KEYS.AUTO_COPY, value);
  const setAutoFlash = async (value: boolean) => updateSetting(SETTINGS_KEYS.AUTO_FLASH, value);
  const setMultiCodeDetection = async (value: boolean) => updateSetting(SETTINGS_KEYS.MULTI_CODE, value);
  const setContinuousScan = async (value: boolean) => updateSetting(SETTINGS_KEYS.CONTINUOUS_SCAN, value);
  const setAnalyticsEnabled = async (value: boolean) => updateSetting(SETTINGS_KEYS.ANALYTICS, value);
  const setHistoryEnabled = async (value: boolean) => updateSetting(SETTINGS_KEYS.HISTORY, value);

  // Special function to clear scan history
  const clearScanHistory = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('scan_history');
    } catch (error) {
      console.error('Error clearing scan history:', error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setDarkMode,
        setThemeColor,
        setVibrationEnabled,
        setSoundEnabled,
        setAutoCopy,
        setAutoFlash,
        setMultiCodeDetection,
        setContinuousScan,
        setAnalyticsEnabled,
        setHistoryEnabled,
        updateSetting,
        clearScanHistory,
        isLoading
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use the settings context
export const useSettings = () => useContext(SettingsContext);

// Export individual setting hooks for convenience
export const useDarkMode = () => {
  const { settings, setDarkMode } = useSettings();
  return { darkMode: settings.darkMode, setDarkMode };
};

export const useMultiCodeDetection = () => {
  const { settings, setMultiCodeDetection } = useSettings();
  return { multiCodeDetection: settings.multiCodeDetection, setMultiCodeDetection };
};

export const useContinuousScan = () => {
  const { settings, setContinuousScan } = useSettings();
  return { continuousScan: settings.continuousScan, setContinuousScan };
};