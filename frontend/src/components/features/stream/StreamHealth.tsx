import React from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { useStreamHealth } from "./hooks";
import { formatLastRefresh } from "./utils";
import StreamSummaryCards from "./components/StreamSummaryCards";
import HealthyStreamsList from "./components/HealthyStreamsList";
import UnhealthyStreamsList from "./components/UnhealthyStreamsList";

const StreamHealth: React.FC = () => {
  const { healthData, loading, error, lastRefresh, fetchHealth } =
    useStreamHealth();

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" color="primary.main">
          Stream Health Monitor
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchHealth}
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? <CircularProgress size={20} /> : "Refresh"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {lastRefresh && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 2, display: "block" }}
        >
          Last updated: {formatLastRefresh(lastRefresh)}
        </Typography>
      )}

      {healthData && (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <StreamSummaryCards healthData={healthData} />

          {/* Healthy Streams */}
          <HealthyStreamsList streams={healthData.health_status} />

          {/* Unhealthy Streams */}
          <UnhealthyStreamsList streams={healthData.unhealthy_streams} />
        </Grid>
      )}
    </Box>
  );
};

export default StreamHealth;
