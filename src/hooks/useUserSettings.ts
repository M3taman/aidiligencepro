import { useState } from 'react';

export interface UserSettings {
  emailNotifications: boolean;
  darkMode: boolean;
  language: string;
  theme: string;
  reportFormat: 'detailed' | 'summary';
}

const defaultSettings: UserSettings = {
  emailNotifications: true,
  darkMode: false,
  language: 'en',
  theme: 'system',
  reportFormat: 'detailed',
};

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      setSettings(prev => ({ ...prev, ...newSettings }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  };

  return {
    settings,
    updateSettings,
    loading,
    error,
  };
}; 