import React, { createContext, useContext, useState } from 'react';

const HealthContext = createContext();

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};

export const HealthProvider = ({ children }) => {
  const [healthData, setHealthData] = useState({
    vitalSigns: {
      heartRate: 72,
      bloodPressure: { systolic: 120, diastolic: 80 },
      oxygenSaturation: 98,
      respiratoryRate: 16,
      temperature: 37
    },
    symptoms: [],
    medications: [],
    activities: [],
    riskScores: {
      overall: 15,
      cardiovascular: 10,
      diabetes: 5,
      mental: 8
    }
  });

  const updateHealthData = (newData) => {
    setHealthData(prev => ({
      ...prev,
      ...newData
    }));
  };

  const updateVitalSigns = (vitalSigns) => {
    setHealthData(prev => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        ...vitalSigns
      }
    }));
  };

  const addSymptom = (symptom) => {
    setHealthData(prev => ({
      ...prev,
      symptoms: [...prev.symptoms, symptom]
    }));
  };

  const removeSymptom = (symptomIndex) => {
    setHealthData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, index) => index !== symptomIndex)
    }));
  };

  return (
    <HealthContext.Provider value={{ 
      healthData, 
      updateHealthData,
      updateVitalSigns,
      addSymptom,
      removeSymptom
    }}>
      {children}
    </HealthContext.Provider>
  );
};
