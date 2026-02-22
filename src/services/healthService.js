// src/services/healthService.js
const STORAGE_KEY = 'app_health_data';

/**
 * FETCH REAL DATA FROM GOOGLE FIT
 * Fetches the daily step count using the aggregate API.
 */
export const fetchRealGoogleFitData = async (accessToken) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const response = await fetch(
    "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        aggregateBy: [{ dataTypeName: "com.google.step_count.delta" }],
        bucketByTime: { durationMillis: 86400000 }, 
        startTimeMillis: startOfDay.getTime(),
        endTimeMillis: Date.now(),
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Google Fit API Error:", errorText);
    throw new Error("Failed to fetch Google Fit data");
  }

  const result = await response.json();
  
  // Navigate the Google data structure to find the integer step value
  const steps = result.bucket[0]?.dataset[0]?.point[0]?.value[0]?.intVal || 0;
  
  return {
    steps: steps,
    sleepHours: 0, // Option A: Set to 0 so it's no longer hardcoded to 7
  };
};

/**
 * STORAGE HELPERS
 * Manages saving and retrieving synced data from LocalStorage.
 */
export const healthService = {
  fetchData: () => {
    const data = localStorage.getItem(STORAGE_KEY);
    // Default state starts at 0 for both steps and sleep
    return data ? JSON.parse(data) : { steps: 0, sleepHours: 0, lastSynced: null };
  },
  syncData: (newData) => {
    const updatedData = { ...newData, lastSynced: new Date().toLocaleString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    return updatedData;
  }
};