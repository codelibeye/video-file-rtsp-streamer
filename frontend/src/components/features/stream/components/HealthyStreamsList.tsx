import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
} from "@mui/material";
import { StreamHealth } from "../types";
import { getStatusIcon } from "../utils";

interface HealthyStreamsListProps {
  streams: StreamHealth[];
}

const HealthyStreamsList: React.FC<HealthyStreamsListProps> = ({ streams }) => {
  if (streams.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom color="success.main">
            Healthy Streams
          </Typography>
          {streams.map((stream) => (
            <Box
              key={stream.video_id}
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                mb: 1,
                bgcolor: "background.paper",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                {getStatusIcon(stream.status)}
                <Typography variant="subtitle1" sx={{ ml: 1, flexGrow: 1 }}>
                  {stream.video_title}
                </Typography>
                <Chip
                  label={`PID: ${stream.pid}`}
                  size="small"
                  color="primary"
                />
              </Box>
              <Box sx={{ display: "flex", mt: 1 }}>
                <Box sx={{ flex: 1, mr: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    CPU Usage: {stream.cpu_percent?.toFixed(1)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stream.cpu_percent || 0}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Box sx={{ flex: 1, mr: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Memory: {stream.memory_mb?.toFixed(1)} MB
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Stream ID: {stream.video_id}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default HealthyStreamsList;
