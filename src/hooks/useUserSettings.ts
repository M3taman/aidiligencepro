import { useState } from 'react';

export function useUserSettings() {
  const [settings, setSettings] = useState<{ theme?: 'light' | 'dark' }>({});
  return { settings, setSettings };
}
