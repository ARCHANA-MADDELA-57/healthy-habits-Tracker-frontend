// src/components/HealthSync.js
import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { healthService, fetchRealGoogleFitData } from '../services/healthService';

const HealthSync = () => {
  const [data, setData] = useState(healthService.fetchData());
  const [loading, setLoading] = useState(false);

  // REAL GOOGLE LOGIN HOOK
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // 1. Fetch real steps using the access token from the popup
        const realData = await fetchRealGoogleFitData(tokenResponse.access_token);
        
        // 2. Save the real data to localStorage
        const updated = healthService.syncData(realData);
        
        // 3. Update the UI
        setData(updated);
      } catch (error) {
        console.error("Sync failed", error);
        alert("Failed to fetch real data from Google Fit.");
      } finally {
        setLoading(false);
      }
    },
    scope: 'https://www.googleapis.com/auth/fitness.activity.read',
  });

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '300px' }}>
      <h3>Real Device Sync</h3>
      <p><strong>Steps:</strong> {data.steps}</p>
      <p><strong>Sleep:</strong> {data.sleepHours} hours</p>
      <p><small>Last synced: {data.lastSynced || 'Never'}</small></p>
      
      {/* Change handleSync to login() */}
      <button 
        onClick={() => login()} 
        disabled={loading} 
        style={{ cursor: loading ? 'not-allowed' : 'pointer', padding: '10px 15px' }}
      >
        {loading ? 'Connecting to Google...' : 'Sync with Google Fit'}
      </button>
    </div>
  );
};

export default HealthSync;