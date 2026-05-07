import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Settings } from '../types';

interface SettingsContextType {
  settings: Settings;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
  whatsapp: '+2348120670667',
  deliveryFee: 1500,
  storeName: 'Tastes by Zafira',
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  refreshSettings: async () => {},
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch {
      // use defaults if backend is unavailable
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
