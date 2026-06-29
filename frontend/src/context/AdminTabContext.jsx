import { createContext, useContext } from 'react';

export const AdminTabContext = createContext({
  activeTab:    'overview',
  setActiveTab: () => {},
});

export const useAdminTab = () => useContext(AdminTabContext);
