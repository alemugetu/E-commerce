import { useState, useEffect } from 'react';
import { api } from '../services/api';

/**
 * Fetches the singleton StoreSettings from the backend.
 * Endpoint: GET /api/site_settings/store/settings/
 * No authentication required — AllowAny permission.
 * Returns { settings, loading, error }.
 */
export const useStoreSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Use the shared Axios instance so the base URL is always correct.
    // The endpoint is public — no Authorization header is needed.
    api
      .get('/site_settings/store/settings/')
      .then(({ data }) => setSettings(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading, error };
};
