import React, { createContext, useContext } from 'react';
import { useStoreSettings } from '../hooks/useStoreSettings';

const StoreSettingsContext = createContext({ settings: null, loading: true, error: null });

export const StoreSettingsProvider = ({ children }) => {
  const { settings, loading, error } = useStoreSettings();
  return (
    <StoreSettingsContext.Provider value={{ settings, loading, error }}>
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettingsContext = () => useContext(StoreSettingsContext);
