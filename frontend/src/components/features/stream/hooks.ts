import { useState, useEffect } from "react";
import { HealthResponse } from "./types";

export const useStreamHealth = () => {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/stream/health");
      if (response.ok) {
        const data = await response.json();
        setHealthData(data);
        setLastRefresh(new Date());
      } else {
        setError("Failed to fetch stream health data");
      }
    } catch (err) {
      setError("Error connecting to backend");
      console.error("Error fetching health data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    healthData,
    loading,
    error,
    lastRefresh,
    fetchHealth,
  };
};
