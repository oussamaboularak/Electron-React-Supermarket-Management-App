import React, { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

// إنشاء Context لحالة الترخيص
const LicenseContext = createContext();

// Hook لاستخدام context
export const useLicense = () => {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
};

// Provider component
export const LicenseProvider = ({ children }) => {
  const [showLicenseBar, setShowLicenseBar] = useState(true);

  const handleShowLicenseBar = () => {
    setShowLicenseBar(true);
    toast.success('تم إظهار شريط الترخيص');
  };

  const handleCloseLicenseBar = () => {
    setShowLicenseBar(false);
  };

  const value = {
    showLicenseBar,
    handleShowLicenseBar,
    handleCloseLicenseBar,
  };

  return (
    <LicenseContext.Provider value={value}>
      {children}
    </LicenseContext.Provider>
  );
};
